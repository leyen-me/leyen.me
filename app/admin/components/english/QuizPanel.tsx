"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAnswerCorrect } from "@/lib/admin/english/answer-utils";

export type QuizQuestion = {
  wordId: string;
  word: string;
  type: "dictation" | "multiple_choice" | "fill_blank";
  prompt: string;
  answer: string;
  options: string[];
};

const TYPE_LABELS: Record<QuizQuestion["type"], string> = {
  dictation: "默写",
  multiple_choice: "选择题",
  fill_blank: "填空",
};

type QuizPanelProps = {
  questions: QuizQuestion[];
  title?: string;
  loading?: boolean;
  onSubmit: (results: Array<{ wordId: string; correct: boolean }>) => Promise<void>;
};

export default function QuizPanel({
  questions,
  title = "考试",
  loading,
  onSubmit,
}: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    const results = questions.map((q) => {
      const given = answers[q.wordId] ?? "";
      const correct =
        q.type === "multiple_choice"
          ? given === q.answer
          : isAnswerCorrect(given, q.answer);
      return { wordId: q.wordId, correct };
    });
    const correctCount = results.filter((r) => r.correct).length;
    setScore(Math.round((correctCount / results.length) * 100));
    await onSubmit(results);
    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) {
    return <p className="text-zinc-500">AI 正在出题...</p>;
  }

  if (questions.length === 0) {
    return <p className="text-zinc-500">暂无题目</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {questions.map((q, index) => (
        <Card key={`${q.wordId}-${index}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">第 {index + 1} 题</CardTitle>
              <span className="text-xs text-zinc-500">{TYPE_LABELS[q.type]}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{q.prompt}</p>
            {q.type === "multiple_choice" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={answers[q.wordId] === option ? "default" : "outline"}
                    className="justify-start text-left h-auto py-2 whitespace-normal"
                    disabled={submitted}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.wordId]: option }))
                    }
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`answer-${q.wordId}`}>你的答案</Label>
                <Input
                  id={`answer-${q.wordId}`}
                  value={answers[q.wordId] ?? ""}
                  disabled={submitted}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.wordId]: e.target.value }))
                  }
                  placeholder={q.type === "dictation" ? "输入英文单词" : "填入缺失单词"}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={
            submitting ||
            questions.some((q) =>
              q.type === "multiple_choice"
                ? !answers[q.wordId]
                : !answers[q.wordId]?.trim()
            )
          }
          className="w-full sm:w-auto"
        >
          {submitting ? "提交中..." : "提交答案"}
        </Button>
      ) : (
        <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
          得分：{score}%
        </p>
      )}
    </div>
  );
}
