import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoRenderer } from "@/app/components/ui-gallery/DemoRenderer";
import { PreviewBridge } from "@/app/components/ui-gallery/PreviewBridge";
import {
  getAllGalleryItems,
  getGalleryItem,
} from "@/lib/ui-gallery/queries";

type Params = { kind: string; category: string; slug: string };

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

export default function PreviewPage({ params }: { params: Params }) {
  const item = getGalleryItem(params.kind, params.category, params.slug);
  if (!item) notFound();

  return (
    <>
      <PreviewBridge />
      <DemoRenderer id={item.id} />
    </>
  );
}
