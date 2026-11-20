import type { ReactNode } from "react";
import {
  morphCycleDuration,
  morphHoldDuration,
  morphKeyTimes,
  morphStageDuration,
} from "./timing";

/**
 * Ported from coss.com/ui (MIT, © 2025 coss.com and Origin UI).
 * See ./LICENSE for the full license text.
 */
export function ConstructionMotion({
  attributeName,
  delay = 0.12,
  duration = 0.68,
  from,
  stage,
  to,
  type,
}: {
  attributeName: string;
  delay?: number;
  duration?: number;
  from: string | number;
  stage: number;
  to: string | number;
  type?: "rotate";
}) {
  const timing = {
    attributeName,
    begin: `${stage * morphStageDuration}s`,
    calcMode: "spline" as const,
    dur: `${morphCycleDuration}s`,
    keySplines: "0 0 1 1;0.22 0 0.12 1;0 0 1 1;0 0 1 1;0 0 1 1",
    keyTimes: morphKeyTimes(
      0,
      delay,
      delay + duration,
      2.45,
      2.5,
      morphCycleDuration
    ),
    repeatCount: "indefinite" as const,
    values: [from, from, to, to, from, from].join(";"),
  };

  return type ? (
    <animateTransform {...timing} type={type} />
  ) : (
    <animate {...timing} />
  );
}

export function ConstructionAnnotation({
  children,
  stage,
}: {
  children: ReactNode;
  stage: number;
}) {
  return (
    <g opacity="0">
      <ConstructionMotion
        attributeName="opacity"
        delay={0.78}
        duration={0.16}
        from={0}
        stage={stage}
        to={1}
      />
      {children}
    </g>
  );
}

export function ConstructionStage({
  children,
  stage,
}: {
  children: ReactNode;
  stage: number;
}) {
  return (
    <g opacity="0">
      <animate
        attributeName="opacity"
        begin={`${stage * morphStageDuration}s`}
        dur={`${morphCycleDuration}s`}
        keyTimes={morphKeyTimes(
          0,
          0.18,
          2.2,
          morphHoldDuration,
          morphCycleDuration
        )}
        repeatCount="indefinite"
        values="0;1;1;0;0"
      />
      {children}
    </g>
  );
}
