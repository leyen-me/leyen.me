import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { MarkdownBody } from "@/app/components/shared/MarkdownBody";
import { CodePanel } from "@/app/components/ui-gallery/CodePanel";
import { GalleryMetaPanel } from "@/app/components/ui-gallery/GalleryMetaPanel";
import { PreviewStage } from "@/app/components/ui-gallery/PreviewStage";
import {
  galleryKindMeta,
  getGalleryCategoryLabel,
} from "@/lib/ui-gallery/categories";
import {
  getAllGalleryItems,
  getGalleryItem,
  getGalleryItemsByCategory,
  getGalleryPreviewMode,
} from "@/lib/ui-gallery/queries";
import sourcesJson from "@/lib/ui-gallery/sources.generated.json";
import type { GallerySourceBundle } from "@/lib/ui-gallery/types";

const sources = sourcesJson as Record<string, GallerySourceBundle>;

type Params = { kind: string; category: string; slug: string };

export function generateStaticParams(): Params[] {
  return getAllGalleryItems().map((item) => ({
    kind: item.kind,
    category: item.category,
    slug: item.slug,
  }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const item = getGalleryItem(params.kind, params.category, params.slug);
  if (!item) return { title: "UI | Leyen" };
  const title = `${item.title} | UI | Leyen`;
  const url = `https://leyen.me/ui/${item.id}`;
  return {
    title,
    description: item.summary,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: item.summary,
      type: "article",
      url,
    },
  };
}

export default function UiDetailPage({ params }: { params: Params }) {
  const item = getGalleryItem(params.kind, params.category, params.slug);
  if (!item) notFound();

  const previewMode = getGalleryPreviewMode(item.kind);
  const previewHref =
    previewMode === "iframe" ? `/ui/preview/${item.id}` : undefined;

  const siblings = getGalleryItemsByCategory(item.kind, item.category);
  const index = siblings.findIndex((entry) => entry.id === item.id);
  const previous = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  const source = sources[item.id];
  const files = source?.files ?? [];
  const note = source?.note ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: item.title,
    description: item.summary,
    codeRepository: "https://github.com/leyen-me/leyen.me",
    programmingLanguage: "TypeScript",
    url: `https://leyen.me/ui/${item.id}`,
    license: item.source.url,
    author: { "@type": "Person", name: "Leyen" },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 md:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
              href={`/ui/${item.kind}`}
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              {galleryKindMeta[item.kind].label}
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li>
            <Link
              href={`/ui/${item.kind}/${item.category}`}
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              {getGalleryCategoryLabel(item.kind, item.category)}
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li aria-current="page" className="text-zinc-900 dark:text-white">
            {item.title}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-500">
          {getGalleryCategoryLabel(item.kind, item.category)}
          {item.status === "wip" && (
            <span className="ml-2 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-600 dark:text-amber-400">
              WIP
            </span>
          )}
        </p>
        <h1 className="mt-3 font-incognito text-3xl font-semibold tracking-tight sm:text-4xl">
          {item.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          {item.summary}
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-10">
          <PreviewStage
            id={item.id}
            title={item.title}
            mode={previewMode}
            previewHref={previewHref}
          />

          <section aria-labelledby="code-heading">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 id="code-heading" className="text-lg font-semibold tracking-tight">
                Code
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                入口为 index.tsx，可直接复制到项目中。
              </p>
            </div>
            <CodePanel files={files} />
          </section>

          {note && (
            <section aria-labelledby="notes-heading">
              <h2 id="notes-heading" className="mb-3 text-lg font-semibold tracking-tight">
                Notes
              </h2>
              <MarkdownBody markdown={note} />
            </section>
          )}
        </div>

        <div className="h-fit lg:sticky lg:top-8">
          <GalleryMetaPanel item={item} />
        </div>
      </div>

      {(previous || next) && (
        <nav
          aria-label="同分类作品"
          className="mt-12 grid gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={`/ui/${previous.id}`}
              className="group flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <ArrowLeft className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-zinc-400">
                  Previous
                </span>
                <span className="block truncate text-sm text-zinc-800 group-hover:text-emerald-500 dark:text-zinc-200">
                  {previous.title}
                </span>
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {next && (
            <Link
              href={`/ui/${next.id}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-right transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-zinc-400">
                  Next
                </span>
                <span className="block truncate text-sm text-zinc-800 group-hover:text-emerald-500 dark:text-zinc-200">
                  {next.title}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
