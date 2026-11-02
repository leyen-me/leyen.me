import "server-only";

type SanityMutationError = {
  details?: {
    items?: Array<{
      error?: { type?: string; description?: string; referenceID?: string };
    }>;
    description?: string;
  };
};

/**
 * Sanity refuses to write a document that references an asset which no longer
 * exists (typically an upload that was removed while the editor was open).
 * Surface it as a fixable, user-facing problem instead of a generic 500.
 */
export function getMissingReferenceMessage(error: unknown): string | null {
  const details = (error as SanityMutationError | undefined)?.details;
  if (!details) return null;

  const missing = details.items?.find(
    (item) => item?.error?.type === "documentReferenceDoesNotExistError"
  );

  if (!missing) {
    const generic = details.description?.includes("references non-existent document");
    return generic ? "关联的内容已不存在，请重新选择后再保存" : null;
  }

  const referenceId = missing.error?.referenceID ?? "";
  if (referenceId.startsWith("image-")) {
    return "封面图引用的图片已不存在（可能已被删除），请重新选择封面后再保存";
  }

  return "文章关联的作者或内容已不存在，请在设置中重新选择作者后再保存";
}
