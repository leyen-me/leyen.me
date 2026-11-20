import type { ReactNode } from "react";

/**
 * Ported from coss.com/ui (MIT, © 2025 coss.com and Origin UI).
 * See ./LICENSE for the full license text.
 */
export function DrawingSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full overflow-visible font-mono text-zinc-900 [font-optical-sizing:auto] [font-synthesis:none] dark:text-zinc-100"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeOpacity="0.8"
      strokeWidth="1"
      viewBox="0 0 560 440"
    >
      {children}
    </svg>
  );
}
