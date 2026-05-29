"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type WordDetail = {
  _id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaningZh?: string;
  morphology?: {
    breakdown?: string;
    parts?: Array<{ type?: "prefix" | "root" | "suffix"; text: string; meaning: string }>;
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
  status?: string;
};

const SOURCE_LABELS: Record<string, string> = {
  ielts: "雅思",
  toefl: "托福",
  movie: "电影",
  general: "通用",
};

const MORPHEME_TYPE_LABELS: Record<"prefix" | "root" | "suffix", string> = {
  prefix: "前缀",
  root: "词根",
  suffix: "后缀",
};

type WordDetailViewProps = {
  word: WordDetail;
  showAiTutor?: boolean;
};

export default function WordDetailView({
  word,
  showAiTutor = true,
}: WordDetailViewProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAi() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/admin/ai/english/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context: `单词：${word.word}，释义：${word.meaningZh ?? ""}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "请求失败");
      setAnswer(data.answer);
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{word.word}</h1>
        {word.phonetic && (
          <p className="mt-1 text-lg text-zinc-500">{word.phonetic}</p>
        )}
        <p className="mt-2 text-base">
          {word.partOfSpeech && (
            <span className="mr-2 font-medium text-zinc-500">
              {word.partOfSpeech}
            </span>
          )}
          {word.meaningZh}
        </p>
        {word.level && (
          <Badge className="mt-2" variant="secondary">
            {word.level}
          </Badge>
        )}
      </div>

      {word.morphology &&
        (word.morphology.breakdown ||
          word.morphology.memoryTip ||
          (word.morphology.parts && word.morphology.parts.length > 0)) && (
          <section className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
              词根词缀
            </h2>
            {word.morphology.breakdown && (
              <p className="text-base font-medium tracking-wide">
                {word.morphology.breakdown}
              </p>
            )}
            {word.morphology.parts && word.morphology.parts.length > 0 && (
              <ul className="space-y-2">
                {word.morphology.parts.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-md border border-amber-300 bg-white px-2.5 py-1.5 text-sm dark:border-amber-800 dark:bg-zinc-900"
                  >
                    {p.type && (
                      <Badge variant="secondary" className="shrink-0">
                        {MORPHEME_TYPE_LABELS[p.type]}
                      </Badge>
                    )}
                    <span className="font-mono font-semibold">{p.text}</span>
                    <span className="text-zinc-400">→</span>
                    <span className="text-zinc-600 dark:text-zinc-300">
                      {p.meaning}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {word.morphology.memoryTip && (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-medium">助记：</span>
                {word.morphology.memoryTip}
              </p>
            )}
          </section>
        )}

      {word.phrases && word.phrases.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">短语</h2>
          <ul className="space-y-2">
            {word.phrases.map((p, i) => (
              <li key={i} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="font-medium">{p.phrase}</span>
                <span className="mx-2 text-zinc-400">—</span>
                <span className="text-zinc-600 dark:text-zinc-300">{p.meaningZh}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {word.examples && word.examples.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">例句</h2>
          <ul className="space-y-3">
            {word.examples.map((ex, i) => (
              <li key={i} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <p>{ex.sentence}</p>
                <p className="mt-1 text-sm text-zinc-500">{ex.translationZh}</p>
                <Badge variant="outline" className="mt-2">
                  {SOURCE_LABELS[ex.source] ?? ex.source}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {word.derivations && word.derivations.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">派生词</h2>
          <ul className="space-y-2">
            {word.derivations.map((d, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{d.word}</span>
                <span className="mx-2 text-zinc-400">{d.partOfSpeech}</span>
                <span>{d.meaningZh}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showAiTutor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI 导师</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="向 AI 提问，例如：这个单词和 xxx 有什么区别？"
              rows={3}
            />
            <Button onClick={askAi} disabled={loading}>
              {loading ? "思考中..." : "提问"}
            </Button>
            {answer && (
              <div className="rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                {answer}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
