"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MarkdownHeading } from "@/lib/markdown-headings";

type PostTableOfContentsProps = {
  headings: MarkdownHeading[];
};

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

type SpinePoint = {
  id: string;
  x: number;
  yTop: number;
  yBottom: number;
};

const TOP_OFFSET = 140;

/** 竖线与文字起点之间的间距（px），越大线越靠左 */
const SPINE_TO_TEXT_GAP = 8;

/** 参考 Fuma TOC：层级切换时的贝塞尔控制点强度 */
const CORNER_CURVE = 4;

/**
 * 脊柱在锚点坐标系内的 x（相对锚点左缘）。缩进在 padding-left 上，需用 padding 算层级。
 * 整体 x = offsetLeft + spineXRelativeToAnchor（与 nav 左侧留白对齐）。
 */
function spineXRelativeToAnchor(el: HTMLElement): number {
  const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 12;
  return Math.max(4, padLeft - SPINE_TO_TEXT_GAP);
}

/** 参考 Fuma：从上一项底部平滑曲线连接到下一项顶部，再继续当前项的竖线。 */
function buildOutlinePath(points: SpinePoint[]): string {
  if (points.length === 0) {
    return "";
  }

  let d = `M ${points[0].x} ${points[0].yTop} L ${points[0].x} ${points[0].yBottom}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];

    const dx = cur.x - prev.x;
    const dy = cur.yTop - prev.yBottom;

    if (Math.abs(dx) > 0.5 && dy > 0.5) {
      const c = Math.min(
        CORNER_CURVE,
        Math.abs(dx),
        Math.max(0, dy / 2)
      );
      d += ` C ${prev.x} ${cur.yTop - c} ${cur.x} ${prev.yBottom + c} ${cur.x} ${cur.yTop}`;
    } else {
      d += ` L ${prev.x} ${cur.yTop}`;
      if (Math.abs(dx) > 0.5) {
        d += ` L ${cur.x} ${cur.yTop}`;
      }
    }

    d += ` L ${cur.x} ${cur.yBottom}`;
  }

  return d;
}

export default function PostTableOfContents({
  headings,
}: PostTableOfContentsProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const navInnerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const clipId = useId().replace(/:/g, "");
  const [activeId, setActiveId] = useState("overview");
  const [layout, setLayout] = useState<{
    width: number;
    height: number;
    pathD: string;
    clip: { x: number; y: number; width: number; height: number } | null;
  } | null>(null);

  const items = useMemo<TocItem[]>(
    () => [{ id: "overview", text: "Overview", level: 2 }, ...headings],
    [headings]
  );

  const measure = useCallback(() => {
    const inner = navInnerRef.current;

    if (!inner) {
      return;
    }

    const width = inner.clientWidth;
    const height = inner.scrollHeight;

    const points: SpinePoint[] = [];

    for (const item of items) {
      const el = itemRefs.current[item.id];

      if (!el) {
        continue;
      }

      points.push({
        id: item.id,
        x: el.offsetLeft + spineXRelativeToAnchor(el),
        yTop: el.offsetTop,
        yBottom: el.offsetTop + el.offsetHeight,
      });
    }

    if (points.length === 0) {
      setLayout(null);
      return;
    }

    const pathD = buildOutlinePath(points);
    const activeEl =
      itemRefs.current[activeId] ?? itemRefs.current[items[0]?.id ?? ""];
    const pad = 2;
    const clip = activeEl
      ? {
          x: 0,
          y: Math.max(0, activeEl.offsetTop - pad),
          width,
          height: activeEl.offsetHeight + pad * 2,
        }
      : null;

    setLayout((prev) => {
      const next = { width, height, pathD, clip };
      if (
        prev &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.pathD === next.pathD &&
        prev.clip?.x === next.clip?.x &&
        prev.clip?.y === next.clip?.y &&
        prev.clip?.width === next.clip?.width &&
        prev.clip?.height === next.clip?.height
      ) {
        return prev;
      }
      return next;
    });
  }, [items, activeId]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const inner = navInnerRef.current;

    if (!inner) {
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
      };
    }

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(inner);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    const updateActiveId = () => {
      let currentId = items[0]?.id ?? "overview";

      for (const item of items) {
        const element = document.getElementById(item.id);

        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top - TOP_OFFSET <= 0) {
          currentId = item.id;
          continue;
        }

        break;
      }

      setActiveId((prev) => (prev === currentId ? prev : currentId));
    };

    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveId);
    };

    updateActiveId();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  useEffect(() => {
    const activeLink = navRef.current?.querySelector<HTMLAnchorElement>(
      `[data-id="${activeId}"]`
    );

    activeLink?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeId]);

  return (
    <div className="flex h-full flex-col border-r border-zinc-200 pr-6 dark:border-zinc-800">
      <div className="pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
          Article
        </p>
        <h2 className="mt-2 font-incognito text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          On this page
        </h2>
      </div>

      <div ref={navRef} className="min-h-0 flex-1 overflow-y-auto">
        <nav
          ref={navInnerRef}
          className="relative space-y-1 py-1 pl-2"
        >
          {layout?.pathD ? (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              preserveAspectRatio="none"
              shapeRendering="geometricPrecision"
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              style={{
                transform: "translateX(-10px)",
              }}
            >
              <defs>
                <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                  {layout.clip ? (
                    <rect
                      height={layout.clip.height}
                      style={{
                        transform: `translate(${layout.clip.x}px, ${layout.clip.y}px)`,
                        transformBox: "fill-box",
                        transformOrigin: "0 0",
                        transition:
                          "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), height 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                      width={layout.clip.width}
                      x={0}
                      y={0}
                    />
                  ) : null}
                </clipPath>
              </defs>

              <path
                className="stroke-zinc-300/90 dark:stroke-zinc-600/80"
                d={layout.pathD}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />

              <path
                className="stroke-zinc-900 dark:stroke-zinc-50"
                clipPath={layout.clip ? `url(#${clipId})` : undefined}
                d={layout.pathD}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : null}

          {items.map((item) => {
            const isActive = item.id === activeId;
            const indentClass =
              item.level === 3
                ? "pl-6"
                : item.level === 4
                  ? "pl-9"
                  : "pl-3";

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                data-id={item.id}
                ref={(element) => {
                  itemRefs.current[item.id] = element;
                }}
                aria-current={isActive ? "location" : undefined}
                className={[
                  "relative z-10 block rounded-r-xl py-2 pr-3 text-sm leading-6 transition-colors",
                  indentClass,
                  isActive
                    ? "font-medium text-zinc-950 dark:text-zinc-50"
                    : [
                        "text-zinc-600 dark:text-zinc-400",
                        "[@media(hover:hover)]:hover:text-zinc-900 dark:[@media(hover:hover)]:hover:text-zinc-100",
                      ].join(" "),
                ].join(" ")}
              >
                {item.text}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
