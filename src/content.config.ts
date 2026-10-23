import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// 路径锚定到本文件所在位置（src/），不受运行时 cwd 影响
const GALLERY_ASSET_DIR = fileURLToPath(new URL('../public/gallery/', import.meta.url));
const GALLERY_DATA_FILE = fileURLToPath(new URL('./data/gallery.json', import.meta.url));
const TEACHER_ASSET_DIR = fileURLToPath(new URL('../public/teachers/', import.meta.url));

// 004 FR-011：站点品牌数据校验（显式例外）。site.json 非 collection（001 §7 约定），
// 故在本配置模块加载期直接校验——astro check / astro build 载入本文件时即执行，
// 任一违反立即抛错中断构建，不静默渲染裂图或空名称站点。
const SITE_DATA_FILE = fileURLToPath(new URL('./data/site.json', import.meta.url));
const SITE_ASSET_DIR = fileURLToPath(new URL('../public/', import.meta.url));

function validateSiteBrand(): void {
  let siteBrand: Record<string, unknown>;
  try {
    siteBrand = JSON.parse(readFileSync(SITE_DATA_FILE, 'utf-8')) as Record<string, unknown>;
  } catch (e) {
    throw new Error(
      `src/data/site.json 无法读取或不是合法 JSON：${(e as Error).message}`,
    );
  }

  // (a) 静态资源字段：MUST 为以 "/" 开头、无 ".." 的站内绝对路径，且文件存在于 public/
  for (const field of ['logo', 'favicon']) {
    const value = siteBrand[field];
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        `src/data/site.json 的 "${field}" 字段缺失或为空——请提供站内绝对路径（如 "/logo.svg"）`,
      );
    }
    if (!value.startsWith('/') || value.includes('..')) {
      throw new Error(
        `src/data/site.json 的 "${field}" 值 "${value}" 必须是以 "/" 开头且不含 ".." 的站内绝对路径`,
      );
    }
    const targetPath = SITE_ASSET_DIR + value.slice(1);
    if (!existsSync(targetPath)) {
      throw new Error(
        `src/data/site.json 的 "${field}" 值 "${value}" 指向的文件不存在（目标路径 ${targetPath}）——请先放入 public/ 下的文件，再修改 src/data/site.json`,
      );
    }
  }

  // (b) 品牌命名字段：MUST 存在且为非空字符串（groupName/navBrand 任一为空即失败，
  // 因完整主名称由 ${groupName} ${navBrand} 组合派生）
  for (const field of [
    'instituteZh',
    'lab',
    'groupName',
    'alias',
    'fullName',
    'navBrand',
  ]) {
    const value = siteBrand[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(
        `src/data/site.json 的 "${field}" 字段缺失或为空字符串——全站命名展示位由该字段派生，请补齐后再构建`,
      );
    }
  }
}

validateSiteBrand();

/**
 * file loader 要求每个数组元素带 id/slug 字段，而维护者数据契约（contracts/data-files.md）
 * 不含 id。这里通过自定义 parser 解析 JSON 数组并自动注入「前缀-序号」形式的 entry id。
 *
 * JSON 语法错误若直接 throw 会被 loader 捕获后仅打印日志、构建继续（静默丢数据），
 * 因此解析失败时返回一个携带 `_jsonParseError` 的错误载体条目，交由下方各 schema 的
 * `_jsonParseError` 字段校验失败使构建报错——保证任何数据文件损坏都阻塞构建。
 */
function jsonArrayParser(fileName: string, prefix: string) {
  return (text: string): Array<Record<string, unknown>> => {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return [
        {
          id: `${prefix}-parse-error`,
          _jsonParseError: `src/data/${fileName} 不是合法 JSON：${(e as Error).message}`,
        },
      ];
    }
    if (!Array.isArray(data)) {
      return [
        {
          id: `${prefix}-parse-error`,
          _jsonParseError: `src/data/${fileName} 顶层必须是数组，实际为 ${typeof data}`,
        },
      ];
    }
    return data.map((item, i) => {
      const raw =
        item && typeof item === 'object' && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};
      return { ...raw, id: `${prefix}-${String(i + 1).padStart(3, '0')}` };
    });
  };
}

/** 错误载体字段：正常条目无此字段（校验通过），存在即携带错误信息使构建失败 */
const jsonParseErrorField = {
  _jsonParseError: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val !== undefined) {
        ctx.addIssue({ code: 'custom', message: val });
      }
    }),
};

/** HTTPS 外链校验（Constitution：外部链接 MUST 使用 HTTPS） */
const httpsUrl = z
  .url()
  .refine((v) => v.startsWith('https://'), { message: '外部链接必须以 https:// 开头' })
  .optional()
  .nullable();

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    summary: z.string().min(1).max(200),
    cover: z.string().optional(),
  }),
});

const publications = defineCollection({
  loader: file('src/data/publications.json', {
    parser: jsonArrayParser('publications.json', 'pub'),
  }),
  schema: z
    .object({
      title: z.string().min(1),
      venue: z.string().min(1),
      year: z.number().int().min(1980).max(2100),
      // 006 FR-011：组内排序用的时间锚点（YYYY-MM-DD）；无链接条目可缺省。
      // 除格式外还需是合法日历日期——round-trip 拒绝 2026-02-30 这类被 Date 自动进位的值。
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'date 必须为 YYYY-MM-DD 格式')
        .refine(
          (s) => {
            const t = new Date(`${s}T00:00:00Z`);
            return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === s;
          },
          { message: 'date 必须是合法日历日期（如 2026-02-30 不合法）' },
        )
        .optional(),
      ccf: z.enum(['A', 'B', 'C']).optional().nullable(),
      url: httpsUrl,
      featured: z.boolean().optional().default(false),
      authors: z.array(z.string()).optional(),
      ...jsonParseErrorField,
    })
    .superRefine((pub, ctx) => {
      // FR-011：有链接的条目 MUST 有 date，无链接条目 MUST 留空（仅允许缺省）
      if (pub.url && !pub.date) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: `有 url 的条目 "${pub.title}" 必须填写 date（YYYY-MM-DD）`,
        });
      }
    }),
});

const teachers = defineCollection({
  loader: file('src/data/teachers.json', {
    parser: jsonArrayParser('teachers.json', 'tea'),
  }),
  schema: z
    .object({
      name: z.string().min(1),
      title: z.string().min(1),
      advisorRole: z.enum(['phd', 'master']),
      directions: z.array(z.string()).min(1),
      email: z.email().optional().nullable(),
      homepage: httpsUrl,
      photo: z.string().optional().nullable(),
      bio: z.string().optional().nullable(),
      ...jsonParseErrorField,
    })
    .superRefine((teacher, ctx) => {
      // 003 FR-016：photo 非空时必须是 public/teachers/ 下已存在的文件（构建期存在性校验，
      // 缺失即构建报错并定位数据文件、教师姓名与缺失路径，不渲染破图上线）。
      // photo 为空/未定义不校验（缺照片为合法展示状态）；字段定义不变（FR-015 显式例外）。
      // 注：zod 4.6.5 字段级 superRefine 的 ctx 无 parent，故采用对象级校验以同时取 name 与 photo
      const photo = teacher.photo;
      if (!photo) return;
      if (!photo.startsWith('/teachers/')) {
        ctx.addIssue({
          code: 'custom',
          message: `src/data/teachers.json 教师「${teacher.name}」的 photo "${photo}" 必须以 /teachers/ 开头（指向 public/teachers/ 下的文件）`,
        });
        return;
      }
      const fileName = photo.slice('/teachers/'.length);
      if (fileName.includes('/') || fileName.includes('..')) {
        ctx.addIssue({
          code: 'custom',
          message: `src/data/teachers.json 教师「${teacher.name}」的 photo "${photo}" 必须是 public/teachers/ 目录下的文件名（禁止 "/" 与 ".."）`,
        });
      } else if (!existsSync(TEACHER_ASSET_DIR + fileName)) {
        ctx.addIssue({
          code: 'custom',
          message: `src/data/teachers.json 教师「${teacher.name}」的 photo "${photo}" 在 public/teachers/ 中不存在——请先放入图片文件，再修改 src/data/teachers.json`,
        });
      }
    }),
});

const students = defineCollection({
  loader: file('src/data/students.json', {
    parser: jsonArrayParser('students.json', 'stu'),
  }),
  schema: z.object({
    name: z.string().min(1),
    level: z.enum(['phd', 'master']),
    grade: z.string().optional().nullable(),
    url: httpsUrl,
    github: httpsUrl,
    note: z.string().optional().nullable(),
    ...jsonParseErrorField,
  }),
});

const graduates = defineCollection({
  loader: file('src/data/graduates.json', {
    parser: jsonArrayParser('graduates.json', 'gra'),
  }),
  schema: z.object({
    name: z.string().min(1),
    destination: z.string().min(1),
    degree: z.enum(['phd', 'master']),
    year: z.number().int().optional().nullable(),
    url: httpsUrl,
    github: httpsUrl,
    ...jsonParseErrorField,
  }),
});

const gallery = defineCollection({
  loader: file('src/data/gallery.json', {
    parser: jsonArrayParser('gallery.json', 'gal'),
  }),
  schema: z
    .object({
      // src 必须是 public/gallery/ 下已存在的文件名（构建期存在性校验，
      // 缺失即构建报错并定位文件与字段，不渲染裂图 —— spec 边缘用例）
      src: z
        .string()
        .min(1)
        .superRefine((val, ctx) => {
          if (val.includes('/') || val.includes('..')) {
            ctx.addIssue({
              code: 'custom',
              message: `src "${val}" 必须是 public/gallery/ 目录下的文件名（禁止 "/" 与 ".."）`,
            });
          } else if (!existsSync(GALLERY_ASSET_DIR + val)) {
            ctx.addIssue({
              code: 'custom',
              message: `src "${val}" 在 public/gallery/ 中不存在——请先放入图片文件，再修改 src/data/gallery.json`,
            });
          }
        }),
      caption: z.string().min(1),
      date: z.string().optional().nullable(),
      ...jsonParseErrorField,
    })
    .superRefine((_entry, ctx) => {
      // FR-017：Gallery 精选 8–12 张，超过 12 条由 schema 强制构建报错
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(GALLERY_DATA_FILE, 'utf-8'));
      } catch {
        raw = undefined;
      }
      if (Array.isArray(raw) && raw.length > 12) {
        ctx.addIssue({
          code: 'custom',
          message: `FR-017：src/data/gallery.json 共 ${raw.length} 条，超过上限 12 条，请精选后删除多余的 ${raw.length - 12} 条`,
        });
      }
    }),
});

export const collections = { news, publications, teachers, students, graduates, gallery };
