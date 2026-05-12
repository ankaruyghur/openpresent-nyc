'use client';

import Image from 'next/image';
import type { CSSProperties, MouseEventHandler } from 'react';
import type { JaePhoto as JaePhotoMeta, PhotoSize } from './photo-types';

const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB;

/**
 * Resolve a photo + size to its full public URL. Format defaults to AVIF;
 * Next.js's image optimizer transparently falls back to WebP for older clients
 * because of `images.formats` in next.config.ts.
 */
export function photoUrl(photo: JaePhotoMeta, size: PhotoSize, format: 'avif' | 'webp' = 'avif'): string {
  if (!CLOUDFRONT_DOMAIN) {
    // Without the domain, every <Image> would request https://undefined/... —
    // surface that loudly so the misconfig shows up on the first page load
    // instead of silently breaking every photo.
    throw new Error('NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB is not set — Jae\'s photos cannot resolve. Check .env.local / Vercel project env.');
  }
  return `https://${CLOUDFRONT_DOMAIN}/${photo.basePath}-${size}.${format}`;
}

type Props = {
  photo: JaePhotoMeta;
  /** Display tier hint. `medium` is the workhorse; `large` for zoom overlays. */
  size?: PhotoSize;
  /**
   * Tell the browser how big the image will render. Use a real CSS expression
   * (e.g. "(max-width: 768px) 80vw, 40vw"). Required for performant LCP.
   */
  sizes: string;
  /** Above-the-fold? Set true on the first 1–2 visible photos. */
  priority?: boolean;
  alt?: string;
  style?: CSSProperties;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * When true, the image fills its (positioned) parent and the parent's
   * dimensions determine display size. Use this whenever the wrapper has
   * width/height (everywhere we previously passed `width="100%"`).
   */
  fill?: boolean;
};

/**
 * Renders one of Jae's photographs via Next.js's image pipeline.
 *
 * - Streams a tiny inline blur preview instantly (blurDataURL is in HTML).
 * - Fetches the right tier based on `size` + viewport via CloudFront.
 * - Lazy-loads by default; pass `priority` for above-the-fold images.
 *
 * Replaces the legacy `PlaceholderImg` everywhere.
 */
export function JaePhoto({
  photo,
  size = 'medium',
  sizes,
  priority,
  alt,
  style,
  className,
  onClick,
  fill = true,
}: Props) {
  const src = photoUrl(photo, size);
  const altText = alt ?? photo.alt;

  // Use `fill` mode in a positioned wrapper so the layout decides the rendered
  // size (matches how PlaceholderImg behaved with width/height props on the
  // wrapper). For non-fill mode, fall back to intrinsic width/height.
  if (!fill) {
    return (
      <Image
        src={src}
        alt={altText}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        priority={priority}
        className={className}
        style={style}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Image
        src={src}
        alt={altText}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        priority={priority}
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
