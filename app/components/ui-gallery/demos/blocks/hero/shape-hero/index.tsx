"use client";

/**
 * Shape Hero — 药丸刚体堆，移植自 KokonutUI（v2，现行文档版本）。
 * 来源：https://kokonutui.com/docs/backgrounds/shape-hero
 * 源码：https://github.com/kokonut-labs/kokonutui
 * 许可：MIT · © 2025 kokonutUI
 *
 * 保留的：120Hz 固定步长的小型刚体求解器、顺序冲量 + 摩擦、整堆休眠、
 * 指针抓取与抛掷，以及 reduced-motion 下直接结算成静止堆。
 * 相对原作的调整：去掉标题、副标题与按钮，只保留可交互的形状层；
 * `size-*` 等 Tailwind v4 工具类换成 v3 等价写法。
 */

import { useEffect, useRef } from "react";

import {
  createBodies,
  hitTest,
  render,
  step,
  STEP,
  type Point,
  type World,
} from "./physics";
import { cn, FILL, SHAPES } from "./shapes";

export default function Demo() {
  const rootRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // 形状清单与填充比例是常量：效果每次访问都以相同的顺序落下。
  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    if (!(root && layer)) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const elements = [...layer.querySelectorAll<HTMLElement>("[data-shape]")];
    const world: World = {
      bodies: [],
      width: layer.clientWidth,
      height: layer.clientHeight,
      drag: null,
      still: 0,
    };
    let raf = 0;
    let last = 0;
    let carry = 0;
    let started = false;
    let visible = false;
    let cancelled = false;

    const loop = (now: number) => {
      raf = 0;
      carry += Math.min((now - last) / 1000, 0.05);
      last = now;
      let asleep = false;
      while (carry >= STEP) {
        asleep = step(world);
        carry -= STEP;
      }
      render(world.bodies);
      if (!asleep && visible) {
        raf = requestAnimationFrame(loop);
      }
    };
    const wake = () => {
      world.still = 0;
      if (!raf && started && visible) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const begin = () => {
      if (started || cancelled) {
        return;
      }
      started = true;
      world.bodies = createBodies(elements, world.width, world.height, FILL);
      if (reduceMotion) {
        // Settle the pile up front and show it at rest.
        let steps = 0;
        while (steps < 2400 && !step(world)) {
          steps++;
        }
        render(world.bodies);
        return;
      }
      render(world.bodies);
      wake();
    };

    // A tab coming back must not wake a background that's scrolled away.
    let onScreen = true;
    const intersection = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        visible = onScreen && !document.hidden;
        if (visible) {
          // Wait for fonts, so each shape is measured at its final width.
          document.fonts.ready.then(begin);
          wake();
        }
      },
      { threshold: 0.3 }
    );
    intersection.observe(root);
    const onVisibility = () => {
      visible = onScreen && !document.hidden;
      wake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const resizeObserver = new ResizeObserver(() => {
      world.width = layer.clientWidth;
      world.height = layer.clientHeight;
      wake();
    });
    resizeObserver.observe(layer);

    const local = (event: PointerEvent): Point => {
      const rect = layer.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };
    const onDown = (event: PointerEvent) => {
      if (!started || world.drag || event.button !== 0) {
        return;
      }
      const [x, y] = local(event);
      const body = hitTest(world.bodies, x, y);
      if (!body) {
        return;
      }
      event.preventDefault();
      const dx = x - body.x;
      const dy = y - body.y;
      const cos = Math.cos(-body.a);
      const sin = Math.sin(-body.a);
      world.drag = {
        body,
        lx: dx * cos - dy * sin,
        ly: dx * sin + dy * cos,
        tx: x,
        ty: y,
        id: event.pointerId,
      };
      layer.setPointerCapture(event.pointerId);
      layer.dataset.dragging = "";
      // Tailwind 3.3 不支持命名 group 的 data 变体，拖拽光标直接写内联样式。
      layer.style.cursor = "grabbing";
      wake();
    };
    const onMove = (event: PointerEvent) => {
      if (world.drag?.id === event.pointerId) {
        [world.drag.tx, world.drag.ty] = local(event);
        wake();
      }
    };
    const onUp = (event: PointerEvent) => {
      if (world.drag?.id === event.pointerId) {
        world.drag = null;
        delete layer.dataset.dragging;
        layer.style.removeProperty("cursor");
        wake();
      }
    };
    layer.addEventListener("pointerdown", onDown);
    layer.addEventListener("pointermove", onMove);
    layer.addEventListener("pointerup", onUp);
    layer.addEventListener("pointercancel", onUp);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      layer.removeEventListener("pointerdown", onDown);
      layer.removeEventListener("pointermove", onMove);
      layer.removeEventListener("pointerup", onUp);
      layer.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <section
      className="relative h-full min-h-[600px] w-full overflow-hidden bg-white dark:bg-zinc-950"
      ref={rootRef}
    >
      <div
        aria-hidden="true"
        className="group/shapes absolute inset-0 touch-pan-y"
        ref={layerRef}
      >
        {SHAPES.map((shape) => (
          <div
            className={cn(
              "absolute left-0 top-0 flex cursor-grab touch-none select-none items-center justify-center whitespace-nowrap rounded-full will-change-transform",
              shape.className
            )}
            data-shape=""
            key={shape.id}
            style={{ visibility: "hidden" }}
          >
            {shape.content}
          </div>
        ))}
      </div>
    </section>
  );
}
