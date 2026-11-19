import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeading from "@/app/components/shared/PageHeading";
import { GalleryFilters } from "@/app/components/ui-gallery/GalleryFilters";
import { GalleryGrid } from "@/app/components/ui-gallery/GalleryGrid";
import {
  galleryKindMeta,
  galleryKinds,
  isGalleryKind,
} from "@/lib/ui-gallery/categories";
import {
  filterGalleryItems,
  getGalleryCategoryCounts,
  getGalleryItemsByKind,
  getGalleryKindCounts,
  getGalleryTags,
} from "@/lib/ui-gallery/queries";

type Params = { kind: string };
type SearchParams = { q?: string; tag?: string };

export function generateStaticParams(): Params[] {
  return galleryKinds.map((kind) => ({ kind }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  if (!isGalleryKind(params.kind)) {
    return { title: "UI | Leyen" };
  }
  const meta = galleryKindMeta[params.kind];
  return {
    title: `${meta.label} | UI | Leyen`,
    description: meta.description,
    alternates: { canonical: `https://leyen.me/ui/${params.kind}` },
  };
}

export default function UiKindPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  if (!isGalleryKind(params.kind)) notFound();
  const kind = params.kind;
  const meta = galleryKindMeta[kind];

  const baseItems = getGalleryItemsByKind(kind);
  const items = filterGalleryItems(baseItems, {
    q: searchParams.q,
    tag: searchParams.tag,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 md:px-16">
      <PageHeading title={meta.label} description={meta.description}>
        <p className="mt-5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {baseItems.length} works
        </p>
      </PageHeading>

      <GalleryFilters
        basePath={`/ui/${kind}`}
        kind={kind}
        q={searchParams.q}
        tag={searchParams.tag}
        kindCounts={getGalleryKindCounts()}
        categories={getGalleryCategoryCounts(kind)}
        tags={getGalleryTags(baseItems)}
        resultCount={items.length}
      />

      <GalleryGrid
        items={items}
        emptyTitle={baseItems.length === 0 ? "作品正在整理中" : undefined}
        emptyMessage={
          baseItems.length === 0 ? "第一批组件与区块马上就来。" : undefined
        }
      />
    </div>
  );
}
