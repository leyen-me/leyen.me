"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import { normalizeSlug, slugify } from "@/lib/utils";
import type { ImageInput } from "@/lib/admin/sanity-helpers";
import AdminFormActions from "@/app/admin/components/AdminFormActions";

export default function MovieEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [coverImage, setCoverImage] = useState<ImageInput | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>();
  const [rating, setRating] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [loading, setLoading] = useState(!!itemId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    fetch(`/api/admin/movies/${itemId}`).then((r) => r.json()).then((data) => {
      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setMediaType(data.mediaType ?? "movie");
      setCoverImage(data.coverImage?.assetId ? { assetId: data.coverImage.assetId, alt: data.coverImage.alt } : null);
      setCoverUrl(data.coverImage?.url);
      setRating(data.rating?.toString() ?? "");
      setReleaseDate(data.releaseDate ?? "");
      setDirector(data.director ?? "");
      setCast((data.cast ?? []).join(", "));
      setDescription(data.description ?? "");
      setExternalUrl(data.externalUrl ?? "");
      setLoading(false);
    });
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coverImage?.assetId) return;
    setSaving(true);
    const payload = {
      title, slug: normalizeSlug(slug || slugify(title)), mediaType, coverImage,
      rating: rating ? Number(rating) : null,
      releaseDate: releaseDate || undefined,
      director, cast: cast.split(",").map((c) => c.trim()).filter(Boolean),
      description, externalUrl,
    };
    await fetch(itemId ? `/api/admin/movies/${itemId}` : "/api/admin/movies", {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    router.push("/admin/movies");
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{itemId ? "编辑 Movie" : "新建 Movie"}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>标题</Label><Input value={title} onChange={(e) => { setTitle(e.target.value); if (!itemId && !slug) setSlug(slugify(e.target.value)); }} required /></div>
        <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e) => setSlug(normalizeSlug(e.target.value))} placeholder="my-movie" pattern="[a-z][a-z0-9-]*" required /></div>
      </div>
      <div className="space-y-2"><Label>类型</Label><Select value={mediaType} onValueChange={(v) => setMediaType(v as "movie" | "tv")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="movie">Movie</SelectItem><SelectItem value="tv">TV Show</SelectItem></SelectContent></Select></div>
      <ImageUploadField label="封面" value={coverImage} previewUrl={coverUrl} onChange={setCoverImage} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>评分 (0-10)</Label><Input type="number" min={0} max={10} step={0.1} value={rating} onChange={(e) => setRating(e.target.value)} /></div>
        <div className="space-y-2"><Label>发布日期</Label><Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} /></div>
      </div>
      <div className="space-y-2"><Label>导演</Label><Input value={director} onChange={(e) => setDirector(e.target.value)} /></div>
      <div className="space-y-2"><Label>演员（逗号分隔）</Label><Input value={cast} onChange={(e) => setCast(e.target.value)} /></div>
      <div className="space-y-2"><Label>描述</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
      <div className="space-y-2"><Label>External URL</Label><Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} /></div>
      <AdminFormActions saving={saving} onCancel={() => router.push("/admin/movies")} />
    </form>
  );
}
