"use client";

/**
 * Dot Distortion Shader — canvas dot field, ported from Aceternity UI.
 * Source: https://ui.aceternity.com/blocks/shaders/dot-distortion-shader
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the 14px dot lattice, per-dot brightness noise,
 * breathing, the random glow pulses, drag-style pointer distortion with
 * spring return, and the sky-700 dots on white/black.
 * Changed for the gallery: plain React canvas loop instead of motion/react,
 * `prefers-reduced-motion` paints one static frame, and the loop pauses while
 * the tab is hidden. The dot field is drawn at device pixel ratio for crisp
 * 1px dots.
 */

import { useEffect, useRef } from "react";

type Dot = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  brightness: number;
  phase: number;
  breathingSpeed: number;
  glowIntensity: number;
  glowTarget: number;
  glowSpeed: number;
  nextGlowTime: number;
};

export type DotGridProps = {
  /** Distance between dot centres in CSS px. */
  dotGap: number;
  /** Dot radius in CSS px. */
  dotSize: number;
  dotColor: string;
  glowColor: string;
  /** Pointer influence radius in CSS px. */
  mouseRadius: number;
  /** How hard a fast pointer drags nearby dots. */
  distortionStrength: number;
  /** Spring rate back to the resting lattice. */
  returnSpeed: number;
  breathingSpeed: number;
  opacity: number;
  enableMouseInteraction: boolean;
  className?: string;
};

/** Deterministic-looking but random brightness so the field never tiles. */
function createDots(width: number, height: number, gap: number): Dot[] {
  const dots: Dot[] = [];
  const cols = Math.ceil(width / gap) + 2;
  const rows = Math.ceil(height / gap) + 2;
  const offsetX = (width % gap) / 2;
  const offsetY = (height % gap) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * gap + offsetX;
      const y = j * gap + offsetY;
      const noise =
        Math.sin(i * 0.3 + j * 0.2) * 0.3 +
        Math.sin(i * 0.7 - j * 0.5) * 0.2 +
        Math.sin((i + j) * 0.4) * 0.2 +
        Math.random() * 0.3;

      dots.push({
        baseX: x,
        baseY: y,
        x,
        y,
        vx: 0,
        vy: 0,
        brightness: Math.max(0.1, Math.min(1, 0.3 + noise)),
        phase: Math.random() * Math.PI * 2,
        breathingSpeed: 0.5 + Math.random() * 0.5,
        glowIntensity: 0,
        glowTarget: 0,
        glowSpeed: 0.002 + Math.random() * 0.003,
        nextGlowTime: Math.random() * 3,
      });
    }
  }

  return dots;
}

export function DotGrid({
  dotGap,
  dotSize,
  dotColor,
  glowColor,
  mouseRadius,
  distortionStrength,
  returnSpeed,
  breathingSpeed,
  opacity,
  enableMouseInteraction,
  className,
}: DotGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pointer = { x: -1000, y: -1000 };
    const pointerVelocity = { x: 0, y: 0 };

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;

    const resetDots = () => {
      for (const dot of dots) {
        dot.x = dot.baseX;
        dot.y = dot.baseY;
        dot.vx = 0;
        dot.vy = 0;
        dot.glowIntensity = 0;
        dot.glowTarget = 0;
        dot.nextGlowTime = Math.random() * 2;
      }
      pointer.x = -1000;
      pointer.y = -1000;
      pointerVelocity.x = 0;
      pointerVelocity.y = 0;
    };

    const draw = (now: number, animate: boolean) => {
      const delta = animate && lastTime ? Math.min((now - lastTime) / 16.667, 1.5) : 0;
      if (animate) lastTime = now;

      context.clearRect(0, 0, width, height);
      context.globalAlpha = opacity;

      const time = now * 0.001 * breathingSpeed;
      const glowTime = now * 0.001;
      const pointerSpeed = Math.hypot(pointerVelocity.x, pointerVelocity.y);

      for (const dot of dots) {
        if (animate) {
          if (glowTime >= dot.nextGlowTime) {
            if (dot.glowTarget === 0) {
              dot.glowTarget = 0.6 + Math.random() * 0.4;
              dot.glowSpeed = 0.001 + Math.random() * 0.002;
            } else {
              dot.glowTarget = 0;
              dot.glowSpeed = 0.0005 + Math.random() * 0.001;
              dot.nextGlowTime = glowTime + 1 + Math.random() * 3;
            }
          }

          const glowDelta = dot.glowTarget - dot.glowIntensity;
          dot.glowIntensity += glowDelta * dot.glowSpeed * delta * 60;
          if (dot.glowTarget > 0 && Math.abs(glowDelta) < 0.05) {
            dot.nextGlowTime = glowTime + 2 + Math.random() * 3;
          }

          const dx = pointer.x - dot.baseX;
          const dy = pointer.y - dot.baseY;
          const distance = Math.hypot(dx, dy);
          if (distance < mouseRadius && enableMouseInteraction && pointerSpeed > 0.5) {
            const falloff = 1 - distance / mouseRadius;
            const force = falloff * falloff * distortionStrength;
            dot.vx += pointerVelocity.x * force * 0.3;
            dot.vy += pointerVelocity.y * force * 0.3;
          }

          dot.x += dot.vx * delta;
          dot.y += dot.vy * delta;
          dot.x += (dot.baseX - dot.x) * returnSpeed * delta;
          dot.y += (dot.baseY - dot.y) * returnSpeed * delta;

          dot.vx *= 0.92;
          dot.vy *= 0.92;
          dot.vx += (dot.baseX - dot.x) * 0.02 * delta;
          dot.vy += (dot.baseY - dot.y) * 0.02 * delta;
        }

        const breathing = Math.sin(time * dot.breathingSpeed + dot.phase) * 0.15;
        const localBrightness = Math.max(0.05, Math.min(1, dot.brightness + breathing));
        const displacement = Math.hypot(dot.x - dot.baseX, dot.y - dot.baseY);
        const displacementBoost = Math.min(0.5, displacement * 0.05);
        const glowBoost = dot.glowIntensity * 0.7;
        const alpha = Math.min(1, localBrightness + displacementBoost + glowBoost);
        const glowing = dot.glowIntensity > 0.1;

        if (alpha > 0.4 || glowing) {
          const glowStrength = Math.max((alpha - 0.4) / 0.6, dot.glowIntensity);
          context.shadowColor = glowColor;
          context.shadowBlur = 10 + 20 * glowStrength;
        } else {
          context.shadowColor = "transparent";
          context.shadowBlur = 0;
        }

        context.globalAlpha = alpha * opacity;
        context.fillStyle = dotColor;
        context.beginPath();
        context.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        context.fill();
      }

      if (animate) {
        pointerVelocity.x *= 0.9;
        pointerVelocity.y *= 0.9;
      }
    };

    const tick = (now: number) => {
      if (document.hidden) {
        // Do not simulate elapsed hidden time: restart from the current state.
        lastTime = 0;
        frame = window.requestAnimationFrame(tick);
        return;
      }
      draw(now, true);
      frame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };

    const start = () => {
      if (frame !== 0 || motionQuery.matches) return;
      lastTime = 0;
      frame = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = createDots(width, height, dotGap);

      stop();
      if (motionQuery.matches) {
        draw(0, false);
      } else {
        start();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      if (!inside) {
        pointer.x = -1000;
        pointer.y = -1000;
        pointerVelocity.x = 0;
        pointerVelocity.y = 0;
        return;
      }

      if (pointer.x < -500) {
        pointerVelocity.x = 0;
        pointerVelocity.y = 0;
      } else {
        pointerVelocity.x = x - pointer.x;
        pointerVelocity.y = y - pointer.y;
      }
      pointer.x = x;
      pointer.y = y;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        resetDots();
        start();
      }
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        stop();
        resetDots();
        draw(0, false);
      } else {
        start();
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionChange);
    resize();

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [
    breathingSpeed,
    distortionStrength,
    dotColor,
    dotGap,
    dotSize,
    enableMouseInteraction,
    glowColor,
    mouseRadius,
    opacity,
    returnSpeed,
  ]);

  return (
    <div ref={containerRef} aria-hidden="true" className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
