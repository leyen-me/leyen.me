"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function MediaTypeFilter({ mediaType, sortBy }: { mediaType: string; sortBy?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
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
      <div className="flex gap-3">
        <button
          onClick={() => updateFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            mediaType === "all"
              ? "bg-[rgb(12,206,107)] text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70"
          }`}
        >
          All
        </button>
        <button
          onClick={() => updateFilter("movie")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            mediaType === "movie"
              ? "bg-[rgb(12,206,107)] text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70"
          }`}
        >
          Movies
        </button>
        <button
          onClick={() => updateFilter("tv")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            mediaType === "tv"
              ? "bg-[rgb(12,206,107)] text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70"
          }`}
        >
          TV Shows
        </button>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => updateSort("rating")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            sortBy === "rating" || !sortBy
              ? "bg-[rgb(12,206,107)] text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70"
          }`}
        >
          By Rating
        </button>
        <button
          onClick={() => updateSort("newest")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
            sortBy === "newest"
              ? "bg-[rgb(12,206,107)] text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/70"
          }`}
        >
          By Newest
        </button>
      </div>
    </div>
  );
}