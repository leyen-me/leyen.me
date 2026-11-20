"use client";

/**
 * GitHub Globe — ported from Aceternity UI's block of the same name.
 * Source: https://ui.aceternity.com/components/github-globe
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the "We sell soap worldwide" heading and its
 * supporting line, the 42 sample arcs, the globe/arc/point palette, the
 * centred layout with a bottom fade, and the globe's auto-rotation plus drag
 * interaction.
 * Changed for the gallery: the WebGL scene lives in a sibling client module
 * loaded without SSR, the section fills the ?fill=1 iframe instead of using
 * h-screen, the canvas is square and container-sized so mobile never crops the
 * globe horizontally, and reduced motion disables auto-rotation, dash
 * animation and rings. The country GeoJSON is vendored under `.data/` so the
 * demo makes no network requests and the 187 KB dataset stays out of the
 * source panel.
 */

import dynamic from "next/dynamic";

const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-full w-full" />,
});

export default function Demo() {
  return (
    <section className="relative flex h-full min-h-[600px] w-full flex-col overflow-hidden bg-white dark:bg-black">
      <div className="relative z-20 mx-auto max-w-3xl px-6 pt-10 text-center sm:pt-16">
        <h2 className="text-xl font-bold text-black dark:text-white md:text-4xl">
          We sell soap worldwide
        </h2>
        <p className="mx-auto mt-2 max-w-md text-base font-normal text-neutral-700 dark:text-neutral-200 md:text-lg">
          This globe is interactive and customizable. Have fun with it, and
          don&apos;t forget to share it. :)
        </p>
      </div>

      <div className="relative z-10 flex w-full flex-1 items-center justify-center sm:items-start">
        <div
          aria-label="Interactive 3D globe with animated connection arcs"
          className="relative aspect-square w-full max-w-[720px]"
          role="img"
        >
          <GlobeCanvas />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-b from-transparent to-white dark:to-black"
      />
    </section>
  );
}
