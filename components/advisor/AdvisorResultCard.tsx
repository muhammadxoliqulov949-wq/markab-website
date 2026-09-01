'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { SaveButton } from '@/components/account/SaveButton';
import { formatUzs } from '@/lib/format';
import { joinReasons, joinUnmet } from '@/lib/advisor/explanation';
import type { AdvisorMatch } from '@/lib/advisor/types';
import { CatalogueImage } from '@/components/products/CatalogueImage';

function NoImage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-400">
      <svg
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M3 16.5V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.5" />
        <path d="M3 16.5 8 11l4 4 3-3 5 5" />
        <circle cx="9" cy="7.5" r="1.2" />
      </svg>
      <span className="text-xs">Rasm mavjud emas</span>
    </div>
  );
}

/**
 * One recommendation.
 *
 * The "why" line is assembled from fields the engine verified, and the
 * "mos kelmadi" line appears only for nearest alternatives — a card can never
 * show a reason it did not check.
 */
export function AdvisorResultCard({
  match,
  compareSelected,
  compareDisabled,
  onToggleCompare,
}: {
  match: AdvisorMatch;
  compareSelected: boolean;
  /** true when the compare tray is full and this card is not in it. */
  compareDisabled: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const reason = joinReasons(match.reasons);
  const unmet = joinUnmet(match.unmet);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {match.image ? (
          <CatalogueImage
            src={match.image}
            alt={match.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={[
              'object-center transition-transform duration-700 ease-smooth',
              match.kind === 'electronics' ? 'object-contain p-4' : 'object-cover',
            ].join(' ')}
            fallbackLabel="Rasm yuklanmadi"
          />
        ) : (
          <NoImage />
        )}

        {match.stock ? (
          <div className="absolute left-3 top-3">
            <Badge tone={match.stock.tone}>{match.stock.label}</Badge>
          </div>
        ) : null}

        {/* Floated inside the 4:3 frame so saving cannot change the card height. */}
        <SaveButton
          variant="overlay"
          item={{
            kind: match.kind === 'car' ? 'car' : 'electronics',
            ref: match.id,
            title: match.title,
            priceUzs: match.priceUzs,
            image: match.image,
            href: match.href,
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink-900">
          <Link href={match.href} className="hover:text-brand-700">
            {match.title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-sm text-ink-500">{match.subtitle}</p>

        <p className="mt-3 text-lg font-semibold text-ink-900">{formatUzs(match.priceUzs)}</p>

        {/*
          Financing: only a value the listing itself publishes. When none is
          published the card says nothing rather than showing a derived number,
          and the financing handoff below links to the official calculator.
        */}
        {match.financingMonthlyUzs !== null ? (
          <p className="mt-1 text-xs text-ink-500">
            E’londagi oylik to‘lov: {formatUzs(match.financingMonthlyUzs)}
          </p>
        ) : null}

        {reason ? (
          <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-xs leading-relaxed text-ink-700">
            <span className="font-semibold">Nima uchun: </span>
            {reason}
          </p>
        ) : null}

        {unmet ? (
          <p className="mt-3 rounded-lg border border-dashed border-line-strong bg-surface-muted px-3 py-2 text-xs leading-relaxed text-ink-600">
            <span className="font-semibold">E’tibor bering: </span>
            {unmet}. Bu e’lon aniq mos variant emas — talab yumshatilmagan, farq ko‘rsatilgan.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 pt-1">
          <ButtonLink href={match.href} size="sm">
            E’lonni ochish
          </ButtonLink>
          <button
            type="button"
            onClick={() => onToggleCompare(match.id)}
            disabled={compareDisabled && !compareSelected}
            aria-pressed={compareSelected}
            className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-white px-3.5 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {compareSelected ? 'Tanlandi' : 'Solishtirish'}
          </button>
        </div>
      </div>
    </article>
  );
}
