"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { INTERVIEW_CATEGORY_OPTIONS } from "@/lib/interview-categories";

export function InterviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCat = searchParams.get("cat") ?? "";

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

  const catButtonClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
      active
        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
        : "bg-gray-100 dark:bg-zinc-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700/70"
    }`;

  return (
    <div className="mb-8">
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
  );
}
