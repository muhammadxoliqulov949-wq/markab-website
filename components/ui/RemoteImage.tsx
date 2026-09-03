'use client';

import Image from 'next/image';
import { useState, type ImgHTMLAttributes } from 'react';

/**
 * Remote image with graceful failure fallback.
 *
 * Every catalogue / marketing / search-result photograph in the UI goes through
 * this component instead of bare next/image so that when a remote image fails
 * to load (CSP block, egress restriction, TLS reset in sandboxes like Arena,
 * 404 upstream) the card never shows a broken-image icon or an empty frame.
 * The fallback is a neutral, sunken panel matching the visual language of
 * CatalogueImage so it does not shout "error!" — it just reads as an absent
 * photograph.
 *
 * Wrapped in 'use client' purely because detecting the failure is a browser
 * event; the SSR output is otherwise identical to next/image.
 */
export function RemoteImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority = false,
  className,
  fallbackLabel = 'Rasm yuklanmadi',
  fallbackClassName,
  ...rest
}: {
  src: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallbackLabel?: string | null;
  fallbackClassName?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height' | 'sizes'>) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-sunken text-ink-400 ${fallbackClassName ?? ''}`}
        role="img"
        aria-label={alt}
      >
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m4 16 4.5-4.5 3 3L16 10l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {fallbackLabel ? <span className="text-[11px]">{fallbackLabel}</span> : null}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
