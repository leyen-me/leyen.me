"use client";

import { Loader2, PenLine, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PostAiToolbarProps = {
  loading: boolean;
  hasSelection: boolean;
  onPolish: () => void;
  onContinue: () => void;
  className?: string;
};

export default function PostAiToolbar({
  loading,
  hasSelection,
  onPolish,
  onContinue,
  className,
}: PostAiToolbarProps) {
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
        disabled={loading || !hasSelection}
        onClick={onPolish}
        title="润色选中文本"
      >
        {loading ? (
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
        disabled={loading}
        onClick={onContinue}
        title="从光标处续写"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PenLine className="h-4 w-4" />
        )}
        续写
      </Button>
    </div>
  );
}
