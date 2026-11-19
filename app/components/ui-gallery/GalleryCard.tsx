import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GalleryItem } from "@/lib/ui-gallery/types";
import { getGalleryCategoryLabel } from "@/lib/ui-gallery/categories";
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
          className="relative flex items-center justify-center px-5 pb-6 pt-14 sm:px-7"
          style={{ minHeight: item.previewHeight }}
        >
          <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 backdrop-blur-sm dark:bg-black/25 dark:text-zinc-400">
            {getGalleryCategoryLabel(item.kind, item.category)}
          </span>

          {item.status === "wip" && (
            <span className="absolute right-5 top-5 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              WIP
            </span>
          )}

          <CardPreview id={item.id} />
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div className="flex items-end justify-between gap-4 border-t border-zinc-900/[0.06] pt-5 dark:border-white/[0.07]">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                <Link
                  href={href}
                  className="rounded-sm outline-none transition-colors group-hover:text-emerald-600 focus-visible:underline focus-visible:decoration-emerald-500 focus-visible:underline-offset-4 dark:group-hover:text-emerald-400"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {item.summary}
              </p>
            </div>

            <ArrowUpRight
              aria-hidden="true"
              className="mb-0.5 h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-zinc-500"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
