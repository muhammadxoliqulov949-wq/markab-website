'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon } from './HeaderSearch.icon';

/**
 * Global catalogue search.
 *
 * One consistent behaviour on both mobile and desktop:
 *  - A magnifier icon sits in the header at all times (never hidden).
 *  - Tapping it opens a small dropdown panel BELOW the icon (top-full),
 *    never over the navigation links above/next to it.
 *  - Typing + Enter navigates to /search?q=... and closes the panel.
 *  - Escape, a second tap on the icon, or a click outside closes it.
 *
 * This avoids two mistakes we made earlier:
 *  - Never positions the form over the primary nav (so "Academy", cart,
 *    menu, login remain tappable when closed, and are not covered when open).
 *  - No separate "Cancel / Bekor" text button — the same magnifier icon
 *    acts as both opener and (via outside-click / Esc) closer. When the
 *    panel is open, pressing Enter submits; clicking the icon again also
 *    submits (same as pressing the search key).
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  // "/" opens search.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey) return;
      const el = document.activeElement;
      const tag = el?.tagName ?? '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (el as HTMLElement)?.isContentEditable) return;
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Outside-click / Escape closes.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const navigate = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const href = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
      router.push(href);
      setOpen(false);
    },
    [router],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(value);
  };

  const onIconClick = () => {
    if (open) {
      // If there's text, submit; otherwise just close.
      if (value.trim()) {
        navigate(value);
      } else {
        setOpen(false);
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {/* The magnifier icon — always visible in every breakpoint. */}
      <button
        type="button"
        onClick={onIconClick}
        aria-expanded={open}
        aria-controls="global-search-form"
        aria-label={open ? 'Qidirishni yopish' : 'Qidirish'}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900 active:bg-surface-sunken lg:h-11 lg:w-11 lg:rounded-lg lg:p-2.5"
      >
        <SearchIcon className="h-[22px] w-[22px] lg:h-5 lg:w-5" />
      </button>

      {/* Dropdown panel — appears below the icon, never covering nav above. */}
      <form
        id="global-search-form"
        action="/search"
        method="get"
        role="search"
        onSubmit={onSubmit}
        className={[
          'absolute right-0 top-[calc(100%+6px)] z-50 w-[92vw] max-w-[380px] origin-top-right rounded-panel border border-line bg-white p-3 shadow-lift transition-all duration-200 ease-out sm:p-4',
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        ].join(' ')}
      >
        <label htmlFor="global-search" className="sr-only">
          Avtomobil va elektronika bo‘yicha qidirish
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
          </span>
          <input
            ref={inputRef}
            id="global-search"
            name="q"
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Avtomobil yoki elektronika…"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full rounded-btn border border-line bg-surface pl-10 pr-10 text-[16px] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {/* Subtle inline submit glyph inside the field (right side). */}
          <button
            type="submit"
            aria-label="Qidirish"
            className="absolute right-2 top-1/2 inline-flex h-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-600 px-2.5 text-white transition-ctrl hover:bg-brand-700 active:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-ink-400">
          Masalan: <span className="text-ink-500">Cobalt, Gentra, iPhone</span>
        </p>
      </form>
    </div>
  );
}
