"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Refractor } from "@/lib/refractor-languages";
import {
  formatCodeLanguageLabel,
  resolveHighlightLanguage,
} from "@/lib/code-language-label";
import type { GalleryFile } from "@/lib/ui-gallery/types";

function fileName(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

export function CodePanel({ files }: { files: GalleryFile[] }) {
  const [activePath, setActivePath] = useState(files[0]?.path ?? "");
  const [copied, setCopied] = useState(false);
  const active = useMemo(
    () => files.find((file) => file.path === activePath) ?? files[0],
    [files, activePath]
  );

  if (!active) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        这个作品没有可展示的源码。
      </p>
    );
  }

  const language = resolveHighlightLanguage(active.language);
  const lines = active.code.split("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function handleDownload() {
    const blob = new Blob([active.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName(active.path);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="源码文件">
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              role="tab"
              aria-selected={file.path === active.path}
              onClick={() => setActivePath(file.path)}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-xs transition-colors ${
                file.path === active.path
                  ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5 dark:bg-zinc-800 dark:text-white dark:ring-white/10"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {fileName(file.path)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1 hidden text-[11px] uppercase tracking-wider text-zinc-400 sm:inline">
            {formatCodeLanguageLabel(active.language)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "已复制" : "复制源码"}
            title={copied ? "已复制" : "复制源码"}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label="下载源码"
            title="下载源码"
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="max-h-[560px] overflow-auto bg-white/80 dark:bg-zinc-950/80">
        <div className="flex min-w-max">
          <div
            aria-hidden="true"
            className="shrink-0 select-none border-r border-zinc-200 bg-zinc-50/60 py-4 pl-3 pr-3 text-right font-mono text-[0.83rem] leading-[1.55] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-600"
          >
            {lines.map((_, index) => (
              <span key={index} className="block tabular-nums">
                {index + 1}
              </span>
            ))}
          </div>
          <Refractor
            language={language}
            value={active.code}
            className="!my-0 min-w-0 px-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
