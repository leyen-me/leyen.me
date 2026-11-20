"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  AnimatePresence,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { MotionDiv, MotionImg, MotionSpan } from "./motion";
import {
  BUBBLE_WIDTH,
  LEVELS,
  PREVIEW_HEIGHT,
  TICKS,
  TRACK_HEIGHT,
} from "./levels";

type GooFilterIdProps = {
  gooId: string;
  shiverId: string;
  turbulenceRef: RefObject<SVGFETurbulenceElement | null>;
  displacementRef: RefObject<SVGFEDisplacementMapElement | null>;
};

/** Both SVG filters from the source, inlined once per demo instance. */
export function GooFilters({
  gooId,
  shiverId,
  turbulenceRef,
  displacementRef,
}: GooFilterIdProps) {
  return (
    <svg aria-hidden="true" className="absolute h-0 w-0">
      <filter id={gooId}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" result="shape" />
        <feMorphology in="goo" operator="dilate" radius="1" result="grown" />
        <feFlood style={{ floodColor: "var(--ps-ring)" }} result="ink" />
        <feComposite in="ink" in2="grown" operator="in" result="ring" />
        <feMerge>
          <feMergeNode in="ring" />
          <feMergeNode in="shape" />
        </feMerge>
      </filter>
      <filter id={shiverId} x="-2%" y="-20%" width="104%" height="140%">
        <feTurbulence
          ref={turbulenceRef}
          type="turbulence"
          baseFrequency="0.015 0.28"
          numOctaves="1"
          seed="0"
          result="noise"
        />
        <feDisplacementMap
          ref={displacementRef}
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

export function Ticks({ reduced }: { reduced: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 inset-y-0 grid items-center"
      style={{ gridTemplateColumns: `repeat(${TICKS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: TICKS }, (_, index) => (
        <MotionSpan
          key={`${TICKS}-${index}`}
          className="mx-auto h-3 w-px rounded-full bg-neutral-900 dark:bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          transition={
            reduced
              ? { duration: 0 }
              : { delay: index * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }
          }
        />
      ))}
    </div>
  );
}

/** The label rolls toward the side the level moved: masked, blurred, 220 ms. */
export function SliderLabel({
  index,
  reduced,
}: {
  index: number;
  reduced: boolean;
}) {
  const lastIndex = useRef(index);
  const direction = index >= lastIndex.current ? 1 : -1;
  const label = LEVELS[index]?.label ?? "";

  useEffect(() => {
    lastIndex.current = index;
  }, [index]);

  const variants: Variants = reduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (move: number) => ({
          y: `${move * 100}%`,
          opacity: 0,
          filter: "blur(2px)",
        }),
        center: { y: "0%", opacity: 1, filter: "blur(0px)" },
        exit: (move: number) => ({
          y: `${-move * 100}%`,
          opacity: 0,
          filter: "blur(2px)",
        }),
      };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-full mt-3 flex justify-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
    >
      <span
        className="relative inline-flex justify-center whitespace-nowrap py-1.5 leading-none"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <MotionSpan
            key={label}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: reduced ? 0.1 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {label}
          </MotionSpan>
        </AnimatePresence>
      </span>
    </div>
  );
}

type PreviewBubbleProps = {
  visible: boolean;
  index: number;
  reduced: boolean;
  left: MotionValue<string>;
  tilt: MotionValue<number>;
  scale: MotionValue<number>;
  overshoot: MotionValue<number>;
};

/** The floating capsule preview. Its goo merge with the tray happens one
 *  level up, on the filtered container that wraps both. */
export function PreviewBubble({
  visible,
  index,
  reduced,
  left,
  tilt,
  scale,
  overshoot,
}: PreviewBubbleProps) {
  const variants: Variants = reduced
    ? {
        hidden: { opacity: 0, y: -36, transition: { duration: 0.15 } },
        shown: { opacity: 1, y: -36, transition: { duration: 0.15 } },
      }
    : {
        hidden: {
          y: TRACK_HEIGHT / 2,
          scaleX: 0.6,
          scaleY: 0.6,
          transition: { duration: 0.28, ease: [0.55, 0, 0.75, 0.2] },
        },
        shown: {
          y: -36,
          scaleX: [0.6, 0.82, 1],
          scaleY: [0.6, 1.18, 1],
          transition: {
            y: { type: "spring", duration: 0.8, bounce: 0.25 },
            scaleX: { duration: 0.6, times: [0, 0.45, 1], ease: "easeOut" },
            scaleY: { duration: 0.6, times: [0, 0.45, 1], ease: "easeOut" },
          },
        },
      };

  return (
    <MotionDiv
      className="absolute bottom-0 h-8"
      style={{ left: 24, right: 24, x: overshoot }}
    >
      <AnimatePresence>
        {visible ? (
          <MotionDiv
            key="bubble"
            className="absolute bottom-1/2 origin-bottom"
            style={{
              left,
              x: "-50%",
              rotate: tilt,
              scale,
              width: BUBBLE_WIDTH,
              height: PREVIEW_HEIGHT,
            }}
            initial="hidden"
            animate="shown"
            exit="hidden"
          >
            <MotionDiv
              className="absolute inset-x-0 bottom-0 rounded-full bg-surface-0"
              style={{ height: BUBBLE_WIDTH }}
              variants={variants}
            >
              <MotionDiv
                className="absolute inset-1 overflow-hidden rounded-full bg-surface-2"
                variants={{
                  hidden: { opacity: 0, transition: { duration: 0.08 } },
                  shown: { opacity: 1, transition: { duration: 0.12 } },
                }}
              >
                {LEVELS.map((level, levelIndex) => (
                  <MotionImg
                    key={level.label}
                    src={level.image.src}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={false}
                    animate={
                      levelIndex === index
                        ? { opacity: 1, scale: 1, filter: "blur(0px)", zIndex: 1 }
                        : reduced
                          ? { opacity: 0, zIndex: 0 }
                          : { opacity: 0, scale: 1.12, filter: "blur(6px)", zIndex: 0 }
                    }
                    transition={{
                      duration: reduced ? 0.2 : 0.45,
                      ease: [0.22, 1, 0.36, 1],
                      opacity: {
                        duration: levelIndex === index ? 0.35 : 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      },
                      zIndex: { duration: 0 },
                    }}
                  />
                ))}
              </MotionDiv>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </MotionDiv>
  );
}
