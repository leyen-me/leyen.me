"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInterviewCategoryLabel } from "@/lib/interview-categories";

type Item = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  isPublished?: boolean;
};

export default function InterviewsListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/interviews");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`确定删除「${title}」？`)) return;
    await fetch(`/api/admin/interviews/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Interviews</h1>
        <Button asChild><Link href="/admin/interviews/new"><Plus className="h-4 w-4" />新建</Link></Button>
      </div>
      {loading ? <p className="text-zinc-500">加载中...</p> : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-4 py-3 text-left">题目</th><th className="px-4 py-3 text-left">分类</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{getInterviewCategoryLabel(item.category)}</td>
                  <td className="px-4 py-3"><Badge variant={item.isPublished ? "success" : "warning"}>{item.isPublished ? "已发布" : "草稿"}</Badge></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><Button asChild variant="ghost" size="icon"><Link href={`/admin/interviews/${item._id}`}><Pencil className="h-4 w-4" /></Link></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item._id, item.title)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
