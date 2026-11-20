import type { Metadata } from "next";
import { BlueprintDrawing } from "@/app/components/ui-gallery/BlueprintDrawing";
import { GalleryFilters } from "@/app/components/ui-gallery/GalleryFilters";
import { GalleryGrid } from "@/app/components/ui-gallery/GalleryGrid";
import { isGalleryKind } from "@/lib/ui-gallery/categories";
import {
  filterGalleryItems,
  getAllGalleryItems,
  getGalleryCategoryCounts,
  getGalleryItemsByKind,
  getGalleryKindCounts,
  getGalleryTags,
} from "@/lib/ui-gallery/queries";

export const metadata: Metadata = {
  title: "UI | Leyen",
  description:
    "A collection of front-end components and blocks, written one at a time. Every piece is real, runnable, and ready to preview, read, and copy.",
  openGraph: {
    title: "UI | Leyen",
    description:
      "A collection of front-end components and blocks, written one at a time. Every piece is real, runnable, and ready to preview, read, and copy.",
    type: "website",
    locale: "zh_CN",
    url: "https://leyen.me/ui",
  },
};

type SearchParams = {
  kind?: string;
  cat?: string;
  q?: string;
  tag?: string;
};

export default function UiOverviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const kind = searchParams.kind && isGalleryKind(searchParams.kind)
    ? searchParams.kind
    : "components";

  const kindCounts = getGalleryKindCounts();
  const baseItems = kind ? getGalleryItemsByKind(kind) : getAllGalleryItems();
  const activeCategory =
    kind && searchParams.cat && baseItems.some((item) => item.category === searchParams.cat)
      ? searchParams.cat
      : undefined;

  const scopedItems = activeCategory
    ? baseItems.filter((item) => item.category === activeCategory)
    : baseItems;
  const items = filterGalleryItems(scopedItems, {
    q: searchParams.q,
    tag: searchParams.tag,
  });

  const categories = kind ? getGalleryCategoryCounts(kind) : undefined;
  const tags = getGalleryTags(baseItems);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 md:px-16">
      <header className="mb-10 pt-4 sm:pt-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="min-w-0">
            <h1 className="font-incognito text-5xl font-semibold leading-none tracking-[-0.035em] text-zinc-900 dark:text-white sm:text-7xl">
              UI
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              A collection of front-end components and blocks, written one at a time.
              Every piece is real, runnable, and ready to preview, read, and copy.
            </p>
          </div>
          <BlueprintDrawing className="pointer-events-none mx-auto hidden w-full max-w-[540px] shrink-0 select-none lg:block" />
        </div>
      </header>

      <GalleryFilters
        basePath="/ui"
        kind={kind}
        activeCategory={activeCategory}
        q={searchParams.q}
        tag={searchParams.tag}
        categories={categories}
        tags={tags}
        resultCount={items.length}
      />

      <GalleryGrid
        items={items}
        emptyTitle={
          kindCounts.components + kindCounts.blocks === 0
            ? "作品正在整理中"
            : undefined
        }
        emptyMessage={
          kindCounts.components + kindCounts.blocks === 0
            ? "第一批组件与区块马上就来。"
            : undefined
        }
      />
    </div>
  );
}
