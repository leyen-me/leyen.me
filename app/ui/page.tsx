import type { Metadata } from "next";
import PageHeading from "@/app/components/shared/PageHeading";
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
    : undefined;

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
      <PageHeading
        title="UI"
        description="A collection of front-end components and blocks, written one at a time. Every piece is real, runnable, and ready to preview, read, and copy."
      />

      <GalleryFilters
        basePath="/ui"
        kind={kind}
        activeCategory={activeCategory}
        q={searchParams.q}
        tag={searchParams.tag}
        kindCounts={kindCounts}
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
