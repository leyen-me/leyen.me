"use client";

/**
 * Dot Distortion Shader — ported from Aceternity UI's block of the same name.
 * Source: https://ui.aceternity.com/blocks/shaders/dot-distortion-shader
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the dot lattice with breathing brightness, random
 * glow pulses, pointer drag distortion with spring return, the sky-700 dots on
 * white/black, the eyebrow, headline, supporting copy, and both CTAs.
 * Changed for the gallery: the section fills the preview instead of `h-screen`,
 * the canvas is a plain React loop (no motion/react), and reduced motion paints
 * a single static frame.
 */

import { DotGrid } from "./DotGrid";

/** Tailwind sky-700, the original's default dot and glow colour. */
const SKY_700 = "#0369a1";

export default function Demo() {
  return (
    <section className="relative flex h-full min-h-[600px] w-full flex-col overflow-hidden bg-white dark:bg-black">
      <DotGrid
        breathingSpeed={1}
        className="absolute inset-0"
        distortionStrength={1.2}
        dotColor={SKY_700}
        dotGap={14}
        dotSize={1}
        enableMouseInteraction
        glowColor={SKY_700}
        mouseRadius={100}
        opacity={1}
        returnSpeed={0.06}
      />

      <div className="relative z-10 mx-auto flex h-full w-full flex-col items-start justify-center px-4">
        <div className="relative z-10 mx-auto flex h-full max-w-2xl flex-col items-start justify-center px-8">
          <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
            New components and templates every month
          </p>
          <h1 className="mb-6 text-5xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
            Build your next project in minutes, not hours.
          </h1>
          <p className="mb-8 text-xl text-neutral-600 dark:text-neutral-300">
            We are a team of developers who are passionate about creating web
            apps that make you feel like you&apos;re in the future.
          </p>
          <div className="flex flex-col gap-4 md:flex-row">
            <button
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus-visible:ring-offset-black"
              type="button"
            >
              Get started →
            </button>
            <button
              className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus-visible:ring-offset-black"
              type="button"
            >
              <span className="mr-2">G</span> Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
