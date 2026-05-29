import { groq } from "next-sanity";

export const englishWordFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  word,
  phonetic,
  partOfSpeech,
  meaningZh,
  etymology { breakdown, roots[] { part, meaning }, origin, memoryTip },
  phrases[] { phrase, meaningZh },
  examples[] { sentence, source, translationZh },
  derivations[] { word, partOfSpeech, meaningZh },
  level,
  status,
  srsInterval,
  nextReviewAt,
  consecutiveCorrect,
  wrongCount,
  learnedAt,
  lastReviewedAt,
  dailyBatchDate,
  cachedReviewQuiz { type, prompt, answer, options },
  cachedExamQuiz { type, prompt, answer, options }
`;

export const adminEnglishSettingsQuery = groq`*[_type == "englishSettings"][0] {
  _id,
  currentLevel,
  targetExam,
  dailyWordCount,
  masteredThreshold,
  lastStudyDate,
  currentStreak
}`;

export const adminEnglishWordsQuery = groq`*[_type == "englishWord"] | order(_createdAt desc) {
  ${englishWordFields}
}`;

export const adminEnglishWordByIdQuery = groq`*[_type == "englishWord" && _id == $id][0] {
  ${englishWordFields}
}`;

export const adminEnglishWordsByStatusQuery = groq`*[_type == "englishWord" && status == $status] | order(nextReviewAt asc) {
  ${englishWordFields}
}`;

export const adminEnglishWordsDueForReviewQuery = groq`*[
  _type == "englishWord" &&
  status != "mastered" &&
  defined(nextReviewAt) &&
  nextReviewAt <= $today
] | order(nextReviewAt asc) {
  ${englishWordFields}
}`;

export const adminEnglishWordsByBatchQuery = groq`*[
  _type == "englishWord" &&
  dailyBatchDate == $batchDate
] | order(word asc) {
  ${englishWordFields}
}`;

export const adminEnglishKnownWordsQuery = groq`*[_type == "englishWord"]{ word }`;

export const adminEnglishDailyLogByDateQuery = groq`*[
  _type == "englishDailyLog" &&
  date == $date
][0] {
  _id,
  date,
  wordsLearnedCount,
  reviewCount,
  examScore,
  activityLevel,
  learnWordIndex,
  reviewWordIndex,
  completedSteps { review, learn, exam }
}`;

export const adminEnglishDailyLogsQuery = groq`*[
  _type == "englishDailyLog" &&
  date >= $startDate
] | order(date asc) {
  _id,
  date,
  wordsLearnedCount,
  reviewCount,
  examScore,
  activityLevel,
  learnWordIndex,
  reviewWordIndex,
  completedSteps { review, learn, exam }
}`;

export const adminEnglishStatsQuery = groq`{
  "totalWords": count(*[_type == "englishWord"]),
  "masteredWords": count(*[_type == "englishWord" && status == "mastered"]),
  "newWordBookCount": count(*[_type == "englishWord" && status == "new_word_book"]),
  "learningWords": count(*[_type == "englishWord" && status == "learning"]),
  "reviewWords": count(*[_type == "englishWord" && status == "review"])
}`;
