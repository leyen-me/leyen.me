"use client";

import { useId, useState } from "react";
import LabelInput, { type LabelInputField } from "./label-input";
import { LABEL_INPUT_CSS } from "./label-input-css";

/*
 * A 1:1 port of Bencho's "Label input" block: the 280 x 52 outline is always
 * whole, focus only darkens it and parts the top line from the middle, and
 * the label lifts 26 px at 0.78 scale while a 24 ms-per-letter hop travels
 * along it. The `corner` and `field` parameters stay reachable below.
 *
 * Validation, the character count and the focus-visible ring are gallery
 * additions. Bencho's block is a single field with no form semantics, so the
 * hint and count sit under the stage without changing its geometry.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LENGTH = 64;
const CORNERS = [0, 12, 20, 26] as const;

const SEGMENT =
  "inline-flex min-h-8 items-center justify-center rounded-full px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-zinc-900";
const ACTIVE =
  "bg-white text-zinc-900 shadow-sm dark:bg-[#262626] dark:text-white";
const IDLE =
  "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white";

type Status = "idle" | "pending" | "success" | "error";

export default function Demo() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const hintId = `lbi-hint-${uid}`;
  const countId = `lbi-count-${uid}`;

  const [field, setField] = useState<LabelInputField>("Email");
  const [corner, setCorner] = useState(20);
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);

  const filled = value.length > 0;
  const valid = field === "Email" ? EMAIL.test(value) : value.length >= 8;
  const status: Status = !filled
    ? "idle"
    : valid
      ? "success"
      : touched
        ? "error"
        : "pending";

  const message =
    field === "Email"
      ? status === "idle"
        ? "聚焦后标签上浮，顶部描边从中间裂开。"
        : status === "success"
          ? "邮箱格式有效。"
          : status === "error"
            ? "邮箱格式不完整，请检查 @ 与域名。"
            : "继续补全邮箱地址。"
      : status === "idle"
        ? "聚焦后标签上浮，顶部描边从中间裂开。"
        : status === "success"
          ? "长度足够。"
          : status === "error"
            ? "密码至少需要 8 个字符。"
            : "继续输入，至少 8 个字符。";

  const dot =
    status === "error"
      ? "bg-rose-500"
      : status === "success"
        ? "bg-emerald-500"
        : status === "pending"
          ? "bg-zinc-400 dark:bg-zinc-500"
          : "bg-zinc-300 dark:bg-zinc-600";

  function changeField(next: LabelInputField) {
    if (next === field) return;
    setField(next);
    setValue("");
    setTouched(false);
    setShow(false);
  }

  return (
    <div className="lbi-demo w-full max-w-[340px]">
      <style dangerouslySetInnerHTML={{ __html: LABEL_INPUT_CSS }} />

      <div className="rounded-2xl border border-zinc-200/80 bg-[#f7f7f6] px-4 pb-4 pt-6 dark:border-zinc-800 dark:bg-[#0a0a0a]">
        <div className="flex justify-center">
          <LabelInput
            field={field}
            corner={corner}
            value={value}
            onChange={setValue}
            onBlur={() => setTouched(true)}
            show={show}
            onToggleShow={() => setShow((current) => !current)}
            invalid={status === "error"}
            describedBy={`${hintId} ${countId}`}
            maxLength={MAX_LENGTH}
          />
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-[280px] items-start gap-2">
          <span
            aria-hidden="true"
            className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${dot}`}
          />
          <p
            id={hintId}
            role="status"
            aria-live="polite"
            data-state={status}
            className={`lbi-hint min-w-0 flex-1 text-[11px] leading-4 ${
              status === "error" || status === "success"
                ? ""
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {message}
          </p>
          <span
            id={countId}
            data-state={status}
            className={`lbi-count shrink-0 pt-px font-mono text-[10px] tabular-nums ${
              status === "error" ? "" : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {value.length}/{MAX_LENGTH}
            <span className="sr-only"> characters</span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <div
          role="group"
          aria-label="Field"
          className="flex items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Field
          </span>
          <div className="flex rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900">
            {(["Email", "Password"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={field === option}
                onClick={() => changeField(option)}
                className={`${SEGMENT} ${field === option ? ACTIVE : IDLE}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div
          role="group"
          aria-label="Corner radius"
          className="flex items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Corner
          </span>
          <div className="flex rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900">
            {CORNERS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={corner === option}
                onClick={() => setCorner(option)}
                className={`${SEGMENT} ${corner === option ? ACTIVE : IDLE}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
