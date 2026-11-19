"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyState = "idle" | "copied" | "failed";

/**
 * 卡片左下角的作品名：点击即复制名称，省去选中文本的步骤。
 * 剪贴板 API 在非安全上下文或旧浏览器里不可用，因此保留 textarea 兜底。
 */
async function writeClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 权限被拒或上下文不安全时继续走兜底方案。
    }
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  } finally {
    area.remove();
  }
  return ok;
}

export function GalleryNameCopy({ name }: { name: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function handleCopy() {
    const ok = await writeClipboard(name);
    setState(ok ? "copied" : "failed");

    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setState("idle"), 1600);
  }

  return (
    <div className="pointer-events-none absolute bottom-5 left-5 flex max-w-[calc(100%-5rem)] items-center gap-1.5 text-xs font-medium leading-5 tracking-tight text-zinc-400 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 translate-y-1 opacity-0 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 sm:left-7 dark:text-zinc-500">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy name: ${name}`}
        title={name}
        className="pointer-events-auto flex min-w-0 select-none items-center gap-1.5 rounded transition-colors hover:text-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:hover:text-zinc-300"
      >
        <span className="truncate">
          {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : name}
        </span>
        {state === "copied" ? (
          <Check aria-hidden="true" className="h-3 w-3 shrink-0 text-emerald-500" />
        ) : (
          <Copy aria-hidden="true" className="h-3 w-3 shrink-0 opacity-50" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Name copied" : state === "failed" ? "Copy failed" : ""}
      </span>
    </div>
  );
}
