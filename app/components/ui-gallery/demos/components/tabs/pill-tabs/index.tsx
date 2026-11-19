"use client";

import { useState } from "react";

const tabs = ["Overview", "Analytics", "Settings"];

export default function Demo() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full max-w-md">
      <div
        role="tablist"
        aria-label="Sections"
        className="relative grid grid-cols-3 rounded-full border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-full bg-surface-0 transition-transform duration-300 ease-out dark:bg-zinc-700"
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            left: "0.25rem",
            transform: `translateX(calc(${active} * 100%))`,
          }}
        />
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => setActive(index)}
            className={`relative z-10 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
              active === index
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        className="mt-4 rounded-panel border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
      >
        {tabs[active]} 面板内容
      </div>
    </div>
  );
}
