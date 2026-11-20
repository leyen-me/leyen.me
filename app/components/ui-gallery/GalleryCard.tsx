import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GalleryItem } from "@/lib/ui-gallery/types";
import { CardPreview } from "./CardPreview";
import { GalleryNameCopy } from "./GalleryNameCopy";

/**
 * 列表大卡片：只展示作品本身，卡片高度由 meta.previewHeight 决定，
 * 让不同作品在瀑布流里形成错落节奏。标题与描述只在详情页出现。
 */
export function GalleryCard({ item }: { item: GalleryItem }) {
  const href = `/ui/${item.id}`;
  const isBlock = item.kind === "blocks";

  return (
    <article className={isBlock ? "group break-inside-avoid" : "group mb-5 break-inside-avoid"}>
      <div className="relative overflow-hidden rounded-shell bg-zinc-100/70 ring-1 ring-inset ring-zinc-900/[0.04] transition-colors duration-300 hover:bg-zinc-100 focus-within:ring-zinc-900/10 dark:bg-white/[0.055] dark:ring-white/[0.06] dark:hover:bg-white/[0.075] dark:focus-within:ring-white/15">
        <div
          className={
            isBlock
              ? "relative w-full overflow-hidden bg-surface-0 sm:aspect-[16/9]"
              : "relative flex items-center justify-center px-5 py-8 sm:px-7"
          }
          style={isBlock ? undefined : { minHeight: item.previewHeight }}
        >
          {item.status === "wip" && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              WIP
            </span>
          )}

          {isBlock ? (
            <div className="[&>div>div]:block sm:absolute sm:inset-0 sm:[&>div]:h-full sm:[&>div>div]:h-full sm:[&_section]:h-full sm:[&_section]:min-h-0 sm:[&_section>div]:h-full sm:[&_section>div]:min-h-0 sm:[&_section>div>div]:h-full sm:[&_section>div>div]:min-h-0">
              <CardPreview id={item.id} />
            </div>
          ) : (
            <CardPreview id={item.id} />
          )}

          <GalleryNameCopy name={item.title} />

          {/*
            预览区承载可交互 demo（拖拽、输入、按钮），整卡包链接会吞掉这些交互，
            所以详情入口只在悬停/聚焦时于右下角出现；触屏没有悬停，始终显示。
          */}
          <Link
            href={href}
            className="absolute bottom-3 right-3 p-2 text-zinc-400 transition-[opacity,transform,color] duration-300 hover:text-emerald-600 focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 pointer-events-none translate-y-1 opacity-0 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 dark:text-zinc-500 dark:hover:text-emerald-400"
          >
            <span className="sr-only">{item.title}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
