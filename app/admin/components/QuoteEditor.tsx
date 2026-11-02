"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminFormActions from "@/app/admin/components/AdminFormActions";
import TagInput from "@/app/admin/components/TagInput";
import { useTagSuggestions } from "@/app/admin/hooks/useTagSuggestions";
import { normalizeTags } from "@/lib/admin/tags";
import { QUOTE_CONTENT_TYPE_OPTIONS } from "@/lib/quote-content-types";

export default function QuoteEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const tagSuggestions = useTagSuggestions("quote");

  const [contentType, setContentType] = useState<"quote" | "essay">("quote");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [context, setContext] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!itemId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemId) return;
    fetch(`/api/admin/quotes/${itemId}`)
      .then((r) => r.json())
      .then((data) => {
        setContentType(data.contentType ?? "quote");
        setQuote(data.quote ?? "");
        setAuthor(data.author ?? "");
        setContext(data.context ?? "");
        setTags(normalizeTags(data.tags));
        setLoading(false);
      });
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (tags.length === 0) {
      setError("请至少添加一个标签");
      return;
    }

    setSaving(true);
    try {
      const payload = { contentType, quote, author, context, tags };
      const res = await fetch(itemId ? `/api/admin/quotes/${itemId}` : "/api/admin/quotes", {
        method: itemId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "保存失败，请重试");
      }

      router.push("/admin/quotes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">
        {itemId ? "编辑 Quote" : "新建 Quote"}
      </h1>

      <div className="space-y-2">
        <Label>类型</Label>
        <Select value={contentType} onValueChange={(v) => setContentType(v as "quote" | "essay")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUOTE_CONTENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>内容</Label>
        <Textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={6} />
      </div>

      <div className="space-y-2">
        <Label>作者</Label>
        <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label>语境 / 主题</Label>
        <Input value={context} onChange={(e) => setContext(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote-tags">标签</Label>
        <TagInput
          id="quote-tags"
          value={tags}
          onChange={setTags}
          suggestions={tagSuggestions}
          placeholder="搜索或新增标签，回车确认"
        />
        <p className="text-xs text-zinc-500">从已有标签中选择，或直接输入新标签</p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <AdminFormActions saving={saving} onCancel={() => router.push("/admin/quotes")} />
    </form>
  );
}
