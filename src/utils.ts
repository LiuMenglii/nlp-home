/** 站内路径拼接 base 前缀（GitHub Pages 子路径部署时 URL 需带 /<repo> 前缀） */
const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL;

export function withBase(path: string): string {
  return `${BASE}${path}`;
}

/** 归一化路径用于当前页判断（去尾部斜杠） */
export function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}
