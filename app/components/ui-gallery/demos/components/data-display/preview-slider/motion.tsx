"use client";

/**
 * framer-motion 10's intrinsic component types resolve against its own older
 * React typings, so each element is rebuilt from this repo's React types plus
 * MotionProps. The style key is replaced by MotionStyle inside MotionProps.
 */
import {
  motion,
  type MotionProps,
} from "framer-motion";
import type {
  ComponentType,
  HTMLAttributes,
  ImgHTMLAttributes,
  Ref,
} from "react";

type MotionDivProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> &
  MotionProps & { ref?: Ref<HTMLDivElement> };
type MotionImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "style"> &
  MotionProps & { ref?: Ref<HTMLImageElement> };
type MotionSpanProps = Omit<HTMLAttributes<HTMLSpanElement>, "style"> &
  MotionProps & { ref?: Ref<HTMLSpanElement> };

export const MotionDiv = motion.div as unknown as ComponentType<MotionDivProps>;
export const MotionImg = motion.img as unknown as ComponentType<MotionImgProps>;
export const MotionSpan =
  motion.span as unknown as ComponentType<MotionSpanProps>;
