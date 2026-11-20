"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

const SIZE = 240;
const SCALE = 48;
const ABERRATION = 14;
const FROST = 0.4;
/** 位移强度在镜片边缘处的峰值。 */
const RIM_STRENGTH = 0.8;
/** 位移随径向距离衰减的特征长度（相对直径），越大 bevel 越宽。 */
const RIM_FALLOFF = 0.025;

/** 拖动时镜片放大的倍数。 */
const DRAG_SCALE = 1.07;
/** 跟手弹簧角频率（rad/s）：越大越贴近指针，42 约等于 48ms 的视觉延迟。 */
const FOLLOW_OMEGA = 42;
/** 松手后的弹簧角频率：越低滑行越远，13 约在 380ms 内收敛。 */
const SETTLE_OMEGA = 13;
/** 减少动态效果时的松手角频率：快速停住，不产生滑行。 */
const REDUCED_OMEGA = 34;
/** 缩放插值时间常数（秒），约 180ms 达到目标值的 96%。 */
const SCALE_TIME_CONSTANT = 0.055;
/** 松手时额外继承的指针速度比例，放大“甩出”手感。 */
const INERTIA_RATIO = 0.35;
/** 松手继承速度的上限（px/s），避免极端滑动导致飞出。 */
const MAX_RELEASE_SPEED = 1200;
/** 物理积分的最大步长，保证高刷新率或掉帧时依然稳定。 */
const MAX_SUBSTEP = 1 / 120;
/** 速度采样窗口（毫秒）与样本上限。 */
const SAMPLE_WINDOW = 110;
const MAX_SAMPLES = 6;
/** 判定静止的阈值。 */
const SETTLE_DISTANCE = 0.05;
const SETTLE_SPEED = 2;
const SETTLE_SCALE = 0.0005;

type Vec = { x: number; y: number };
type Sample = { x: number; y: number; t: number };
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  samples: Sample[];
};

/**
 * Builds the displacement map the SVG filter samples: each pixel stores the
 * inward normal (R = x, G = y) scaled by an edge-concentrated falloff, so the
 * rim bends the backdrop inwards like a lens instead of bulging outwards.
 */
function buildDisplacementMap(size: number): string | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(size, size);
  const center = size / 2;
  const falloff = size * RIM_FALLOFF;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - center;
      const dy = y + 0.5 - center;
      const distance = Math.hypot(dx, dy);
      const fromEdge = Math.max(0, center - distance);
      const amount = RIM_STRENGTH * Math.exp(-fromEdge / falloff);
      const nx = distance > 0 ? -dx / distance : 0;
      const ny = distance > 0 ? -dy / distance : 0;
      const offset = (y * size + x) * 4;
      image.data[offset] = 128 + nx * amount * 127;
      image.data[offset + 1] = 128 + ny * amount * 127;
      image.data[offset + 2] = 128;
      image.data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function clampToLimit(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

/**
 * 位置与缩放都写在 transform 上，不触发布局。直接操作 style 以避免每帧
 * 触发 React 渲染。
 */
function writeTransform(
  element: HTMLDivElement,
  x: number,
  y: number,
  scale: number
): void {
  element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(
    2
  )}px, 0) scale(${scale.toFixed(4)})`;
}

export function LiquidGlassLens() {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `liquid-glass-${rawId}`;
  const [map, setMap] = useState<string | null>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  const position = useRef<Vec>({ x: 0, y: 0 });
  const target = useRef<Vec>({ x: 0, y: 0 });
  const velocity = useRef<Vec>({ x: 0, y: 0 });
  const scale = useRef(1);
  const scaleTarget = useRef(1);
  const bounds = useRef<Vec>({
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
  });
  const drag = useRef<DragState | null>(null);
  const dragging = useRef(false);
  const reducedMotion = useRef(false);
  const frame = useRef<number | null>(null);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    setMap(buildDisplacementMap(SIZE));
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotion.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    },
    []
  );

  /** 读取 section 尺寸并以此约束位置，同时把越界的当前值拉回边界。 */
  const measure = useCallback(() => {
    const element = lensRef.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;

    const { width, height } = parent.getBoundingClientRect();
    const limit = {
      x: Math.max(0, width / 2 - SIZE / 2),
      y: Math.max(0, height / 2 - SIZE / 2),
    };
    bounds.current = limit;

    const point = position.current;
    const goal = target.current;
    goal.x = clampToLimit(goal.x, limit.x);
    goal.y = clampToLimit(goal.y, limit.y);
    point.x = clampToLimit(point.x, limit.x);
    point.y = clampToLimit(point.y, limit.y);

    lastFrameTime.current = 0;
    writeTransform(element, point.x, point.y, scale.current);
  }, []);

  /**
   * 单个 rAF 循环：临界阻尼弹簧把当前位置推向目标，缩放做指数插值。
   * 全部状态来自 ref，静止后自动停止循环。
   */
  const step = useCallback((time: number) => {
    frame.current = null;
    const element = lensRef.current;
    if (!element) return;

    const previous = lastFrameTime.current;
    lastFrameTime.current = time;
    let delta = previous > 0 ? (time - previous) / 1000 : 1 / 60;
    if (!Number.isFinite(delta) || delta <= 0) delta = 1 / 60;
    delta = Math.min(delta, 0.1);

    const omega = dragging.current
      ? FOLLOW_OMEGA
      : reducedMotion.current
        ? REDUCED_OMEGA
        : SETTLE_OMEGA;

    let remaining = delta;
    while (remaining > 0) {
      const h = Math.min(remaining, MAX_SUBSTEP);
      remaining -= h;

      const point = position.current;
      const speed = velocity.current;
      const goal = target.current;

      // 临界阻尼弹簧：没有回弹振荡，但会保留松手瞬间的速度。
      speed.x +=
        (omega * omega * (goal.x - point.x) - 2 * omega * speed.x) * h;
      speed.y +=
        (omega * omega * (goal.y - point.y) - 2 * omega * speed.y) * h;
      point.x += speed.x * h;
      point.y += speed.y * h;

      const limit = bounds.current;
      if (point.x < -limit.x) {
        point.x = -limit.x;
        if (speed.x < 0) speed.x = 0;
      } else if (point.x > limit.x) {
        point.x = limit.x;
        if (speed.x > 0) speed.x = 0;
      }
      if (point.y < -limit.y) {
        point.y = -limit.y;
        if (speed.y < 0) speed.y = 0;
      } else if (point.y > limit.y) {
        point.y = limit.y;
        if (speed.y > 0) speed.y = 0;
      }
    }

    const scaleBlend = 1 - Math.exp(-delta / SCALE_TIME_CONSTANT);
    scale.current += (scaleTarget.current - scale.current) * scaleBlend;

    writeTransform(
      element,
      position.current.x,
      position.current.y,
      scale.current
    );

    const settled =
      Math.abs(target.current.x - position.current.x) < SETTLE_DISTANCE &&
      Math.abs(target.current.y - position.current.y) < SETTLE_DISTANCE &&
      Math.abs(velocity.current.x) < SETTLE_SPEED &&
      Math.abs(velocity.current.y) < SETTLE_SPEED &&
      Math.abs(scaleTarget.current - scale.current) < SETTLE_SCALE;

    if (settled) {
      position.current.x = target.current.x;
      position.current.y = target.current.y;
      velocity.current.x = 0;
      velocity.current.y = 0;
      scale.current = scaleTarget.current;
      writeTransform(
        element,
        position.current.x,
        position.current.y,
        scale.current
      );
      lastFrameTime.current = 0;
      return;
    }

    frame.current = window.requestAnimationFrame(step);
  }, []);

  const startLoop = useCallback(() => {
    if (frame.current !== null) return;
    lastFrameTime.current = 0;
    frame.current = window.requestAnimationFrame(step);
  }, [step]);

  useEffect(() => {
    measure();
    const parent = lensRef.current?.parentElement;
    if (!parent) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(parent);
    return () => observer.disconnect();
  }, [measure]);

  function pushSample(state: DragState, x: number, y: number, time: number) {
    state.samples.push({ x, y, t: time });
    if (state.samples.length > MAX_SAMPLES) state.samples.shift();
    while (
      state.samples.length > 2 &&
      time - state.samples[0].t > SAMPLE_WINDOW
    ) {
      state.samples.shift();
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current) return;

    // 以当前目标点为基准，保证抓取瞬间画面不跳动。
    measure();
    const state: DragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: target.current.x,
      originY: target.current.y,
      samples: [],
    };
    drag.current = state;
    dragging.current = true;
    scaleTarget.current = DRAG_SCALE;
    pushSample(state, event.clientX, event.clientY, performance.now());

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // 指针已经释放时捕获会失败，此时拖拽逻辑照常工作。
    }

    startLoop();
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    endDrag(true);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    endDrag(false);
  }

  function handleLostPointerCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    endDrag(false);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const limit = bounds.current;
    target.current.x = clampToLimit(
      state.originX + event.clientX - state.startX,
      limit.x
    );
    target.current.y = clampToLimit(
      state.originY + event.clientY - state.startY,
      limit.y
    );
    pushSample(state, event.clientX, event.clientY, performance.now());
    startLoop();
  }

  /** 结束拖拽；pointercancel 或丢失捕获时不再追加甩出速度。 */
  function endDrag(withInertia: boolean) {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    dragging.current = false;
    scaleTarget.current = 1;

    if (
      withInertia &&
      !reducedMotion.current &&
      state.samples.length >= 2
    ) {
      const first = state.samples[0];
      const last = state.samples[state.samples.length - 1];
      const elapsed = (last.t - first.t) / 1000;
      const age = performance.now() - last.t;

      // 指针停顿过久时速度为 0，避免松手后再“弹射”。
      if (elapsed >= 0.02 && age < 100) {
        let vx = ((last.x - first.x) / elapsed) * INERTIA_RATIO;
        let vy = ((last.y - first.y) / elapsed) * INERTIA_RATIO;
        const speed = Math.hypot(vx, vy);
        if (speed > MAX_RELEASE_SPEED) {
          const factor = MAX_RELEASE_SPEED / speed;
          vx *= factor;
          vy *= factor;
        }
        velocity.current.x += vx;
        velocity.current.y += vy;
      }
    }

    startLoop();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const stepSize = event.shiftKey ? 32 : 12;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-stepSize, 0],
      ArrowRight: [stepSize, 0],
      ArrowUp: [0, -stepSize],
      ArrowDown: [0, stepSize],
    };
    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();
    measure();
    const limit = bounds.current;
    target.current.x = clampToLimit(target.current.x + move[0], limit.x);
    target.current.y = clampToLimit(target.current.y + move[1], limit.y);
    velocity.current.x = 0;
    velocity.current.y = 0;
    startLoop();
  }

  const backdrop = map
    ? `url(#${filterId}) blur(0.5px) saturate(1.85) brightness(1.02)`
    : undefined;

  return (
    <div
      ref={lensRef}
      role="img"
      tabIndex={0}
      aria-label="可拖动的液态玻璃镜片"
      className="absolute left-1/2 top-1/2 z-10 cursor-grab touch-none rounded-full bg-white/[0.12] backdrop-blur-md outline-none ring-1 ring-white/15 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-white/70 active:cursor-grabbing"
      style={{
        width: SIZE,
        height: SIZE,
        marginLeft: -SIZE / 2,
        marginTop: -SIZE / 2,
        transform: "translate3d(0px, 0px, 0) scale(1)",
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
        boxShadow:
          "0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      >
        {map ? (
          <filter
            id={filterId}
            x="-33%"
            y="-33%"
            width="166%"
            height="166%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={map}
              x="0"
              y="0"
              width={SIZE}
              height={SIZE}
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={SCALE + ABERRATION}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispR"
            />
            <feColorMatrix
              in="dispR"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispG"
            />
            <feColorMatrix
              in="dispG"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={SCALE - ABERRATION}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispB"
            />
            <feColorMatrix
              in="dispB"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="rgb" />
            <feGaussianBlur in="rgb" stdDeviation={FROST} />
          </filter>
        ) : null}
      </svg>
    </div>
  );
}
