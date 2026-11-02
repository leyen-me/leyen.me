"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type BottomSheetProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * WeChat-style action sheet: rises from the bottom on mobile, centres on
 * desktop. Locks page scroll and traps focus while open.
 */
export default function BottomSheet({
  open,
  title,
  description,
  onClose,
  children,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "操作"}
        className={cn(
          "relative z-10 w-full max-w-sm overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950",
          "pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:rounded-2xl"
        )}
      >
        {(title || description) && (
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            {title && <p className="text-sm font-medium">{title}</p>}
            {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
          </div>
        )}

        <div className="p-2">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function SheetItem({
  children,
  onClick,
  tone = "default",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-12 w-full items-center justify-center rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "danger"
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
      )}
    >
      {children}
    </button>
  );
}

export function SheetCancel({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-800">
      <SheetItem onClick={onClick}>取消</SheetItem>
    </div>
  );
}
