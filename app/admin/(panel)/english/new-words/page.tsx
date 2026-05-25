"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import WordCard, { type WordSummary } from "@/app/admin/components/english/WordCard";
import QuizPanel, { type QuizQuestion } from "@/app/admin/components/english/QuizPanel";
import { Button } from "@/components/ui/button";

export default function EnglishNewWordsPage() {
  const [words, setWords] = useState<WordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/english/words?status=new_word_book");
    setWords(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function startQuiz() {
    if (words.length === 0) return;
    setQuizLoading(true);
    const res = await fetch("/api/admin/ai/english/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wordIds: words.map((w) => w._id),
        mode: "review",
        questionTypes: ["dictation", "multiple_choice", "fill_blank"],
      }),
    });
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setQuizLoading(false);
  }

  async function handleSubmit(
    results: Array<{ wordId: string; correct: boolean }>
  ) {
    await fetch("/api/admin/english/study/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results }),
    });
    setQuestions([]);
    load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="生词本"
        description="答错或未掌握的单词，直到完全记住才移出"
        action={
          <div className="flex gap-2">
            {words.length > 0 && (
              <Button onClick={startQuiz} disabled={quizLoading}>
                {quizLoading ? "出题中..." : "练习考试"}
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/admin/english">返回</Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <p className="text-zinc-500">加载中...</p>
      ) : words.length === 0 ? (
        <p className="text-zinc-500">生词本为空，继续保持！</p>
      ) : (
        <>
          {questions.length > 0 ? (
            <QuizPanel
              questions={questions}
              title="生词本练习"
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {words.map((word) => (
                <WordCard key={word._id} word={word} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
