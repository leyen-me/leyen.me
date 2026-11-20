"use client";

import Lanyard from "./Lanyard";

export default function Demo() {
  return (
    <section className="relative h-full min-h-[600px] w-full overflow-hidden bg-surface-0">
      <Lanyard className="absolute inset-0" />
    </section>
  );
}
