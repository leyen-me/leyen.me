import Link from "next/link";
import { Boxes, Layers } from "lucide-react";
import type { GalleryItem } from "@/lib/ui-gallery/types";
import { getGalleryCategoryLabel } from "@/lib/ui-gallery/categories";
import { CardPreview } from "./CardPreview";

export function GalleryCard({ item }: { item: GalleryItem }) {
  const isBlock = item.kind === "blocks";

  return (
    <article className="group h-full">
      <Link
        href={`/ui/${item.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
      >
        <div className="relative h-40 shrink-0 overflow-hidden border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          {isBlock ? (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(51,224,146,0.18),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(168,85,247,0.16),transparent_55%)]">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(120,120,120,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.12)_1px,transparent_1px)] [background-size:22px_22px]"
              />
              <div className="relative flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Boxes className="h-6 w-6" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-[0.24em]">
                  Block preview
                </span>
              </div>
            </div>
          ) : (
            <CardPreview id={item.id} />
          )}

          <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-zinc-200 bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600 backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-300">
            {getGalleryCategoryLabel(item.kind, item.category)}
          </span>
          {item.status === "wip" && (
            <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              WIP
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {isBlock ? (
              <Boxes className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Layers className="h-3 w-3" aria-hidden="true" />
            )}
            {item.kind}
          </div>

          <h3 className="mt-2 text-base font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-emerald-500 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {item.summary}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
              {item.createdAt}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
