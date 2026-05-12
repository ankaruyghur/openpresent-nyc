export type PhotoSize = 'thumb' | 'medium' | 'large';

/**
 * Metadata for one photograph, emitted by scripts/process-jaecha-photos.ts.
 *
 * The image bytes themselves live in S3 / CloudFront. This struct carries only
 * what the client needs at render time: a stable base path that the JaePhoto
 * component appends `-<size>.<ext>` to, original dimensions for layout
 * reservation, and a tiny blur preview that ships inside the HTML.
 */
export type JaePhoto = {
  /** Stable ID, e.g. "evt-jungle-jungle-2024-01". */
  id: string;
  /**
   * Public URL path prefix (without size suffix or extension), as served by
   * CloudFront. Differs from the S3 key because the distribution prepends
   * `web-assets/` via its Origin path.
   *
   * Example basePath: "jaecha/evt-jungle-jungle-2024/jj-001"
   * Public URL:       `https://${NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB}/${basePath}-${size}.${ext}`
   * Underlying S3:    `web-assets/${basePath}-${size}.${ext}`
   */
  basePath: string;
  /** Sizes generated for this photo. */
  sizes: PhotoSize[];
  /** Original photograph width in pixels (after EXIF orientation). */
  width: number;
  /** Original photograph height in pixels (after EXIF orientation). */
  height: number;
  /** Inline 20-wide base64 WebP — renders instantly as a fuzzy preview. */
  blurDataURL: string;
  /** Accessible description. Defaults to the project + index until curated. */
  alt: string;
};
