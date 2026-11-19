"use client";

import { useId, useState } from "react";
import LabelInput from "./label-input";
import { LABEL_INPUT_CSS } from "./label-input-css";

/*
 * A 1:1 port of Bencho's "Label input" block. The 280 x 52 outline stays
 * whole; focus darkens it and parts the top line from the middle, while the
 * label lifts 26 px at 0.78 scale with a 24 ms-per-letter hop.
 *
 * The field is fixed to the block's default Email type and 20 px corner.
 * Validation and the character count are gallery additions.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LENGTH = 64;

type Status = "idle" | "pending" | "success" | "error";

export default function Demo() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const hintId = `lbi-hint-${uid}`;
  const countId = `lbi-count-${uid}`;

  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [show, setShow] = useState(false);

  const filled = value.length > 0;
  const valid = EMAIL.test(value);
  const status: Status = !filled
    ? "idle"
    : valid
      ? "success"
      : touched
        ? "error"
        : "pending";

  const message =
    status === "idle"
      ? ""
      : status === "success"
        ? "邮箱格式有效。"
        : status === "error"
          ? "邮箱格式不完整，请检查 @ 与域名。"
          : "继续补全邮箱地址。";

  const dot =
    status === "error"
      ? "bg-rose-500"
      : status === "success"
        ? "bg-emerald-500"
        : "bg-zinc-400 dark:bg-zinc-500";

  return (
    <div className="lbi-demo w-full max-w-[340px]">
      <style dangerouslySetInnerHTML={{ __html: LABEL_INPUT_CSS }} />

      <div className="px-4 pb-4 pt-6">
        <div className="flex justify-center">
          <LabelInput
            field="Email"
            corner={20}
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
          {status === "idle" ? null : (
            <>
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
            </>
          )}
          {status === "idle" ? <span id={hintId} className="sr-only" /> : null}
          <span
            id={countId}
            data-state={status}
            className={`ml-auto shrink-0 pt-px font-mono text-[10px] tabular-nums ${
              status === "error" ? "" : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {value.length}/{MAX_LENGTH}
            <span className="sr-only"> characters</span>
          </span>
        </div>
      </div>
    </div>
  );
}
