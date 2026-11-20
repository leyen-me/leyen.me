import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import PageHeading from "@/app/components/shared/PageHeading";
import { GalleryFilters } from "@/app/components/ui-gallery/GalleryFilters";
import { GalleryGrid } from "@/app/components/ui-gallery/GalleryGrid";
import {
  findGalleryCategory,
  galleryCategories,
  galleryKindMeta,
  isGalleryKind,
} from "@/lib/ui-gallery/categories";
import {
  filterGalleryItems,
  getGalleryCategoryCounts,
  getGalleryItemsByCategory,
  getGalleryTags,
} from "@/lib/ui-gallery/queries";

type Params = { kind: string; category: string };
type SearchParams = { q?: string; tag?: string };

export function generateStaticParams(): Params[] {
  return Object.entries(galleryCategories).flatMap(([kind, categories]) =>
    categories.map((category) => ({ kind, category: category.id }))
  );
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  if (!isGalleryKind(params.kind)) return { title: "UI | Leyen" };
  const category = findGalleryCategory(params.kind, params.category);
  if (!category) return { title: "UI | Leyen" };
  const title = `${category.label} — ${galleryKindMeta[params.kind].label} | Leyen`;
  return {
    title,
    description: category.description,
    alternates: {
      canonical: `https://leyen.me/ui/${params.kind}/${params.category}`,
    },
  };
}

export default function UiCategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  if (!isGalleryKind(params.kind)) notFound();
  const kind = params.kind;
  const category = findGalleryCategory(kind, params.category);
  if (!category) notFound();

  const baseItems = getGalleryItemsByCategory(kind, category.id);
  const items = filterGalleryItems(baseItems, {
    q: searchParams.q,
    tag: searchParams.tag,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 md:px-16">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/ui" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              UI
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li>
            <Link
              href={`/ui/${kind}`}
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              {galleryKindMeta[kind].label}
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li aria-current="page" className="text-zinc-900 dark:text-white">
            {category.label}
          </li>
        </ol>
      </nav>

      <PageHeading title={category.label} description={category.description}>
        <p className="mt-5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {baseItems.length} works
        </p>
      </PageHeading>

      <GalleryFilters
        basePath={`/ui/${kind}/${category.id}`}
        kind={kind}
        activeCategory={category.id}
        q={searchParams.q}
        tag={searchParams.tag}
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
