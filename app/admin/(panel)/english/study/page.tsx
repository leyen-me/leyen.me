"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import QuizPanel, { type QuizQuestion } from "@/app/admin/components/english/QuizPanel";
import WordDetailView, { type WordDetail } from "@/app/admin/components/english/WordDetailView";
import { useEnrichedWord } from "@/app/admin/hooks/useEnrichedWord";

type StudyStep = "review" | "learn" | "exam" | "done";

type TodayState = {
  today: string;
  currentStep: StudyStep;
  reviewWords: WordDetail[];
  todayWords: WordDetail[];
  hasTodayBatch: boolean;
  learnWordIndex: number;
  reviewWordIndex: number;
};

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.min(Math.max(0, index), length - 1);
}

export default function EnglishStudyPage() {
  const [state, setState] = useState<TodayState | null>(null);
  const [step, setStep] = useState<StudyStep>("review");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [learnIndex, setLearnIndex] = useState(0);
  const [error, setError] = useState("");
  const reviewAutoStarted = useRef(false);
  const learnAutoStarted = useRef(false);

  const currentRawWord = state?.todayWords[learnIndex] ?? null;
  const {
    word: currentWord,
    loading: enriching,
    error: enrichError,
  } = useEnrichedWord(step === "learn" ? currentRawWord : null);

  async function loadState() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/english/study/today");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "加载失败");
      setLoading(false);
      return;
    }
    setState(data);
    setStep(data.currentStep);
    setLearnIndex(clampIndex(data.learnWordIndex ?? 0, data.todayWords?.length ?? 0));
    setReviewIndex(clampIndex(data.reviewWordIndex ?? 0, data.reviewWords?.length ?? 0));
    setLoading(false);
  }

  function persistProgress(patch: {
    learnWordIndex?: number;
    reviewWordIndex?: number;
  }) {
    if (!state) return;
    void fetch("/api/admin/english/study/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: state.today, ...patch }),
    });
  }

  function goToLearnIndex(index: number) {
    setLearnIndex(index);
    persistProgress({ learnWordIndex: index });
  }

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (step !== "review") {
      reviewAutoStarted.current = false;
    }
    if (step !== "learn") {
      learnAutoStarted.current = false;
    }
  }, [step]);

  useEffect(() => {
    if (loading || !state || step !== "review" || reviewing) return;
    if (!state.reviewWords.length || reviewAutoStarted.current) return;
    const startIndex = clampIndex(state.reviewWordIndex ?? 0, state.reviewWords.length);
    reviewAutoStarted.current = true;
    void beginReview(state.reviewWords[startIndex]._id, startIndex);
  }, [loading, state, step, reviewing]);

  useEffect(() => {
    if (loading || !state || step !== "learn" || generating) return;
    if (state.hasTodayBatch || learnAutoStarted.current) return;
    learnAutoStarted.current = true;
    void generateTodayWords();
  }, [loading, state, step, generating]);

  async function generateTodayWords() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ai/english/generate-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      await loadState();
      setStep("learn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
      learnAutoStarted.current = false;
    } finally {
      setGenerating(false);
    }
  }

  async function loadQuiz(
    mode: "review" | "new_words",
    wordIds: string[]
  ): Promise<boolean> {
    setQuizLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ai/english/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordIds,
          mode,
          questionTypes: ["dictation", "multiple_choice", "fill_blank"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "出题失败");
      setQuestions(data.questions);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "出题失败");
      return false;
    } finally {
      setQuizLoading(false);
    }
  }

  async function beginReview(firstWordId: string, startIndex = 0) {
    setReviewing(true);
    setReviewIndex(startIndex);
    setQuestions([]);
    const ok = await loadQuiz("review", [firstWordId]);
    if (!ok) {
      setReviewing(false);
      reviewAutoStarted.current = false;
    }
  }

  async function handleReviewSubmit(
    results: Array<{ wordId: string; correct: boolean }>
  ) {
    if (!state?.reviewWords.length) return;

    const isLast = reviewIndex >= state.reviewWords.length - 1;
    const res = await fetch("/api/admin/english/study/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results, completeStep: isLast }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "提交失败");
      return;
    }

    if (isLast) {
      await loadState();
      setStep("learn");
      setQuestions([]);
      setReviewing(false);
      setReviewIndex(0);
      return;
    }

    const nextIndex = reviewIndex + 1;
    setReviewIndex(nextIndex);
    persistProgress({ reviewWordIndex: nextIndex });
    setQuestions([]);
    await loadQuiz("review", [state.reviewWords[nextIndex]._id]);
  }

  async function finishLearning() {
    if (!state) return;
    await fetch("/api/admin/english/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: state.today,
        step: "learn",
        wordsLearnedCount: state.todayWords.length,
      }),
    });
    setStep("exam");
    await loadQuiz(
      "new_words",
      state.todayWords.map((w) => w._id)
    );
  }

  async function handleExamSubmit(
    results: Array<{ wordId: string; correct: boolean }>
  ) {
    if (!state) return;
    await fetch("/api/admin/english/study/exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchDate: state.today, results }),
    });
    setStep("done");
    await loadState();
  }

  if (loading) {
    return <p className="text-zinc-500">加载中...</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="每日学习"
        description="复习 → 新词 → 考试"
        action={
          <Button asChild variant="outline">
            <Link href="/admin/english">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Link>
          </Button>
        }
      />

      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </div>
      )}

      <StepIndicator current={step} />

      {step === "review" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">第一步：复习旧词</h2>
          {state?.reviewWords.length ? (
            <>
              <p className="text-zinc-500">
                共 {state.reviewWords.length} 个单词待复习
                {reviewing && questions.length > 0
                  ? ` · 进度 ${reviewIndex + 1} / ${state.reviewWords.length}`
                  : ""}
              </p>
              {questions.length > 0 ? (
                <QuizPanel
                  key={state.reviewWords[reviewIndex]?._id ?? reviewIndex}
                  questions={questions}
                  title="复习"
                  onSubmit={handleReviewSubmit}
                />
              ) : (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在出第 {reviewIndex + 1} 题...
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-zinc-500">暂无到期复习词，可以直接学习新词。</p>
              <Button onClick={() => setStep("learn")}>继续</Button>
            </>
          )}
        </section>
      )}

      {step === "learn" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">第二步：学习新词</h2>
          {!state?.hasTodayBatch ? (
            <div className="space-y-3">
              {generating || !error ? (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在生成今日单词...
                </div>
              ) : (
                <>
                  <p className="text-zinc-500">{error}</p>
                  <Button onClick={generateTodayWords}>重新生成</Button>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-zinc-500">
                {learnIndex + 1} / {state.todayWords.length}
              </p>
              {enrichError && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {enrichError}
                </p>
              )}
              {enriching ? (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在生成「{currentRawWord?.word}」的详解...
                </div>
              ) : currentWord ? (
                <WordDetailView word={currentWord} showAiTutor={false} />
              ) : null}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={learnIndex === 0 || enriching}
                  onClick={() => goToLearnIndex(learnIndex - 1)}
                >
                  上一个
                </Button>
                {learnIndex < state.todayWords.length - 1 ? (
                  <Button disabled={enriching} onClick={() => goToLearnIndex(learnIndex + 1)}>
                    下一个
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button disabled={enriching} onClick={finishLearning}>
                    学完，开始考试
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {step === "exam" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">第三步：今日考试</h2>
          {questions.length === 0 && !quizLoading ? (
            <Button
              onClick={() =>
                state &&
                loadQuiz(
                  "new_words",
                  state.todayWords.map((w) => w._id)
                )
              }
            >
              开始考试
            </Button>
          ) : (
            <QuizPanel
              questions={questions}
              title="新词考试"
              loading={quizLoading}
              onSubmit={handleExamSubmit}
            />
          )}
        </section>
      )}

      {step === "done" && (
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            今日学习完成！
          </h2>
          <p className="text-zinc-500">明天继续加油，先复习再学新词。</p>
          <Button asChild>
            <Link href="/admin/english">返回首页</Link>
          </Button>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: StudyStep }) {
  const steps: Array<{ key: StudyStep; label: string }> = [
    { key: "review", label: "复习" },
    { key: "learn", label: "新词" },
    { key: "exam", label: "考试" },
    { key: "done", label: "完成" },
  ];
  const order = steps.map((s) => s.key);
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((s, i) => (
        <div
          key={s.key}
          className={`rounded-full px-3 py-1 text-sm ${
            i <= currentIdx
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
          }`}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}
