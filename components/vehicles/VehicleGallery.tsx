'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Vehicle gallery.
 *
 * Shows only the images the data source publishes. When a listing has a single
 * photo, that photo is shown alone — no duplicated thumbnails, no placeholder
 * slides, no "1 / 1" counter pretending to be a gallery.
 */
export function VehicleGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-muted text-ink-400 sm:aspect-[3/2]">
        <svg
          className="h-10 w-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 16 4.5-4.5 3 3L16 10l4 4" strokeLinecap="round" />
        </svg>
        <span className="text-sm">Rasm mavjud emas</span>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];
  const hasGallery = images.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-surface-sunken sm:aspect-[3/2]">
        <Image
          key={current}
          src={current}
          alt={hasGallery ? `${title} — rasm ${active + 1}` : title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="animate-fade-in object-cover"
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
              aria-label={`${title} — rasm ${index + 1}`}
              aria-current={index === active}
              className={[
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 sm:h-20 sm:w-28',
                index === active
                  ? 'border-brand-600 ring-2 ring-brand-500/25'
                  : 'border-line hover:border-line-strong',
              ].join(' ')}
            >
              <Image src={src} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-400">
          Bu e’lon uchun bitta rasm mavjud. Qo‘shimcha suratlar rasmiy manba ulangandan so‘ng
          qo‘shiladi.
        </p>
      )}
    </div>
  );
}
