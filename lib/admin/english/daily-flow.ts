import type { EnglishWordStatus } from "@/lib/admin/english/constants";
import { getTodayDateString } from "@/lib/admin/english/constants";
import {
  adminEnglishDailyLogByDateQuery,
  adminEnglishSettingsQuery,
  adminEnglishWordsByBatchQuery,
  adminEnglishWordsDueForReviewQuery,
} from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

export type EnglishWordDoc = {
  _id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaningZh?: string;
  etymology?: {
    breakdown?: string;
    roots?: Array<{ part: string; meaning: string }>;
    origin?: string;
    memoryTip?: string;
  };
  phrases?: Array<{ phrase: string; meaningZh: string }>;
  examples?: Array<{
    sentence: string;
    source: string;
    translationZh: string;
  }>;
  derivations?: Array<{
    word: string;
    partOfSpeech: string;
    meaningZh: string;
  }>;
  level?: string;
  status: EnglishWordStatus;
  srsInterval?: number;
  nextReviewAt?: string;
  consecutiveCorrect?: number;
  wrongCount?: number;
  learnedAt?: string;
  lastReviewedAt?: string;
  dailyBatchDate?: string;
  cachedReviewQuiz?: {
    type: string;
    prompt: string;
    answer: string;
    options?: string[];
  };
  cachedExamQuiz?: {
    type: string;
    prompt: string;
    answer: string;
    options?: string[];
  };
};

export type EnglishSettingsDoc = {
  _id?: string;
  currentLevel: string;
  targetExam: string;
  dailyWordCount: number;
  masteredThreshold: number;
  lastStudyDate?: string;
  currentStreak: number;
};

export type EnglishDailyLogDoc = {
  _id?: string;
  date: string;
  wordsLearnedCount: number;
  reviewCount: number;
  examScore: number;
  activityLevel: number;
  learnWordIndex?: number;
  reviewWordIndex?: number;
  completedSteps: {
    review: boolean;
    learn: boolean;
    exam: boolean;
  };
};

export type StudyStep = "review" | "learn" | "exam" | "done";

export type TodayStudyState = {
  today: string;
  currentStep: StudyStep;
  settings: EnglishSettingsDoc;
  dailyLog: EnglishDailyLogDoc | null;
  reviewWords: EnglishWordDoc[];
  todayWords: EnglishWordDoc[];
  hasTodayBatch: boolean;
  learnWordIndex: number;
  reviewWordIndex: number;
};

function resolveCurrentStep(
  dailyLog: EnglishDailyLogDoc | null,
  reviewWords: EnglishWordDoc[],
  todayWords: EnglishWordDoc[]
): StudyStep {
  const steps = dailyLog?.completedSteps;

  if (reviewWords.length > 0 && !steps?.review) {
    return "review";
  }
  if (todayWords.length === 0) {
    return "learn";
  }
  if (!steps?.learn) {
    return "learn";
  }
  if (!steps?.exam) {
    return "exam";
  }
  return "done";
}

export async function getTodayStudyState(): Promise<TodayStudyState> {
  const today = getTodayDateString();
  const [settings, dailyLog, reviewWords, todayWords] = await Promise.all([
    writeClient.fetch<EnglishSettingsDoc | null>(adminEnglishSettingsQuery),
    writeClient.fetch<EnglishDailyLogDoc | null>(
      adminEnglishDailyLogByDateQuery,
      { date: today }
    ),
    writeClient.fetch<EnglishWordDoc[]>(adminEnglishWordsDueForReviewQuery, {
      today,
    }),
    writeClient.fetch<EnglishWordDoc[]>(adminEnglishWordsByBatchQuery, {
      batchDate: today,
    }),
  ]);

  const resolvedSettings: EnglishSettingsDoc = {
    currentLevel: settings?.currentLevel ?? "A1",
    targetExam: settings?.targetExam ?? "none",
    dailyWordCount: settings?.dailyWordCount ?? 20,
    masteredThreshold: settings?.masteredThreshold ?? 3,
    lastStudyDate: settings?.lastStudyDate,
    currentStreak: settings?.currentStreak ?? 0,
    _id: settings?._id,
  };

  return {
    today,
    settings: resolvedSettings,
    dailyLog,
    reviewWords,
    todayWords,
    hasTodayBatch: todayWords.length > 0,
    learnWordIndex: dailyLog?.learnWordIndex ?? 0,
    reviewWordIndex: dailyLog?.reviewWordIndex ?? 0,
    currentStep: resolveCurrentStep(dailyLog, reviewWords, todayWords),
  };
}
