import {
  addDaysToDateString,
  getTodayDateString,
  SRS_INTERVALS,
  type EnglishWordStatus,
} from "@/lib/admin/english/constants";

export type SrsUpdateInput = {
  srsInterval: number;
  consecutiveCorrect: number;
  wrongCount: number;
  status: EnglishWordStatus;
};

export type SrsUpdateResult = SrsUpdateInput & {
  nextReviewAt: string;
  lastReviewedAt: string;
};

export function applySrsCorrect(
  current: SrsUpdateInput,
  masteredThreshold: number
): SrsUpdateResult {
  const today = getTodayDateString();
  const currentIdx = SRS_INTERVALS.indexOf(
    current.srsInterval as (typeof SRS_INTERVALS)[number]
  );
  const nextIdx =
    currentIdx < 0 ? 0 : Math.min(currentIdx + 1, SRS_INTERVALS.length - 1);
  const newInterval = SRS_INTERVALS[nextIdx];
  const newConsecutive = current.consecutiveCorrect + 1;

  let status: EnglishWordStatus = "review";
  if (newConsecutive >= masteredThreshold) {
    status = "mastered";
  } else if (current.status === "new_word_book") {
    status = "new_word_book";
  }

  return {
    srsInterval: newInterval,
    consecutiveCorrect: newConsecutive,
    wrongCount: current.wrongCount,
    status,
    nextReviewAt: addDaysToDateString(today, newInterval),
    lastReviewedAt: today,
  };
}

export function applySrsWrong(current: SrsUpdateInput): SrsUpdateResult {
  const today = getTodayDateString();

  return {
    srsInterval: 1,
    consecutiveCorrect: 0,
    wrongCount: current.wrongCount + 1,
    status: "new_word_book",
    nextReviewAt: addDaysToDateString(today, 1),
    lastReviewedAt: today,
  };
}

export function createInitialSrsFields(): SrsUpdateResult {
  const today = getTodayDateString();
  return {
    srsInterval: 1,
    consecutiveCorrect: 0,
    wrongCount: 0,
    status: "learning",
    nextReviewAt: addDaysToDateString(today, 1),
    lastReviewedAt: today,
  };
}
