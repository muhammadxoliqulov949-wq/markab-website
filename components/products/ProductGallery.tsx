'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Product gallery.
 *
 * Shows only the images the source publishes. Listings with a single photo get
 * a single photo — no duplicated thumbnails and no "1 / 1" counter pretending
 * to be a gallery.
 *
 * Source photography varies wildly (studio shots, in-hand photos, different
 * crops), so every image is mounted the same way: a square frame with
 * `object-contain` and padding on a neutral ground. Nothing is cropped, nothing
 * is blown up, and the frame never changes size between products.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface-muted text-ink-400">
        <svg
          className="h-12 w-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          aria-hidden="true"
        >
          <rect x="6" y="3" width="12" height="18" rx="2.5" />
          <path d="M11 18h2" strokeLinecap="round" />
        </svg>
        <div className="px-6 text-center">
          <p className="text-sm">Mahsulot rasmi mavjud emas</p>
          <p className="mt-1 text-xs text-ink-400">
            Ochiq e’londa rasm e’lon qilinmagan. Rasmiy manba ulangandan so‘ng qo‘shiladi.
          </p>
        </div>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];
  const hasGallery = images.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-surface-muted">
        <Image
          key={current}
          src={current}
          alt={hasGallery ? `${name} — rasm ${active + 1}` : name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="animate-fade-in object-contain object-center p-6 sm:p-10"
        />

        {hasGallery ? (
          <span className="absolute bottom-3 right-3 rounded-md bg-ink-900/70 px-2 py-1 text-xs font-medium text-white">
            {active + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {hasGallery ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${name} — rasm ${index + 1}`}
              aria-current={index === active}
              className={[
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-surface-muted transition-all duration-200 sm:h-20 sm:w-20',
                index === active
                  ? 'border-brand-600 ring-2 ring-brand-500/25'
                  : 'border-line hover:border-line-strong',
              ].join(' ')}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
