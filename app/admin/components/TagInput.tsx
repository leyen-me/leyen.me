"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  addTags,
  filterTagSuggestions,
  isNewTag,
  normalizeTags,
  removeTag,
  splitTagInput,
} from "@/lib/admin/tags";
import { cn } from "@/lib/utils";

type TagInputProps = {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  /** Existing tags fetched from the CMS, offered as suggestions. */
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
};

/**
 * Chip-style tag picker: choose an existing tag or type a new one.
 *
 * Keyboard: ↑/↓ to move, Enter to add the highlighted (or typed) tag,
 * Backspace on an empty field to remove the last chip.
 */
export default function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
  placeholder = "输入标签后回车添加",
  maxTags,
  disabled = false,
}: TagInputProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // CMS payloads and stale in-flight state may hand us a string instead of an array.
  const tags = useMemo(() => normalizeTags(value), [value]);
  const reachedMax = maxTags !== undefined && tags.length >= maxTags;

  const options = useMemo(
    () => filterTagSuggestions(suggestions, tags, draft),
    [suggestions, tags, draft]
  );

  const canCreate = !reachedMax && isNewTag(tags, draft);

  useEffect(() => {
    setActiveIndex(-1);
  }, [draft, open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const visible = open && (options.length > 0 || canCreate);

  function commit(raw: string) {
    const next = addTags(tags, splitTagInput(raw), maxTags);
    if (next.length !== tags.length) {
      onChange(next);
    }
    setDraft("");
    setOpen(true);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === "，") {
      event.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) {
        commit(options[activeIndex]);
      } else if (draft.trim()) {
        commit(draft);
      }
      return;
    }

    if (event.key === "Backspace" && !draft && tags.length > 0) {
      event.preventDefault();
      onChange(removeTag(tags, tags[tags.length - 1]));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const total = options.length + (canCreate ? 1 : 0);
      if (total === 0) return;
      setActiveIndex((prev) => (prev + 1) % total);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const total = options.length + (canCreate ? 1 : 0);
      if (total === 0) return;
      setActiveIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const createIndex = options.length;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm ring-offset-white focus-within:ring-2 focus-within:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-900",
          disabled && "pointer-events-none opacity-50"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange(removeTag(tags, tag));
              }}
              className="rounded-full p-0.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-zinc-50"
              aria-label={`移除标签 ${tag}`}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}

        <input
          id={id}
          ref={inputRef}
          role="combobox"
          aria-expanded={visible}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && activeIndex < options.length
              ? `${listboxId}-option-${activeIndex}`
              : activeIndex === createIndex
                ? `${listboxId}-create`
                : undefined
          }
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled || reachedMax}
          autoComplete="off"
          className="h-7 min-w-[7rem] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed dark:placeholder:text-zinc-500"
        />
      </div>

      {visible && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="标签建议"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {options.map((option, index) => (
            <li
              key={option}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(option)}
                className={cn(
                  "flex w-full items-center px-3 py-1.5 text-left text-sm",
                  index === activeIndex
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-700 dark:text-zinc-300"
                )}
              >
                {option}
              </button>
            </li>
          ))}

          {canCreate && (
            <li id={`${listboxId}-create`} role="option" aria-selected={activeIndex === createIndex}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(createIndex)}
                onClick={() => commit(draft)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                  activeIndex === createIndex
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-700 dark:text-zinc-300"
                )}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                新增「{draft.trim()}」
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
