'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-muted text-sm text-ink-400">
        <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="6" y="3" width="12" height="18" rx="2.5" />
          <path d="M11 18h2" strokeLinecap="round" />
        </svg>
        Mahsulot rasmi mavjud emas
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-surface-sunken">
        <Image
          key={current}
          src={current}
          alt={`${name} — rasm ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="animate-fade-in object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${name} — rasm ${index + 1}`}
              className={[
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-200',
                index === active
                  ? 'border-brand-600 ring-2 ring-brand-500/25'
                  : 'border-line hover:border-line-strong',
              ].join(' ')}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
