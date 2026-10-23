export type ClassValue = string | false | null | undefined

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ")
}

// 从字符串里去掉 LaTeX 标记，用于列表预览。
export function stripLatex(text: string): string {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, "〔公式〕")
    .replace(/\$[^$]*?\$/g, "〔公式〕")
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// 可读的 LaTeX 预览：保留题目主体，压缩长度。
export function toPreview(text: string, maxLength = 140): string {
  const clean = stripLatex(text)
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).trimEnd()}…`
}
