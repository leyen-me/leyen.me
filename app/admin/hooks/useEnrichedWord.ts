"use client";

import { useEffect, useState } from "react";
import { isWordEnriched } from "@/lib/admin/english/word-utils";
import type { WordDetail } from "@/app/admin/components/english/WordDetailView";

export function useEnrichedWord(word: WordDetail | null | undefined) {
  const [enrichedWord, setEnrichedWord] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!word) {
      setEnrichedWord(null);
      setLoading(false);
      setError("");
      return;
    }

    if (isWordEnriched(word)) {
      setEnrichedWord(word);
      setError("");
      setLoading(false);
      return;
    }

    const currentWord = word;
    const wordId = currentWord._id;
    let cancelled = false;

    async function enrich() {
      setLoading(true);
      setError("");
      setEnrichedWord(currentWord);

      try {
        const res = await fetch("/api/admin/ai/english/enrich-words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wordId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "生成详解失败");
        if (!cancelled) {
          setEnrichedWord(data.word as WordDetail);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "生成详解失败");
          setEnrichedWord(currentWord);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    enrich();

    return () => {
      cancelled = true;
    };
  }, [word?._id]);

  return { word: enrichedWord ?? word ?? null, loading, error };
}
