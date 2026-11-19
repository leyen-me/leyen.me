import Link from "next/link";
import { Search, X } from "lucide-react";
import { galleryKindMeta } from "@/lib/ui-gallery/categories";
import type { GalleryKind as GalleryKindType } from "@/lib/ui-gallery/types";

type CategoryChip = {
  id: string;
  label: string;
  count: number;
};

type GalleryFiltersProps = {
  /** 当前页面路径，用于搜索表单与标签链接 */
  basePath: string;
  kind?: GalleryKindType;
  activeCategory?: string;
  q?: string;
  tag?: string;
  kindCounts?: Record<GalleryKindType, number>;
  categories?: CategoryChip[];
  tags?: string[];
  resultCount: number;
};

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-zinc-900 bg-zinc-900 font-medium text-white dark:border-white dark:bg-white dark:text-zinc-900"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function GalleryFilters({
  basePath,
  kind,
  activeCategory,
  q,
  tag,
  kindCounts,
  categories,
  tags,
  resultCount,
}: GalleryFiltersProps) {
  const kinds: GalleryKindType[] = ["components", "blocks"];
  const hasFilters = Boolean(q || tag || activeCategory);

  return (
    <div className="mb-8 space-y-4">
      {kindCounts && (
        <div
          role="tablist"
          aria-label="作品类型"
          className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {[
            {
              id: "all" as const,
              label: "All",
              count: kindCounts.components + kindCounts.blocks,
              href: buildHref("/ui", { q, tag }),
            },
            ...kinds.map((item) => ({
              id: item,
              label: galleryKindMeta[item].label,
              count: kindCounts[item],
              href: buildHref("/ui", { kind: item, q, tag }),
            })),
          ].map((tab) => {
            const active = tab.id === "all" ? !kind : kind === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={active}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-zinc-900 font-medium text-white shadow-sm dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action={basePath} method="get" className="relative w-full sm:max-w-xs">
          {tag && <input type="hidden" name="tag" value={tag} />}
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="搜索作品、标签…"
            aria-label="搜索作品"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </form>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          共 <span className="font-mono text-zinc-900 dark:text-white">{resultCount}</span>{" "}
          个作品
          {hasFilters && (
            <Link
              href={basePath}
              className="ml-3 inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              清除筛选
            </Link>
          )}
        </p>
      </div>

      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip
            href={
              kind
                ? buildHref(`/ui/${kind}`, { q, tag })
                : buildHref(basePath, { q, tag })
            }
            active={!activeCategory}
          >
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              href={
                kind
                  ? buildHref(`/ui/${kind}/${category.id}`, { q, tag })
                  : buildHref(basePath, { cat: category.id, q, tag })
              }
              active={activeCategory === category.id}
            >
              {category.label}
              <span className="font-mono text-[10px] opacity-60">
                {category.count}
              </span>
            </Chip>
          ))}
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Tags
          </span>
          {tags.slice(0, 12).map((item) => (
            <Link
              key={item}
              href={buildHref(basePath, {
                q,
                tag: tag === item ? undefined : item,
              })}
              className={`rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors ${
                tag === item
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-100 text-zinc-500 hover:text-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              #{item}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
