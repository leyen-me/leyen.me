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
@keyframes pik-chip-in {
  0% { opacity: 0; transform: translateY(-4px) scale(0.9); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.pik-anim-face { animation: pik-face-in 320ms cubic-bezier(0.24, 1.34, 0.38, 1) both; }
.pik-anim-card { animation: pik-card-in 300ms cubic-bezier(0.24, 1.34, 0.38, 1) both; }
.pik-anim-tick { animation: pik-tick-in 220ms cubic-bezier(0.24, 1.34, 0.38, 1) both; }
.pik-anim-chip { animation: pik-chip-in 240ms cubic-bezier(0.24, 1.34, 0.38, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .pik-anim-face,
  .pik-anim-card,
  .pik-anim-tick,
  .pik-anim-chip { animation: none; }
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
 * it with 48 px people rows, 18 px check boxes and the block's spring cues.
 *
 * The source only toggles the four faces. The gallery adds the search field,
 * removable chips and a real combobox / listbox keyboard flow around that
 * geometry, because a standalone picker has to be filterable and reversible.
 * Faces are initial-and-gradient discs in place of the block's photos.
 */
export default function Demo() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const listId = `pik-list-${uid}`;
  const inputId = `pik-search-${uid}`;
  const optionId = useCallback(
    (id: string) => `pik-opt-${uid}-${id}`,
    [uid],
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string[]>([...INITIAL_IDS]);
  const [live, setLive] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPeople = useMemo(
    () =>
      selected
        .map((id) => PEOPLE_BY_ID.get(id))
        .filter((person): person is Person => Boolean(person)),
    [selected],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return PEOPLE;
    return PEOPLE.filter((person) =>
      `${person.name} ${person.role}`.toLowerCase().includes(term),
    );
  }, [query]);

  const railWidth = selectedPeople.length
    ? FACE + (selectedPeople.length - 1) * FACE_STEP
    : 0;

  useEffect(() => {
    setActive((index) =>
      Math.min(index, Math.max(0, filtered.length - 1)),
    );
  }, [filtered.length]);

  // Opening focuses the filter; the card's 300 ms scale-up stays untouched.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  // Outside pointer closes without stealing focus back.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      setQuery("");
      setActive(0);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const closeAndReturnFocus = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  function openMenu() {
    setOpen(true);
    setActive(0);
  }

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
      if (open) {
        inputRef.current?.focus({ preventScroll: true });
      } else {
        openMenu();
      }
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeAndReturnFocus();
    }
  }

  function handleSearchKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!filtered.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(
        (index) => (index + step + filtered.length) % filtered.length,
      );
      return;
    }

    if ((event.key === "Home" || event.key === "End") && filtered.length) {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : filtered.length - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const person = filtered[Math.min(active, filtered.length - 1)];
      if (person) toggle(person.id);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeAndReturnFocus();
    }
  }

  const activePerson = filtered[Math.min(active, filtered.length - 1)];

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
          onClick={() => {
            if (open) {
              setOpen(false);
              setQuery("");
              setActive(0);
            } else {
              openMenu();
            }
          }}
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

        {selectedPeople.length > 0 ? (
          <ul
            aria-label="Selected assignees"
            className="mt-3 flex flex-wrap gap-1.5"
          >
            {selectedPeople.map((person) => (
              <li
                key={person.id}
                className="pik-anim-chip inline-flex h-7 items-center gap-1.5 rounded-full bg-white pl-1 pr-1 text-[#17181a] ring-1 ring-inset ring-black/[0.08] dark:bg-[#0e0f11] dark:text-[#f4f3f1] dark:ring-white/[0.1]"
              >
                <AssigneeAvatar person={person} size={20} />
                <span className="text-[12px] font-medium leading-none">
                  {person.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${person.name}`}
                  onClick={() => toggle(person.id)}
                  className="relative grid h-5 w-5 place-items-center rounded-full text-[#85847e] transition-colors after:absolute after:-inset-1.5 after:rounded-full after:content-[''] hover:bg-black/[0.06] hover:text-[#17181a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 dark:text-[#828282] dark:hover:bg-white/[0.08] dark:hover:text-white"
                >
                  <svg
                    aria-hidden="true"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <path d="M2 2l6 6M8 2 2 8" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[11px] leading-4 text-[#85847e] dark:text-[#828282]">
            No one assigned yet.
          </p>
        )}

        {open ? (
          <div
            className="pik-anim-card absolute left-0 right-0 z-[1] origin-top-left bg-white ring-1 ring-inset ring-black/[0.08] dark:bg-[#0e0f11] dark:ring-white/[0.1]"
            style={{
              top: CARD_TOP,
              padding: CARD_PAD,
              borderRadius: CORNER,
            }}
          >
            <label htmlFor={inputId} className="sr-only">
              Search assignees
            </label>
            <div className="relative mb-1 flex h-9 items-center rounded-[10px] bg-black/[0.045] focus-within:ring-2 focus-within:ring-emerald-400/60 dark:bg-white/[0.06]">
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="pointer-events-none absolute left-2.5 text-[#85847e] dark:text-[#828282]"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M10.4 10.4 13.6 13.6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={
                  activePerson ? optionId(activePerson.id) : undefined
                }
                autoComplete="off"
                spellCheck={false}
                placeholder="Search people"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={handleSearchKeyDown}
                className="h-full w-full min-w-0 rounded-[10px] bg-transparent pl-7 pr-2 text-[13px] text-[#17181a] outline-none placeholder:text-[#85847e] dark:text-[#f4f3f1] dark:placeholder:text-[#828282]"
              />
            </div>

            <div
              id={listId}
              role="listbox"
              aria-label="Assignees"
              aria-multiselectable="true"
            >
              {filtered.map((person) => {
                const isSelected = selected.includes(person.id);
                return (
                  <button
                    key={person.id}
                    id={optionId(person.id)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
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

            {filtered.length === 0 ? (
              <p
                role="status"
                className="px-2 pb-2 pt-4 text-center text-[12px] text-[#85847e] dark:text-[#828282]"
              >
                No one matches “{query.trim()}”.
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {live}
        </p>
      </div>
    </div>
  );
}
