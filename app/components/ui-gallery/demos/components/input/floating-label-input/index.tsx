"use client";

import { useId, useState } from "react";

export default function Demo() {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;

  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <input
          id={inputId}
          type="email"
          value={value}
          autoComplete="email"
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="peer w-full rounded-xl border border-zinc-300 bg-surface-0 px-4 pb-2.5 pt-6 text-sm text-zinc-900 outline-none transition-colors duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:text-white dark:focus:border-emerald-500"
        />
        <label
          htmlFor={inputId}
          className={`pointer-events-none absolute left-4 origin-left text-zinc-500 transition-all duration-200 dark:text-zinc-400 ${
            floating
              ? "top-2 text-[11px] font-medium uppercase tracking-wide text-emerald-500 dark:text-emerald-400"
              : "top-1/2 -translate-y-1/2 text-sm"
          }`}
        >
          Email address
        </label>
      </div>
      <p className="mt-2 min-h-[1.25rem] text-xs text-zinc-500 dark:text-zinc-400">
        {value.includes("@") ? "看起来是个合法邮箱 ✓" : "我们会发送一封确认邮件。"}
      </p>
    </div>
  );
}
