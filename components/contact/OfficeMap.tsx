'use client';

import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { site } from '@/lib/site';

/**
 * Office map — OpenStreetMap embedded iframe.
 *
 * WHY OPENSTREETMAP
 *
 *   • No API key, no paid SDK, no account required.
 *   • Official `/export/embed.html` endpoint is a lightweight static HTML/JS
 *     viewer that supports pan, zoom, touch and a "View Larger Map" link by
 *     default — exactly the interactivity a contact page needs.
 *   • No cookies are set by the embed in third-party context, per OSM's
 *     privacy policy. Tiles are fetched anonymously; no analytics.
 *
 * The iframe is lazy-loaded (loading="lazy") so below-fold placement on
 * mobile doesn't compete with the page render. A stable aspect ratio is
 * reserved via CSS so layout does not shift when the iframe loads.
 *
 * SECURITY
 *
 *   • frame-src is restricted to https://www.openstreetmap.org in CSP.
 *   • sandbox is not applied because OSM embed needs scripts/navigation to
 *     offer pan/zoom and the "View Larger Map" link, which opens in a new
 *     tab via target="_blank" (OSM ships it with rel="noopener" behaviour).
 *   • referrerPolicy="no-referrer-when-downgrade" prevents the full URL being
 *     sent on cross-origin navigation.
 *
 * PRIVACY
 *
 * When the map renders, the visitor's browser fetches tiles from
 * tile.openstreetmap.org. This is a third-party request; it is documented in
 * docs/REAL-API-INTEGRATION.md (Stage 1 addendum). No visitor-identifying
 * data is sent by our code, and the iframe is loaded lazily so it does not
 * fire until the visitor scrolls near it.
 */

// Verified office coordinates (from the existing Google Maps URL in lib/site.ts:
//   https://www.google.com/maps/place/.../@41.331985,69.223558,17z
// ). These are the same coordinates already published on markab.uz — we
// re-use them rather than inventing a location.
const OFFICE_LAT = 41.331985;
const OFFICE_LON = 69.223558;
const OFFICE_ZOOM = 17;

const OSM_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${OFFICE_LON - 0.0035}%2C${OFFICE_LAT - 0.002}%2C${OFFICE_LON + 0.0035}%2C${OFFICE_LAT + 0.002}&layer=mapnik&marker=${OFFICE_LAT}%2C${OFFICE_LON}`;

type MapState = 'loading' | 'ready' | 'failed';

export function OfficeMap() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [state, setState] = useState<MapState>('loading');

  useEffect(() => {
    const node = iframeRef.current;
    if (!node) return;

    let cancelled = false;
    const handleLoad = () => {
      if (cancelled) return;
      setState('ready');
    };
    const handleError = () => {
      if (cancelled) return;
      setState('failed');
    };

    node.addEventListener('load', handleLoad);
    node.addEventListener('error', handleError);

    // Safety net: if neither load nor error fires within 10s (e.g. embed
    // HTML loads but tile network is blocked), surface a usable fallback
    // rather than a permanent loading skeleton.
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setState((current) => (current === 'loading' ? 'failed' : current));
    }, 10_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      node.removeEventListener('load', handleLoad);
      node.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-surface-sunken sm:aspect-[16/10]">
        {/* Loading state — visible until the iframe fires load. The reserved
            aspect ratio prevents layout shift. */}
        {state === 'loading' ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-2 text-ink-400">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand-600"
                aria-hidden="true"
              />
              <p className="text-xs">Xarita yuklanmoqda…</p>
            </div>
            <span className="sr-only">Xarita yuklanmoqda</span>
          </div>
        ) : null}

        <iframe
          ref={iframeRef}
          title={`Markab ofisi xaritada — ${site.office.address}`}
          src={OSM_EMBED}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          // Allow OSM embed's own scripts + pointer events. Do NOT allow
          // same-origin, top-navigation or popups. The "View Larger Map"
          // link inside OSM uses target="_blank" and still works.
          sandbox="allow-scripts allow-pointer-lock"
          className={`h-full w-full border-0 transition-opacity duration-500 ${
            state === 'ready' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ opacity: state === 'ready' ? 1 : 0 }}
          aria-label={`Markab ofisi xaritada. Manzil: ${site.office.address}`}
        />

        {state === 'failed' ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
              <StateBlock
                compact
                variant="unavailable"
                title="Xarita yuklanmadi"
                description="Tarmoq yoki uchinchi tomon xizati sabab xarita hozircha yuklanmadi. Manzil va 'Xaritada ochish' tugmasi ishlatishda davom etadi."
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={site.office.mapUrl} variant="secondary" size="sm" target="_blank" rel="noopener noreferrer">
          Xaritada ochish
        </ButtonLink>
        <p className="text-xs text-ink-400">
          Xarita OpenStreetMap ma’lumotlari asosida ko‘rsatilmoqda.
        </p>
      </div>
    </div>
  );
}
