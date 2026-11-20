"use client";

import type { ReactNode } from "react";
import { BlueprintMotion } from "./BlueprintMotion";
import { PrimitivesMorph } from "./PrimitivesMorph";

/**
 * Ported from coss.com/ui (MIT, © 2025 coss.com and Origin UI).
 * See ./LICENSE for the full license text.
 */
export function PrimitivesMotion({ children }: { children: ReactNode }) {
  return (
    <BlueprintMotion
      renderAnimation={(paused) => <PrimitivesMorph paused={paused} />}
    >
      {children}
    </BlueprintMotion>
  );
}
