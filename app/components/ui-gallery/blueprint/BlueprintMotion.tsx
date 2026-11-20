"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./BlueprintMotion.module.css";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Ported from coss.com/ui (MIT, © 2025 coss.com and Origin UI).
 * See ./LICENSE for the full license text.
 *
 * Keeps the static drawing in the server markup and only mounts the SMIL
 * animation once the drawing is on screen, so offscreen pages never run it.
 */
export function BlueprintMotion({
  children,
  renderAnimation,
}: {
  children: ReactNode;
  renderAnimation: (paused: boolean) => ReactNode;
}) {
  const drawing = useRef<HTMLDivElement>(null);
  const animation = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const live = hasEntered && !reducedMotion;
  const stopped = !inView || !pageVisible || !live;

  useEffect(() => {
    if (!drawing.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setHasEntered(true);
    });
    observer.observe(drawing.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!live) return;
    const svg = animation.current?.querySelector("svg");
    if (!svg) return;
    // Firefox has no SMIL pause API; animation keeps running there.
    if (typeof svg.pauseAnimations !== "function") return;
    if (stopped) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }, [stopped, live]);

  return (
    <div
      className={`relative w-full select-none ${styles.drawing}`}
      data-live={live || undefined}
      ref={drawing}
    >
      <div className={`pointer-events-none ${styles.original}`}>{children}</div>
      {live && (
        <div
          className={`pointer-events-none absolute inset-0 ${styles.animation}`}
          ref={animation}
        >
          {renderAnimation(stopped)}
        </div>
      )}
    </div>
  );
}
