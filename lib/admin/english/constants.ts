export const ENGLISH_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "ielts",
  "toefl",
] as const;

export type EnglishLevel = (typeof ENGLISH_LEVELS)[number];

export const ENGLISH_LEVEL_LABELS: Record<EnglishLevel, string> = {
  A1: "A1 零基础",
  A2: "A2 初级",
  B1: "B1 中级",
  B2: "B2 中高级",
  C1: "C1 高级",
  C2: "C2 精通",
  ielts: "雅思",
  toefl: "托福",
};

export const ENGLISH_WORD_STATUSES = [
  "learning",
  "review",
  "mastered",
  "new_word_book",
] as const;

export type EnglishWordStatus = (typeof ENGLISH_WORD_STATUSES)[number];

export const ENGLISH_WORD_STATUS_LABELS: Record<EnglishWordStatus, string> = {
  learning: "学习中",
  review: "复习中",
  mastered: "已掌握",
  new_word_book: "生词本",
};

export const SRS_INTERVALS = [1, 3, 7, 14, 30] as const;

export const DEFAULT_ENGLISH_SETTINGS = {
  currentLevel: "A1" as EnglishLevel,
  targetExam: "none" as const,
  dailyWordCount: 20,
  masteredThreshold: 3,
  currentStreak: 0,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computeActivityLevel(input: {
  wordsLearnedCount: number;
  reviewCount: number;
  examScore: number;
}): number {
  const score =
    (input.wordsLearnedCount >= 20 ? 2 : input.wordsLearnedCount >= 10 ? 1 : 0) +
    (input.reviewCount >= 10 ? 1 : input.reviewCount > 0 ? 0.5 : 0) +
    (input.examScore >= 80 ? 1 : input.examScore >= 50 ? 0.5 : 0);
  if (score >= 3.5) return 4;
  if (score >= 2.5) return 3;
  if (score >= 1.5) return 2;
  if (score >= 0.5) return 1;
  return 0;
}
