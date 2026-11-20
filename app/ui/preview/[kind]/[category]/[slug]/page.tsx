import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoRenderer } from "@/app/components/ui-gallery/DemoRenderer";
import { PreviewBridge } from "@/app/components/ui-gallery/PreviewBridge";
import {
  getAllGalleryItems,
  getGalleryItem,
} from "@/lib/ui-gallery/queries";

type Params = { kind: string; category: string; slug: string };
type SearchParams = { fill?: string };

export const metadata: Metadata = {
  title: "Preview | UI | Leyen",
  robots: { index: false, follow: false },
};

export function generateStaticParams(): Params[] {
  return getAllGalleryItems().map((item) => ({
    kind: item.kind,
    category: item.category,
    slug: item.slug,
  }));
}

export default function PreviewPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const item = getGalleryItem(params.kind, params.category, params.slug);
  if (!item) notFound();

  // 列表卡片用 `?fill=1`：让区块撑满 iframe 视口，避免 16:9 框底部留白。
  const fill = searchParams.fill === "1";

  return (
    <>
      <PreviewBridge />
      <div
        className={
          fill ? "h-screen w-full [&>*]:h-full [&>*]:w-full [&>*]:min-h-0" : undefined
        }
      >
        <DemoRenderer id={item.id} />
      </div>
    </>
  );
}
