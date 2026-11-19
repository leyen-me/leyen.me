"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BY_SYM, GROUP, sideValues } from "./data";
import { AssetMark } from "./marks";
import { playCue } from "./sound";
import { ASSET_SWAP_CSS } from "./styles";
import useReducedMotion from "./use-reduced-motion";

const CARD_STRIDE = 119;
const PICKER_EXIT = 160;
const CARD_SETTLE = 520;

function ArrowDownIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="swp-pick-on"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Bencho's "Asset swap" block.
 *
 * The arrow counts turns instead of toggling, so every press continues half a
 * rotation. The card it points at (the payer) offers its lot; the other side
 * receives the same USD value minus the block's 0.3% spread. Opening a coin
 * picker lifts that slab over the whole 300 × 235 block while the other slab
 * folds to a sliver, and choosing a coin cross-swaps duplicates.
 *
 * The source uses framer-motion; the same spring timings are expressed here as
 * CSS transitions, with a 160 ms picker fade kept mounted during the exit.
 */
export default function Demo() {
  const reduced = useReducedMotion();

  const [pair, setPair] = useState<string[]>([...GROUP.start]);
  const [turns, setTurns] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [lifted, setLifted] = useState<number | null>(null);
  /** Kept one exit animation longer than `open` so the rows can fade. */
  const [picker, setPicker] = useState<number | null>(null);

  const coinRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusReturn = useRef<number | null>(null);

  const payer = turns % 2;
  const sides = sideValues(pair, payer);
  const list = GROUP.list;

  const paySide = sides[payer];
  const receiveSide = sides[1 - payer];
  const liveText =
    open !== null
      ? `${open === payer ? "You pay" : "You receive"}: choose a coin. Current ${pair[open]}.`
      : `Paying ${pair[payer]} for ${pair[1 - payer]}. You pay ${paySide.amount} ${paySide.asset.sym} (${paySide.fiat}); you receive ${receiveSide.amount} ${receiveSide.asset.sym} (${receiveSide.fiat}).`;

  /** Delay the exit state by one frame so the fade is visible. */
  useEffect(() => {
    if (open !== null || picker === null) return;
    const timer = window.setTimeout(
      () => setPicker(null),
      reduced ? 0 : PICKER_EXIT,
    );
    return () => window.clearTimeout(timer);
  }, [open, picker, reduced]);

  /** The lifted slab keeps its z-index until the collapse has settled. */
  useEffect(() => {
    if (open !== null || lifted === null) return;
    const timer = window.setTimeout(
      () => setLifted(null),
      reduced ? 0 : CARD_SETTLE,
    );
    return () => window.clearTimeout(timer);
  }, [open, lifted, reduced]);

  /** Closing always returns focus to the coin that opened the picker. */
  useEffect(() => {
    if (open !== null) return;
    const index = focusReturn.current;
    if (index === null) return;
    focusReturn.current = null;
    coinRefs.current[index]?.focus({ preventScroll: true });
  }, [open]);

  /** Opening moves focus to the currently selected row. */
  useEffect(() => {
    if (open === null) return;
    const selected = pair[open];
    const node = rowRefs.current[selected] ?? rowRefs.current[list[0].sym];
    node?.focus({ preventScroll: true });
  }, [open, pair, list]);

  /** Escape closes only the picker, exactly like the source. */
  useEffect(() => {
    if (open === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      focusReturn.current = open;
      setOpen(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function openPicker(index: number) {
    if (open !== null) return;
    setOpen(index);
    setLifted(index);
    setPicker(index);
    playCue("expand");
  }

  function closePicker() {
    if (open === null) return;
    focusReturn.current = open;
    setOpen(null);
  }

  function choose(sym: string) {
    if (open === null) return;
    const slot = open;
    const other = 1 - slot;

    setPair((current) => {
      const next = [current[0], current[1]];
      // Picking the coin already on the other slab swaps the pair, so a pair
      // can never show the same symbol twice.
      if (next[other] === sym) next[other] = current[slot];
      next[slot] = sym;
      return next;
    });

    focusReturn.current = slot;
    setOpen(null);
    playCue("pop");
  }

  function flip() {
    if (lifted !== null) return;
    setTurns((current) => current + 1);
    playCue("swoop");
  }

  return (
    <div className="w-full">
      <div className="swp-stage flex w-full justify-center rounded-[28px] bg-[#f1f2f2] px-5 py-10 dark:bg-[#141414]">
        <style>{ASSET_SWAP_CSS}</style>

        <div className="swp" data-reduced={reduced ? "true" : undefined}>
          {pair.map((sym, index) => {
            const asset = BY_SYM[sym];
            const side = sides[index];
            const isOpen = open === index;
            const collapsed = open !== null && !isOpen;
            const showingPicker = picker === index;
            const label = index === payer ? "You pay" : "You receive";

            return (
              <div
                key={index}
                className="swp-card"
                data-open={isOpen ? "" : undefined}
                data-lifted={lifted === index ? "" : undefined}
                data-collapsed={collapsed ? "" : undefined}
                aria-hidden={collapsed || undefined}
                style={
                  {
                    "--swp-top": `${index * CARD_STRIDE}px`,
                    transformOrigin: index === 0 ? "50% 0%" : "50% 100%",
                  } as CSSProperties
                }
                role={isOpen ? "dialog" : undefined}
                aria-label={isOpen ? `${label}: choose a coin` : undefined}
              >
                <div
                  className="swp-face"
                  data-hidden={isOpen ? "" : undefined}
                  aria-hidden={isOpen || undefined}
                  style={index === 0 ? { top: 0 } : { bottom: 0 }}
                >
                  <span className="swp-label">{label}</span>
                  <span className="swp-amount">{side.amount}</span>
                  <span className="swp-fiat">{side.fiat}</span>

                  <button
                    type="button"
                    className="swp-coin"
                    ref={(node) => {
                      coinRefs.current[index] = node;
                    }}
                    onClick={() => openPicker(index)}
                    tabIndex={open === null ? 0 : -1}
                    aria-label={`${asset.name}. Choose another coin`}
                  >
                    <AssetMark sym={sym} size={22} className="swp-logo" />
                    {asset.sym}
                  </button>
                </div>

                {showingPicker ? (
                  <div
                    className="swp-pick"
                    data-leaving={open === null ? "" : undefined}
                    aria-hidden={open === null || undefined}
                  >
                    <div className="swp-pick-head">
                      <span>{label}</span>
                      <button
                        type="button"
                        className="swp-pick-x"
                        onClick={closePicker}
                        tabIndex={open === null ? -1 : 0}
                        aria-label="Close"
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    {list.map((option) => {
                      const selected = pair[index] === option.sym;
                      return (
                        <button
                          key={option.sym}
                          type="button"
                          className="swp-pick-row"
                          ref={(node) => {
                            rowRefs.current[option.sym] = node;
                          }}
                          onClick={() => choose(option.sym)}
                          tabIndex={open === null ? -1 : 0}
                          aria-pressed={selected}
                        >
                          <AssetMark
                            sym={option.sym}
                            size={24}
                            className="swp-logo"
                          />
                          <span className="swp-pick-sym">{option.sym}</span>
                          <span className="swp-pick-name">{option.name}</span>
                          {selected ? <CheckIcon /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          <button
            type="button"
            className="swp-flip"
            data-dimmed={lifted !== null ? "" : undefined}
            onClick={flip}
            tabIndex={lifted === null ? 0 : -1}
            aria-label={`Paying ${pair[payer]} for ${pair[1 - payer]}. Reverse`}
          >
            <span
              className="swp-flip-arrow"
              style={{ transform: `rotate(${turns * 180}deg)` }}
            >
              <ArrowDownIcon />
            </span>
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>
      <p className="sr-only">
        Press the arrow to reverse which asset you pay. Press either coin to
        choose a different asset.
      </p>
    </div>
  );
}
