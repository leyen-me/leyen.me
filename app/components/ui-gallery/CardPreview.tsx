"use client";

import { useEffect, useRef } from "react";
import { DemoRenderer } from "./DemoRenderer";
import { LazyMount } from "./LazyMount";

/**
 * 列表卡片里的微型预览：进入视口才挂载，且完全不可交互
 * （`inert` 同时移出 tab 顺序与读屏树）。
 */
export function CardPreview({ id }: { id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.setAttribute("inert", "");
  }, []);

  return (
    <LazyMount
      className="h-full"
      fallback={<div className="h-full w-full animate-pulse bg-zinc-100/60 dark:bg-zinc-900/60" />}
    >
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden p-4"
      >
        <DemoRenderer id={id} />
      </div>
    </LazyMount>
  );
}
