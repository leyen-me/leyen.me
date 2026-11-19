"use client";

import { DemoRenderer } from "./DemoRenderer";
import { LazyMount } from "./LazyMount";

/**
 * 列表大卡片里的实时预览：进入视口才挂载，并且完全可交互。
 * 卡片本身不再是链接，指针事件留给作品；详情入口在卡片底部的标题链接。
 */
export function CardPreview({ id }: { id: string }) {
  return (
    <LazyMount
      className="flex w-full justify-center"
      fallback={
        <div className="h-32 w-full max-w-sm animate-pulse rounded-2xl bg-zinc-200/60 dark:bg-white/[0.06]" />
      }
    >
      <div className="flex w-full justify-center">
        <DemoRenderer id={id} />
      </div>
    </LazyMount>
  );
}
