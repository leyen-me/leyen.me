"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  BoardIcon,
  CreateIcon,
  DocumentIcon,
  FolderIcon,
  SpreadsheetIcon,
} from "./icons";
import { CREATE_MENU_CSS } from "./create-menu-css";
import { playCreateMenuSound, type CreateMenuSound } from "./sound";
import { useReducedMotion, useShapeSpring } from "./springs";

/* ── Bencho's constants, unchanged ───────────────────────────
   The stage reserves a 244 px square so opening the menu never shifts the
   page; the pill and panel are both centred inside it. CORNER is the block's
   `corner` param default of 20. */
const PILL_HEIGHT = 38;
const PANEL_WIDTH = 212;
const PANEL_HEIGHT = 166;
const CORNER = 20;
const PRESS_MS = 60;
const ITEM_DELAY_MS = 30;
const ITEM_STEP_MS = 22;

/** "Create" at 13px, used until the real label has been measured. */
const FALLBACK_LABEL = 42;

const ITEMS = [
  { label: "Document", Icon: DocumentIcon },
  { label: "Spreadsheet", Icon: SpreadsheetIcon },
  { label: "Board", Icon: BoardIcon },
  { label: "Folder", Icon: FolderIcon },
] as const;

const shutRadiusFor = (corner: number) => Math.min(19, (19 / 20) * corner);
const rowRadiusFor = (corner: number) => Math.min(17, Math.max(0, corner - 10));

/**
 * A 1:1 port of Bencho's "Create menu" block.
 *
 * The pill and the panel are the same body at two sizes: pressing squashes it
 * for 60 ms, then a single spring spreads width, height and corner together
 * while the rows fade up in a 22 ms cascade. The goo filter is the block's own
 * `#liq-goo` (blur 7 + alpha 20/−10).
 *
 * Deliberate additions for the gallery: the rows are a real menu with roving
 * focus and arrow keys, Escape closes and returns focus to the trigger, and
 * the press/expand/click/off cues are synthesised with Web Audio.
 */
export default function CreateMenu() {
  const reduced = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `crt-goo-${uid}`;
  const menuId = `crt-menu-${uid}`;

  const [open, setOpen] = useState(false);
  const [sink, setSink] = useState(false);
  const [labelWidth, setLabelWidth] = useState(FALLBACK_LABEL);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState("");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pressTimer = useRef<number | undefined>(undefined);

  const pillWidth = Math.round(26 + labelWidth + 34);
  const shutRadius = shutRadiusFor(CORNER);
  const rowRadius = rowRadiusFor(CORNER);

  // The pill sizes itself around the measured label, just like the source.
  useEffect(() => {
    const element = labelRef.current;
    if (!element) return;

    let alive = true;
    const measure = () => {
      if (alive) setLabelWidth(element.offsetWidth);
    };

    measure();
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const shape = useShapeSpring(
    open ? PANEL_WIDTH : pillWidth,
    open ? PANEL_HEIGHT : PILL_HEIGHT,
    open ? CORNER : shutRadius,
    reduced,
  );

  const sound = useCallback((name: CreateMenuSound) => {
    playCreateMenuSound(name);
  }, []);

  const openMenu = useCallback(() => {
    if (open) return;

    sound("press");
    setSink(true);
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      setSink(false);
      setOpen(true);
      sound("expand");
    }, PRESS_MS);
  }, [open, sound]);

  useEffect(
    () => () => {
      window.clearTimeout(pressTimer.current);
    },
    [],
  );

  // Moving into the menu means keyboard users can keep going without hunting
  // for an invisible trigger: it fades out while the panel is open.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      setActive(0);
      itemRefs.current[0]?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  // Escape closes and gives focus back to the trigger.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      setActive(0);
      sound("off");
      window.requestAnimationFrame(() =>
        triggerRef.current?.focus({ preventScroll: true }),
      );
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, sound]);

  // Anywhere outside the panel's visible box puts the menu away. `contains()`
  // would count the empty square around the panel as "inside", which is the
  // dead ground the block deliberately avoids.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isTrusted) return;
      const box = panelRef.current?.getBoundingClientRect();
      const inside =
        box !== undefined &&
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;

      if (!inside) {
        setOpen(false);
        setActive(0);
        sound("off");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, sound]);

  function handleTriggerClick() {
    openMenu();
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    if (!open) openMenu();
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    const last = ITEMS.length - 1;
    let next = -1;

    if (event.key === "ArrowDown") next = (active + 1) % ITEMS.length;
    else if (event.key === "ArrowUp") next = (active - 1 + ITEMS.length) % ITEMS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;

    event.preventDefault();
    setActive(next);
    itemRefs.current[next]?.focus();
  }

  function choose(label: string) {
    sound("click");
    setOpen(false);
    setActive(0);
    setLive(`Created ${label}`);
    // The row disappears with the panel, so focus cannot stay on it.
    window.requestAnimationFrame(() =>
      triggerRef.current?.focus({ preventScroll: true }),
    );
  }

  return (
    <div className="crt-demo flex w-full justify-center py-2">
      <style dangerouslySetInnerHTML={{ __html: CREATE_MENU_CSS }} />

      <svg
        className="crt-defs"
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
      >
        <defs>
          <filter
            id={filterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="smear" />
            <feColorMatrix
              in="smear"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="crt-stage"
        data-open={open ? "true" : "false"}
        data-sink={sink ? "true" : undefined}
        style={
          {
            "--pill-w": `${pillWidth}px`,
            "--crt-r": `${CORNER}px`,
            "--crt-shut-r": `${shutRadius.toFixed(2)}px`,
            "--crt-row-r": `${rowRadius.toFixed(2)}px`,
          } as CSSProperties
        }
      >
        <div
          className="crt-blobs"
          aria-hidden="true"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            className="crt-body"
            style={{
              width: `${Math.max(0, shape.width).toFixed(2)}px`,
              height: `${Math.max(0, shape.height).toFixed(2)}px`,
              borderRadius: `${Math.max(0, shape.radius).toFixed(2)}px`,
            }}
          />
        </div>

        <button
          ref={triggerRef}
          type="button"
          className="crt-pill"
          aria-label="Create"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          tabIndex={open ? -1 : 0}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className="crt-glyph" aria-hidden="true">
            <CreateIcon />
          </span>
          <span className="crt-say" style={{ width: labelWidth || undefined }}>
            <span ref={labelRef}>Create</span>
          </span>
        </button>

        <div className="crt-panel" ref={panelRef} aria-hidden={!open}>
          <ul
            id={menuId}
            className="crt-menu"
            role="menu"
            aria-label="Create"
            onKeyDown={handleMenuKeyDown}
          >
            {ITEMS.map((item, index) => (
              <li
                key={item.label}
                className="crt-item"
                role="none"
                style={{
                  transitionDelay: open
                    ? `${ITEM_DELAY_MS + index * ITEM_STEP_MS}ms`
                    : "0ms",
                }}
              >
                <button
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={open && active === index ? 0 : -1}
                  onClick={() => choose(item.label)}
                  onFocus={() => setActive(index)}
                >
                  <item.Icon />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
    </div>
  );
}
