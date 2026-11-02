/**
 * Estimated reading time.
 *
 * The previous implementation split on whitespace only, so a Chinese article
 * counted as a single "word" and every CJK post showed "0 min". Chinese is
 * counted per character and Latin text per word, using typical reading speeds.
 */

const CJK_PATTERN =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\uac00-\ud7af]/g;

const CJK_CHARS_PER_MINUTE = 400;
const WORDS_PER_MINUTE = 200;

function countReadingUnits(text: string): { cjk: number; words: number } {
  const cjkMatches = text.match(CJK_PATTERN);
  const cjk = cjkMatches ? cjkMatches.length : 0;

  const latinOnly = text.replace(CJK_PATTERN, " ");
  const words = latinOnly.split(/\s+/).filter(Boolean).length;

  return { cjk, words };
}

/** Rounded-up minutes, never zero: any article reads as at least "1 min". */
export function readingMinutes(text: string): number {
  const { cjk, words } = countReadingUnits(text);
  if (cjk === 0 && words === 0) return 1;

  const minutes = cjk / CJK_CHARS_PER_MINUTE + words / WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(minutes));
}

export function readTime(text: string): string {
  return `${readingMinutes(text)} min`;
}
