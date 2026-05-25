import {
  computeActivityLevel,
  DEFAULT_ENGLISH_SETTINGS,
  getTodayDateString,
} from "@/lib/admin/english/constants";
import type { EnglishDailyLogDoc, EnglishSettingsDoc } from "@/lib/admin/english/daily-flow";
import {
  adminEnglishDailyLogByDateQuery,
  adminEnglishSettingsQuery,
} from "@/lib/admin/english/queries";
import { writeClient } from "@/lib/sanity.write";

export async function getOrCreateSettings(): Promise<EnglishSettingsDoc> {
  const existing = await writeClient.fetch<EnglishSettingsDoc | null>(
    adminEnglishSettingsQuery
  );

  if (existing) {
    return {
      ...DEFAULT_ENGLISH_SETTINGS,
      ...existing,
      dailyWordCount: existing.dailyWordCount ?? 20,
      masteredThreshold: existing.masteredThreshold ?? 3,
      currentStreak: existing.currentStreak ?? 0,
    };
  }

  const created = await writeClient.create({
    _type: "englishSettings",
    ...DEFAULT_ENGLISH_SETTINGS,
  });

  return {
    _id: created._id,
    ...DEFAULT_ENGLISH_SETTINGS,
  };
}

export async function updateSettings(
  data: Partial<EnglishSettingsDoc>
): Promise<void> {
  const settings = await getOrCreateSettings();

  if (settings._id) {
    await writeClient.patch(settings._id).set(data).commit();
  } else {
    await writeClient.create({
      _type: "englishSettings",
      ...DEFAULT_ENGLISH_SETTINGS,
      ...data,
    });
  }
}

export async function getOrCreateDailyLog(
  date: string
): Promise<EnglishDailyLogDoc> {
  const existing = await writeClient.fetch<EnglishDailyLogDoc | null>(
    adminEnglishDailyLogByDateQuery,
    { date }
  );

  if (existing) return existing;

  const created = await writeClient.create({
    _type: "englishDailyLog",
    date,
    wordsLearnedCount: 0,
    reviewCount: 0,
    examScore: 0,
    activityLevel: 0,
    completedSteps: { review: false, learn: false, exam: false },
  });

  return {
    _id: created._id,
    date,
    wordsLearnedCount: 0,
    reviewCount: 0,
    examScore: 0,
    activityLevel: 0,
    completedSteps: { review: false, learn: false, exam: false },
  };
}

export async function updateDailyLog(
  date: string,
  patch: Partial<Omit<EnglishDailyLogDoc, "completedSteps">> & {
    completedSteps?: Partial<EnglishDailyLogDoc["completedSteps"]>;
  }
): Promise<EnglishDailyLogDoc> {
  const log = await getOrCreateDailyLog(date);
  const merged = {
    ...log,
    ...patch,
    completedSteps: {
      ...log.completedSteps,
      ...patch.completedSteps,
    },
  };

  merged.activityLevel = computeActivityLevel({
    wordsLearnedCount: merged.wordsLearnedCount,
    reviewCount: merged.reviewCount,
    examScore: merged.examScore,
  });

  if (log._id) {
    await writeClient.patch(log._id).set(merged).commit();
  }

  return merged;
}

export async function updateStreakAfterStudy(): Promise<void> {
  const today = getTodayDateString();
  const settings = await getOrCreateSettings();
  const yesterday = new Date(`${today}T12:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newStreak = 1;
  if (settings.lastStudyDate === today) {
    newStreak = settings.currentStreak;
  } else if (settings.lastStudyDate === yesterdayStr) {
    newStreak = settings.currentStreak + 1;
  }

  await updateSettings({
    lastStudyDate: today,
    currentStreak: newStreak,
  });
}

export { normalizeAnswer, isAnswerCorrect } from "@/lib/admin/english/answer-utils";
