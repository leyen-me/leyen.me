export type ExampleSource = "ielts" | "toefl" | "movie" | "general";

export function normalizeExampleSource(value: unknown): ExampleSource {
  if (typeof value !== "string" || !value.trim()) return "general";

  const v = value.toLowerCase().trim();

  if (v === "ielts" || v.includes("ielts") || v.includes("雅思")) return "ielts";
  if (v === "toefl" || v.includes("toefl") || v.includes("托福")) return "toefl";
  if (
    v === "movie" ||
    v === "film" ||
    v.includes("movie") ||
    v.includes("film") ||
    v.includes("电影") ||
    v.includes("影视")
  ) {
    return "movie";
  }
  if (v === "general" || v.includes("general") || v.includes("日常")) {
    return "general";
  }

  return "general";
}

type RawEnrichedWord = {
  word?: unknown;
  phonetic?: unknown;
  partOfSpeech?: unknown;
  meaningZh?: unknown;
  etymology?: unknown;
  phrases?: unknown;
  examples?: unknown;
  derivations?: unknown;
};

export type EtymologyData = {
  breakdown?: string;
  roots?: Array<{ part: string; meaning: string }>;
  origin?: string;
  memoryTip?: string;
};

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeEtymology(raw: unknown): EtymologyData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const data = raw as {
    breakdown?: unknown;
    roots?: unknown;
    origin?: unknown;
    memoryTip?: unknown;
  };

  const roots = Array.isArray(data.roots)
    ? data.roots
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const r = item as { part?: unknown; meaning?: unknown };
          const part = asTrimmedString(r.part);
          const meaning = asTrimmedString(r.meaning);
          if (!part || !meaning) return null;
          return { part, meaning };
        })
        .filter((item): item is { part: string; meaning: string } => Boolean(item))
    : [];

  const result: EtymologyData = {
    breakdown: asTrimmedString(data.breakdown),
    roots: roots.length > 0 ? roots : undefined,
    origin: asTrimmedString(data.origin),
    memoryTip: asTrimmedString(data.memoryTip),
  };

  const hasContent =
    result.breakdown || result.roots || result.origin || result.memoryTip;
  return hasContent ? result : undefined;
}

export function normalizeEnrichedWord(raw: unknown): {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaningZh: string;
  etymology?: EtymologyData;
  phrases: Array<{ phrase: string; meaningZh: string }>;
  examples: Array<{
    sentence: string;
    source: ExampleSource;
    translationZh: string;
  }>;
  derivations: Array<{ word: string; partOfSpeech: string; meaningZh: string }>;
} | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as RawEnrichedWord;
  if (typeof data.word !== "string" || !data.word.trim()) return null;
  if (typeof data.meaningZh !== "string" || !data.meaningZh.trim()) return null;

  const phrases = Array.isArray(data.phrases)
    ? data.phrases
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const p = item as { phrase?: unknown; meaningZh?: unknown };
          if (typeof p.phrase !== "string" || typeof p.meaningZh !== "string") {
            return null;
          }
          return { phrase: p.phrase.trim(), meaningZh: p.meaningZh.trim() };
        })
        .filter((item): item is { phrase: string; meaningZh: string } => Boolean(item))
    : [];

  const examples = Array.isArray(data.examples)
    ? data.examples
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const ex = item as {
            sentence?: unknown;
            source?: unknown;
            translationZh?: unknown;
          };
          if (
            typeof ex.sentence !== "string" ||
            typeof ex.translationZh !== "string"
          ) {
            return null;
          }
          return {
            sentence: ex.sentence.trim(),
            source: normalizeExampleSource(ex.source),
            translationZh: ex.translationZh.trim(),
          };
        })
        .filter(
          (
            item
          ): item is {
            sentence: string;
            source: ExampleSource;
            translationZh: string;
          } => Boolean(item)
        )
    : [];

  const derivations = Array.isArray(data.derivations)
    ? data.derivations
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const d = item as {
            word?: unknown;
            partOfSpeech?: unknown;
            meaningZh?: unknown;
          };
          if (
            typeof d.word !== "string" ||
            typeof d.partOfSpeech !== "string" ||
            typeof d.meaningZh !== "string"
          ) {
            return null;
          }
          return {
            word: d.word.trim(),
            partOfSpeech: d.partOfSpeech.trim(),
            meaningZh: d.meaningZh.trim(),
          };
        })
        .filter(
          (
            item
          ): item is { word: string; partOfSpeech: string; meaningZh: string } =>
            Boolean(item)
        )
    : [];

  if (phrases.length === 0 || examples.length === 0) return null;

  return {
    word: data.word.trim(),
    phonetic:
      typeof data.phonetic === "string" && data.phonetic.trim()
        ? data.phonetic.trim()
        : "",
    partOfSpeech:
      typeof data.partOfSpeech === "string" && data.partOfSpeech.trim()
        ? data.partOfSpeech.trim()
        : "n.",
    meaningZh: data.meaningZh.trim(),
    etymology: normalizeEtymology(data.etymology),
    phrases,
    examples,
    derivations,
  };
}
