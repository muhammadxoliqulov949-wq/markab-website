'use client';

import Link from 'next/link';
import type { SearchHit } from '@/lib/data/types';
import { formatUzs } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { RemoteImage } from '@/components/ui/RemoteImage';

/**
 * A single search result row.
 *
 * Image · identity · price, in that order, so a result can be read in about a
 * second. Only published fields are shown; availability is never promoted
 * above what the catalogue states. RemoteImage provides the broken-image
 * fallback so a failed photograph never leaves an empty thumbnail slot.
 */
export function SearchHitRow({ hit }: { hit: SearchHit }) {
  return (
    <li>
      <Link
        href={hit.href}
        className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-3 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
      >
        <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-sunken sm:h-20 sm:w-28">
          <RemoteImage
            src={hit.image}
            alt=""
            fill
            sizes="(max-width: 640px) 80px, 112px"
            className="object-cover transition-transform duration-300 ease-smooth group-hover:scale-[1.04]"
            fallbackLabel=""
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[0.9375rem] font-semibold text-ink-900">
              {hit.title}
            </span>
            {hit.availability === 'sold' ? <Badge tone="neutral">Sotilgan</Badge> : null}
          </span>
          <span className="mt-0.5 block truncate text-sm text-ink-500">{hit.subtitle}</span>
          <span className="mt-1 block text-sm font-semibold text-ink-900">
            {formatUzs(hit.priceUzs)}
          </span>
        </span>

        <svg
          className="h-4 w-4 shrink-0 text-ink-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </li>
  );
}
