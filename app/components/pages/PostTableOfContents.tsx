"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MarkdownHeading } from "@/lib/markdown-headings";

type PostTableOfContentsProps = {
  headings: MarkdownHeading[];
};

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

type IndicatorStyle = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TOP_OFFSET = 140;

export default function PostTableOfContents({
  headings,
}: PostTableOfContentsProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeId, setActiveId] = useState("overview");
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle | null>(
    null
  );

  const items = useMemo<TocItem[]>(
    () => [{ id: "overview", text: "Overview", level: 2 }, ...headings],
    [headings]
  );

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

  useEffect(() => {
    const updateIndicator = () => {
      const activeLink = itemRefs.current[activeId];

      if (!activeLink) {
        return;
      }

      setIndicatorStyle({
        top: activeLink.offsetTop,
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
        height: activeLink.offsetHeight,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeId, items]);

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
        <nav className="relative space-y-1 py-1">
          {indicatorStyle ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-r-xl bg-zinc-100/85 shadow-[inset_2px_0_0_0_rgba(24,24,27,0.92)] transition-[top,left,width,height,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[top,left,width,height] dark:bg-zinc-800/75 dark:shadow-[inset_2px_0_0_0_rgba(244,244,245,0.96)]"
              style={indicatorStyle}
            />
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
                    : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
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
