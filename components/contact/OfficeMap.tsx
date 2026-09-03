'use client';

import { useEffect, useRef, useState } from 'react';
import { StateBlock } from '@/components/ui/StateBlock';
import { site } from '@/lib/site';

/**
 * Office map — OpenStreetMap embedded iframe.
 *
 * FAILURE MODES HANDLED
 *
 * The OSM iframe is loaded from https://www.openstreetmap.org. Cross-origin
 * sandboxes (like Arena preview) often fail TLS egress to external hosts, so
 * the iframe never fires 'load' and the 'error' event is suppressed by the
 * browser for cross-origin frames. We therefore:
 *
 *   1. listen to both 'load' and 'error' on the iframe;
 *   2. set a short (4s) hard fallback timer;
 *   3. latch into a terminal state ('ready' or 'failed') so the UI never
 *      regresses;
 *   4. disable pointer-events on the iframe while it is invisible so a
 *      hung/failed frame cannot eat clicks meant for surrounding controls;
 *   5. render a clear failure card with the address and deep-link actions
 *      instead of leaving a permanent spinner.
 */

const OFFICE_LAT = 41.331985;
const OFFICE_LON = 69.223558;

const OSM_EMBED =
  `https://www.openstreetmap.org/export/embed.html?bbox=${OFFICE_LON - 0.0035}%2C${OFFICE_LAT - 0.002}%2C${OFFICE_LON + 0.0035}%2C${OFFICE_LAT + 0.002}&layer=mapnik&marker=${OFFICE_LAT}%2C${OFFICE_LON}`;

type MapState = 'loading' | 'ready' | 'failed';

export function OfficeMap() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [state, setState] = useState<MapState>('loading');
  const [copied, setCopied] = useState(false);

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
    const timer = window.setTimeout(() => finish('failed'), 4_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      node.removeEventListener('load', handleLoad);
      node.removeEventListener('error', handleError);
    };
  }, []);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(site.office.mapUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = site.office.mapUrl;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable — the href/title still expose the URL.
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-surface-sunken sm:aspect-[16/10]">
        {/* Loading / failure overlay — always inside the relative overflow-hidden map frame. */}
        {state !== 'ready' ? (
          <div className="absolute inset-0 flex items-center justify-center" role="status" aria-live="polite">
            {state === 'loading' ? (
              <div className="flex flex-col items-center gap-3 text-ink-400">
                <div className="relative h-12 w-12">
                  {/* Static pin placeholder while loading so the user sees where the map is. */}
                  <svg viewBox="0 0 24 24" className="h-12 w-12 text-brand-600/50" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-line-strong border-t-brand-600" />
                </div>
                <p className="text-xs">Xarita yuklanmoqda…</p>
                <span className="sr-only">Xarita yuklanmoqda</span>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
                {/* Static location card shown when OSM cannot be reached. */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-ink-900">Markab ofisi</p>
                  <p className="max-w-[16rem] text-xs text-ink-500">{site.office.address}</p>
                  <p className="max-w-[18rem] text-[11px] text-ink-400">
                    Tarmoq cheklovi sabab interaktiv xarita hozircha yuklanmadi. Pastdagi tugma orqali Google Xaritalarda ochishingiz mumkin.
                  </p>
                </div>
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
          // Pointer events are disabled while the iframe is invisible so a hung
          // frame cannot intercept clicks on the overlay or the link below.
          className={`h-full w-full border-0 transition-opacity duration-500 ${
            state === 'ready' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={`Markab ofisi xaritada. Manzil: ${site.office.address}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Native <a> for Google Maps deep link — no router interception,
            target="_blank" for normal browsers, title exposes the URL on hover
            as a fallback for environments that block navigation. */}
        <a
          href={site.office.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={site.office.mapUrl}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line-strong bg-white px-3.5 text-sm font-medium text-ink-900 transition-all duration-200 hover:border-ink-300 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          Xaritada ochish
        </a>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-medium text-ink-600 transition-all duration-200 hover:border-ink-300 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label="Google Maps manzil URLini nusxalash"
        >
          {copied ? 'Nusxalandi!' : 'Manzilni nusxalash'}
        </button>
        <p className="text-xs text-ink-400">
          Xarita OpenStreetMap ma&rsquo;lumotlari asosida ko&lsquo;rsatilmoqda.
        </p>
      </div>
    </div>
  );
}
