"use client";

/**
 * Following Pointer — ported from Aceternity UI's component of the same name.
 * Source: https://ui.aceternity.com/components/following-pointer
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the blog card copy, thumbnail, author chip, the
 * arrow cursor with the coloured name pill, and the card hover treatment.
 * Changed for the gallery: the demo is a full-height block, following is
 * disabled on coarse pointers and under reduced motion (the cursor stays
 * visible), the accent colour is picked once per hover, and the card rect is
 * read on every move so scrolling and resizing stay in sync. Motion is a
 * transform written in a rAF, not a per-move React render.
 */

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import avatar from "./avatar.png";
import thumbnail from "./thumbnail.png";

/** Accent colours from the original; one is picked when the pointer enters. */
const ACCENTS = [
  "#0ea5e9",
  "#737373",
  "#14b8a6",
  "#22c55e",
  "#3b82f6",
  "#ef4444",
  "#eab308",
];

const article = {
  author: "Manu Arora",
  date: "28th March, 2023",
  title: "Amazing Tailwindcss Grid Layout Examples",
  description:
    "Grids are cool, but Tailwindcss grids are cooler. In this article, we will learn how to create amazing Grid layouts with Tailwindcs grid and React.",
};

export default function Demo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const [canFollow, setCanFollow] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const [accent, setAccent] = useState(ACCENTS[0]);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCanFollow(finePointer.matches && !reducedMotion.matches);
    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!canFollow) setIsInside(false);
  }, [canFollow]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const paint = useCallback(() => {
    frameRef.current = null;
    const follower = followerRef.current;
    if (!follower) return;
    const { x, y } = positionRef.current;
    follower.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const moveTo = useCallback(
    (event: PointerEvent<HTMLDivElement>, immediate = false) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      positionRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      if (immediate) {
        paint();
      } else if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(paint);
      }
    },
    [paint],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (canFollow) moveTo(event);
    },
    [canFollow, moveTo],
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!canFollow) return;
      setAccent(ACCENTS[Math.floor(Math.random() * ACCENTS.length)]);
      setIsInside(true);
      moveTo(event, true);
    },
    [canFollow, moveTo],
  );

  return (
    <section className="flex h-full min-h-[600px] w-full items-center justify-center overflow-hidden bg-neutral-100 px-6 py-16 dark:bg-neutral-900">
      <div
        ref={containerRef}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setIsInside(false)}
        className={`relative w-80 max-w-full ${canFollow ? "cursor-none" : ""}`}
      >
        <div
          ref={followerRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-50"
        >
          <div
            className={`origin-top-left transition-[transform,opacity] duration-150 ease-out ${
              isInside ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <svg
              className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] fill-sky-500 stroke-sky-600"
              fill="currentColor"
              height="1em"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 16 16"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
            </svg>
            <div
              className="flex min-w-max items-center gap-2 whitespace-nowrap rounded-full px-2 py-2 text-xs text-white"
              style={{ backgroundColor: accent }}
            >
              <Image
                alt=""
                className="h-5 w-5 rounded-full border-2 border-white object-cover"
                height={20}
                src={avatar}
                width={20}
              />
              <p className="pr-1">{article.author}</p>
            </div>
          </div>
        </div>

        <article className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-surface-0 transition-shadow duration-200 hover:shadow-xl dark:border-zinc-800">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-tl-lg rounded-tr-lg bg-surface-2">
            <Image
              alt="Abstract grid thumbnail"
              className="h-full w-full object-cover transition duration-200 group-hover:scale-95 group-hover:rounded-2xl motion-reduce:group-hover:scale-100"
              fill
              priority
              sizes="320px"
              src={thumbnail}
            />
          </div>
          <div className="p-4">
            <h2 className="my-4 text-lg font-bold text-zinc-800 dark:text-zinc-100">
              {article.title}
            </h2>
            <p className="my-4 text-sm font-normal leading-5 text-zinc-500 dark:text-zinc-400">
              {article.description}
            </p>
            <div className="mt-10 flex flex-row items-center justify-between gap-4">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {article.date}
              </span>
              <button
                type="button"
                className="relative z-10 block rounded-xl bg-black px-6 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Read More
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
