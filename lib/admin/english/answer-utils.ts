export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isAnswerCorrect(given: string, expected: string): boolean {
  return normalizeAnswer(given) === normalizeAnswer(expected);
}
