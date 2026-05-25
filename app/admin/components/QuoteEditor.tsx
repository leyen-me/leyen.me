"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">{itemId ? "编辑 Quote" : "新建 Quote"}</h1>
      <div className="space-y-2"><Label>类型</Label><Select value={contentType} onValueChange={(v) => setContentType(v as "quote" | "essay")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="quote">Short Quote</SelectItem><SelectItem value="essay">Short Essay</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label>内容</Label><Textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={6} /></div>
      <div className="space-y-2"><Label>作者</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Context</Label><Input value={context} onChange={(e) => setContext(e.target.value)} /></div>
      <div className="space-y-2"><Label>Tags（逗号分隔）</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} required /></div>
      <div className="flex gap-3"><Button type="submit" disabled={saving}>保存</Button><Button type="button" variant="outline" onClick={() => router.push("/admin/quotes")}>取消</Button></div>
    </form>
  );
}
