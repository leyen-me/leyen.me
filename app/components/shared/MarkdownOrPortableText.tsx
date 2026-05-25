import { PortableText, PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { MdxMarkdownBody } from "@/app/components/shared/MdxMarkdownBody";
import { CustomPortableText } from "@/app/components/shared/CustomPortableText";

type MarkdownOrPortableTextProps = {
  value: unknown;
  components?: PortableTextComponents;
};

function isPortableText(value: unknown): value is PortableTextBlock[] {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === "object";
}

export async function MarkdownOrPortableText({
  value,
  components = CustomPortableText,
}: MarkdownOrPortableTextProps) {
  if (typeof value === "string" && value.trim()) {
    return <MdxMarkdownBody markdown={value} />;
  }

  if (isPortableText(value)) {
    return <PortableText value={value} components={components} />;
  }

  return null;
}
