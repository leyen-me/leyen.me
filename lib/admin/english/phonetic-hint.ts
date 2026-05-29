/** 格式化为 /.../ 形式的音标提示 */
export function formatPhoneticHint(phonetic?: string): string | null {
  if (!phonetic?.trim()) return null;

  const inner = phonetic.trim().replace(/^\/+|\/+$/g, "");
  if (!inner) return null;

  return `/${inner}/`;
}
