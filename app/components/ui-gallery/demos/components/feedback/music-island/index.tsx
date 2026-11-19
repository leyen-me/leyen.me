"use client";

import { useState } from "react";
import MusicIsland, { type Tone } from "./island";

const TONES: Tone[] = ["Black", "White"];

/**
 * Gallery wrapper for the music island. The block page exposes the island
 * tone, so it stays here; bounce is fixed at the block's default (40) and the
 * spring maths lives inside the island.
 */
export default function Demo() {
  const [tone, setTone] = useState<Tone>("Black");

  return (
    <div className="mi-stage w-full max-w-[340px]">
      <div className="rounded-[28px] bg-[radial-gradient(120%_120%_at_50%_0%,#f8f9fa_0%,#eceef1_55%,#e2e5e9_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-4 dark:bg-[radial-gradient(120%_120%_at_50%_0%,#3f3f46_0%,#27272a_55%,#18181b_100%)] dark:shadow-none">
        <MusicIsland tone={tone} />

        <div className="mt-1 flex items-center justify-between gap-3 px-1">
          <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
            点击药丸展开播放器
          </p>
          <div
            role="group"
            aria-label="Island tone"
            className="flex shrink-0 rounded-lg border border-zinc-200/80 bg-white/80 p-0.5 dark:border-zinc-700/70 dark:bg-zinc-900/60"
          >
            {TONES.map((item) => {
              const active = item === tone;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTone(item)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
