"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarkdownEditor from "@/app/admin/components/MarkdownEditor";
import { normalizeSlug, slugify } from "@/lib/utils";
import { INTERVIEW_CATEGORY_OPTIONS } from "@/lib/interview-categories";
import AdminFormActions from "@/app/admin/components/AdminFormActions";

export default function InterviewEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("other");
  const [answer, setAnswer] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(!!itemId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemId) return;
    fetch(`/api/admin/interviews/${itemId}`).then((r) => r.json()).then((data) => {
      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setCategory(data.category ?? "other");
      setAnswer(data.answer ?? "");
      setIsPublished(data.isPublished ?? true);
      setLoading(false);
    });
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title, slug: normalizeSlug(slug || slugify(title)), category, answer, isPublished };
    const res = await fetch(itemId ? `/api/admin/interviews/${itemId}` : "/api/admin/interviews", {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Save failed");
      setSaving(false);
      return;
    }
    router.push("/admin/interviews");
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{itemId ? "编辑面试题" : "新建面试题"}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>题目</Label><Input value={title} onChange={(e) => { setTitle(e.target.value); if (!itemId && !slug) setSlug(slugify(e.target.value)); }} required /></div>
        <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(normalizeSlug(e.target.value))} placeholder="my-interview" pattern="[a-z][a-z0-9-]*" required /></div>
      </div>
      <div className="space-y-2">
        <Label>分类</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{INTERVIEW_CATEGORY_OPTIONS.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3"><Switch checked={isPublished} onCheckedChange={setIsPublished} /><Label>发布</Label></div>
      <MarkdownEditor label="回答 (Markdown)" value={answer} onChange={setAnswer} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <AdminFormActions saving={saving} onCancel={() => router.push("/admin/interviews")} />
    </form>
  );
}
