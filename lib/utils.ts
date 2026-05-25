import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 小写字母开头，仅允许 a-z、0-9、- */
export const SLUG_REGEX = /^[a-z][a-z0-9-]*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

export function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/^[^a-z]+/, "");
}

export function slugify(text: string): string {
  return normalizeSlug(text.toLowerCase().trim().replace(/[\s_]+/g, "-"));
}
