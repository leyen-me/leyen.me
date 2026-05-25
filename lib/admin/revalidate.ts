import { revalidateTag } from "next/cache";

export function revalidateContentType(tag: string) {
  revalidateTag(tag);
}
