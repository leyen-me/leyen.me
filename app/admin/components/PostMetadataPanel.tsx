"use client";

import { X } from "lucide-react";
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
import ImageUploadField from "@/app/admin/components/ImageUploadField";
import type { ImageInput } from "@/lib/admin/sanity-helpers";
import { cn } from "@/lib/utils";

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

export type PostMetadataForm = Omit<PostFormState, "content">;

type PostMetadataPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PostMetadataForm;
  authors: AuthorOption[];
  postId?: string;
  onFieldChange: <K extends keyof PostMetadataForm>(
    key: K,
    value: PostMetadataForm[K]
  ) => void;
  onTitleChange: (title: string) => void;
};

export default function PostMetadataPanel({
  open,
  onOpenChange,
  form,
  authors,
  postId,
  onFieldChange,
  onTitleChange,
}: PostMetadataPanelProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/40"
          aria-label="关闭设置面板"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold">文章设置</h2>
            <p className="text-xs text-zinc-500">元数据、封面与发布选项</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">标题</Label>
            <Input
              id="meta-title"
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-slug">Slug</Label>
            <Input
              id="meta-slug"
              value={form.slug}
              onChange={(e) => onFieldChange("slug", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">描述</Label>
            <Input
              id="meta-description"
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-date">日期</Label>
            <Input
              id="meta-date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => onFieldChange("date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>作者</Label>
            <Select
              value={form.authorId}
              onValueChange={(value) => onFieldChange("authorId", value)}
            >
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

          <div className="space-y-2">
            <Label htmlFor="meta-tags">标签（逗号分隔）</Label>
            <Input
              id="meta-tags"
              value={form.tags}
              onChange={(e) => onFieldChange("tags", e.target.value)}
              placeholder="react, nextjs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-canonical">Canonical Link</Label>
            <Input
              id="meta-canonical"
              value={form.canonicalLink}
              onChange={(e) => onFieldChange("canonicalLink", e.target.value)}
            />
          </div>

          <ImageUploadField
            label="封面图"
            value={form.coverImage}
            previewUrl={form.coverImageUrl}
            onChange={(coverImage) => onFieldChange("coverImage", coverImage)}
          />

          <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Featured</Label>
                <p className="text-xs text-zinc-500">在首页或精选位展示</p>
              </div>
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => onFieldChange("featured", checked)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>发布状态</Label>
                <p className="text-xs text-zinc-500">
                  {postId ? "保存后前台可见性" : "新建文章的默认发布状态"}
                </p>
              </div>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(checked) => onFieldChange("isPublished", checked)}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
