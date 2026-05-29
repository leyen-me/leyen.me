"use client";

import { useCallback, useState } from "react";
import type {
  EditorSelection,
  ImmersiveMarkdownEditorHandle,
} from "@/app/admin/components/ImmersiveMarkdownEditor";

const CONTEXT_BEFORE_AFTER = 300;
const CONTEXT_CONTINUE_MAX = 4000;
const CONTEXT_CONTINUE_AFTER_MAX = 1200;

export type PostAiAction = "polish" | "continue";
export type PostPolishMode = "light" | "deep" | "styled";

export const POST_POLISH_MODE_LABEL: Record<PostPolishMode, string> = {
  light: "轻度润色",
  deep: "深度润色",
  styled: "风格化润色",
};

export type PostAiPreview = {
  action: PostAiAction;
  original: string;
  result: string;
  apply: () => void;
  polishMode?: PostPolishMode;
};

type UsePostAiActionOptions = {
  title: string;
  content: string;
  editorRef: React.RefObject<ImmersiveMarkdownEditorHandle | null>;
  getPolishSelection: () => EditorSelection | null;
};

function truncateTail(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(-maxLength);
}

function truncateHead(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

export function usePostAiAction({
  title,
  content,
  editorRef,
  getPolishSelection,
}: UsePostAiActionOptions) {
  const [loadingAction, setLoadingAction] = useState<PostAiAction | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PostAiPreview | null>(null);

  const runAction = useCallback(
    async (action: PostAiAction, polishMode: PostPolishMode = "light") => {
      setError("");

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("请先填写标题");
        return;
      }

      const textarea = editorRef.current?.getTextarea();
      if (!textarea) return;

      if (action === "polish") {
        const selection =
          editorRef.current?.getSelection() ?? getPolishSelection();
        if (!selection?.text.trim()) {
          setError("请先选中要润色的文字");
          return;
        }

        setLoadingAction("polish");

        try {
          const res = await fetch("/api/admin/ai/post-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "polish",
              mode: polishMode,
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
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "AI 请求失败");
          }

          const result = typeof data.text === "string" ? data.text : "";
          if (!result.trim()) {
            throw new Error("AI 返回了空内容，请重试");
          }

          setPreview({
            action,
            original: selection.text,
            result,
            polishMode,
            apply: () => {
              editorRef.current?.replaceRange(
                selection.start,
                selection.end,
                result
              );
            },
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "AI 请求失败");
        } finally {
          setLoadingAction(null);
        }
        return;
      }

      const cursor = textarea.selectionStart;
      const contentBeforeCursor = content.slice(0, cursor);
      if (!contentBeforeCursor.trim()) {
        setError("请先输入一些正文内容再续写");
        return;
      }
      const contentAfterCursor = content.slice(cursor);
      const beforeContext = truncateTail(contentBeforeCursor, CONTEXT_CONTINUE_MAX);
      const afterContext = truncateHead(contentAfterCursor, CONTEXT_CONTINUE_AFTER_MAX);

      setLoadingAction("continue");

      try {
        const res = await fetch("/api/admin/ai/post-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "continue",
            title: trimmedTitle,
              before: beforeContext,
              after: afterContext,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "AI 请求失败");
        }

        const result = typeof data.text === "string" ? data.text : "";
        if (!result.trim()) {
          throw new Error("AI 返回了空内容，请重试");
        }

        setPreview({
          action,
          original: [
            truncateTail(contentBeforeCursor, 200) || "（文首）",
            "\n\n[在此续写]\n\n",
            truncateHead(contentAfterCursor, 200) || "（文末）",
          ].join(""),
          result,
          apply: () => {
            editorRef.current?.replaceRange(cursor, cursor, result);
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI 请求失败");
      } finally {
        setLoadingAction(null);
      }
    },
    [title, content, editorRef, getPolishSelection]
  );

  const runPolish = useCallback(
    (mode: PostPolishMode) => runAction("polish", mode),
    [runAction]
  );
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
    const polishMode = preview.polishMode ?? "light";
    setPreview(null);
    void runAction(action, polishMode);
  }, [preview, runAction]);

  return {
    loadingAction,
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
