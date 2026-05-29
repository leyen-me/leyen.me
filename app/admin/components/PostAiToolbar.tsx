"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, PenLine, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  POST_POLISH_MODE_LABEL,
  type PostAiAction,
  type PostPolishMode,
} from "@/app/admin/hooks/usePostAiAction";

type PostAiToolbarProps = {
  loadingAction: PostAiAction | null;
  hasSelection: boolean;
  onPolish: (mode: PostPolishMode) => void;
  onContinue: () => void;
  className?: string;
};

const POLISH_OPTIONS: Array<{
  mode: PostPolishMode;
  hint: string;
}> = [
  { mode: "light", hint: "忠实原意，微调措辞" },
  { mode: "deep", hint: "重写句式，压缩冗余" },
  { mode: "styled", hint: "专栏风格，表达更鲜明" },
];

export default function PostAiToolbar({
  loadingAction,
  hasSelection,
  onPolish,
  onContinue,
  className,
}: PostAiToolbarProps) {
  const isBusy = loadingAction !== null;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      <div
        aria-hidden="true"
        className="mx-1 hidden h-6 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700 sm:block"
      />
      <Sparkles className="hidden h-4 w-4 shrink-0 text-violet-500 sm:block" />
      <div className="relative" ref={menuRef}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 gap-1.5 px-2 text-xs sm:text-sm"
          disabled={isBusy || !hasSelection}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setMenuOpen((open) => !open)}
          title="选择润色方案"
        >
          {loadingAction === "polish" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          润色
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              menuOpen ? "rotate-180" : ""
            )}
          />
        </Button>
        {menuOpen ? (
          <div className="absolute right-0 top-[calc(100%+0.35rem)] z-20 w-max min-w-[8.5rem] rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            {POLISH_OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                title={option.hint}
                className="block w-full whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setMenuOpen(false);
                  onPolish(option.mode);
                }}
              >
                {POST_POLISH_MODE_LABEL[option.mode]}
              </button>
            ))}
          </div>
        ) : null}
      </div>
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
