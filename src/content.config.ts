import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { containsWidgetSyntax } from './markdown/news-widgets.mjs';

// 004 FR-011：站点品牌数据校验（显式例外）。site.json 非 collection（001 §7 约定），
// 故在本配置模块加载期直接校验——astro check / astro build 载入本文件时即执行，
// 任一违反立即抛错中断构建，不静默渲染裂图或空名称站点。
const SITE_DATA_FILE = fileURLToPath(new URL('../content/site.json', import.meta.url));
const SITE_ASSET_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const CONTENT_DIR = fileURLToPath(new URL('../content/', import.meta.url));
const ENTRY_DIR_PATTERN = /^\d{2}-[a-z0-9-]+$/;

/**
 * 读取 Markdown frontmatter 中的单行标量字段。
 * 仅用于模块加载期条目审计给出可定位的中文提示；
 * 字段类型、枚举等完整校验仍由 collection schema 负责。
 */
function readFrontmatterScalars(text: string): Record<string, string> | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return null;
  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!field) continue;
    fields[field[1]] = field[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return fields;
}

/**
 * Gallery 条目审计：目录命名、index.md 存在性、总数上限、image 同目录存在性、
 * caption 非空。schema 的 image() 仍作为第二层兜底。
 */
function validateGalleryEntries(): void {
  const galleryDir = join(CONTENT_DIR, 'gallery');
  const entries = readdirSync(galleryDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  let total = 0;

  for (const entry of entries) {
    const entryPath = `content/gallery/${entry.name}`;
    if (!ENTRY_DIR_PATTERN.test(entry.name)) {
      throw new Error(
        `${entryPath} 命名不符合规则——请改为「两位数字序号-小写短名」，如 01-emnlp-2025-suzhou`,
      );
    }
    const indexPath = join(galleryDir, entry.name, 'index.md');
    if (!existsSync(indexPath)) {
      throw new Error(
        `${entryPath} 缺少 index.md——请在该目录新建 index.md 并填写 image / caption`,
      );
    }
    total += 1;

    const fields = readFrontmatterScalars(readFileSync(indexPath, 'utf-8'));
    if (!fields) {
      throw new Error(`${entryPath}/index.md 缺少 frontmatter（--- 包裹的头部）`);
    }

    const image = fields.image;
    if (!image) {
      throw new Error(`${entryPath}/index.md 的 "image" 字段缺失或为空——请填写 image: ./文件名`);
    }
    if (!image.startsWith('./')) {
      throw new Error(
        `${entryPath}/index.md 的 "image" 值 "${image}" 必须写成 ./文件名（图片与 index.md 同目录）`,
      );
    }
    const imageName = image.slice(2);
    if (imageName.length === 0 || imageName.includes('/') || imageName.includes('..')) {
      throw new Error(
        `${entryPath}/index.md 的 "image" 值 "${image}" 必须是同目录图片文件名（禁止 "/"、".." 与子目录）`,
      );
    }
    const imagePath = join(galleryDir, entry.name, imageName);
    if (!existsSync(imagePath)) {
      throw new Error(
        `${entryPath}/index.md 的 "image" 指向的文件不存在（目标路径 ${imagePath}）——请把图片放入该条目目录`,
      );
    }
    if (!fields.caption || fields.caption.trim().length === 0) {
      throw new Error(`${entryPath}/index.md 的 "caption" 字段缺失或为空——请填写中文说明`);
    }
    if ('date' in fields && fields.date.trim().length === 0) {
      throw new Error(
        `${entryPath}/index.md 的 "date" 有值时必须为字符串，如 "2026-11" 或 "2024-06-23"`,
      );
    }
  }

  if (total > 12) {
    throw new Error(
      `content/gallery/ 当前 ${total} 条，超过上限 12 条——请精选保留 12 条，删除或合并多余的 ${total - 12} 条`,
    );
  }
}

/**
 * 教师条目审计：目录命名、index.md 存在性、photo 同目录存在性。
 * photo 为 null 或缺省表示无照片，合法；schema 的 image() 仍作为第二层兜底。
 */
function validateTeacherEntries(): void {
  const teachersDir = join(CONTENT_DIR, 'teachers');
  const entries = readdirSync(teachersDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

  for (const entry of entries) {
    const entryPath = `content/teachers/${entry.name}`;
    if (!ENTRY_DIR_PATTERN.test(entry.name)) {
      throw new Error(
        `${entryPath} 命名不符合规则——请改为「两位数字序号-小写短名」，如 05-zhang-san`,
      );
    }
    const indexPath = join(teachersDir, entry.name, 'index.md');
    if (!existsSync(indexPath)) {
      throw new Error(`${entryPath} 缺少 index.md——请在该目录新建 index.md 并填写教师字段`);
    }

    const fields = readFrontmatterScalars(readFileSync(indexPath, 'utf-8'));
    if (!fields) {
      throw new Error(`${entryPath}/index.md 缺少 frontmatter（--- 包裹的头部）`);
    }

    const photo = fields.photo;
    if (!photo || photo === 'null') continue;
    if (!photo.startsWith('./')) {
      throw new Error(
        `${entryPath}/index.md 的 "photo" 值 "${photo}" 必须写成 ./文件名（照片与 index.md 同目录）`,
      );
    }
    const photoName = photo.slice(2);
    if (photoName.length === 0 || photoName.includes('/') || photoName.includes('..')) {
      throw new Error(
        `${entryPath}/index.md 的 "photo" 值 "${photo}" 必须是同目录图片文件名（禁止 "/"、".." 与子目录）`,
      );
    }
    const photoPath = join(teachersDir, entry.name, photoName);
    if (!existsSync(photoPath)) {
      throw new Error(
        `${entryPath}/index.md 的 "photo" 指向的文件不存在（目标路径 ${photoPath}）——请把照片放入该条目目录`,
      );
    }
  }
}

/**
 * 新闻条目审计：为 title / date / summary 提供可定位到 content/news/<file>.md 的中文报错；
 * 控件语法硬错误由 astro.config.mjs 的 newsWidgetsValidation 负责。
 */
function validateNewsEntries(): void {
  const newsDir = join(CONTENT_DIR, 'news');
  const files: string[] = [];
  const collect = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) collect(join(dir, entry.name));
      else if (entry.isFile() && entry.name.endsWith('.md')) files.push(join(dir, entry.name));
    }
  };
  collect(newsDir);
  files.sort();

  for (const file of files) {
    const relativePath = `content/news/${relative(newsDir, file).split(sep).join('/')}`;
    const fields = readFrontmatterScalars(readFileSync(file, 'utf-8'));
    if (!fields) {
      throw new Error(`${relativePath} 缺少 frontmatter（--- 包裹的头部）`);
    }
    if (!fields.title || fields.title.trim().length === 0) {
      throw new Error(`${relativePath} 的 "title" 字段缺失或为空——请填写新闻标题`);
    }
    if (!fields.date) {
      throw new Error(`${relativePath} 的 "date" 字段缺失——请填写发布日期（如 2026-11-24）`);
    }
    if (Number.isNaN(Date.parse(fields.date))) {
      throw new Error(
        `${relativePath} 的 "date" 值 "${fields.date}" 不是合法日期——请填写 YYYY-MM-DD`,
      );
    }
    if (!fields.summary) {
      throw new Error(`${relativePath} 的 "summary" 字段缺失或为空——请填写一句话摘要`);
    }
    const summaryLength = [...fields.summary].length;
    if (summaryLength > 200) {
      throw new Error(
        `${relativePath} 的 summary 为 ${summaryLength} 个字符（按 code point 计），不得超过 200 个字符`,
      );
    }
  }
}

function validateSiteBrand(): void {
  let siteBrand: Record<string, unknown>;
  try {
    siteBrand = JSON.parse(readFileSync(SITE_DATA_FILE, 'utf-8')) as Record<string, unknown>;
  } catch (e) {
    throw new Error(
      `content/site.json 无法读取或不是合法 JSON：${(e as Error).message}`,
    );
  }

  // (a) 静态资源字段：MUST 为以 "/" 开头、无 ".." 的站内绝对路径，且文件存在于 public/
  for (const field of ['logo', 'favicon']) {
    const value = siteBrand[field];
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        `content/site.json 的 "${field}" 字段缺失或为空——请提供站内绝对路径（如 "/logo.svg"）`,
      );
    }
    if (!value.startsWith('/') || value.includes('..')) {
      throw new Error(
        `content/site.json 的 "${field}" 值 "${value}" 必须是以 "/" 开头且不含 ".." 的站内绝对路径`,
      );
    }
    const targetPath = SITE_ASSET_DIR + value.slice(1);
    if (!existsSync(targetPath)) {
      throw new Error(
        `content/site.json 的 "${field}" 值 "${value}" 指向的文件不存在（目标路径 ${targetPath}）——请先放入 public/ 下的文件，再修改 content/site.json`,
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
        `content/site.json 的 "${field}" 字段缺失或为空字符串——全站命名展示位由该字段派生，请补齐后再构建`,
      );
    }
  }
}

validateSiteBrand();

/**
 * 008 FR-023：新增长文的标题与摘要无法通过 schema 按 entry id 校验
 * （Astro 不向 schema 暴露 id），故在模块加载期直接扫描该 Markdown 的
 * frontmatter，任一项违反即抛错中断构建。只作用于本特性新增的文章，
 * 不改变既有新闻的摘要长度规则。
 */
const FEATURED_NEWS_FILE = fileURLToPath(
  new URL('../content/news/self-taught-rlvr-2026.md', import.meta.url),
);
const REFERENCE_ARTICLE_TITLE =
  '让大模型学会「自己教自己」！京东&中科院信工所连发三篇论文定义Self-Taught RLVR';
const CJK = /[\u4e00-\u9fff]/g;

function validateFeaturedNews(): void {
  if (!existsSync(FEATURED_NEWS_FILE)) return;

  const text = readFileSync(FEATURED_NEWS_FILE, 'utf-8');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!frontmatter) {
    throw new Error(`content/news/self-taught-rlvr-2026.md 缺少 frontmatter（--- 包裹的头部）`);
  }

  const fields: Record<string, string> = {};
  for (const line of frontmatter[1].split(/\r?\n/)) {
    const match = /^(title|summary):\s*(.*)$/.exec(line);
    if (!match) continue;
    fields[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }

  const title = fields.title ?? '';
  const summary = fields.summary ?? '';
  const cjkTitleCount = (title.match(CJK) ?? []).length;
  const summaryLength = [...summary].length;

  if (cjkTitleCount > 40) {
    throw new Error(
      `content/news/self-taught-rlvr-2026.md 的 title 含 ${cjkTitleCount} 个 CJK 统一表意文字，超过上限 40 个`,
    );
  }
  if (title.trim() === REFERENCE_ARTICLE_TITLE) {
    throw new Error(
      `content/news/self-taught-rlvr-2026.md 的 title 不得与参考文章标题相同，请改写为原创标题`,
    );
  }
  if (summaryLength < 80 || summaryLength > 200) {
    throw new Error(
      `content/news/self-taught-rlvr-2026.md 的 summary 为 ${summaryLength} 个字符（按 code point 计），必须为 80–200 个字符`,
    );
  }
  if (containsWidgetSyntax(summary)) {
    throw new Error(
      `content/news/self-taught-rlvr-2026.md 的 summary 不得包含 :::highlight、:::table 或 \`\`\`bibtex 控件语法`,
    );
  }
}

validateFeaturedNews();

/**
 * 013 FR-009：students.json 的 directions 契约需要定位到文件、学生姓名与项序号，
 * 而 schema 错误只暴露 entry id，故在模块加载期直接读取原始数组校验。
 * 缺失、非数组、空数组、含非字符串 / 空 / 纯空白项均抛错中断构建；
 * 不新增入学年份残留检测（评审决定：由数据清理与检索保证）。
 */
const STUDENTS_DATA_FILE = fileURLToPath(new URL('../content/students.json', import.meta.url));

function validateStudentsData(): void {
  let rawStudents: unknown;
  try {
    rawStudents = JSON.parse(readFileSync(STUDENTS_DATA_FILE, 'utf-8'));
  } catch (e) {
    throw new Error(
      `content/students.json 无法读取或不是合法 JSON：${(e as Error).message}`,
    );
  }

  if (!Array.isArray(rawStudents)) {
    throw new Error(
      `content/students.json 顶层必须是数组，实际为 ${rawStudents === null ? 'null' : typeof rawStudents}`,
    );
  }

  rawStudents.forEach((student, index) => {
    const record =
      student && typeof student === 'object' && !Array.isArray(student)
        ? (student as Record<string, unknown>)
        : {};
    const name =
      typeof record.name === 'string' && record.name.trim().length > 0
        ? record.name
        : `第 ${index + 1} 条记录`;

    if (!('directions' in record)) {
      throw new Error(
        `content/students.json 学生「${name}」缺少 directions 字段——请提供至少 1 项研究方向字符串`,
      );
    }

    const directions = record.directions;
    if (!Array.isArray(directions)) {
      throw new Error(
        `content/students.json 学生「${name}」的 directions 必须是字符串数组，实际为 ${directions === null ? 'null' : typeof directions}`,
      );
    }

    if (directions.length === 0) {
      throw new Error(
        `content/students.json 学生「${name}」的 directions 至少需要 1 项，不能为空数组`,
      );
    }

    directions.forEach((direction, itemIndex) => {
      if (typeof direction !== 'string' || direction.trim().length === 0) {
        throw new Error(
          `content/students.json 学生「${name}」的 directions[${itemIndex}] 必须是非空字符串（不能为空或纯空白），实际为 ${JSON.stringify(direction)}`,
        );
      }
    });
  });
}

validateStudentsData();

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
          _jsonParseError: `content/${fileName} 不是合法 JSON：${(e as Error).message}`,
        },
      ];
    }
    if (!Array.isArray(data)) {
      return [
        {
          id: `${prefix}-parse-error`,
          _jsonParseError: `content/${fileName} 顶层必须是数组，实际为 ${typeof data}`,
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

/**
 * 007 FR-014：成员链接字段三选一（url / github / scholar 至多一个非空）。
 * 非空字段 ≥2 时构建失败，错误信息同时给出数据文件、成员姓名与按 url → github → scholar
 * 顺序排列的全部冲突字段；三者皆空合法（不渲染标签）。解析错误载体在基础字段校验阶段失败，
 * 此处以 !entry.name 防御后跳过。
 */
function singleLinkRefiner(dataFile: string) {
  return (
    entry: { name?: string; url?: string | null; github?: string | null; scholar?: string | null },
    ctx: z.RefinementCtx,
  ) => {
    if (!entry.name) return;
    const conflicts: string[] = [];
    if (entry.url) conflicts.push('url');
    if (entry.github) conflicts.push('github');
    if (entry.scholar) conflicts.push('scholar');
    if (conflicts.length < 2) return;
    ctx.addIssue({
      code: 'custom',
      message: `${dataFile} 成员「${entry.name}」同时填写了 ${conflicts.join('、')} —— 每人至多填写一个链接字段（url / github / scholar 三选一）`,
    });
  };
}

validateGalleryEntries();
validateTeacherEntries();
validateNewsEntries();

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/news' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    summary: z
      .string()
      .min(1)
      .refine((v) => [...v].length <= 200, {
        message: 'summary 不得超过 200 个字符（按 code point 计）',
      }),
    cover: z.string().optional(),
  }),
});

const publications = defineCollection({
  loader: file('content/publications.json', {
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
      // FR-018：ccf 缺省必须省略字段，拒绝 null（不再允许 .nullable()）
      ccf: z.enum(['A', 'B', 'C']).optional(),
      url: httpsUrl,
      featured: z.boolean().optional().default(false),
      authors: z.array(z.string()).optional(),
      ...jsonParseErrorField,
    })
    .superRefine((pub, ctx) => {
      // FR-007 / FR-018：url 缺省时必须省略字段，不得写 JSON null
      if (pub.url === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['url'],
          message: `条目 "${pub.title}" 的 url 缺省必须省略字段，不得为 null`,
        });
      }
      // FR-011：有链接的条目 MUST 有 date
      if (pub.url && !pub.date) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: `有 url 的条目 "${pub.title}" 必须填写 date（YYYY-MM-DD）`,
        });
      }
      // FR-007：无链接的条目 MUST 不保留 date（反向配对，移除链接须同步移除日期）
      if (!pub.url && pub.date) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: `无 url 的条目 "${pub.title}" 不得保留 date，移除链接时须同步删除 date`,
        });
      }
    }),
});

const teachers = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './content/teachers' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      title: z.string().min(1),
      advisorRole: z.enum(['phd', 'master']),
      directions: z.array(z.string()).min(1),
      email: z.email().optional().nullable(),
      ucasProfile: httpsUrl,
      homepage: httpsUrl,
      // 同目录相对路径（./文件名）；null / 缺省表示无照片，合法。
      // 文件存在性与路径形式由 image() 与条目审计共同校验。
      photo: image().nullable().optional(),
      bio: z.string().optional().nullable(),
    }),
});

const students = defineCollection({
  loader: file('content/students.json', {
    parser: jsonArrayParser('students.json', 'stu'),
  }),
  schema: z
    .object({
      name: z.string().min(1),
      level: z.enum(['phd', 'master']),
      // 013 FR-001 / FR-002：以非空研究方向数组取代入学年份字段；
      // 文件、姓名与项序号级错误由上方 validateStudentsData 提供
      directions: z.array(z.string().min(1).refine((v) => v.trim().length > 0)).min(1),
      url: httpsUrl,
      github: httpsUrl,
      scholar: httpsUrl,
      ...jsonParseErrorField,
    })
    .superRefine(singleLinkRefiner('content/students.json')),
});

const graduates = defineCollection({
  loader: file('content/graduates.json', {
    parser: jsonArrayParser('graduates.json', 'gra'),
  }),
  schema: z
    .object({
      name: z.string().min(1),
      destination: z.string().min(1),
      degree: z.enum(['phd', 'master']),
      year: z.number().int().optional().nullable(),
      url: httpsUrl,
      github: httpsUrl,
      scholar: httpsUrl,
      ...jsonParseErrorField,
    })
    .superRefine(singleLinkRefiner('content/graduates.json')),
});

const gallery = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './content/gallery' }),
  schema: ({ image }) =>
    z.object({
      // 同目录相对路径（./文件名）；文件存在性由 image() 与条目审计共同校验
      image: image(),
      caption: z.string().min(1),
      date: z.string().optional(),
    }),
});

export const collections = { news, publications, teachers, students, graduates, gallery };
