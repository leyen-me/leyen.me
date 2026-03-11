"use client";

import { useState } from "react";
import { BiCopy } from "react-icons/bi";
import { RiCheckboxCircleFill } from "react-icons/ri";

export default function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!markdown) return;

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "已复制 Markdown" : "复制 Markdown"}
      title={copied ? "已复制" : "复制文章 Markdown"}
      className="inline-flex items-center gap-x-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 transition hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {copied ? (
        <>
          <RiCheckboxCircleFill className="text-green-500" />
          <span>已复制</span>
        </>
      ) : (
        <>
          <BiCopy />
          <span>复制 Markdown</span>
        </>
      )}
    </button>
  );
}
