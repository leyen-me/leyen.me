"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface TagFilterProps {
  tags: string[];
  selectedTag?: string;
}

export function TagFilter({ tags, selectedTag }: TagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === "all" || tag === selectedTag) {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (tags.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateTag("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            !selectedTag || selectedTag === "all"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
              : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
          }`}
        >
          全部
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => updateTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
              selectedTag === tag
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

