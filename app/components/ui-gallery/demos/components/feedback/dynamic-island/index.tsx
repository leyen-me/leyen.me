"use client";

import { useId, useState } from "react";
import DynamicIsland, {
  ACTIVITIES,
  type Activity,
  type Tone,
} from "./island";

const TONES: Tone[] = ["Black", "White"];

/**
 * The gallery wrapper: Bencho's island plus the three knobs its block page
 * exposes (activity, island tone, bounce). The island owns its own open state
 * and clock so pressing the pill is the only way to expand it, exactly like
 * the source.
 */
export default function Demo() {
  const [activity, setActivity] = useState<Activity>("Timer");
  const [tone, setTone] = useState<Tone>("Black");
  const [bounce, setBounce] = useState(40);
  const bounceId = useId();

  return (
    <div className="dyn-stage w-full">
      <div className="mx-auto w-full max-w-[340px] rounded-[28px] bg-[radial-gradient(120%_120%_at_50%_0%,#f8f9fa_0%,#eceef1_55%,#e2e5e9_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-4 dark:bg-[radial-gradient(120%_120%_at_50%_0%,#3f3f46_0%,#27272a_55%,#18181b_100%)] dark:shadow-none">
        <DynamicIsland activity={activity} bounce={bounce} tone={tone} />

        <div className="mt-3 space-y-3">
          <div
            role="group"
            aria-label="Activity"
            className="grid grid-cols-4 gap-1 rounded-xl border border-zinc-200/80 bg-white/80 p-1 dark:border-zinc-700/70 dark:bg-zinc-900/60"
          >
            {ACTIVITIES.map((item) => {
              const active = item === activity;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActivity(item)}
                  className={`rounded-lg px-1 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Island tone"
              className="flex rounded-lg border border-zinc-200/80 bg-white/80 p-0.5 dark:border-zinc-700/70 dark:bg-zinc-900/60"
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

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <label
                htmlFor={bounceId}
                className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
              >
                Bounce
              </label>
              <input
                id={bounceId}
                type="range"
                min={0}
                max={100}
                step={5}
                value={bounce}
                onChange={(event) => setBounce(Number(event.target.value))}
                className="h-4 min-w-0 flex-1 cursor-pointer accent-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:accent-zinc-100 dark:focus-visible:ring-offset-zinc-900"
              />
              <span className="w-6 text-right text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                {bounce}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
