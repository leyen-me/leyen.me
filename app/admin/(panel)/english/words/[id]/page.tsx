"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import WordDetailView, { type WordDetail } from "@/app/admin/components/english/WordDetailView";
import { useEnrichedWord } from "@/app/admin/hooks/useEnrichedWord";

export default function EnglishWordDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [word, setWord] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { word: enrichedWord, loading: enriching, error: enrichError } =
    useEnrichedWord(word);

  useEffect(() => {
    fetch(`/api/admin/english/words/${id}`)
      .then((r) => r.json())
      .then(setWord)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-zinc-500">加载中...</p>;
  if (!word?.word) return <p className="text-zinc-500">单词不存在</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={word.word}
        action={
          <Button asChild variant="outline">
            <Link href="/admin/english/words">返回单词本</Link>
          </Button>
        }
      />

      {enrichError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{enrichError}</p>
      )}

      {enriching ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          AI 正在生成单词详解...
        </div>
      ) : (
        <WordDetailView word={enrichedWord ?? word} />
      )}
    </div>
  );
}
