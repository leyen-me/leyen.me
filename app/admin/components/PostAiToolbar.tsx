"use client";

import { Loader2, PenLine, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PostAiAction } from "@/app/admin/hooks/usePostAiAction";

type PostAiToolbarProps = {
  loadingAction: PostAiAction | null;
  hasSelection: boolean;
  onPolish: () => void;
  onContinue: () => void;
  className?: string;
};

export default function PostAiToolbar({
  loadingAction,
  hasSelection,
  onPolish,
  onContinue,
  className,
}: PostAiToolbarProps) {
  const isBusy = loadingAction !== null;

  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      <div
        aria-hidden="true"
        className="mx-1 hidden h-6 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700 sm:block"
      />
      <Sparkles className="hidden h-4 w-4 shrink-0 text-violet-500 sm:block" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 gap-1.5 px-2 text-xs sm:text-sm"
        disabled={isBusy || !hasSelection}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onPolish}
        title="润色选中文本"
      >
        {loadingAction === "polish" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        润色
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 gap-1.5 px-2 text-xs sm:text-sm"
        disabled={isBusy}
        onClick={onContinue}
        title="从光标处续写"
      >
        {loadingAction === "continue" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PenLine className="h-4 w-4" />
        )}
        续写
      </Button>
    </div>
  );
}
