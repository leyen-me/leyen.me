import Link from "next/link";
import { Search, X } from "lucide-react";
import { galleryKindMeta, galleryKinds } from "@/lib/ui-gallery/categories";
import type { GalleryKind as GalleryKindType } from "@/lib/ui-gallery/types";
import { GalleryKindTabs } from "./GalleryKindTabs";

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
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs transition-colors ${
        active
          ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-900/[0.055] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-white"
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
  categories,
  tags,
  resultCount,
}: GalleryFiltersProps) {
  const tabs = galleryKinds.map((item) => ({
    id: item,
    label: galleryKindMeta[item].label,
    href: buildHref("/ui", { kind: item, q, tag }),
  }));
  const hasFilters = Boolean(q || tag || activeCategory);
  const visibleCategories =
    categories?.filter(
      (category) => category.count > 0 || category.id === activeCategory
    ) ?? [];
  const hasFacets = visibleCategories.length > 0 || (tags && tags.length > 0);

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <GalleryKindTabs
          activeId={kind ?? "components"}
          label="作品类型"
          tabs={tabs}
        />

        <form
          action={basePath}
          method="get"
          className="relative w-full sm:ml-auto sm:max-w-[260px]"
        >
          {tag && <input type="hidden" name="tag" value={tag} />}
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="搜索作品、标签…"
            aria-label="搜索作品"
            className="h-10 w-full rounded-full bg-zinc-900/[0.045] pl-10 pr-4 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 hover:bg-zinc-900/[0.06] focus:bg-white focus:ring-2 focus:ring-zinc-900/10 dark:bg-white/[0.055] dark:text-white dark:placeholder:text-zinc-500 dark:hover:bg-white/[0.07] dark:focus:bg-zinc-900 dark:focus:ring-white/15"
          />
        </form>
      </div>

      {hasFacets && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {visibleCategories.length > 0 && (
            <>
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
              {visibleCategories.map((category) => (
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
                  <span className="font-mono text-[10px] opacity-50">
                    {category.count}
                  </span>
                </Chip>
              ))}
            </>
          )}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {visibleCategories.length > 0 && (
                <span
                  aria-hidden="true"
                  className="mx-1 h-3.5 w-px bg-zinc-900/10 dark:bg-white/10"
                />
              )}
              {tags.slice(0, 12).map((item) => (
                <Link
                  key={item}
                  href={buildHref(basePath, {
                    q,
                    tag: tag === item ? undefined : item,
                  })}
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] transition-colors ${
                    tag === item
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400 hover:bg-zinc-900/[0.055] hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-white/[0.07] dark:hover:text-zinc-200"
                  }`}
                >
                  #{item}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          共{" "}
          <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
            {resultCount}
          </span>{" "}
          个作品
        </p>
        {hasFilters && (
          <Link
            href={basePath}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            清除筛选
          </Link>
        )}
      </div>
    </div>
  );
}
