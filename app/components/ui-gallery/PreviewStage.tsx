"use client";

import { useState } from "react";
import {
  ExternalLink,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { DemoRenderer } from "./DemoRenderer";
import { PreviewFrame } from "./PreviewFrame";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORTS: Array<{
  id: Viewport;
  label: string;
  icon: typeof Monitor;
  width: number | null;
}> = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: null },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 768 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
];

type PreviewStageProps = {
  id: string;
  title: string;
  mode: "live" | "iframe";
  /** blocks 的独立预览地址 */
  previewHref?: string;
};

export function PreviewStage({ id, title, mode, previewHref }: PreviewStageProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const width = VIEWPORTS.find((item) => item.id === viewport)?.width ?? null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-1" role="group" aria-label="预览视口">
          {VIEWPORTS.map(({ id: viewportId, label, icon: Icon }) => (
            <button
              key={viewportId}
              type="button"
              aria-label={label}
              aria-pressed={viewport === viewportId}
              title={label}
              onClick={() => setViewport(viewportId)}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                viewport === viewportId
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {previewHref && (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="在新窗口打开预览"
              title="在新窗口打开预览"
              className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            aria-label="重新加载预览"
            title="重新加载预览"
            onClick={() => setReloadKey((value) => value + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="bg-[linear-gradient(45deg,rgba(0,0,0,0.02)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.02)_75%,transparent_75%,transparent)] bg-[length:16px_16px] dark:bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)]">
        <div
          className="mx-auto w-full transition-[max-width] duration-300"
          style={{ maxWidth: width ?? undefined }}
        >
          {mode === "iframe" && previewHref ? (
            <PreviewFrame
              src={previewHref}
              title={`${title} 预览`}
              reloadKey={reloadKey}
            />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center overflow-hidden p-6">
              <DemoRenderer id={id} resetKey={String(reloadKey)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
