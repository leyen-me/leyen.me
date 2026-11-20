"use client";

/**
 * Preview Slider — ported from Aceternity UI's interaction of the same name.
 * Source: https://ui.aceternity.com/interactions/preview-slider
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * The original ships as a Pro item; this port follows its published bundle
 * and the live preview. Kept: the four reasoning-effort levels and their
 * preview images, the spring-followed fill, the gooey SVG filter that fuses
 * the floating preview into the track, the velocity-derived tilt and
 * squash/stretch, the shiver filter at the last level, the nine ticks, the
 * masked label roll, and pointer capture plus arrow/Home/End keys.
 * Changed for the gallery: images are bundled locally, the preview sits in a
 * self-sized widget, motion/react is replaced by framer-motion, and reduced
 * motion removes every translation, scale and tilt while keeping opacity
 * fades. The 900 ms keyboard hint timer is cleaned up.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  DEFAULT_LEVEL,
  KEY_HINT_MS,
  LAST_LEVEL,
  LEVELS,
  LEVEL_COUNT,
  MAX_TILT,
  centerOf,
  clamp01,
  levelAt,
  overshootFor,
} from "./levels";
import { MotionDiv } from "./motion";
import {
  GooFilters,
  PreviewBubble,
  SliderLabel,
  Ticks,
} from "./slider-parts";
import usePrefersReducedMotion from "./use-reduced-motion";
import useShiver from "./use-shiver";

export default function Demo() {
  const reduced = usePrefersReducedMotion();
  const filterId = `preview-slider-goo-${useId().replace(/:/g, "")}`;
  const shiverId = `preview-slider-shiver-${useId().replace(/:/g, "")}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const keyTimer = useRef<number | undefined>(undefined);
  const widthRef = useRef(1);

  const [index, setIndex] = useState(DEFAULT_LEVEL);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const target = useMotionValue(centerOf(DEFAULT_LEVEL));
  const display = useSpring(
    target,
    reduced
      ? { duration: 0 }
      : { stiffness: 300, damping: 30, mass: 0.35 },
  );
  const displayPercent = useTransform(display, (value) => `${value * 100}%`);

  const velocity = useVelocity(display);
  const tilt = useSpring(
    useTransform(velocity, (value) =>
      reduced ? 0 : MAX_TILT * Math.tanh((-value * 24) / MAX_TILT),
    ),
    reduced ? { duration: 0 } : { stiffness: 300, damping: 10, mass: 0.35 },
  );

  /* Overshoot drives the preview's rubber band and the track squash. */
  const overshoot = useMotionValue(0);
  const stretchX = useTransform(
    overshoot,
    (value) => 1 + Math.abs(value) / widthRef.current,
  );
  const squashY = useTransform(overshoot, (value) =>
    1 - Math.min(0.18, Math.abs(value) / 120),
  );
  const originX = useTransform(overshoot, (value) => (value < 0 ? 0 : 1));
  const bubbleScale = useTransform(
    overshoot,
    (value) => 1 + (Math.abs(value) / 28) * 0.3,
  );

  const fillOpacity = useSpring(
    useTransform(display, (value) => (value >= LAST_LEVEL ? 1 : 0)),
    reduced ? { duration: 0 } : { stiffness: 260, damping: 30 },
  );

  const shiver = useShiver({
    enabled: dragging || hovering,
    reduced,
    shiverId,
    target,
    overshoot,
  });

  useMotionValueEvent(display, "change", (value) => {
    const next = levelAt(value);
    setIndex((current) => (current === next ? current : next));
  });

  useEffect(() => {
    LEVELS.forEach(({ image }) => {
      const preload = new window.Image();
      preload.src = image.src;
      preload.decode?.().catch(() => {});
    });
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(keyTimer.current);
    },
    [],
  );

  /** Maps a client x to the track, following the pointer 1:1 outside it. */
  const setFromClientX = useCallback(
    (clientX: number) => {
      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const width = root.offsetWidth || rect.width;
      if (rect.width <= 0) return;

      const x = ((clientX - rect.left) * width) / rect.width;
      widthRef.current = width;
      target.set(clamp01(x / width));

      /* Outside the track the tray stretches like taffy; distance is capped
         by the spring-like falloff, never by the pointer's raw distance. */
      const outside = x < 0 ? x : x > width ? x - width : 0;
      overshoot.set(
        reduced ? 0 : Math.sign(outside) * overshootFor(Math.abs(outside)),
      );
    },
    [overshoot, reduced, target],
  );

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;

    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Capture is an enhancement; dragging still works without it. */
    }
    event.currentTarget.focus({ preventScroll: true });
    /* Pointer focus is not keyboard focus: suppress the ring until the
       visitor actually navigates by keyboard. */
    setFocusVisible(false);
    setDragging(true);
    setFromClientX(event.clientX);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragging) setFromClientX(event.clientX);
  }

  const endDrag = useCallback(() => {
    setDragging(false);
    if (reduced) {
      overshoot.set(0);
      return;
    }
    animate(overshoot, 0, { type: "spring", stiffness: 500, damping: 22 });
  }, [overshoot, reduced]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const next =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? index - 1
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? index + 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? LEVEL_COUNT - 1
              : null;
    if (next === null) return;

    event.preventDefault();
    const bounded = Math.min(LEVEL_COUNT - 1, Math.max(0, next));
    target.set(centerOf(bounded));
    setKeyboard(true);
    window.clearTimeout(keyTimer.current);
    keyTimer.current = window.setTimeout(() => setKeyboard(false), KEY_HINT_MS);
  }

  const bubbleVisible = hovering || dragging || keyboard;
  const thumbActive = hovering || dragging || focusVisible;

  return (
    <div className="flex w-full justify-center px-6 pb-10 pt-28">
      <div className="w-full max-w-sm">
        <div
          ref={rootRef}
          role="slider"
          tabIndex={0}
          aria-label="Reasoning effort"
          aria-valuemin={0}
          aria-valuemax={LEVEL_COUNT - 1}
          aria-valuenow={index}
          aria-valuetext={LEVELS[index]?.label}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={(event) =>
            setFocusVisible(event.currentTarget.matches(":focus-visible"))
          }
          onBlur={() => setFocusVisible(false)}
          className="relative h-8 w-full cursor-grab touch-none select-none outline-none active:cursor-grabbing [--ps-ring:rgb(0_0_0/0.1)] [--ps-shadow:drop-shadow(0_1px_3px_rgb(0_0_0/0.1))_drop-shadow(0_1px_1px_rgb(0_0_0/0.1))] dark:[--ps-ring:transparent] dark:[--ps-shadow:drop-shadow(0_1px_1px_rgb(0_0_0/0.1))_drop-shadow(0_6px_12px_rgb(0_0_0/0.08))] [-webkit-tap-highlight-color:transparent]"
        >
          <GooFilters
            gooId={filterId}
            shiverId={shiverId}
            turbulenceRef={shiver.turbulenceRef}
            displacementRef={shiver.displacementRef}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0"
            style={{
              top: -124,
              left: -24,
              right: -24,
              filter: `url(#${filterId}) var(--ps-shadow)`,
            }}
          >
            <PreviewBubble
              visible={bubbleVisible}
              index={index}
              reduced={reduced}
              left={displayPercent}
              tilt={tilt}
              scale={bubbleScale}
              overshoot={overshoot}
            />

            <MotionDiv
              ref={shiver.trayRef}
              className="absolute bottom-0 h-8 overflow-hidden rounded-md bg-surface-1"
              style={{
                left: 24,
                right: 24,
                scaleX: stretchX,
                scaleY: squashY,
                originX,
              }}
            >
              <MotionDiv
                className="absolute inset-y-0 left-0 overflow-hidden rounded-l-md"
                style={{ width: displayPercent }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-300 to-neutral-200 dark:from-neutral-600 dark:to-neutral-700" />
                <MotionDiv
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-400 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)] dark:to-sky-500 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
                  style={{ opacity: fillOpacity }}
                />
              </MotionDiv>
              <Ticks reduced={reduced} />
            </MotionDiv>
          </div>

          <SliderLabel index={index} reduced={reduced} />

          <MotionDiv
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ x: overshoot }}
          >
            <MotionDiv
              className={`absolute top-1/2 z-10 h-5 w-3 rounded-sm bg-white shadow-md ring-1 ring-black/15 dark:bg-neutral-300 dark:ring-black/40 ${
                focusVisible
                  ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-blue-400 dark:ring-offset-neutral-900"
                  : ""
              }`}
              style={{ left: displayPercent, x: "-50%", y: "-50%" }}
              initial={false}
              animate={{ scale: thumbActive && !reduced ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
