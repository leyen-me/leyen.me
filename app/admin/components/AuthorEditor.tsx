"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import type { ImageInput } from "@/lib/admin/sanity-helpers";

export default function AuthorEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [photo, setPhoto] = useState<ImageInput | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [loading, setLoading] = useState(!!itemId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemId) return;
    fetch(`/api/admin/authors/${itemId}`).then((r) => r.json()).then((data) => {
      setName(data.name ?? "");
      setTwitterUrl(data.twitterUrl ?? "");
      setPhoto(data.photo?.assetId ? { assetId: data.photo.assetId, alt: data.photo.alt } : null);
      setPhotoUrl(data.photo?.url);
      setLoading(false);
    });
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo?.assetId) { setError("请上传头像"); return; }
    setSaving(true);
    setError("");
    const res = await fetch(itemId ? `/api/admin/authors/${itemId}` : "/api/admin/authors", {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, twitterUrl, photo }),
    });
    if (!res.ok) { setError("Save failed"); setSaving(false); return; }
    router.push("/admin/authors");
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">{itemId ? "编辑作者" : "新建作者"}</h1>
      <div className="space-y-2"><Label>姓名</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Twitter URL</Label><Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} required /></div>
      <ImageUploadField label="头像" value={photo} previewUrl={photoUrl} onChange={setPhoto} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3"><Button type="submit" disabled={saving}>保存</Button><Button type="button" variant="outline" onClick={() => router.push("/admin/authors")}>取消</Button></div>
    </form>
  );
}
