"use client";

import { galleryLoaders } from "@/lib/ui-gallery/loaders.generated";
import { DemoErrorBoundary } from "./DemoErrorBoundary";

export function DemoRenderer({
  id,
  resetKey,
}: {
  id: string;
  resetKey?: string;
}) {
  const Demo = galleryLoaders[id];

  if (!Demo) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
      >
        未找到作品 <code className="font-mono">{id}</code>，请运行{" "}
        <code className="font-mono">npm run ui:sync</code>。
      </div>
    );
  }

  return (
    <DemoErrorBoundary resetKey={resetKey}>
      <Demo />
    </DemoErrorBoundary>
  );
}
