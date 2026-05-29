"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import QuizPanel from "@/app/admin/components/english/QuizPanel";
import type { QuizQuestion } from "@/app/admin/components/english/QuizPanel";

type GrammarQuestion = {
  prompt: string;
  options: string[];
  answer: string;
  explanationZh: string;
};

export default function EnglishGrammarPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wrongIndexes, setWrongIndexes] = useState<number[]>([]);

  async function generate() {
    setLoading(true);
    setError("");
    setSubmitted(false);
    setQuestions([]);
    try {
      const res = await fetch("/api/admin/ai/english/generate-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || undefined, count: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");

      const grammarQs = data.questions as GrammarQuestion[];
      setExplanations(
        Object.fromEntries(
          grammarQs.map((q, i) => [i, q.explanationZh])
        )
      );
      setQuestions(
        grammarQs.map((q, i) => ({
          wordId: `grammar-${i}`,
          word: "语法",
          type: "multiple_choice" as const,
          prompt: q.prompt,
          answer: q.answer,
          options: q.options,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(results: Array<{ wordId: string; correct: boolean }>) {
    const wrong = results
      .map((r, i) => (!r.correct ? i : -1))
      .filter((i) => i >= 0);
    setWrongIndexes(wrong);
    setSubmitted(true);
  }

  async function explainWrong(index: number) {
    const explanation = explanations[index];
    if (explanation) return;

    const res = await fetch("/api/admin/ai/english/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: `请详细讲解这道语法题：${questions[index]?.prompt}`,
        context: questions[index]?.answer,
      }),
    });
    const data = await res.json();
    setExplanations((prev) => ({
      ...prev,
      [index]: data.answer ?? data.error ?? "无法获取讲解",
    }));
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="语法练习"
        description="AI 按当前等级生成语法题"
        action={
          <Button asChild variant="outline">
            <Link href="/admin/english">返回</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">生成练习</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="topic">主题（可选）</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="如：时态、从句、介词"
            />
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? "AI 出题中..." : "生成 5 道题"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
      )}

      {questions.length > 0 && (
        <>
          <QuizPanel
            questions={questions}
            title="语法测验"
            retryUntilCorrect={false}
            onSubmit={handleSubmit}
          />
          {submitted && wrongIndexes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">错题讲解</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {wrongIndexes.map((index) => (
                  <div key={index} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <p className="text-sm font-medium">第 {index + 1} 题</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {explanations[index] ?? (
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() => explainWrong(index)}
                        >
                          向 AI 请求讲解
                        </Button>
                      )}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
