"use client";

import DynamicIsland from "./island";

/**
 * Gallery shell for the dynamic island. The block is shown with its default
 * Timer activity, black tone and bounce of 40; the parameter controls are
 * intentionally omitted.
 */
export default function Demo() {
  return (
    <div className="dyn-stage w-full">
      <div className="mx-auto w-full max-w-[340px] p-3 sm:p-4">
        <DynamicIsland activity="Timer" bounce={40} tone="Black" />
      </div>
    </div>
  );
}
