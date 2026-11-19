"use client";

import { useState } from "react";
import Otp from "./otp";

type Answer = "Accept" | "Reject";

const SEGMENT =
  "inline-flex min-h-8 items-center justify-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-zinc-900";
const ACTIVE =
  "bg-white text-zinc-900 shadow-sm dark:bg-[#262626] dark:text-white";
const IDLE =
  "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white";

/**
 * Gallery shell for the OTP block. Bencho exposes length, answer and corner;
 * the two segmented controls make the 4/6 layout and the rejection path
 * reachable, while the block itself keeps its default 12 px corner.
 */
export default function Demo() {
  const [length, setLength] = useState<4 | 6>(4);
  const [answer, setAnswer] = useState<Answer>("Accept");

  return (
    <div className="flex w-full flex-col items-center">
      <Otp length={length} answer={answer} corner={12} />

      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <div
          role="group"
          aria-label="Code length"
          className="flex items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Digits
          </span>
          <div className="flex rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900">
            {([4, 6] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={length === value}
                onClick={() => setLength(value)}
                className={`${SEGMENT} ${length === value ? ACTIVE : IDLE}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div
          role="group"
          aria-label="Answer"
          className="flex items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Answer
          </span>
          <div className="flex rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900">
            {(["Accept", "Reject"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={answer === value}
                onClick={() => setAnswer(value)}
                className={`${SEGMENT} ${answer === value ? ACTIVE : IDLE}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
