"use client";

import { ArrowUpRight } from "lucide-react";

export default function Demo() {
  return (
    <button
      type="button"
      className="group relative inline-flex rounded-full p-[1.5px] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,#33E092,#22d3ee,#a855f7,#33E092)] opacity-70 blur-[1px] transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-white">
        Get started
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
