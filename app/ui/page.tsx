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
    "前端组件与区块作品集：按钮、卡片、Hero、定价页等，全部可实时预览并复制源码。",
  openGraph: {
    title: "UI | Leyen",
    description:
      "前端组件与区块作品集：按钮、卡片、Hero、定价页等，全部可实时预览并复制源码。",
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
        description="自己每天写一点的前端组件与区块。全部真实可运行，可以预览、读源码、直接复制。"
      >
        <p className="mt-5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {kindCounts.components} components · {kindCounts.blocks} blocks
        </p>
      </PageHeading>

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

      <GalleryGrid items={items} />
    </div>
  );
}
