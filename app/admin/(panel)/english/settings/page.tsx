"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import {
  ENGLISH_LEVELS,
  ENGLISH_LEVEL_LABELS,
} from "@/lib/admin/english/constants";

type Settings = {
  currentLevel: string;
  targetExam: string;
  dailyWordCount: number;
  masteredThreshold: number;
};

type LevelAdvice = {
  summary: string;
  weakPoints: string[];
  suggestions: string[];
  recommendedLevel: string;
};

export default function EnglishSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    currentLevel: "A1",
    targetExam: "none",
    dailyWordCount: 20,
    masteredThreshold: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [advice, setAdvice] = useState<LevelAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/english/settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/english/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  }

  async function loadAdvice() {
    setAdviceLoading(true);
    const res = await fetch("/api/admin/ai/english/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "level_advice" }),
    });
    const data = await res.json();
    setAdvice(data.advice ?? null);
    setAdviceLoading(false);
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="学习设置"
        description="等级、目标与每日词数"
        action={
          <Button asChild variant="outline">
            <Link href="/admin/english">返回</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>当前等级</Label>
            <Select
              value={settings.currentLevel}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, currentLevel: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENGLISH_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {ENGLISH_LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>目标考试</Label>
            <Select
              value={settings.targetExam}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, targetExam: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无特定目标</SelectItem>
                <SelectItem value="ielts">雅思</SelectItem>
                <SelectItem value="toefl">托福</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dailyWordCount">每日新词数</Label>
              <Input
                id="dailyWordCount"
                type="number"
                min={1}
                max={50}
                value={settings.dailyWordCount}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    dailyWordCount: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="masteredThreshold">掌握阈值（连续答对）</Label>
              <Input
                id="masteredThreshold"
                type="number"
                min={1}
                max={10}
                value={settings.masteredThreshold}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    masteredThreshold: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <Button onClick={save} disabled={saving}>
            {saving ? "保存中..." : "保存设置"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI 等级建议</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={loadAdvice} disabled={adviceLoading} variant="outline">
            {adviceLoading ? "分析中..." : "获取 AI 进阶建议"}
          </Button>
          {advice && (
            <div className="space-y-3 text-sm">
              <p>{advice.summary}</p>
              {advice.weakPoints?.length > 0 && (
                <div>
                  <p className="font-medium">弱项</p>
                  <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-300">
                    {advice.weakPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {advice.suggestions?.length > 0 && (
                <div>
                  <p className="font-medium">建议</p>
                  <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-300">
                    {advice.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-zinc-500">
                推荐等级：{ENGLISH_LEVEL_LABELS[advice.recommendedLevel as keyof typeof ENGLISH_LEVEL_LABELS] ?? advice.recommendedLevel}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
