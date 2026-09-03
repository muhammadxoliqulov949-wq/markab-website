'use client';

import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { site } from '@/lib/site';

/**
 * Office map — OpenStreetMap embedded iframe.
 *
 * WHY NO IFRAME SANDBOX
 *
 * The iframe points at a tightly CSP-pinned origin (www.openstreetmap.org) and
 * loads cross-origin, so the browser's same-origin policy already prevents the
 * embedded page from touching our origin. An over-restrictive sandbox attribute
 * prevents the OSM embed's own Leaflet bundle from reaching the DOM/storage
 * APIs it needs to initialise tiles and attach the "View Larger Map" link,
 * which caused the iframe to hang at the loading spinner in some environments.
 * Removing sandbox keeps the iframe fully functional, while CSP frame-src keeps
 * the allowed embed origin narrowed to exactly OpenStreetMap.
 *
 * LOAD / FAILURE DETECTION
 *
 *   • iframe load event  → ready (iframe fades in)
 *   • iframe error event → failed
 *   • 8-second hard timer → failed (belt-and-braces: some browsers never fire
 *     'error' on cross-origin network failures; this guarantees the UI never
 *     shows a permanent spinner even when the third-party cannot be reached)
 *   • Once a terminal state (ready/failed) is reached it never regresses.
 */

// Verified office coordinates from lib/site.ts mapUrl (markab.uz public map).
const OFFICE_LAT = 41.331985;
const OFFICE_LON = 69.223558;

const OSM_EMBED =
  `https://www.openstreetmap.org/export/embed.html?bbox=${OFFICE_LON - 0.0035}%2C${OFFICE_LAT - 0.002}%2C${OFFICE_LON + 0.0035}%2C${OFFICE_LAT + 0.002}&layer=mapnik&marker=${OFFICE_LAT}%2C${OFFICE_LON}`;

type MapState = 'loading' | 'ready' | 'failed';

export function OfficeMap() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [state, setState] = useState<MapState>('loading');

  useEffect(() => {
    const node = iframeRef.current;
    if (!node) return;

    let cancelled = false;
    const finish = (next: Exclude<MapState, 'loading'>) => {
      if (cancelled) return;
      setState((current) => (current === 'loading' ? next : current));
    };

    const handleLoad = () => finish('ready');
    const handleError = () => finish('failed');

    node.addEventListener('load', handleLoad);
    node.addEventListener('error', handleError);

    // Hard fallback: if neither load nor error fires within 8 seconds (for
    // example when the third-party network is blocked and cross-origin
    // browsers never emit an error event), drop into the unavailable state
    // so the visitor never sees an infinite spinner.
    const timer = window.setTimeout(() => finish('failed'), 8_000);

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
        {state !== 'ready' ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            role="status"
            aria-live="polite"
          >
            {state === 'loading' ? (
              <div className="flex flex-col items-center gap-2 text-ink-400">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand-600"
                  aria-hidden="true"
                />
                <p className="text-xs">Xarita yuklanmoqda…</p>
                <span className="sr-only">Xarita yuklanmoqda</span>
              </div>
            ) : (
              <div className="w-full max-w-sm p-4">
                <StateBlock
                  compact
                  variant="unavailable"
                  title="Xarita yuklanmadi"
                  description="Tarmoq yoki uchinchi tomon xizmati sabab xarita hozircha yuklanmadi. Manzil va 'Xaritada ochish' tugmasi ishlashda davom etadi."
                />
              </div>
            )}
          </div>
        ) : null}

        <iframe
          ref={iframeRef}
          title={`Markab ofisi xaritada — ${site.office.address}`}
          src={OSM_EMBED}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          // Deliberately no sandbox attribute: CSP frame-src already pins the
          // origin to https://www.openstreetmap.org, and the iframe is
          // cross-origin (same-origin policy prevents script access to our
          // page). Sandboxing breaks the OSM viewer's own Leaflet/tile code.
          //
          // Pointer events are DISABLED until the iframe fires `load`, so a
          // hung/stuck/failed iframe that is still opacity:0 cannot eat taps
          // meant for the failure StateBlock or the surrounding controls.
          // Once `ready`, pointer-events turn back on so pan/zoom/touch work.
          className={`h-full w-full border-0 transition-opacity duration-500 ${
            state === 'ready' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={`Markab ofisi xaritada. Manzil: ${site.office.address}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink
          href={site.office.mapUrl}
          variant="secondary"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Xaritada ochish
        </ButtonLink>
        <p className="text-xs text-ink-400">
          Xarita OpenStreetMap ma&rsquo;lumotlari asosida ko&lsquo;rsatilmoqda.
        </p>
      </div>
    </div>
  );
}
