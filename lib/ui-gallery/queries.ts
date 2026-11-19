import { galleryCatalog } from "./catalog.generated";
import { galleryCategories, galleryKindMeta } from "./categories";
import type { GalleryItem, GalleryKind } from "./types";

export function getAllGalleryItems(): GalleryItem[] {
  return galleryCatalog;
}

export function getGalleryItem(
  kind: string,
  category: string,
  slug: string
): GalleryItem | undefined {
  return galleryCatalog.find(
    (item) =>
      item.kind === kind && item.category === category && item.slug === slug
  );
}

export function getGalleryItemsByKind(kind: GalleryKind): GalleryItem[] {
  return galleryCatalog.filter((item) => item.kind === kind);
}

export function getGalleryItemsByCategory(
  kind: GalleryKind,
  category: string
): GalleryItem[] {
  return galleryCatalog.filter(
    (item) => item.kind === kind && item.category === category
  );
}

export function getGalleryItemsByTag(tag: string): GalleryItem[] {
  return galleryCatalog.filter((item) => item.tags.includes(tag));
}

export function filterGalleryItems(
  items: GalleryItem[],
  filters: { q?: string; tag?: string }
): GalleryItem[] {
  const query = filters.q?.trim().toLowerCase();
  return items.filter((item) => {
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
    if (!query) return true;
    return [item.title, item.summary, item.category, ...item.tags]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export function getGalleryTags(items: GalleryItem[] = galleryCatalog): string[] {
  return [...new Set(items.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getGalleryCategoryCounts(
  kind: GalleryKind
): Array<{ id: string; label: string; description: string; count: number }> {
  return galleryCategories[kind].map((category) => ({
    ...category,
    count: galleryCatalog.filter(
      (item) => item.kind === kind && item.category === category.id
    ).length,
  }));
}

export function getGalleryKindCounts(): Record<GalleryKind, number> {
  return galleryCatalog.reduce(
    (counts, item) => {
      counts[item.kind] += 1;
      return counts;
    },
    { components: 0, blocks: 0 } as Record<GalleryKind, number>
  );
}

export function getGalleryPreviewMode(kind: GalleryKind): "live" | "iframe" {
  return galleryKindMeta[kind].preview;
}
