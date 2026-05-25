"use client";

import { useCallback, useState } from "react";
import type { ImmersiveMarkdownEditorHandle } from "@/app/admin/components/ImmersiveMarkdownEditor";

const CONTEXT_BEFORE_AFTER = 300;
const CONTEXT_CONTINUE_MAX = 4000;

export type PostAiAction = "polish" | "continue";

export type PostAiPreview = {
  action: PostAiAction;
  original: string;
  result: string;
  apply: () => void;
};

type UsePostAiActionOptions = {
  title: string;
  content: string;
  editorRef: React.RefObject<ImmersiveMarkdownEditorHandle | null>;
};

function truncateTail(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(-maxLength);
}

export function usePostAiAction({
  title,
  content,
  editorRef,
}: UsePostAiActionOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PostAiPreview | null>(null);

  const runAction = useCallback(
    async (action: PostAiAction) => {
      setError("");

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("请先填写标题");
        return;
      }

      const textarea = editorRef.current?.getTextarea();
      if (!textarea) return;

      let body: Record<string, string>;

      if (action === "polish") {
        const selection = editorRef.current?.getSelection();
        if (!selection?.text.trim()) {
          setError("请先选中要润色的文字");
          return;
        }

        body = {
          action: "polish",
          title: trimmedTitle,
          selection: selection.text,
          before: content.slice(
            Math.max(0, selection.start - CONTEXT_BEFORE_AFTER),
            selection.start
          ),
          after: content.slice(
            selection.end,
            selection.end + CONTEXT_BEFORE_AFTER
          ),
        };
      } else {
        const cursor = textarea.selectionStart;
        const contentBeforeCursor = content.slice(0, cursor).trim();
        if (!contentBeforeCursor) {
          setError("请先输入一些正文内容再续写");
          return;
        }

        body = {
          action: "continue",
          title: trimmedTitle,
          content: truncateTail(contentBeforeCursor, CONTEXT_CONTINUE_MAX),
        };
      }

      setLoading(true);

      try {
        const res = await fetch("/api/admin/ai/post-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "AI 请求失败");
        }

        const result = typeof data.text === "string" ? data.text : "";
        if (!result.trim()) {
          throw new Error("AI 返回了空内容，请重试");
        }

        if (action === "polish") {
          const selection = editorRef.current?.getSelection();
          if (!selection) {
            throw new Error("选区已丢失，请重新选中文字");
          }

          setPreview({
            action,
            original: selection.text,
            result,
            apply: () => {
              editorRef.current?.replaceRange(
                selection.start,
                selection.end,
                result
              );
            },
          });
        } else {
          const cursor = textarea.selectionStart;
          setPreview({
            action,
            original: content.slice(Math.max(0, cursor - 200), cursor) || "（光标位置）",
            result,
            apply: () => {
              editorRef.current?.replaceRange(cursor, cursor, result);
            },
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI 请求失败");
      } finally {
        setLoading(false);
      }
    },
    [title, content, editorRef]
  );

  const runPolish = useCallback(() => runAction("polish"), [runAction]);
  const runContinue = useCallback(() => runAction("continue"), [runAction]);

  const applyPreview = useCallback(() => {
    preview?.apply();
    setPreview(null);
  }, [preview]);

  const dismissPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const retryPreview = useCallback(() => {
    if (!preview) return;
    const action = preview.action;
    setPreview(null);
    void runAction(action);
  }, [preview, runAction]);

  return {
    loading,
    error,
    preview,
    runPolish,
    runContinue,
    applyPreview,
    dismissPreview,
    retryPreview,
    clearError: () => setError(""),
  };
}
