export type ImageInput = {
  assetId: string;
  alt?: string;
};

export function buildSlugField(slug: string) {
  return { _type: "slug" as const, current: slug };
}

export function buildImageField(image?: ImageInput | null) {
  if (!image?.assetId) return undefined;
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: image.assetId },
    ...(image.alt ? { alt: image.alt } : {}),
  };
}

export function buildFileField(assetId?: string) {
  if (!assetId) return undefined;
  return {
    _type: "file" as const,
    asset: { _type: "reference" as const, _ref: assetId },
  };
}

export function buildReference(refId: string) {
  return { _type: "reference" as const, _ref: refId };
}
