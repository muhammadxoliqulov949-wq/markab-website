'use client';

import Image from 'next/image';
import { useState } from 'react';

export function VehicleGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-muted text-sm text-ink-400">
        Rasm mavjud emas
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-surface-sunken">
        <Image
          key={current}
          src={current}
          alt={`${title} — rasm ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="animate-fade-in object-cover"
        />
        <span className="absolute bottom-3 right-3 rounded-md bg-ink-900/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
          {active + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${title} — rasm ${index + 1}`}
              aria-current={index === active}
              className={[
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all duration-200',
                index === active
                  ? 'border-brand-600 ring-2 ring-brand-500/25'
                  : 'border-line hover:border-line-strong',
              ].join(' ')}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
