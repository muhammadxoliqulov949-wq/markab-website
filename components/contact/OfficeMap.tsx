'use client';

import { useEffect, useRef, useState } from 'react';
import { ButtonLink, ExternalLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { site } from '@/lib/site';

type LogEntry = { ts: string; msg: string };

const OFFICE_LAT = 41.331985;
const OFFICE_LON = 69.223558;

const OSM_EMBED =
  `https://www.openstreetmap.org/export/embed.html?bbox=${OFFICE_LON - 0.0035}%2C${OFFICE_LAT - 0.002}%2C${OFFICE_LON + 0.0035}%2C${OFFICE_LAT + 0.002}&layer=mapnik&marker=${OFFICE_LAT}%2C${OFFICE_LON}`;

type MapState = 'loading' | 'ready' | 'failed';

export function OfficeMap() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [state, setState] = useState<MapState>('loading');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  // mountPhase starts as 'ssr' and immediately becomes 'mounted' when the first
  // useEffect fires. If the user still sees 'ssr', React is NOT running our
  // client code at all (CSP / bundle blocked / JS error before mount).
  const [mountPhase, setMountPhase] = useState<'ssr' | 'mounted' | 'effect-errored'>('ssr');
  const [envInfo, setEnvInfo] = useState<string>('pending-effect…');

  const log = (msg: string) =>
    setLogs((prev) =>
      [{ ts: new Date().toISOString().slice(11, 23), msg }, ...prev].slice(0, 24),
    );

  // Effect #0: single-guaranteed mount probe. This has no dependencies except
  // the empty array, so if React is alive on the client it WILL fire. If it
  // doesn't, JS is not executing at all.
  useEffect(() => {
    const probe = async () => {
      try {
        setMountPhase('mounted');
        const flags: string[] = [];
        flags.push(`inIframe=${window.top !== window.self}`);
        flags.push(`location=${window.location.href.slice(0, 100)}`);
        try {
          const fe = window.frameElement as HTMLIFrameElement | null;
          if (fe) {
            flags.push(`framed=yes`);
            const sb = fe.sandbox;
            flags.push(`frame-sandbox="${sb ? sb.toString() : 'no-sandbox-attr'}"`);
          } else {
            flags.push(`framed=no`);
          }
        } catch (e) {
          flags.push(`frameElement-denied:${(e as Error).message.slice(0, 40)}`);
        }
        try {
          flags.push(`window.open=${typeof window.open}`);
        } catch (e) {
          flags.push(`window.open-threw:${(e as Error).message.slice(0, 40)}`);
        }
        // Self-fetch the page chunk that contains OfficeMap, to surface any
        // 403/CSP/network failure the browser actually encounters. We can't
        // introspect the blocked script from JS because blocked scripts don't
        // execute, but a fetch() of the same URL from within the executing
        // bundle will tell us whether static assets are reachable.
        try {
          const pageScript = Array.from(document.querySelectorAll('script[src]')).find(
            (s) => /\/_next\/static\/chunks\/app\/(contact\/)?page(\.|$)/.test(s.getAttribute('src') || ''),
          );
          const src = pageScript?.getAttribute('src') || '/_next/static/chunks/app/contact/page.js';
          flags.push(`probe-chunk=${src.split('/').pop()}`);
          const r = await fetch(src, { credentials: 'same-origin' });
          flags.push(`chunk-fetch=${r.status} ${r.statusText}`);
          // Echo back the x-debug-req-* headers the middleware attached so we
          // can see exactly what Origin/Referer/Host the browser sent for a
          // same-origin static chunk request.
          const reqOrigin = r.headers.get('x-debug-req-origin');
          const reqReferer = r.headers.get('x-debug-req-referer');
          const reqHost = r.headers.get('x-debug-req-host');
          if (reqOrigin) flags.push(`hdr-origin=${reqOrigin}`);
          if (reqReferer) flags.push(`hdr-referer=${reqReferer.slice(0, 80)}`);
          if (reqHost) flags.push(`hdr-host=${reqHost}`);
        } catch (e) {
          flags.push(`chunk-fetch-threw:${(e as Error).message.slice(0, 80)}`);
        }
        // Detect websocket HMR availability (dev-only): if HMR is connected
        // window.__nextDevClientErrors is defined and/or there is a WS to _next/webpack-hmr.
        try {
          flags.push(`hmr-ws=${(window as unknown as { __nextDevClientErrors?: unknown }).__nextDevClientErrors !== undefined ? 'registered' : 'absent'}`);
        } catch {
          flags.push(`hmr-ws=probe-failed`);
        }
        setEnvInfo(flags.join(' | '));
      } catch (e) {
        setMountPhase('effect-errored');
        setEnvInfo(`effect-threw:${(e as Error).message}`);
      }
    };
    void probe();
  }, []);

  useEffect(() => {
    const node = iframeRef.current;
    if (!node) return;

    let cancelled = false;
    const finish = (next: Exclude<MapState, 'loading'>, reason: string) => {
      if (cancelled) return;
      setState((current) => {
        if (current !== 'loading') return current;
        log(`iframe -> ${next} (${reason})`);
        return next;
      });
    };

    const handleLoad = () => finish('ready', 'load event');
    const handleError = () => finish('failed', 'error event');

    node.addEventListener('load', handleLoad);
    node.addEventListener('error', handleError);
    const timer = window.setTimeout(() => finish('failed', '8s timeout'), 8_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      node.removeEventListener('load', handleLoad);
      node.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;

    const onPointerDown = (e: PointerEvent) => {
      const rect = link.getBoundingClientRect();
      const center = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const centerTag = center?.tagName.toLowerCase() ?? 'null';
      const centerClass =
        center && 'className' in center
          ? '.' + ((center as Element).className as string).slice(0, 60).replace(/\s+/g, '.')
          : '';
      const tgt = e.target as Element;
      log(
        `pointerdown: target=<${tgt.tagName.toLowerCase()}${tgt.id ? '#' + tgt.id : ''}> elementFromPoint(center)=<${centerTag}${centerClass}>`,
      );
    };
    const onClickCapture = (e: MouseEvent) => {
      const tgt = e.target as Element;
      log(
        `click[capture] target=<${tgt.tagName.toLowerCase()}> defaultPrevented=${e.defaultPrevented} button=${e.button} meta=${e.metaKey} ctrl=${e.ctrlKey} shift=${e.shiftKey}`,
      );
    };
    const onClickBubble = (e: MouseEvent) => {
      const tgt = e.target as Element;
      log(
        `click[bubble] target=<${tgt.tagName.toLowerCase()}> defaultPrevented=${e.defaultPrevented} href=${link.getAttribute('href')} target=${link.getAttribute('target')}`,
      );
    };
    link.addEventListener('pointerdown', onPointerDown, true);
    link.addEventListener('click', onClickCapture, true);
    link.addEventListener('click', onClickBubble, false);

    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Element;
      const isOnLink = t === link || link.contains(t);
      if (isOnLink && e.eventPhase === Event.CAPTURING_PHASE) {
        log(`document.click[capture] reached link, defaultPrevented=${e.defaultPrevented}`);
      }
    };
    document.addEventListener('click', onDocClick, true);

    return () => {
      link.removeEventListener('pointerdown', onPointerDown, true);
      link.removeEventListener('click', onClickCapture, true);
      link.removeEventListener('click', onClickBubble, false);
      document.removeEventListener('click', onDocClick, true);
    };
  }, []);

  const attemptNativeSameTab = () => {
    log(`programmatic same-tab assignment -> ${site.office.mapUrl}`);
    window.location.href = site.office.mapUrl;
  };
  const attemptNativePopup = () => {
    log(`window.open attempt -> ${site.office.mapUrl}`);
    try {
      const w = window.open(site.office.mapUrl, '_blank', 'noopener,noreferrer');
      log(`window.open returned ${w ? 'window' : 'null (blocked)'}`);
    } catch (err) {
      log(`window.open threw: ${(err as Error).message}`);
    }
  };
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(site.office.mapUrl);
      log('clipboard: copied mapUrl');
    } catch (err) {
      log(`clipboard failed: ${(err as Error).message}`);
    }
  };

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
          className={`h-full w-full border-0 transition-opacity duration-500 ${
            state === 'ready' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={`Markab ofisi xaritada. Manzil: ${site.office.address}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          ref={linkRef}
          href={site.office.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line-strong bg-white px-3.5 text-sm font-medium text-ink-900 transition-all duration-200 hover:border-ink-300 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          data-diag-id="xaritada-ochish"
          id="xaritada-ochish"
        >
          Xaritada ochish
        </a>
        <p className="text-xs text-ink-400">
          Xarita OpenStreetMap ma&rsquo;lumotlari asosida ko&lsquo;rsatilmoqda.
        </p>
      </div>

      {/* DEV/DIAGNOSTIC PANEL — present only while diagnosing click path */}
      <div
        className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900"
        data-diag-panel
      >
        <div className="mb-1 font-semibold">Diagnostika (faqat preview uchun)</div>
        <div className="mb-1 break-all rounded bg-white/60 px-2 py-1 font-mono text-[11px]">
          mountPhase=<strong className="text-rose-700">{mountPhase}</strong>
        </div>
        <div className="mb-2 break-all">{envInfo}</div>
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={attemptNativeSameTab}
            className="rounded border border-amber-700/40 bg-white px-2 py-1 hover:bg-amber-100"
          >
            Sinov: same-tab (window.location.href)
          </button>
          <button
            type="button"
            onClick={attemptNativePopup}
            className="rounded border border-amber-700/40 bg-white px-2 py-1 hover:bg-amber-100"
          >
            Sinov: window.open(_blank)
          </button>
          <button
            type="button"
            onClick={copyUrl}
            className="rounded border border-amber-700/40 bg-white px-2 py-1 hover:bg-amber-100"
          >
            URL nusxalash
          </button>
        </div>
        <div className="max-h-40 overflow-auto rounded bg-white/70 p-2 font-mono">
          {logs.length === 0 ? (
            <div className="text-ink-400">&ldquo;Xaritada ochish&rdquo; tugmasini bosing &mdash; hodisalar shu yerda ko&rsquo;rsatiladi.</div>
          ) : (
            logs.map((l, i) => (
              <div key={i}>
                <span className="text-ink-400">{l.ts}</span> {l.msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

void ButtonLink;
void ExternalLink;
