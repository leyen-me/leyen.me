"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { INTERVIEW_CATEGORY_OPTIONS } from "@/lib/interview-categories";

interface InterviewFiltersProps {
  allTags: string[];
}

export function InterviewFilters({ allTags }: InterviewFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCat = searchParams.get("cat") ?? "";
  const selectedTag = searchParams.get("tag") ?? "";

  const sortedTags = [...allTags].sort((a, b) =>
    a.localeCompare(b, "en")
  );

  const pushParams = (next: URLSearchParams) => {
    const q = next.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!cat) params.delete("cat");
    else params.set("cat", cat);
    pushParams(params);
  };

  const setTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!tag) params.delete("tag");
    else params.set("tag", tag);
    pushParams(params);
  };

  const catButtonClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
      active
        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
        : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
    }`;

  const tagButtonClass = (active: boolean) => catButtonClass(active);

  return (
    <div className="mb-8 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 mb-3">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={catButtonClass(!selectedCat)}
          >
            All
          </button>
          {INTERVIEW_CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={catButtonClass(selectedCat === c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {sortedTags.length > 0 ? (
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 mb-3">
            Tag
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTag("")}
              className={tagButtonClass(!selectedTag)}
            >
              All
            </button>
            {sortedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTag(tag)}
                className={tagButtonClass(selectedTag === tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
