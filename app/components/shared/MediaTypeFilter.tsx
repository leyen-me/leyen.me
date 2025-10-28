"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function MediaTypeFilter({ mediaType }: { mediaType: string }) {
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

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => updateFilter("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          mediaType === "all"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        All
      </button>
      <button
        onClick={() => updateFilter("movie")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          mediaType === "movie"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        Movies
      </button>
      <button
        onClick={() => updateFilter("tv")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          mediaType === "tv"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        TV Shows
      </button>
    </div>
  );
}