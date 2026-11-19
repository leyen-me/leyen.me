import EmptyState from "@/app/components/shared/EmptyState";
import type { GalleryItem } from "@/lib/ui-gallery/types";
import { GalleryCard } from "./GalleryCard";

export function GalleryGrid({
  items,
  emptyMessage = "换一个关键词或分类试试。",
}: {
  items: GalleryItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="没有找到作品"
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
