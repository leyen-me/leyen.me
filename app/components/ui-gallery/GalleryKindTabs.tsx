"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type GalleryKindTab = {
  id: string;
  label: string;
  href: string;
};

type Rect = {
  left: number;
  width: number;
};

/**
 * 记录“当前页面停留的类型”。真正切换作品类型时，新页面据此从旧位置滑入；
 * 分类 / 标签 / 搜索只是在同一类型内跳转，重新挂载时读到相同的值就不会误播动画。
 */
const LAST_TAB_KEY = "ui-gallery:last-kind-tab";

function readLastTab(): string | null {
  try {
    return window.sessionStorage.getItem(LAST_TAB_KEY);
  } catch {
    return null;
  }
}

function rememberTab(id: string): void {
  try {
    window.sessionStorage.setItem(LAST_TAB_KEY, id);
  } catch {
    // 隐私模式禁用存储时，退化为不做跨页滑动。
  }
}

type GalleryKindTabsProps = {
  tabs: GalleryKindTab[];
  activeId: string;
  label: string;
};

export function GalleryKindTabs({ tabs, activeId, label }: GalleryKindTabsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState<Rect | null>(null);
  /** 首帧先无动画落位，之后才开启过渡，避免滑块从 0 宽“长出来”。 */
  const [ready, setReady] = useState(false);
  /** 跨页滑动期间忽略尺寸同步，避免 ResizeObserver 立刻把滑块拽回终点。 */
  const slideGuardRef = useRef(0);
  /**
   * 每次挂载只采样一次“上一页的类型”。分类 / 标签 / 搜索跳转都会重建本组件，
   * 若每次挂载都重新比较 sessionStorage，就会在类型未变时误播滑入动画。
   */
  const originCacheRef = useRef<{ activeId: string; origin: Rect | null } | null>(
    null
  );

  const measure = useCallback((id: string): Rect | null => {
    const element = tabRefs.current.get(id);
    if (!element) return null;
    return { left: element.offsetLeft, width: element.offsetWidth };
  }, []);

  useLayoutEffect(() => {
    const target = measure(activeId);
    if (!target) return;

    if (originCacheRef.current?.activeId !== activeId) {
      const lastId = readLastTab();
      originCacheRef.current = {
        activeId,
        origin: lastId && lastId !== activeId ? measure(lastId) : null,
      };
      // 无论从哪个入口离开，都把当前类型记为“上一页”，供下次真正换类型时滑动。
      rememberTab(activeId);
    }

    const origin = originCacheRef.current.origin;

    if (!origin) {
      setIndicator(target);
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }

    // 先在旧位置渲染，隔一帧再滑到目标位置，形成跨页连续感。
    setIndicator(origin);
    slideGuardRef.current = performance.now() + 420;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      setReady(true);
      inner = requestAnimationFrame(() => setIndicator(target));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [activeId, measure]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const sync = () => {
      if (performance.now() < slideGuardRef.current) return;
      const rect = measure(activeId);
      if (rect) setIndicator(rect);
    };

    const observer = new ResizeObserver(sync);
    observer.observe(track);
    for (const element of tabRefs.current.values()) observer.observe(element);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [activeId, measure]);

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label={label}
      className="relative inline-flex shrink-0 items-center gap-0.5 rounded-full bg-zinc-900/[0.045] p-1 dark:bg-white/[0.055]"
    >
      <span
        aria-hidden="true"
        style={
          indicator
            ? { width: indicator.width, transform: `translateX(${indicator.left}px)` }
            : undefined
        }
        className={`pointer-events-none absolute bottom-1 left-0 top-1 rounded-full bg-zinc-900 shadow-sm shadow-zinc-900/25 dark:bg-white dark:shadow-black/40 ${
          indicator ? "opacity-100" : "opacity-0"
        } ${
          ready
            ? "transition-[width,transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            : ""
        }`}
      />
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={active}
            ref={(element) => {
              if (element) tabRefs.current.set(tab.id, element);
              else tabRefs.current.delete(tab.id);
            }}
            className={`relative z-[1] inline-flex h-8 items-center rounded-full px-4 text-sm font-medium transition-colors duration-300 motion-reduce:transition-none ${
              active
                ? `text-white dark:text-zinc-900 ${
                    // 水合完成前先用链接自身的底色兜底，避免首屏没有选中块。
                    indicator
                      ? ""
                      : "bg-zinc-900 shadow-sm shadow-zinc-900/25 dark:bg-white dark:shadow-black/40"
                  }`
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
