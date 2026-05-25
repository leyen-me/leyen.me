"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import type { ImageInput } from "@/lib/admin/sanity-helpers";

export default function JobEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [logo, setLogo] = useState<ImageInput | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(!!itemId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    fetch(`/api/admin/jobs/${itemId}`).then((r) => r.json()).then((data) => {
      setName(data.name ?? "");
      setJobTitle(data.jobTitle ?? "");
      setLogo(data.logo?.assetId ? { assetId: data.logo.assetId } : null);
      setLogoUrl(data.logo?.url);
      setUrl(data.url ?? "");
      setDescription(data.description ?? "");
      setStartDate(data.startDate ?? "");
      setEndDate(data.endDate ?? "");
      setLoading(false);
    });
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(itemId ? `/api/admin/jobs/${itemId}` : "/api/admin/jobs", {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, jobTitle, logo, url, description, startDate, endDate }),
    });
    router.push("/admin/jobs");
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">{itemId ? "编辑 Job" : "新建 Job"}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>公司</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="space-y-2"><Label>职位</Label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required /></div>
      </div>
      <ImageUploadField label="Logo" value={logo} previewUrl={logoUrl} onChange={setLogo} />
      <div className="space-y-2"><Label>公司网站</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} /></div>
      <div className="space-y-2"><Label>描述</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>开始日期</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        <div className="space-y-2"><Label>结束日期</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
      </div>
      <div className="flex gap-3"><Button type="submit" disabled={saving}>保存</Button><Button type="button" variant="outline" onClick={() => router.push("/admin/jobs")}>取消</Button></div>
    </form>
  );
}
