"use client";

import { useState, type ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SlugKind } from "@/lib/admin/ai/slug";
import { normalizeSlug } from "@/lib/utils";

type SlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
  sourceTitle: string;
  kind: SlugKind;
  placeholder?: string;
  id?: string;
  label?: ReactNode;
  required?: boolean;
};

export default function SlugField({
  value,
  onChange,
  sourceTitle,
  kind,
  placeholder = "my-slug",
  id = "slug",
  label = "Slug",
  required = true,
}: SlugFieldProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    const title = sourceTitle.trim();
    if (!title) {
      setError("请先填写标题");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/ai/slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, kind }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "生成 Slug 失败");
      }

      onChange(data.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成 Slug 失败");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-zinc-600 dark:text-zinc-400"
          onClick={handleGenerate}
          disabled={generating || !sourceTitle.trim()}
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          AI 生成
        </Button>
      </div>
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          setError("");
          onChange(normalizeSlug(e.target.value));
        }}
        placeholder={placeholder}
        pattern="[a-z][a-z0-9-]*"
        required={required}
      />
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-zinc-500">
          只需填写标题即可 AI 生成；小写字母开头，仅允许英文字母、数字和中划线
        </p>
      )}
    </div>
  );
}
