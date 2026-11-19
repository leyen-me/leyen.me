import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GalleryItem } from "@/lib/ui-gallery/types";
import { CardPreview } from "./CardPreview";

/**
 * 列表大卡片：作品居中、可交互，卡片高度由 meta.previewHeight 决定，
 * 让不同作品在瀑布流里形成错落节奏。
 */
export function GalleryCard({ item }: { item: GalleryItem }) {
  const href = `/ui/${item.id}`;

  return (
    <article className="group mb-5 break-inside-avoid">
      <div className="relative overflow-hidden rounded-[28px] bg-zinc-100/70 ring-1 ring-inset ring-zinc-900/[0.04] transition-colors duration-300 hover:bg-zinc-100 focus-within:ring-zinc-900/10 dark:bg-white/[0.055] dark:ring-white/[0.06] dark:hover:bg-white/[0.075] dark:focus-within:ring-white/15">
        <div
          className="relative flex items-center justify-center px-5 py-8 sm:px-7"
          style={{ minHeight: item.previewHeight }}
        >
          <CardPreview id={item.id} />
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div className="relative flex items-end justify-between gap-4 border-t border-zinc-900/[0.06] pt-5 dark:border-white/[0.07]">
            <div className="min-w-0">
              {item.status === "wip" && (
                <span className="mb-2 inline-flex rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  WIP
                </span>
              )}
              <h3 className="truncate text-lg font-semibold leading-7 tracking-tight text-zinc-900 dark:text-white">
                {/*
                  预览区承载可交互 demo（拖拽、输入、按钮），整卡包裹 Link 会吞掉这些交互。
                  因此把链接拉伸到整个 meta 区：标题、描述、箭头都可点。
                */}
                <Link
                  href={href}
                  className="rounded-sm outline-none transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-emerald-600 focus-visible:underline focus-visible:decoration-emerald-500 focus-visible:underline-offset-4 dark:group-hover:text-emerald-400"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {item.summary}
              </p>
            </div>

            <ArrowUpRight
              aria-hidden="true"
              className="pointer-events-none mb-0.5 h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-zinc-500"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
