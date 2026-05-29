"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarkdownPreview from "@/app/admin/components/MarkdownPreview";
import {
  POST_POLISH_MODE_LABEL,
  type PostAiPreview,
} from "@/app/admin/hooks/usePostAiAction";

type PostAiPreviewDialogProps = {
  preview: PostAiPreview | null;
  onApply: () => void;
  onRetry: () => void;
  onDismiss: () => void;
};

export default function PostAiPreviewDialog({
  preview,
  onApply,
  onRetry,
  onDismiss,
}: PostAiPreviewDialogProps) {
  const isPolish = preview?.action === "polish";
  const isContinue = preview?.action === "continue";
  const isTranslate = preview?.action === "translate";
  const polishTitle =
    isPolish && preview?.polishMode
      ? `${POST_POLISH_MODE_LABEL[preview.polishMode]}预览`
      : "润色预览";
  const dialogTitle = isPolish
    ? polishTitle
    : isTranslate
      ? "翻译预览"
      : "续写预览";

  return (
    <Dialog.Root open={!!preview} onOpenChange={(open) => !open && onDismiss()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <Dialog.Title className="text-base font-medium">
              {dialogTitle}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">关闭</span>
              </Button>
            </Dialog.Close>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-2">
            <div className="flex min-h-0 flex-col border-b border-zinc-200 dark:border-zinc-800 md:border-b-0 md:border-r">
              <div className="shrink-0 px-4 py-2 text-xs font-medium text-zinc-500">
                {isPolish || isTranslate
                  ? "原文"
                  : isContinue
                    ? "光标附近上下文"
                    : "上文（光标前）"}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {preview?.original}
                </pre>
              </div>
            </div>
            <div className="flex min-h-0 flex-col">
              <div className="shrink-0 px-4 py-2 text-xs font-medium text-violet-600 dark:text-violet-400">
                AI 结果
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <MarkdownPreview
                  markdown={preview?.result ?? ""}
                  className="rounded-none border-0 bg-transparent p-0"
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onDismiss}>
              取消
            </Button>
            <Button type="button" variant="outline" onClick={onRetry}>
              重试
            </Button>
            <Button type="button" onClick={onApply}>
              应用
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
