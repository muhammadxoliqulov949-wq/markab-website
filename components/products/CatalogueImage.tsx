'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Catalogue image with a real fallback.
 *
 * `next/image` renders a broken image when the file 404s or the network drops,
 * which leaves a marketplace grid full of empty frames. This keeps the same
 * frame and swaps in the neutral placeholder instead, so a missing photograph
 * never reads as a broken card.
 *
 * It is a client component only because the failure has to be detected in the
 * browser — the markup it produces is otherwise identical.
 */
export function CatalogueImage({
  src,
  alt,
  sizes,
  priority = false,
  className = 'object-cover',
  fallbackLabel = 'Rasm yuklanmadi',
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-sunken text-ink-400">
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 16 4.5-4.5 3 3L16 10l4 4" strokeLinecap="round" />
        </svg>
        {fallbackLabel ? <span className="text-xs">{fallbackLabel}</span> : null}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
