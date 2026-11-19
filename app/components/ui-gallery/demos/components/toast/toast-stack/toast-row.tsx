"use client";

import { useEffect, useState } from "react";
import { useSpringPose } from "./springs";
import { CloseIcon, ToastIcon } from "./toast-icons";
import {
  closedPose,
  CORNER,
  openPose,
  SHOWN,
  TOAST_HEIGHT,
  type Toast,
  type ToastKind,
} from "./toast-data";

/** Bencho's fixed icon colours; `info` borrows the muted copy token. */
const KIND_COLOR: Record<ToastKind, string> = {
  success: "text-[#1f9d55]",
  error: "text-[#e5484d]",
  warning: "text-[#e09a12]",
  info: "text-[#8a8a8a] dark:text-[#969696]",
};

const EXIT_EASE = "cubic-bezier(0.4,0,1,1)";
const ENTER_EASE = "cubic-bezier(0,0,0.2,1)";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2231dd] focus-visible:ring-offset-0";

type ToastRowProps = {
  toast: Toast;
  /** 0 is the front of the stack. */
  depth: number;
  open: boolean;
  exiting: boolean;
  reduced: boolean;
  onDismiss: (id: number) => void;
  onResolve: (id: number) => void;
};

/**
 * One row of the stack. Its Y/scale come from the shared spring; opacity and
 * the exit slide are CSS so the 220 ms ease-in dismissal stays a tween, exactly
 * as in the source. `entered` flips one frame after mount to trigger the fade.
 */
export function ToastRow({
  toast,
  depth,
  open,
  exiting,
  reduced,
  onDismiss,
  onResolve,
}: ToastRowProps) {
  const front = depth === 0;
  const tucked = !open && !front;
  const target = open ? openPose(depth) : closedPose(depth);
  /** Bencho starts every new row 24 px past the front row's place. */
  const initialY = (open ? openPose(0).y : closedPose(0).y) + 24;
  const pose = useSpringPose(target.y, target.scale, initialY, reduced);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /** Only the front row, or any row while open, is keyboard reachable. */
  const reachable = open || front;
  const content = `transition-opacity duration-[220ms] motion-reduce:transition-none ${
    tucked ? "opacity-0" : "opacity-100"
  }`;

  return (
    <div
      data-kind={toast.kind}
      data-front={front || undefined}
      aria-hidden={tucked || undefined}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: TOAST_HEIGHT,
        zIndex: SHOWN - depth,
        transformOrigin: "50% 0",
        transform: `translateY(${pose.y}px) scale(${pose.scale})`,
      }}
    >
      <div
        className={`h-full w-full transition-[opacity,transform,background-color,box-shadow] duration-[220ms] motion-reduce:transition-none ${
          tucked
            ? "bg-[#f1f1f1] shadow-[0_0_0_1px_rgba(23,24,26,0.06)] dark:bg-[#343434] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
            : "bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.4)] dark:bg-[#262626] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
        }`}
        style={{
          borderRadius: CORNER,
          opacity: exiting || !entered ? 0 : 1,
          transform: exiting ? "translateX(60px)" : "translateX(0px)",
          transitionTimingFunction: exiting ? EXIT_EASE : ENTER_EASE,
        }}
      >
        <div className="flex h-full w-full items-center gap-3 pl-4 pr-3">
          <span
            className={`grid shrink-0 place-items-center ${KIND_COLOR[toast.kind]} ${content}`}
          >
            <ToastIcon kind={toast.kind} />
          </span>

          <span className={`flex min-w-0 flex-1 flex-col gap-[2px] ${content}`}>
            <b className="truncate text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-zinc-900 dark:text-white">
              {toast.title}
            </b>
            <span className="truncate text-[13px] leading-[17px] text-[#8a8a8a] dark:text-[#969696]">
              {toast.body}
            </span>
          </span>

          {toast.action ? (
            <button
              type="button"
              onClick={() => onResolve(toast.id)}
              tabIndex={reachable && !exiting ? 0 : -1}
              className={`h-7 shrink-0 rounded-full bg-[#f1f1f1] px-3 text-[13px] font-medium text-zinc-900 transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] motion-reduce:transition-none dark:bg-[#343434] dark:text-white ${FOCUS_RING} ${content}`}
            >
              {toast.action}
            </button>
          ) : null}

          <button
            type="button"
            aria-label={`Dismiss ${toast.title}`}
            onClick={() => onDismiss(toast.id)}
            tabIndex={reachable && !exiting ? 0 : -1}
            className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#8a8a8a] transition-colors duration-150 after:absolute after:-inset-1 after:content-[''] hover:bg-[#f1f1f1] hover:text-zinc-900 motion-reduce:transition-none dark:text-[#969696] dark:hover:bg-[#343434] dark:hover:text-white ${FOCUS_RING} ${content}`}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
