"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MarkdownEditor from "@/app/admin/components/MarkdownEditor";
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import { slugify } from "@/lib/utils";
import type { ImageInput } from "@/lib/admin/sanity-helpers";

type AuthorOption = { _id: string; name: string };

type PostFormState = {
  title: string;
  slug: string;
  description: string;
  canonicalLink: string;
  date: string;
  coverImage: ImageInput | null;
  coverImageUrl?: string;
  featured: boolean;
  tags: string;
  authorId: string;
  content: string;
  isPublished: boolean;
};

const emptyForm: PostFormState = {
  title: "",
  slug: "",
  description: "",
  canonicalLink: "",
  date: new Date().toISOString().slice(0, 16),
  coverImage: null,
  featured: false,
  tags: "",
  authorId: "",
  content: "",
  isPublished: false,
};

type PostEditorProps = {
  postId?: string;
};

export default function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormState>(emptyForm);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((data) => setAuthors(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/admin/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          canonicalLink: data.canonicalLink ?? "",
          date: data.date ? data.date.slice(0, 16) : "",
          coverImage: data.coverImage?.assetId
            ? { assetId: data.coverImage.assetId, alt: data.coverImage.alt }
            : null,
          coverImageUrl: data.coverImage?.url,
          featured: data.featured ?? false,
          tags: (data.tags ?? []).join(", "),
          authorId: data.authorId ?? "",
          content: data.content ?? "",
          isPublished: data.isPublished ?? false,
        });
        setLoading(false);
      });
  }, [postId]);

  function updateField<K extends keyof PostFormState>(key: K, value: PostFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        canonicalLink: form.canonicalLink,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        coverImage: form.coverImage,
        featured: form.featured,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        authorId: form.authorId,
        content: form.content,
        isPublished: form.isPublished,
      };

      const res = await fetch(postId ? `/api/admin/posts/${postId}` : "/api/admin/posts", {
        method: postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {postId ? "编辑文章" : "新建文章"}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => {
              updateField("title", e.target.value);
              if (!postId && !form.slug) updateField("slug", slugify(e.target.value));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">日期</Label>
          <Input
            id="date"
            type="datetime-local"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>作者</Label>
          <Select value={form.authorId} onValueChange={(v) => updateField("authorId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="选择作者" />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author._id} value={author._id}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">标签（逗号分隔）</Label>
        <Input
          id="tags"
          value={form.tags}
          onChange={(e) => updateField("tags", e.target.value)}
          placeholder="react, nextjs"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="canonicalLink">Canonical Link</Label>
        <Input
          id="canonicalLink"
          value={form.canonicalLink}
          onChange={(e) => updateField("canonicalLink", e.target.value)}
        />
      </div>

      <ImageUploadField
        label="封面图"
        value={form.coverImage}
        previewUrl={form.coverImageUrl}
        onChange={(coverImage) => updateField("coverImage", coverImage)}
      />

      <div className="flex flex-wrap gap-8">
        <div className="flex items-center gap-3">
          <Switch
            checked={form.featured}
            onCheckedChange={(checked) => updateField("featured", checked)}
          />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.isPublished}
            onCheckedChange={(checked) => updateField("isPublished", checked)}
          />
          <Label>发布</Label>
        </div>
      </div>

      <MarkdownEditor
        label="正文 (Markdown)"
        value={form.content}
        onChange={(content) => updateField("content", content)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/posts")}>
          取消
        </Button>
      </div>
    </form>
  );
}
