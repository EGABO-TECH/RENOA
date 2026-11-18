import type { Media } from "@/payload-types";

/**
 * Relations come back as either an id or the populated document, depending on
 * depth. These helpers take whichever and hand back only what the view needs,
 * so no page has to repeat the `typeof x === "object"` dance.
 */
export const populated = <T extends { id: number }>(value: number | T | null | undefined): T | null =>
  value && typeof value === "object" ? value : null;

export const populatedList = <T extends { id: number }>(
  values: (number | T)[] | null | undefined,
): T[] => (values ?? []).filter((v): v is T => typeof v === "object" && v !== null);

/** The variants Media.imageSizes actually generates. */
export type MediaSize = "thumbnail" | "card" | "feature" | "hero";

export type ImageSource = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * A Media document as `next/image` needs it.
 *
 * `alt` is required by the Media collection, so there is no empty-alt path to
 * fall through — an image without a description would fail the WCAG 2.2 AA bar
 * in section 9 of the brief. Intrinsic width and height come from the upload,
 * which is what keeps the layout from shifting while the image loads.
 *
 * Returns null when the relation was never populated or the upload has no URL
 * yet, so callers render their own empty state instead of a broken image.
 */
export const imageFrom = (
  value: number | Media | null | undefined,
  size?: MediaSize,
): ImageSource | null => {
  const doc = populated<Media>(value);
  if (!doc) return null;

  const variant = size ? doc.sizes?.[size] : undefined;
  const src = variant?.url ?? doc.url;
  if (!src) return null;

  const width = variant?.width ?? doc.width;
  const height = variant?.height ?? doc.height;
  if (!width || !height) return null;

  return { src, alt: doc.alt, width, height };
};
