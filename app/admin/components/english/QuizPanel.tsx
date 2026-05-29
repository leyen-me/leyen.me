"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAnswerCorrect } from "@/lib/admin/english/answer-utils";
import { formatPhoneticHint } from "@/lib/admin/english/phonetic-hint";

export type QuizQuestion = {
  wordId: string;
  word: string;
  type: "dictation" | "multiple_choice" | "fill_blank";
  prompt: string;
  answer: string;
  options: string[];
  phonetic?: string;
};

export type QuizResult = {
  wordId: string;
  correct: boolean;
  wrongAttempts?: number;
};

const TYPE_LABELS: Record<QuizQuestion["type"], string> = {
  dictation: "默写",
  multiple_choice: "选择题",
  fill_blank: "填空",
};

const PHONETIC_HINT_AFTER = 3;
const WORD_HINT_AFTER = 6;

function isQuestionCorrect(q: QuizQuestion, given: string): boolean {
  return q.type === "multiple_choice"
    ? given === q.answer
    : isAnswerCorrect(given, q.answer);
}

type QuizPanelProps = {
  questions: QuizQuestion[];
  title?: string;
  loading?: boolean;
  /** 答错须重做才能下一题；语法测验等可设为 false */
  retryUntilCorrect?: boolean;
  /** 累计答错几次后显示音标提示 */
  phoneticHintAfterAttempts?: number;
  /** 累计答错几次后显示单词提示 */
  wordHintAfterAttempts?: number;
  onSubmit: (results: QuizResult[]) => Promise<void>;
};

export default function QuizPanel({
  questions,
  title = "考试",
  loading,
  retryUntilCorrect = true,
  phoneticHintAfterAttempts = PHONETIC_HINT_AFTER,
  wordHintAfterAttempts = WORD_HINT_AFTER,
  onSubmit,
}: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});
  const [wrongFeedback, setWrongFeedback] = useState<Record<string, boolean>>({});
  const [completedResults, setCompletedResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    setAnswers({});
    setSubmitting(false);
    setSubmitted(false);
    setScore(null);
    setActiveIndex(0);
    setWrongAttempts({});
    setWrongFeedback({});
    setCompletedResults([]);
  }, [questions]);

  function clearFeedback(wordId: string) {
    setWrongFeedback((prev) => {
      if (!prev[wordId]) return prev;
      const next = { ...prev };
      delete next[wordId];
      return next;
    });
  }

  function setAnswer(wordId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [wordId]: value }));
    clearFeedback(wordId);
  }

  async function finishRetryMode(finalResults: QuizResult[]) {
    setSubmitting(true);
    const correctCount = finalResults.filter((r) => r.correct).length;
    setScore(Math.round((correctCount / finalResults.length) * 100));
    await onSubmit(finalResults);
    setSubmitted(true);
    setSubmitting(false);
  }

  async function handleCheckCurrent() {
    const q = questions[activeIndex];
    if (!q) return;

    const given = answers[q.wordId] ?? "";
    if (
      q.type === "multiple_choice"
        ? !given
        : !given.trim()
    ) {
      return;
    }

    if (isQuestionCorrect(q, given)) {
      const result: QuizResult = {
        wordId: q.wordId,
        correct: true,
        wrongAttempts: wrongAttempts[q.wordId] ?? 0,
      };
      const nextResults = [...completedResults, result];

      if (activeIndex < questions.length - 1) {
        setCompletedResults(nextResults);
        setActiveIndex((i) => i + 1);
        clearFeedback(q.wordId);
        return;
      }

      await finishRetryMode(nextResults);
      return;
    }

    const attempts = (wrongAttempts[q.wordId] ?? 0) + 1;
    setWrongAttempts((prev) => ({ ...prev, [q.wordId]: attempts }));
    setWrongFeedback((prev) => ({ ...prev, [q.wordId]: true }));
  }

  async function handleBatchSubmit() {
    setSubmitting(true);
    const results: QuizResult[] = questions.map((q) => {
      const given = answers[q.wordId] ?? "";
      return {
        wordId: q.wordId,
        correct: isQuestionCorrect(q, given),
      };
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

  const displayQuestions = retryUntilCorrect
    ? [questions[activeIndex]].filter(Boolean)
    : questions;

  const progressLabel = retryUntilCorrect
    ? `第 ${activeIndex + 1} / ${questions.length} 题`
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {progressLabel && !submitted && (
          <span className="text-sm text-zinc-500">{progressLabel}</span>
        )}
      </div>

      {displayQuestions.map((q, index) => {
        const displayIndex = retryUntilCorrect ? activeIndex : index;
        const attempts = wrongAttempts[q.wordId] ?? 0;
        const showWrong = wrongFeedback[q.wordId];
        const phoneticHint = formatPhoneticHint(q.phonetic);
        const showPhoneticHint =
          showWrong &&
          attempts >= phoneticHintAfterAttempts &&
          attempts < wordHintAfterAttempts &&
          q.word !== "语法" &&
          Boolean(phoneticHint);
        const showWordHint =
          showWrong && attempts >= wordHintAfterAttempts && q.word !== "语法";

        return (
          <Card key={`${q.wordId}-${displayIndex}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {retryUntilCorrect ? "题目" : `第 ${displayIndex + 1} 题`}
                </CardTitle>
                <span className="text-xs text-zinc-500">{TYPE_LABELS[q.type]}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{q.prompt}</p>

              {showPhoneticHint && phoneticHint && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  音标提示：<span className="font-medium">{phoneticHint}</span>
                </p>
              )}
              {showWordHint && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  单词提示：<span className="font-medium">{q.word}</span>
                </p>
              )}

              {q.type === "multiple_choice" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={answers[q.wordId] === option ? "default" : "outline"}
                      className="h-auto justify-start whitespace-normal py-2 text-left"
                      disabled={submitted}
                      onClick={() => setAnswer(q.wordId, option)}
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
                    onChange={(e) => setAnswer(q.wordId, e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        retryUntilCorrect &&
                        e.key === "Enter" &&
                        !submitted &&
                        !submitting
                      ) {
                        e.preventDefault();
                        void handleCheckCurrent();
                      }
                    }}
                    placeholder={
                      q.type === "dictation" ? "输入英文单词" : "填入缺失单词"
                    }
                  />
                </div>
              )}

              {showWrong && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                  <p>回答错误，请修改后重新提交，答对才能继续。</p>
                  {attempts > 0 && (
                    <p className="mt-1 text-red-700/80 dark:text-red-300/80">
                      已错 {attempts} 次
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {!submitted ? (
        retryUntilCorrect ? (
          <Button
            onClick={() => void handleCheckCurrent()}
            disabled={
              submitting ||
              displayQuestions.some((q) =>
                q.type === "multiple_choice"
                  ? !answers[q.wordId]
                  : !answers[q.wordId]?.trim()
              )
            }
            className="w-full sm:w-auto"
          >
            {submitting
              ? "提交中..."
              : wrongFeedback[displayQuestions[0]?.wordId ?? ""]
                ? "再试一次"
                : "检查答案"}
          </Button>
        ) : (
          <Button
            onClick={() => void handleBatchSubmit()}
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
        )
      ) : (
        <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
          得分：{score}%
        </p>
      )}
    </div>
  );
}
