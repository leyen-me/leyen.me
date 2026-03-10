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

const TOP_OFFSET = 140;

export default function PostTableOfContents({
  headings,
}: PostTableOfContentsProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState("overview");

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
        <nav className="space-y-1">
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
                aria-current={isActive ? "location" : undefined}
                className={[
                  "block rounded-r-xl border-l-2 py-2 pr-3 text-sm leading-6 transition-colors",
                  indentClass,
                  isActive
                    ? "border-zinc-900 bg-zinc-100/80 font-medium text-zinc-950 dark:border-zinc-100 dark:bg-zinc-800/80 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
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
