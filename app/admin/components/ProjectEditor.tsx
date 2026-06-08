"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/app/admin/components/MarkdownEditor";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import { normalizeSlug, slugify } from "@/lib/utils";
import type { ImageInput } from "@/lib/admin/sanity-helpers";
import AdminFormActions from "@/app/admin/components/AdminFormActions";
import SlugField from "@/app/admin/components/SlugField";

export default function ProjectEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [logo, setLogo] = useState<ImageInput | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>();
  const [projectUrl, setProjectUrl] = useState("");
  const [repository, setRepository] = useState("");
  const [coverImage, setCoverImage] = useState<ImageInput | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>();
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [loading, setLoading] = useState(!!itemId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    fetch(`/api/admin/projects/${itemId}`).then((r) => r.json()).then((data) => {
      setName(data.name ?? "");
      setSlug(data.slug ?? "");
      setTagline(data.tagline ?? "");
      setLogo(data.logo?.assetId ? { assetId: data.logo.assetId } : null);
      setLogoUrl(data.logo?.url);
      setProjectUrl(data.projectUrl ?? "");
      setRepository(data.repository ?? "");
      setCoverImage(data.coverImage?.assetId ? { assetId: data.coverImage.assetId, alt: data.coverImage.alt } : null);
      setCoverUrl(data.coverImage?.url);
      setDescription(typeof data.description === "string" ? data.description : "");
      setOrder(String(data.order ?? 0));
      setLoading(false);
    });
  }, [itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(itemId ? `/api/admin/projects/${itemId}` : "/api/admin/projects", {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, slug: normalizeSlug(slug || slugify(name)), tagline, logo, projectUrl, repository,
        coverImage, description, order: Number(order) || 0,
      }),
    });
    router.push("/admin/projects");
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{itemId ? "编辑 Project" : "新建 Project"}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>名称</Label><Input value={name} onChange={(e) => { setName(e.target.value); if (!itemId && !slug) setSlug(slugify(e.target.value)); }} required /></div>
        <SlugField value={slug} onChange={setSlug} sourceTitle={name} kind="project" placeholder="my-project" />
      </div>
      <div className="space-y-2"><Label>Tagline</Label><Input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={60} required /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Project URL</Label><Input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} /></div>
        <div className="space-y-2"><Label>Repository</Label><Input value={repository} onChange={(e) => setRepository(e.target.value)} /></div>
      </div>
      <div className="space-y-2"><Label>排序</Label><Input type="number" min={0} value={order} onChange={(e) => setOrder(e.target.value)} /></div>
      <ImageUploadField label="Logo" value={logo} previewUrl={logoUrl} onChange={setLogo} />
      <ImageUploadField label="封面" value={coverImage} previewUrl={coverUrl} onChange={setCoverImage} />
      <MarkdownEditor label="描述 (Markdown)" value={description} onChange={setDescription} />
      <AdminFormActions saving={saving} onCancel={() => router.push("/admin/projects")} />
    </form>
  );
}
