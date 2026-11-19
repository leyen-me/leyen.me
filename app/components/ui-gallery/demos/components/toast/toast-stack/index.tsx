"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "./springs";
import { ToastRow } from "./toast-row";
import {
  EXIT_MS,
  PRESETS,
  SHOWN,
  STACK_HEIGHT,
  TOAST_WIDTH,
  type Toast,
} from "./toast-data";

function createInitialToasts(): Toast[] {
  return PRESETS.slice(0, SHOWN).map((toast, id) => ({ ...toast, id }));
}

/**
 * A 1:1 port of Bencho's "Toast stack" block.
 *
 * Three toasts rest as a centred pile; pointing at the region (or moving focus
 * into it) fans them into a list with one spring each. Dismissing a row tweens
 * it out to the right, then swaps in the next toast from the block's cycle at
 * the front, so the new arrival springs down from above. `Retry` resolves the
 * declined payment in place.
 *
 * The source's four Web Audio cues and framer-motion are not ported; the same
 * spring is integrated in `springs.ts`, matching the rest of this gallery. Its
 * white pane edge (40% in light, 20% in dark) is kept, and the demo sits on the
 * light surface Bencho stages the block on so the front row stays legible.
 */
export default function ToastStack() {
  const reduced = useReducedMotion();
  const [toasts, setToasts] = useState<Toast[]>(createInitialToasts);
  const [exitingId, setExitingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const timers = useRef<number[]>([]);
  const nextIndex = useRef(SHOWN);

  useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
    },
    [],
  );

  const dismiss = useCallback(
    (id: number) => {
      if (exitingId !== null) return;
      const toast = toasts.find((entry) => entry.id === id);
      setExitingId(id);

      const timer = window.setTimeout(() => {
        timers.current = timers.current.filter((entry) => entry !== timer);
        const index = nextIndex.current;
        nextIndex.current += 1;
        const next = PRESETS[index % PRESETS.length];
        setToasts((current) => [
          { ...next, id: index },
          ...current.filter((entry) => entry.id !== id),
        ]);
        setExitingId(null);
        setAnnouncement(
          `${toast?.title ?? "Notification"} dismissed. ${next.title} arrived.`,
        );
      }, EXIT_MS);

      timers.current.push(timer);
    },
    [exitingId, toasts],
  );

  const resolve = useCallback((id: number) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              kind: "success",
              title: "Payment complete",
              body: "Your card was charged.",
              action: undefined,
            }
          : toast,
      ),
    );
    setAnnouncement("Payment complete. Your card was charged.");
  }, []);

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[340px] p-5">
        <div
          role="region"
          aria-label="Notifications"
          data-open={open || undefined}
          className="relative mx-auto"
          style={
            {
              width: TOAST_WIDTH,
              height: STACK_HEIGHT,
              maxWidth: "100%",
            } as CSSProperties
          }
          onPointerOver={() => {
            if (!open) setOpen(true);
          }}
          onPointerOut={(event) => {
            const next = event.relatedTarget;
            if (next instanceof Node && event.currentTarget.contains(next))
              return;
            // Keep the stack open while focus is inside, so a tucked row can
            // never become aria-hidden around the focused button.
            const active = document.activeElement;
            if (active instanceof Node && event.currentTarget.contains(active))
              return;
            setOpen(false);
          }}
          onPointerCancel={() => setOpen(false)}
          onFocus={() => {
            if (!open) setOpen(true);
          }}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (next instanceof Node && event.currentTarget.contains(next))
              return;
            setOpen(false);
          }}
        >
          {toasts.map((toast, depth) => (
            <ToastRow
              key={toast.id}
              toast={toast}
              depth={depth}
              open={open}
              exiting={exitingId === toast.id}
              reduced={reduced}
              onDismiss={dismiss}
              onResolve={resolve}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
      </div>
    </div>
  );
}
