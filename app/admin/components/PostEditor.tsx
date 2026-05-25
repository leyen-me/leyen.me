"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImmersiveMarkdownEditor, {
  type EditorSelection,
  type ImmersiveMarkdownEditorHandle,
} from "@/app/admin/components/ImmersiveMarkdownEditor";
import MarkdownFormatToolbar from "@/app/admin/components/MarkdownFormatToolbar";
import PostAiPreviewDialog from "@/app/admin/components/PostAiPreviewDialog";
import PostAiToolbar from "@/app/admin/components/PostAiToolbar";
import PostMetadataPanel, {
  type PostMetadataForm,
} from "@/app/admin/components/PostMetadataPanel";
import { useAdminLayout } from "@/app/admin/components/AdminLayoutContext";
import { usePostAiAction } from "@/app/admin/hooks/usePostAiAction";
import {
  useModKeyLabel,
  usePostEditorShortcuts,
} from "@/app/admin/hooks/usePostEditorShortcuts";
import { cn, isValidSlug, normalizeSlug, slugify } from "@/lib/utils";
import type { ImageInput } from "@/lib/admin/sanity-helpers";

type AuthorOption = { _id: string; name: string };

type PostFormState = PostMetadataForm & {
  content: string;
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
  const editorRef = useRef<ImmersiveMarkdownEditorHandle>(null);
  const { toggleSidebar } = useAdminLayout();
  const [form, setForm] = useState<PostFormState>(emptyForm);
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [editorSelection, setEditorSelection] = useState<EditorSelection | null>(
    null
  );
  const [headerElevated, setHeaderElevated] = useState(false);
  const modKey = useModKeyLabel();

  const lastSelectionRef = useRef<EditorSelection | null>(null);

  const handleSelectionChange = useCallback(
    (selection: EditorSelection | null) => {
      if (selection?.text.trim()) {
        lastSelectionRef.current = selection;
      }

      setEditorSelection((prev) => {
        if (!selection && !prev) return prev;
        if (
          selection &&
          prev &&
          prev.start === selection.start &&
          prev.end === selection.end &&
          prev.text === selection.text
        ) {
          return prev;
        }
        return selection;
      });
    },
    []
  );

  const ai = usePostAiAction({
    title: form.title,
    content: form.content,
    editorRef,
    getPolishSelection: () =>
      editorRef.current?.getSelection() ?? lastSelectionRef.current,
  });

  usePostEditorShortcuts({
    onSave: () => save(),
    onPublish: () => save({ publish: true }),
    onOpenSettings: () => setMetadataOpen(true),
    onCloseSettings: () => setMetadataOpen(false),
    saving,
    metadataOpen,
  });

  useEffect(() => {
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAuthors(list);
        if (!postId && list.length === 1) {
          setForm((prev) =>
            prev.authorId ? prev : { ...prev, authorId: list[0]._id }
          );
        }
      });
  }, [postId]);

  function getMissingFields(): string[] {
    const missing: string[] = [];
    const slug = normalizeSlug(form.slug || slugify(form.title));

    if (!form.title.trim()) missing.push("标题");
    if (!slug) missing.push("Slug");
    else if (!isValidSlug(slug)) {
      missing.push("Slug（须以小写字母开头，仅含 a-z、0-9、-）");
    }
    if (!form.description.trim()) missing.push("描述");
    if (!form.authorId) missing.push("作者");
    if (!form.tags.split(",").map((t) => t.trim()).filter(Boolean).length) {
      missing.push("标签");
    }
    return missing;
  }

  function validateBeforeSave() {
    const missing = getMissingFields();
    if (missing.length === 0) return true;

    setError(`请在设置中填写：${missing.join("、")}`);
    setMetadataOpen(true);
    return false;
  }

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

  function handleTitleChange(title: string) {
    setForm((prev) => {
      const next = { ...prev, title };
      if (!postId && !prev.slug) {
        next.slug = slugify(title);
      }
      return next;
    });
  }

  async function save(options?: { publish?: boolean }) {
    if (!validateBeforeSave()) return;

    setSaving(true);
    setError("");

    const isPublished = options?.publish ?? form.isPublished;

    try {
      const payload = {
        title: form.title,
        slug: normalizeSlug(form.slug || slugify(form.title)),
        description: form.description,
        canonicalLink: form.canonicalLink,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        coverImage: form.coverImage,
        featured: form.featured,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        authorId: form.authorId,
        content: form.content,
        isPublished,
      };

      const res = await fetch(postId ? `/api/admin/posts/${postId}` : "/api/admin/posts", {
        method: postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Validation failed") {
          setMetadataOpen(true);
          throw new Error("部分字段未通过校验，请在设置中检查并补全");
        }
        throw new Error(data.error || "Save failed");
      }

      if (options?.publish) {
        setForm((prev) => ({ ...prev, isPublished: true }));
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">加载中...</p>
      </div>
    );
  }

  const isDraft = !form.isPublished;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header
        className={cn(
          "sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b border-zinc-200 bg-white/95 px-3 py-2 backdrop-blur transition-shadow duration-200 dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-4",
          headerElevated &&
            "shadow-md shadow-zinc-900/5 dark:shadow-black/40"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={toggleSidebar}
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="文章标题"
            required
            className="min-w-0 flex-1 border-0 bg-transparent pl-2 pr-0 text-base font-medium shadow-none focus-visible:ring-0 sm:pl-3 sm:text-lg"
          />

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => router.push("/admin/posts")}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="sm:hidden"
              onClick={() => setMetadataOpen(true)}
              aria-label="文章设置"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setMetadataOpen(true)}
              title={`文章设置 (${modKey}+,)`}
            >
              设置
            </Button>
            <Button
              type="button"
              variant={isDraft ? "outline" : "default"}
              size="sm"
              disabled={saving}
              onClick={() => save()}
              title={`${isDraft ? "保存草稿" : "保存"} (${modKey}+S)`}
            >
              {saving ? "保存中..." : isDraft ? "保存草稿" : "保存"}
            </Button>
            {isDraft ? (
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => save({ publish: true })}
                title={`发布 (${modKey}+Shift+S)`}
              >
                发布
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-100 pt-2 dark:border-zinc-800">
          <MarkdownFormatToolbar
            onAction={(action) => editorRef.current?.applyFormat(action)}
          />
          <PostAiToolbar
            loadingAction={ai.loadingAction}
            hasSelection={!!editorSelection?.text.trim()}
            onPolish={ai.runPolish}
            onContinue={ai.runContinue}
          />
        </div>
      </header>

      {error && (
        <div className="flex shrink-0 items-start gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
          <p className="min-w-0 flex-1">{error}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => setError("")}
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {ai.error && (
        <div className="flex shrink-0 items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="min-w-0 flex-1">{ai.error}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
            onClick={ai.clearError}
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ImmersiveMarkdownEditor
        ref={editorRef}
        value={form.content}
        onChange={(content) => updateField("content", content)}
        onSelectionChange={handleSelectionChange}
        onContentScroll={setHeaderElevated}
      />

      <PostAiPreviewDialog
        preview={ai.preview}
        onApply={ai.applyPreview}
        onRetry={ai.retryPreview}
        onDismiss={ai.dismissPreview}
      />

      <PostMetadataPanel
        open={metadataOpen}
        onOpenChange={setMetadataOpen}
        form={form}
        authors={authors}
        postId={postId}
        onFieldChange={(key, value) =>
          updateField(key, value as PostFormState[typeof key])
        }
        onTitleChange={handleTitleChange}
      />
    </div>
  );
}
