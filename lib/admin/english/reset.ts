import { writeClient } from "@/lib/sanity.write";

export const ENGLISH_DOCUMENT_TYPES = [
  "englishWord",
  "englishSettings",
  "englishDailyLog",
] as const;

export type EnglishDocumentType = (typeof ENGLISH_DOCUMENT_TYPES)[number];

export async function countEnglishDocuments(): Promise<
  Record<EnglishDocumentType, number>
> {
  const counts = await writeClient.fetch<Record<string, number>>(
    `{
      "englishWord": count(*[_type == "englishWord"]),
      "englishSettings": count(*[_type == "englishSettings"]),
      "englishDailyLog": count(*[_type == "englishDailyLog"])
    }`
  );

  return {
    englishWord: counts.englishWord ?? 0,
    englishSettings: counts.englishSettings ?? 0,
    englishDailyLog: counts.englishDailyLog ?? 0,
  };
}

/** 删除所有 English 学习相关 Sanity 文档（单词、设置、每日记录） */
export async function resetAllEnglishData(): Promise<{
  deleted: Record<EnglishDocumentType, number>;
}> {
  const before = await countEnglishDocuments();
  const deleted = { ...before };

  for (const type of ENGLISH_DOCUMENT_TYPES) {
    if (before[type] === 0) continue;
    await writeClient.delete({ query: `*[_type == "${type}"]` });
  }

  return { deleted };
}
