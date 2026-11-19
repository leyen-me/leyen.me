"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import {
  applyShape,
  clamp,
  drawParticles,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  FRAME_MS,
  SHAPES,
  shockwave,
  stepParticles,
  type FieldOptions,
  type Grain,
  type Particle,
  type ParticleShape,
} from "./engine";

const REACH = 80;
const FORCE = 60;
const GRAIN: Grain = "Fine";

type Engine = {
  point: (x: number, y: number) => void;
  leave: () => void;
  press: (x: number, y: number) => void;
};

type FieldPoint = readonly [number, number];

/**
 * A 1:1 port of Bencho's "Particles" hover block.
 *
 * The canvas is always a 480 × 400 field; CSS only scales it. All state lives
 * in the particle array inside the effect: pointer movement writes a pointer
 * position and wakes the RAF loop, which stops again once the swarm settles.
 * Pressing sends a shockwave and then re-homes every dot on the next shape.
 *
 * Bencho's press sound is not ported, and the playground's grain switch is
 * fixed at the block default ("Fine"); the engine supports both sizes.
 */
export default function Demo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [announced, setAnnounced] = useState<ParticleShape>("Circle");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let particles: Particle[] = [];
    let shape: ParticleShape = "Circle";
    let pointer: FieldPoint | null = null;
    let frame = 0;
    let previous = 0;
    let disposed = false;

    const options: FieldOptions = { reach: REACH, force: FORCE, grain: GRAIN };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;

    const paint = () => {
      drawParticles(context, particles, options.grain, getComputedStyle(canvas).color);
    };

    const tick = (now: number) => {
      const dt = previous ? clamp((now - previous) / FRAME_MS, 0, 2.5) : 1;
      previous = now;

      const moving = stepParticles(particles, pointer, options, dt);
      paint();
      frame = moving && !disposed ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (frame) return;
      // Each new run starts with a full 60 Hz step, like Bencho's loop.
      previous = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const goToShape = (next: ParticleShape) => {
      shape = next;
      particles = applyShape(particles, next, reduced);
      setAnnounced(next);
      paint();
      start();
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(FIELD_WIDTH * dpr);
      canvas.height = Math.round(FIELD_HEIGHT * dpr);
      paint();
    };

    particles = applyShape(particles, shape, false);
    resize();

    engineRef.current = {
      point(x, y) {
        if (reduced) return;
        pointer = [x, y];
        start();
      },
      leave() {
        if (reduced) return;
        pointer = null;
        start();
      },
      press(x, y) {
        if (!reduced) shockwave(particles, x, y, options.force);
        const next = SHAPES[(SHAPES.indexOf(shape) + 1) % SHAPES.length];
        goToShape(next);
      },
    };

    // The gallery flips the theme via the root class; Bencho uses `data-theme`.
    const observer = new MutationObserver(paint);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    const onMotion = () => {
      reduced = motion.matches;
      if (reduced) pointer = null;
    };

    window.addEventListener("resize", resize);
    motion.addEventListener("change", onMotion);

    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", onMotion);
      engineRef.current = null;
    };
  }, []);

  function toField(clientX: number, clientY: number): FieldPoint {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return [0, 0];
    const scale = rect.width / FIELD_WIDTH;
    return [(clientX - rect.left) / scale, (clientY - rect.top) / scale];
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const [x, y] = toField(event.clientX, event.clientY);
    engineRef.current?.point(x, y);
  }

  function handlePress(clientX: number, clientY: number) {
    const [x, y] = toField(clientX, clientY);
    engineRef.current?.press(x, y);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (event.repeat) return;
    engineRef.current?.press(FIELD_WIDTH / 2, FIELD_HEIGHT / 2);
  }

  return (
    <div className="w-full max-w-[528px] select-none">
      <div className="rounded-[28px] bg-[#f1f2f2] p-6 dark:bg-[#171717]">
        <canvas
          ref={canvasRef}
          width={FIELD_WIDTH}
          height={FIELD_HEIGHT}
          tabIndex={0}
          role="button"
          aria-label="Particles. Move the pointer to scatter the dots; press to send a shockwave and change shape."
          className="block h-auto w-full touch-none cursor-crosshair rounded-[2px] text-[#17181a] outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f1f2f2] dark:text-white dark:focus-visible:ring-offset-[#171717]"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => engineRef.current?.leave()}
          onPointerCancel={() => engineRef.current?.leave()}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            handlePress(event.clientX, event.clientY);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announced} shape. Press to send a shockwave and move to the next shape.
      </p>
    </div>
  );
}
