import EmptyState from "@/app/components/shared/EmptyState";
import type { GalleryItem } from "@/lib/ui-gallery/types";
import { GalleryCard } from "./GalleryCard";

export function GalleryGrid({
  items,
  emptyTitle = "没有找到作品",
  emptyMessage = "换一个关键词或分类试试。",
}: {
  items: GalleryItem[];
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  const isBlocks = items[0]?.kind === "blocks";

  return (
    <div
      className={
        isBlocks
          ? "grid grid-cols-1 gap-6"
          : "columns-1 gap-5 sm:columns-2 lg:columns-3"
      }
    >
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
