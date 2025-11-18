"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function MediaTypeFilter({ mediaType, sortBy }: { mediaType?: string; sortBy?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const isFirstType = type === "movie";
    const isCurrentlySelected = type === mediaType;
    
    if (isFirstType && isCurrentlySelected) {
      // 如果点击的是第一个类型（movie）且已经选中，不做任何操作（保持选中）
      return;
    } else if (isCurrentlySelected && !isFirstType) {
      // 如果点击已选中的类型（且不是第一个），则回到第一个类型
      params.delete("type");
    } else {
      // 选择新的类型
      params.set("type", type);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "rating") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter("movie")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            mediaType === "movie"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
              : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
          }`}
        >
          电影
        </button>
        <button
          onClick={() => updateFilter("tv")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            mediaType === "tv"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
              : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
          }`}
        >
          电视剧
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateSort("rating")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            sortBy === "rating" || !sortBy
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
              : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
          }`}
        >
          按评分
        </button>
        <button
          onClick={() => updateSort("newest")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            sortBy === "newest"
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
              : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
          }`}
        >
          按最新
        </button>
      </div>
    </div>
  );
}