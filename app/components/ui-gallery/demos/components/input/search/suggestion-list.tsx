"use client";

import { useEffect, useRef } from "react";
import type { Suggestion } from "./search-data";

type SuggestionListProps = {
  id: string;
  query: string;
  matches: Suggestion[];
  active: number;
  width: number;
  optionId: (id: string) => string;
  onActive: (index: number) => void;
  onChoose: (item: Suggestion) => void;
};

function Match({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  const at = needle
    ? text.toLowerCase().indexOf(needle.toLowerCase())
    : -1;

  if (at < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[2px] bg-[#17181a]/10 px-px text-inherit dark:bg-white/15">
        {text.slice(at, at + needle.length)}
      </mark>
      {text.slice(at + needle.length)}
    </>
  );
}

/**
 * The gallery extension around Bencho's field: a local result corpus, matched
 * text highlighted in place, and a scroll container that keeps the active
 * option visible without moving the page.
 */
export default function SuggestionList({
  id,
  query,
  matches,
  active,
  width,
  optionId,
  onActive,
  onChoose,
}: SuggestionListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const list = listRef.current;
    const option = optionRefs.current[active];
    if (!list || !option) return;

    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [active, matches.length]);

  const trimmed = query.trim();
  const empty = matches.length === 0;

  return (
    <div
      className="seek-panel absolute left-1/2 top-[76px] z-20 -translate-x-1/2"
      style={{ width }}
    >
      <div className="overflow-hidden rounded-2xl border border-[#17181a]/10 bg-white shadow-[0_12px_32px_-12px_rgba(23,24,26,0.28)] dark:border-white/10 dark:bg-[#1a1a1a] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#17181a]/[0.06] px-3.5 py-2.5 dark:border-white/[0.08]">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#85847e] dark:text-[#828282]">
            {trimmed ? "Results" : "Suggestions"}
          </span>
          <span className="text-[10px] tabular-nums text-[#85847e] dark:text-[#828282]">
            {matches.length}
          </span>
        </div>

        <ul
          ref={listRef}
          id={id}
          role="listbox"
          aria-label="Search results"
          className="max-h-[208px] overflow-y-auto overscroll-contain p-1.5"
        >
          {empty ? (
            <li
              role="option"
              aria-disabled="true"
              aria-selected="false"
              className="flex cursor-default flex-col gap-1 rounded-xl px-3 py-5 text-center"
            >
              <span className="text-[13px] font-medium text-[#17181a] dark:text-white">
                No matches for “{trimmed}”
              </span>
              <span className="text-[11px] text-[#85847e] dark:text-[#828282]">
                Press Enter to search anyway
              </span>
            </li>
          ) : (
            matches.map((item, index) => (
              <li
                key={item.id}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                id={optionId(item.id)}
                role="option"
                aria-selected={index === active}
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => onActive(index)}
                onClick={() => onChoose(item)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors duration-100 ${
                  index === active
                    ? "bg-[#17181a]/[0.055] dark:bg-white/[0.08]"
                    : "bg-transparent"
                }`}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-[#17181a] dark:text-white">
                    <Match text={item.title} query={query} />
                  </span>
                  <span className="truncate text-[11px] text-[#85847e] dark:text-[#828282]">
                    {item.meta}
                  </span>
                </span>

                {index === active ? (
                  <span
                    aria-hidden="true"
                    className="shrink-0 rounded border border-[#17181a]/10 px-1.5 py-0.5 text-[10px] text-[#85847e] dark:border-white/15 dark:text-[#828282]"
                  >
                    ↵
                  </span>
                ) : null}
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-3 border-t border-[#17181a]/[0.06] px-3.5 py-2 text-[10px] text-[#85847e] dark:border-white/[0.08] dark:text-[#828282]">
          <span>
            <kbd className="font-sans">↑↓</kbd> move
          </span>
          <span>
            <kbd className="font-sans">↵</kbd> open
          </span>
          <span className="ml-auto">
            <kbd className="font-sans">esc</kbd> clear
          </span>
        </div>
      </div>
    </div>
  );
}
