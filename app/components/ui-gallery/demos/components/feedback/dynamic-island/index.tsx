"use client";

import DynamicIsland from "./island";

/**
 * Gallery shell for the dynamic island. The block is shown with its default
 * Timer activity, black tone and bounce of 40; the parameter controls are
 * intentionally omitted.
 */
export default function Demo() {
  return (
    <div className="dyn-stage flex w-full justify-center">
      <div className="mx-auto w-full max-w-[340px] py-3 sm:py-4">
        <DynamicIsland activity="Timer" bounce={40} tone="Black" />
      </div>
    </div>
  );
}
