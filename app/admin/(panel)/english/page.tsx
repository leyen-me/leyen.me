"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Brain, Flame, GraduationCap, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import EnglishHeatmap from "@/app/admin/components/english/EnglishHeatmap";
import { ENGLISH_LEVEL_LABELS, type EnglishLevel } from "@/lib/admin/english/constants";

type StatsResponse = {
  settings: {
    currentLevel: string;
    currentStreak: number;
    dailyWordCount: number;
  };
  stats: {
    totalWords: number;
    masteredWords: number;
    newWordBookCount: number;
  };
  dailyLogs: Array<{ date: string; activityLevel: number }>;
  todayProgress: {
    review: boolean;
    learn: boolean;
    exam: boolean;
    wordsLearned: number;
    reviewDue: number;
  };
  currentStep: string;
};

const navItems = [
  { href: "/admin/english/study", label: "开始学习", icon: Play },
  { href: "/admin/english/words", label: "单词本", icon: BookOpen },
  { href: "/admin/english/new-words", label: "生词本", icon: Brain },
  { href: "/admin/english/grammar", label: "语法练习", icon: GraduationCap },
  { href: "/admin/english/settings", label: "设置", icon: Settings },
];

export default function EnglishDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/english/stats")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-zinc-500">加载中...</p>;
  }

  const level = data?.settings.currentLevel as EnglishLevel;
  const progressSteps = data?.todayProgress;
  const completedCount = [
    progressSteps?.review,
    progressSteps?.learn,
    progressSteps?.exam,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="English"
        description="AI 英语导师 · 每日 20 词 · 复习与考试"
        action={
          <Button asChild>
            <Link href="/admin/english/study">
              <Play className="h-4 w-4" />
              开始今日学习
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>当前等级</CardDescription>
            <CardTitle className="text-2xl">
              {ENGLISH_LEVEL_LABELS[level] ?? level}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总词汇量</CardDescription>
            <CardTitle className="text-2xl">{data?.stats.totalWords ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已掌握</CardDescription>
            <CardTitle className="text-2xl">{data?.stats.masteredWords ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              连续打卡
            </CardDescription>
            <CardTitle className="text-2xl">
              {data?.settings.currentStreak ?? 0} 天
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>学习热力图</CardTitle>
            <CardDescription>近 365 天学习活跃度</CardDescription>
          </CardHeader>
          <CardContent>
            <EnglishHeatmap logs={data?.dailyLogs ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今日进度</CardTitle>
            <CardDescription>
              {completedCount}/3 步骤 · 生词本 {data?.stats.newWordBookCount ?? 0} 词
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProgressItem
              label="复习"
              done={progressSteps?.review}
              detail={`${progressSteps?.reviewDue ?? 0} 词待复习`}
            />
            <ProgressItem
              label="新词学习"
              done={progressSteps?.learn}
              detail={`${progressSteps?.wordsLearned ?? 0} / ${data?.settings.dailyWordCount ?? 20} 词`}
            />
            <ProgressItem label="考试" done={progressSteps?.exam} detail="默写 · 选择 · 填空" />
            <p className="text-xs text-zinc-500">
              当前步骤：{stepLabel(data?.currentStep)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-zinc-500" />
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProgressItem({
  label,
  done,
  detail,
}: {
  label: string;
  done?: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-zinc-500">{detail}</p>
      </div>
      <span
        className={
          done
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-400"
        }
      >
        {done ? "✓" : "—"}
      </span>
    </div>
  );
}

function stepLabel(step?: string) {
  switch (step) {
    case "review":
      return "复习";
    case "learn":
      return "新词学习";
    case "exam":
      return "考试";
    case "done":
      return "已完成";
    default:
      return "—";
  }
}
