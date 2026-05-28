import { z } from "zod";
import { SLUG_REGEX } from "@/lib/utils";

export const imageInputSchema = z.object({
  assetId: z.string().min(1),
  alt: z.string().nullish(),
});

export const slugSchema = z
  .string()
  .min(1)
  .regex(
    SLUG_REGEX,
    "Slug must start with a lowercase letter and contain only a-z, 0-9, and hyphens"
  );

export const postSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  description: z.string().min(1),
  canonicalLink: z.string().url().optional().or(z.literal("")),
  date: z.string().optional(),
  coverImage: imageInputSchema.optional().nullable(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).min(1),
  authorId: z.string().min(1),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const interviewSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  category: z.string().min(1),
  answer: z.string().min(1),
  isPublished: z.boolean().optional(),
});

export const authorSchema = z.object({
  name: z.string().min(1),
  photo: imageInputSchema,
  twitterUrl: z.string().url(),
});

export const quoteSchema = z.object({
  contentType: z.enum(["quote", "essay"]),
  quote: z.string().optional(),
  author: z.string().min(1),
  context: z.string().optional(),
  tags: z.array(z.string()).min(1),
});

export const movieSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  mediaType: z.enum(["movie", "tv"]),
  coverImage: imageInputSchema,
  rating: z.number().min(0).max(10).optional().nullable(),
  releaseDate: z.string().optional(),
  director: z.string().optional(),
  cast: z.array(z.string()).optional(),
  description: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
});

export const jobSchema = z.object({
  name: z.string().min(1),
  jobTitle: z.string().min(1),
  logo: imageInputSchema.optional().nullable(),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
  tagline: z.string().min(1).max(60),
  logo: imageInputSchema.optional().nullable(),
  projectUrl: z.string().url().optional().or(z.literal("")),
  repository: z.string().url().optional().or(z.literal("")),
  coverImage: imageInputSchema.optional().nullable(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const profileSchema = z.object({
  fullName: z.string().min(1),
  headline: z.string().min(1),
  profileImage: imageInputSchema,
  shortBio: z.string().min(1),
  email: z.string().email(),
  location: z.string().min(1),
  fullBio: z.string().optional(),
  usage: z.string().optional(),
  resumeAssetId: z.string().optional(),
});

export type PostInput = z.infer<typeof postSchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type MovieInput = z.infer<typeof movieSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

export const englishLevelSchema = z.enum([
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "ielts",
  "toefl",
]);

export const englishTargetExamSchema = z.enum(["none", "ielts", "toefl"]);

export const englishWordStatusSchema = z.enum([
  "learning",
  "review",
  "mastered",
  "new_word_book",
]);

export const englishExampleSourceSchema = z.enum([
  "ielts",
  "toefl",
  "movie",
  "general",
]);

export const englishPhraseSchema = z.object({
  phrase: z.string(),
  meaningZh: z.string(),
});

export const englishExampleSchema = z.object({
  sentence: z.string(),
  source: englishExampleSourceSchema,
  translationZh: z.string(),
});

export const englishDerivationSchema = z.object({
  word: z.string(),
  partOfSpeech: z.string(),
  meaningZh: z.string(),
});

export const englishSettingsSchema = z.object({
  currentLevel: englishLevelSchema,
  targetExam: englishTargetExamSchema,
  dailyWordCount: z.number().int().min(1).max(50).optional(),
  masteredThreshold: z.number().int().min(1).max(10).optional(),
});

export const englishWordPatchSchema = z.object({
  status: englishWordStatusSchema.optional(),
});

export const englishDailyStepSchema = z.enum(["review", "learn", "exam"]);

export const englishDailyUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  step: englishDailyStepSchema,
  wordsLearnedCount: z.number().int().min(0).optional(),
  reviewCount: z.number().int().min(0).optional(),
  examScore: z.number().min(0).max(100).optional(),
});

export const englishReviewResultSchema = z.object({
  results: z.array(
    z.object({
      wordId: z.string().min(1),
      correct: z.boolean(),
    })
  ),
});

export const englishExamResultSchema = z.object({
  batchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  results: z.array(
    z.object({
      wordId: z.string().min(1),
      correct: z.boolean(),
    })
  ),
});

export const englishGenerateWordsInputSchema = z.object({
  batchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const englishEnrichWordsInputSchema = z
  .object({
    wordId: z.string().min(1).optional(),
    wordIds: z.array(z.string().min(1)).min(1).optional(),
  })
  .refine((data) => data.wordId || (data.wordIds && data.wordIds.length > 0), {
    message: "wordId or wordIds is required",
  });

export const englishGenerateQuizInputSchema = z.object({
  wordIds: z.array(z.string().min(1)).min(1),
  mode: z.enum(["review", "new_words"]).optional(),
  questionTypes: z
    .array(z.enum(["dictation", "multiple_choice", "fill_blank"]))
    .optional(),
});

export const englishGenerateGrammarInputSchema = z.object({
  topic: z.string().optional(),
  count: z.number().int().min(1).max(10).optional(),
});

export const englishExplainInputSchema = z.object({
  question: z.string().min(1),
  context: z.string().optional(),
});

export type EnglishSettingsInput = z.infer<typeof englishSettingsSchema>;
export type EnglishWordPatchInput = z.infer<typeof englishWordPatchSchema>;
export type EnglishDailyUpdateInput = z.infer<typeof englishDailyUpdateSchema>;
export type EnglishReviewResultInput = z.infer<typeof englishReviewResultSchema>;
export type EnglishExamResultInput = z.infer<typeof englishExamResultSchema>;
