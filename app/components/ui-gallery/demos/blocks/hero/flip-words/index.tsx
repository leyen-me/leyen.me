"use client";

/**
 * Flip Words — ported from Aceternity UI's component of the same name.
 * Source: https://ui.aceternity.com/components/flip-words
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the full demo sentence, the four cycling words,
 * the 3s cadence, the per-word and per-letter blur/translate entrance, and the
 * blurred scale-up exit.
 * Changed for the gallery: motion/react is replaced by the installed
 * framer-motion; the section fills the ?fill=1 iframe; the cycle timer is
 * cleaned up; and under reduced motion words cross-fade in place instead of
 * flying, blurring or scaling.
 */

import {
  useCallback,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentType,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type MotionProps,
} from "framer-motion";

/**
 * framer-motion 10's intrinsic component types collide with this repo's
 * React 19 typings, so the span is narrowed once here instead of casting at
 * every usage.
 */
const MotionSpan = motion.span as unknown as ComponentType<
  ComponentPropsWithoutRef<"span"> & MotionProps
>;

/**
 * framer-motion's own hook logs a dev warning whenever it detects reduced
 * motion. The demo already switches to opacity-only transitions, so the query
 * is read here and framer's automatic handling is turned off below.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

const WORDS = ["better", "cute", "beautiful", "modern"];
const DURATION = 3000;

type FlipWordsProps = {
  words: string[];
  duration?: number;
};

function FlipWords({ words, duration = DURATION }: FlipWordsProps) {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const startAnimation = useCallback(() => {
    const nextIndex = (words.indexOf(currentWord) + 1) % words.length;
    setCurrentWord(words[nextIndex] ?? words[0]);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (isAnimating) return;
    const timer = window.setTimeout(startAnimation, duration);
    return () => window.clearTimeout(timer);
  }, [duration, isAnimating, startAnimation]);

  return (
    <MotionConfig reducedMotion="never">
      <AnimatePresence onExitComplete={() => setIsAnimating(false)}>
        <MotionSpan
          key={currentWord}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={
            reducedMotion
              ? { opacity: 0, position: "absolute" }
              : {
                  opacity: 0,
                  y: -40,
                  x: 40,
                  filter: "blur(8px)",
                  scale: 2,
                  position: "absolute",
                }
          }
          transition={
            reducedMotion
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 100, damping: 10 }
          }
          className="relative z-10 inline-block px-2 text-left text-neutral-900 dark:text-neutral-100"
        >
          {currentWord.split(" ").map((word, wordIndex) => (
            <MotionSpan
              key={`${word}-${wordIndex}`}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, filter: "blur(8px)" }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              transition={{
                delay: reducedMotion ? 0 : wordIndex * 0.3,
                duration: reducedMotion ? 0.2 : 0.3,
              }}
              className="inline-block whitespace-nowrap"
            >
              {word.split("").map((letter, letterIndex) => (
                <MotionSpan
                  key={`${letter}-${letterIndex}`}
                  initial={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 10, filter: "blur(8px)" }
                  }
                  animate={
                    reducedMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  transition={{
                    delay: reducedMotion
                      ? 0
                      : wordIndex * 0.3 + letterIndex * 0.05,
                    duration: reducedMotion ? 0.2 : 0.2,
                  }}
                  className="inline-block"
                >
                  {letter}
                </MotionSpan>
              ))}
              <span className="inline-block">&nbsp;</span>
            </MotionSpan>
          ))}
        </MotionSpan>
      </AnimatePresence>
    </MotionConfig>
  );
}

export default function Demo() {
  return (
    <section className="flex h-full min-h-[600px] w-full items-center justify-center overflow-hidden bg-white px-6 py-16 dark:bg-zinc-950">
      <h1 className="mx-auto font-normal tracking-tight text-neutral-600 dark:text-neutral-400">
        <span className="block text-4xl leading-tight sm:text-5xl md:text-6xl">
          Build
          <FlipWords words={WORDS} />
          <br />
          websites with Aceternity UI
        </span>
      </h1>
    </section>
  );
}
