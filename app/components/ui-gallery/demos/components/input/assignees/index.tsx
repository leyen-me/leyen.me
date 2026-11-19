"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import AssigneeAvatar from "./assignee-avatar";
import { PEOPLE, PEOPLE_BY_ID, type Person } from "./people";

/* ── Bencho's numbers, unchanged ────────────────────────────
   44 px pill, 28 px faces overlapping by 10, the card 54 px below the
   trigger with 8 px inner padding, 48 px rows and an 18 px check box.
   CORNER is the block's `corner` param default of 20; rows use corner − 6. */
const PILL_HEIGHT = 44;
const FACE = 28;
const FACE_OVERLAP = 10;
const FACE_STEP = FACE - FACE_OVERLAP;
const CARD_TOP = 54;
const CARD_PAD = 8;
const ROW_HEIGHT = 48;
const ROW_AVATAR = 32;
const MARK = 18;
const CORNER = 20;
const ROW_RADIUS = 14;

/** Seed selection from the block: Adam and Priya. */
const INITIAL_IDS = ["kai", "mara"] as const;

const KEYFRAMES = `
@keyframes pik-face-in {
  0% { opacity: 0; transform: translateY(-10px) scale(0.2) rotate(-22deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
}
@keyframes pik-card-in {
  0% { opacity: 0; transform: translateY(-10px) scale(0.86, 0.72); }
  100% { opacity: 1; transform: translateY(0) scale(1, 1); }
}
@keyframes pik-tick-in {
  0% { opacity: 0; transform: scale(0.4); }
  70% { transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
.pik-anim-face { animation: pik-face-in 320ms cubic-bezier(0.24, 1.34, 0.38, 1) both; }
.pik-anim-card { animation: pik-card-in 300ms cubic-bezier(0.24, 1.34, 0.38, 1) both; }
.pik-anim-tick { animation: pik-tick-in 220ms cubic-bezier(0.24, 1.34, 0.38, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .pik-anim-face,
  .pik-anim-card,
  .pik-anim-tick { animation: none; }
  .pik-move { transition: none; }
}
`;

const pillClass =
  "group z-[2] inline-flex h-11 items-center gap-3 bg-white pl-2 pr-3 text-[14px] font-medium tracking-[-0.01em] text-[#17181a] ring-1 ring-inset ring-black/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/45 dark:bg-[#0e0f11] dark:text-[#f4f3f1] dark:ring-white/[0.1] dark:focus-visible:ring-white/45";

const rowClass =
  "flex h-12 w-full items-center gap-3 rounded-[14px] px-2 text-left text-[#17181a] transition-colors hover:bg-black/[0.06] focus-visible:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/60 dark:text-[#f4f3f1] dark:hover:bg-white/[0.06] dark:focus-visible:bg-white/[0.06]";

/**
 * A 1:1 port of Bencho's "Assignees" picker (slug `picker`): a 44 px pill whose
 * avatar rail widens by one face-step per person, and a card that unfolds below
 * it with 48 px people rows and 18 px check boxes. The source has no search
 * field or removable chips; the four gradient faces are self-contained
 * replacements for the block's photographs.
 */
export default function Demo() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const listId = `pik-list-${uid}`;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([...INITIAL_IDS]);
  const [live, setLive] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedPeople = useMemo(
    () =>
      selected
        .map((id) => PEOPLE_BY_ID.get(id))
        .filter((person): person is Person => Boolean(person)),
    [selected],
  );

  const railWidth = selectedPeople.length
    ? FACE + (selectedPeople.length - 1) * FACE_STEP
    : 0;

  // Outside pointer closes without stealing focus back.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const closeAndReturnFocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  function toggle(id: string) {
    const person = PEOPLE_BY_ID.get(id);
    const wasSelected = selected.includes(id);

    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

    if (person) {
      setLive(`${person.name} ${wasSelected ? "removed" : "assigned"}`);
    }
  }

  function handleTriggerKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeAndReturnFocus();
    }
  }

  return (
    <div className="flex w-full justify-center">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div ref={rootRef} className="relative h-[320px] w-[264px]">
        <button
          ref={triggerRef}
          type="button"
          className={pillClass}
          style={{ height: PILL_HEIGHT, borderRadius: CORNER }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={
            selectedPeople.length
              ? `Assignees, ${selectedPeople.length} selected`
              : "Assignees, unassigned"
          }
          onClick={() => setOpen((value) => !value)}
          onKeyDown={handleTriggerKeyDown}
        >
          <span
            aria-hidden="true"
            className="pik-move relative h-7 flex-none transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: railWidth }}
          >
            {selectedPeople.map((person, index) => (
              <span
                key={person.id}
                className="pik-move absolute top-0 transition-[left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  left: index * FACE_STEP,
                  zIndex: PEOPLE.length - index,
                }}
              >
                <span
                  className="pik-anim-face block"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <AssigneeAvatar
                    person={person}
                    size={FACE}
                    className="ring-2 ring-white dark:ring-[#0e0f11]"
                  />
                </span>
              </span>
            ))}
          </span>

          {selectedPeople.length === 0 ? (
            <span className="-ml-1.5 whitespace-nowrap">Unassigned</span>
          ) : null}

          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`-ml-0.5 flex-none text-[#6f6e68] transition-[transform,color] duration-200 group-hover:text-[#3c3b37] dark:text-[#828282] dark:group-hover:text-[#b4b4b4] ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M4 6.5 8 10.5 12 6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open ? (
          <div
            className="pik-anim-card absolute left-0 right-0 z-[1] origin-top-left bg-white shadow-[0_14px_34px_-18px_rgba(23,24,26,0.4)] ring-1 ring-inset ring-black/[0.08] dark:bg-[#0e0f11] dark:shadow-[0_14px_34px_-18px_rgba(0,0,0,0.8)] dark:ring-white/[0.1]"
            style={{
              top: CARD_TOP,
              padding: CARD_PAD,
              borderRadius: CORNER,
            }}
          >
            <div
              id={listId}
              role="listbox"
              aria-label="Assignees"
              aria-multiselectable="true"
            >
              {PEOPLE.map((person) => {
                const isSelected = selected.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(person.id)}
                    className={rowClass}
                    style={{ height: ROW_HEIGHT, borderRadius: ROW_RADIUS }}
                  >
                    <AssigneeAvatar person={person} size={ROW_AVATAR} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[13px] leading-4">
                        {person.name}
                      </span>
                      <span className="text-[11px] leading-[14px] text-[#85847e] dark:text-[#9a9a9a]">
                        {person.role}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid shrink-0 place-items-center rounded-md ring-[1.5px] ring-inset transition-colors ${
                        isSelected
                          ? "bg-[#17181a] ring-[#17181a] dark:bg-[#f4f3f1] dark:ring-[#f4f3f1]"
                          : "ring-black/[0.22] dark:ring-white/[0.22]"
                      }`}
                      style={{ width: MARK, height: MARK }}
                    >
                      {isSelected ? (
                        <span className="pik-anim-tick block text-white dark:text-[#0e0f11]">
                          <svg
                            aria-hidden="true"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M3 7.4 5.7 10 11 4.4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {live}
        </p>
      </div>
    </div>
  );
}
