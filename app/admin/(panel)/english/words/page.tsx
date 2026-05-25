"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import WordCard, { type WordSummary } from "@/app/admin/components/english/WordCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENGLISH_WORD_STATUS_LABELS } from "@/lib/admin/english/constants";

export default function EnglishWordsPage() {
  const [words, setWords] = useState<WordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    const url =
      statusFilter === "all"
        ? "/api/admin/english/words"
        : `/api/admin/english/words?status=${statusFilter}`;
    const res = await fetch(url);
    setWords(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="单词本"
        description="全部已学单词"
        action={
          <Button asChild variant="outline">
            <Link href="/admin/english">返回</Link>
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {Object.entries(ENGLISH_WORD_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-zinc-500">加载中...</p>
      ) : words.length === 0 ? (
        <p className="text-zinc-500">暂无单词，去开始学习吧。</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <WordCard key={word._id} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
