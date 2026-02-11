/**
 * 合并 CSS 类名，过滤 falsy 值
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
