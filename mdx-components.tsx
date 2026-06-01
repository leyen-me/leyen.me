import type { Components } from "react-markdown";
import {
  getMarkdownComponents,
  markdownComponents,
} from "@/app/components/shared/markdown-components";

export function getMDXComponents(components?: Partial<Components>): Components {
  return getMarkdownComponents(components);
}

export const useMDXComponents = getMDXComponents;

export { markdownComponents };
