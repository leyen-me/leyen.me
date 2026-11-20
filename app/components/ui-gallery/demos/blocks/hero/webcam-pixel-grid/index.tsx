"use client";

/**
 * Webcam Pixel Grid — hero block ported from Aceternity UI.
 * Source: https://ui.aceternity.com/components/webcam-pixel-grid
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the badge, headline, supporting copy, both CTAs, the
 * dark gradient overlay and the pixel-grid background.
 * Changed for the gallery: the section fills the preview instead of `h-screen`,
 * the camera error is an inline empty state (retry remounts the stream) instead
 * of a floating toast, and the copy scales for a 390px viewport.
 */

import { ArrowRight, CameraOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { WebcamPixelGrid, type WebcamStatus } from "./WebcamPixelGrid";

export default function Demo() {
  const [status, setStatus] = useState<WebcamStatus>("requesting");
  // Remounting the grid re-runs the permission request and guarantees the old
  // stream is stopped before a retry starts.
  const [attempt, setAttempt] = useState(0);

  return (
    <section
      aria-label="Webcam pixel grid hero"
      className="relative flex h-full min-h-[600px] w-full flex-col overflow-hidden bg-[#030303]"
    >
      <div className="absolute inset-0">
        <WebcamPixelGrid
          key={attempt}
          className="h-full w-full"
          onStatusChange={setStatus}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-5 py-14 text-center sm:px-8">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm sm:text-sm">
            Introducing AI SaaS Template →
          </div>

          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-white sm:mb-6 sm:text-6xl md:text-8xl">
            Ship stunning landing pages faster.
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-pretty text-base text-white/60 sm:mb-10 sm:text-xl">
            Build amazing landing pages with component blocks and templates from
            aceternity, without having to worry about styling and animations.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-medium text-black transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:hover:scale-100"
              type="button"
            >
              Get Started
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </button>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              type="button"
            >
              View Documentation
            </button>
          </div>

          {status === "requesting" ? (
            <p
              className="mt-6 inline-flex items-center gap-2 text-xs text-white/40"
              role="status"
            >
              <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
              Requesting camera access…
            </p>
          ) : null}

          {status === "denied" ? (
            <div
              className="mx-auto mt-6 flex max-w-md flex-col items-start gap-3 rounded-item border border-white/10 bg-black/55 p-4 text-left backdrop-blur-md sm:flex-row sm:items-center"
              role="status"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                <CameraOff aria-hidden="true" className="h-5 w-5 text-white/60" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/90">
                  Camera access is blocked
                </p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  Allow camera access for this site to see your feed as a pixel
                  grid. Frames never leave this browser.
                </p>
              </div>
              <button
                className="inline-flex h-8 flex-shrink-0 items-center justify-center rounded-control bg-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                onClick={() => {
                  setStatus("requesting");
                  setAttempt((value) => value + 1);
                }}
                type="button"
              >
                Enable camera
              </button>
            </div>
          ) : null}

          {status === "unsupported" ? (
            <div
              className="mx-auto mt-6 flex max-w-md items-start gap-3 rounded-item border border-white/10 bg-black/55 p-4 text-left backdrop-blur-md"
              role="status"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                <CameraOff aria-hidden="true" className="h-5 w-5 text-white/60" />
              </span>
              <div>
                <p className="text-sm font-medium text-white/90">
                  Camera not available
                </p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  This browser does not expose a camera stream, so the grid
                  stays flat. Open the block on a device with a camera to see it
                  react.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
