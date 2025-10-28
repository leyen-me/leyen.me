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
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => updateFilter("all")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out ${
          mediaType === "all"
            ? "bg-blue-500 text-white shadow-sm"
            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        All
      </button>
      <button
        onClick={() => updateFilter("movie")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out ${
          mediaType === "movie"
            ? "bg-blue-500 text-white shadow-sm"
            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        Movies
      </button>
      <button
        onClick={() => updateFilter("tv")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out ${
          mediaType === "tv"
            ? "bg-blue-500 text-white shadow-sm"
            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        TV Shows
      </button>
    </div>
  );
}