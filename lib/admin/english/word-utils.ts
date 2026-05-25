export type WordEnrichCheck = {
  phonetic?: string;
  partOfSpeech?: string;
  meaningZh?: string;
  phrases?: unknown[];
  examples?: unknown[];
};

export function isWordEnriched(word: WordEnrichCheck): boolean {
  return Boolean(
    word.phonetic &&
      word.partOfSpeech &&
      word.meaningZh &&
      word.phrases?.length &&
      word.examples?.length
  );
}
