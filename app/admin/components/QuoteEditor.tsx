"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { QUOTE_CONTENT_TYPE_OPTIONS } from "@/lib/quote-content-types";

export default function QuoteEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [contentType, setContentType] = useState<"quote" | "essay">("quote");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [context, setContext] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(!!itemId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    fetch(`/api/admin/quotes/${itemId}`).then((r) => r.json()).then((data) => {
      setContentType(data.contentType ?? "quote");
      setQuote(data.quote ?? "");
      setAuthor(data.author ?? "");
      setContext(data.context ?? "");
      setTags((data.tags ?? []).join(", "));
      setLoading(false);
    });
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { contentType, quote, author, context, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) };
    await fetch(itemId ? `/api/admin/quotes/${itemId}` : "/api/admin/quotes", {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    router.push("/admin/quotes");
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{itemId ? "编辑 Quote" : "新建 Quote"}</h1>
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
      <div className="space-y-2"><Label>内容</Label><Textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={6} /></div>
      <div className="space-y-2"><Label>作者</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} required /></div>
      <div className="space-y-2"><Label>语境 / 主题</Label><Input value={context} onChange={(e) => setContext(e.target.value)} /></div>
      <div className="space-y-2"><Label>标签（逗号分隔）</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} required /></div>
      <AdminFormActions saving={saving} onCancel={() => router.push("/admin/quotes")} />
    </form>
  );
}
