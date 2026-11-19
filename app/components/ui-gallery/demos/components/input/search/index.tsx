"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { SEARCH_CSS } from "./search-css";
import { filterSuggestions, type Suggestion } from "./search-data";
import {
  useMediaQuery,
  usePrefersReducedMotion,
  useWidthSpring,
} from "./motion";
import { playSearchSound, type SearchSound } from "./sound";
import SuggestionList from "./suggestion-list";

/* Bencho's Seek defaults, unchanged: 240 px open on desktop, 220 px under
   760 px, 48 px closed, 14 px inset, 20 px lens, 24 px corner. The 26 px of
   frame air and the 88 px frame height are the block's own stage. */
const CLOSED_WIDTH = 48;
const OPEN_DESKTOP = 240;
const OPEN_MOBILE = 220;
const FIELD_HEIGHT = 48;
const FRAME_EXTRA = 26;
const FRAME_HEIGHT = 88;
const CORNER = 24;
const SPRING = 20;
const GIVE = 50;
const MAGNET_RADIUS = 110;
const PRESS_MS = 90;
const BUSY_MS = 340;
const TYPE_SOUND_GAP_MS = 70;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A 1:1 port of Bencho's "Search" block (slug `seek`): one pill whose width is
 * the state, with the lens fixed in place while the field grows around it. A
 * 90 ms press squash, the width spring, the cursor magnet, the busy lens and
 * the expand / click / off cues all come from the source.
 *
 * The gallery keeps everything above and adds the part a standalone search
 * needs: a local suggestion corpus, substring filtering with highlighting,
 * a clear button and a combobox keyboard flow. Suggestions live in a panel
 * below the untouched 88 px stage, so opening them cannot move the field.
 */
export default function Demo() {
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery("(max-width: 760px)");
  const coarse = useMediaQuery("(pointer: coarse)");
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const fieldId = `seek-field-${uid}`;
  const listId = `seek-list-${uid}`;
  const optionId = useCallback(
    (id: string) => `seek-opt-${uid}-${id}`,
    [uid],
  );

  const openWidth = narrow ? OPEN_MOBILE : OPEN_DESKTOP;
  const frameWidth = Math.max(CLOSED_WIDTH, openWidth) + FRAME_EXTRA;

  const [open, setOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });

  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pressTimer = useRef<number | undefined>(undefined);
  const busyTimer = useRef<number | undefined>(undefined);
  const lastTypeSound = useRef(0);

  const width = useWidthSpring(
    open ? openWidth : CLOSED_WIDTH,
    SPRING,
    reduced,
  );

  const progress = clamp(
    (width - CLOSED_WIDTH) /
      Math.max(1, Math.max(CLOSED_WIDTH, openWidth) - CLOSED_WIDTH),
    0,
    1,
  );
  const say = clamp((progress - 0.55) / 0.45, 0, 1);
  const matches = useMemo(() => filterSuggestions(value), [value]);
  const submittedMatches = useMemo(
    () => (submitted ? filterSuggestions(submitted).length : 0),
    [submitted],
  );

  const sound = useCallback((name: SearchSound) => {
    playSearchSound(name);
  }, []);

  useEffect(() => {
    setActive((index) => Math.min(index, Math.max(0, matches.length - 1)));
  }, [matches.length]);

  useEffect(
    () => () => {
      window.clearTimeout(pressTimer.current);
      window.clearTimeout(busyTimer.current);
    },
    [],
  );

  // The magnet is measured from the frame, which never moves, and is off once
  // the field is open or motion is reduced. A few pixels, capped at 4.5.
  useEffect(() => {
    if (open || reduced) {
      setMagnet({ x: 0, y: 0 });
      return;
    }

    let frame = 0;
    const target = { x: 0, y: 0 };
    const apply = () => {
      frame = 0;
      setMagnet({ x: target.x, y: target.y });
    };

    const handleMove = (event: PointerEvent) => {
      const box = frameRef.current?.getBoundingClientRect();
      if (!box) return;

      const scale =
        box.width / (frameRef.current?.offsetWidth || box.width) || 1;
      const dx = (event.clientX - (box.left + box.width / 2)) / scale;
      const dy = (event.clientY - (box.top + box.height / 2)) / scale;
      const distance = Math.hypot(dx, dy);

      if (distance > MAGNET_RADIUS) {
        target.x = 0;
        target.y = 0;
      } else {
        const pull =
          (1 - distance / MAGNET_RADIUS) ** 1.4 * (2 + (GIVE / 100) * 5);
        target.x = (dx / (distance || 1)) * pull;
        target.y = (dy / (distance || 1)) * pull;
      }

      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const handleLeave = () => {
      target.x = 0;
      target.y = 0;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerleave", handleLeave);
      window.cancelAnimationFrame(frame);
    };
  }, [open, reduced]);

  const openSearch = useCallback(() => {
    if (open) return;

    sound("expand");
    setPressing(true);
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(
      () => {
        setPressing(false);
        setOpen(true);
        setListOpen(true);
        setActive(0);
        inputRef.current?.focus({ preventScroll: true });
      },
      reduced ? 0 : PRESS_MS,
    );
  }, [open, reduced, sound]);

  function closeSearch(returnFocus: boolean) {
    setOpen(false);
    setPressing(false);
    setBusy(false);
    setListOpen(false);
    setSubmitted(null);
    setMagnet({ x: 0, y: 0 });

    if (returnFocus) {
      window.requestAnimationFrame(() =>
        triggerRef.current?.focus({ preventScroll: true }),
      );
    }
  }

  function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;

    const count = filterSuggestions(trimmed).length;
    setSubmitted(trimmed);
    setListOpen(false);
    sound("select");
    setLive(
      count === 0
        ? `No results for ${trimmed}`
        : `${count} result${count === 1 ? "" : "s"} for ${trimmed}`,
    );
  }

  function choose(item: Suggestion) {
    setValue(item.title);
    setSubmitted(null);
    setListOpen(false);
    setActive(0);
    sound("select");
    setLive(`Opening ${item.title}`);
    inputRef.current?.focus({ preventScroll: true });
  }

  function noteTyping() {
    window.clearTimeout(busyTimer.current);
    setBusy(true);
    busyTimer.current = window.setTimeout(() => setBusy(false), BUSY_MS);

    const now = performance.now();
    if (now - lastTypeSound.current < TYPE_SOUND_GAP_MS) return;
    lastTypeSound.current = now;
    sound("click");
  }

  function handleChange(next: string) {
    setValue(next);
    setSubmitted(null);
    setListOpen(true);
    setActive(0);
    noteTyping();
  }

  function handleClear() {
    setValue("");
    setSubmitted(null);
    setListOpen(true);
    setActive(0);
    sound("select");
    setLive("Search cleared");
    inputRef.current?.focus({ preventScroll: true });
  }

  function handleBlur() {
    setListOpen(false);
    if (value.trim()) return;
    sound("off");
    closeSearch(false);
  }

  function handleFieldKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    const last = matches.length - 1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!listOpen) {
        setListOpen(true);
        return;
      }
      if (matches.length > 0) setActive((index) => (index + 1) % matches.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!listOpen) {
        setListOpen(true);
        return;
      }
      if (matches.length > 0) {
        setActive((index) => (index - 1 + matches.length) % matches.length);
      }
      return;
    }

    if ((event.key === "Home" || event.key === "End") && listOpen) {
      if (matches.length === 0) return;
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : last);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (listOpen && matches.length > 0) {
        choose(matches[Math.min(active, last)]);
      } else {
        submit(value);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      const hadValue = value.trim().length > 0;
      inputRef.current?.blur();
      setValue("");
      setActive(0);
      if (hadValue) sound("off");
      closeSearch(true);
    }
  }

  function handleSkinPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!open) return;

    const target = event.target as HTMLElement;
    if (target === inputRef.current || target.closest("button")) return;

    event.preventDefault();
    setListOpen(true);
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="seek-demo flex w-full justify-center">
      <style dangerouslySetInnerHTML={{ __html: SEARCH_CSS }} />

      <div className="flex min-h-[420px] w-full max-w-[340px] flex-col items-center rounded-2xl border border-zinc-200/80 bg-[#f7f7f6] px-4 pb-5 pt-10 dark:border-zinc-800 dark:bg-[#0a0a0a]">
        <div
          ref={frameRef}
          className="sek"
          data-open={open ? "true" : "false"}
          data-press={pressing ? "true" : undefined}
          data-busy={busy ? "true" : undefined}
          data-flat={reduced ? "true" : undefined}
          style={
            {
              "--seek-w": `${Math.max(CLOSED_WIDTH, width).toFixed(2)}px`,
              "--seek-say": say.toFixed(3),
              "--seek-lx": `${magnet.x.toFixed(2)}px`,
              "--seek-ly": `${magnet.y.toFixed(2)}px`,
              "--seek-frame": `${frameWidth}px`,
              "--seek-frameh": `${FRAME_HEIGHT}px`,
              "--seek-corner": `${CORNER}px`,
              "--seek-shut": `${FIELD_HEIGHT}px`,
            } as CSSProperties
          }
        >
          <div className="sek-skin" onPointerDown={handleSkinPointerDown}>
            <svg
              className="sek-lens"
              viewBox="0 0 18 18"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="7.6" cy="7.6" r="5.4" />
              <path d="M11.6 11.6 L15.4 15.4" />
            </svg>

            <label htmlFor={fieldId} className="sr-only">
              Search
            </label>
            <input
              ref={inputRef}
              id={fieldId}
              className="sek-field"
              type="text"
              value={value}
              placeholder="Search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open && listOpen}
              aria-controls={open && listOpen ? listId : undefined}
              aria-activedescendant={
                open && listOpen && matches.length > 0
                  ? optionId(matches[Math.min(active, matches.length - 1)].id)
                  : undefined
              }
              autoComplete="off"
              spellCheck={false}
              inputMode={coarse ? "none" : undefined}
              tabIndex={open ? 0 : -1}
              style={{ paddingRight: value ? 34 : 0 }}
              onChange={(event) => handleChange(event.target.value)}
              onFocus={() => {
                if (open) setListOpen(true);
              }}
              onBlur={handleBlur}
              onKeyDown={handleFieldKeyDown}
            />

            {open && value ? (
              <button
                type="button"
                aria-label="Clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClear}
                className="absolute right-2 top-1/2 z-[4] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#85847e] transition-colors hover:bg-[#17181a]/[0.06] hover:text-[#17181a] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(52,211,153,0.7)] dark:text-[#828282] dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M2.4 2.4l7.2 7.2M9.6 2.4L2.4 9.6" />
                </svg>
              </button>
            ) : null}

            {!open ? (
              <button
                ref={triggerRef}
                type="button"
                className="sek-hit"
                aria-label="Search"
                aria-haspopup="listbox"
                aria-expanded={false}
                onClick={openSearch}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowDown") return;
                  event.preventDefault();
                  openSearch();
                }}
              />
            ) : null}
          </div>

          {open && listOpen ? (
            <SuggestionList
              id={listId}
              query={value}
              matches={matches}
              active={active}
              width={openWidth}
              optionId={optionId}
              onActive={setActive}
              onChoose={choose}
            />
          ) : null}
        </div>

        <div
          className={`mt-auto pt-6 text-center ${
            open && listOpen ? "invisible" : ""
          }`}
        >
          {submitted ? (
            <p className="text-xs text-[#3c3b37] dark:text-[#b4b4b4]">
              {submittedMatches === 0
                ? `No results for “${submitted}”`
                : `${submittedMatches} result${
                    submittedMatches === 1 ? "" : "s"
                  } for “${submitted}”`}
            </p>
          ) : (
            <p className="text-[11px] text-[#85847e] dark:text-[#6b6b6b]">
              Try{" "}
              <kbd className="rounded border border-[#17181a]/10 px-1 py-0.5 font-sans text-[10px] dark:border-white/10">
                mo
              </kbd>
              ,{" "}
              <kbd className="rounded border border-[#17181a]/10 px-1 py-0.5 font-sans text-[10px] dark:border-white/10">
                dark
              </kbd>{" "}
              or{" "}
              <kbd className="rounded border border-[#17181a]/10 px-1 py-0.5 font-sans text-[10px] dark:border-white/10">
                focus
              </kbd>
            </p>
          )}
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {live}
        </p>
      </div>
    </div>
  );
}
