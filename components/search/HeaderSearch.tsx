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
 * Semantics: a plain HTML GET form pointing at /search. Pressing Enter
 * navigates immediately; clicking the search icon/button also navigates
 * immediately. There is no debounce, no setTimeout, no artificial delay
 * before navigation — results render after the URL changes, via the
 * server-rendered /search page.
 *
 * Desktop (xl+) shows the field inline with a visible submit button. Below
 * that breakpoint the field collapses to an icon; tapping the icon expands
 * the field, and tapping it again submits the current value.
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const params = useSearchParams();

  // Keep the field in sync with the URL when arriving on /search directly.
  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  // "/" focuses search (unless the visitor is already typing).
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

  // Mobile/tablet: tapping the icon when the field is already open submits.
  // On xl+ the icon is hidden and a visible submit button is used instead.
  const onTriggerClick = () => {
    if (open) {
      navigate(value);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Mobile/tablet trigger — submits on second tap. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={onTriggerClick}
        aria-expanded={open}
        aria-controls="global-search-form"
        aria-label={open ? 'Qidiruvni yuborish' : 'Qidirish'}
        className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900 xl:hidden"
      >
        <SearchIcon />
      </button>

      <form
        id="global-search-form"
        action="/search"
        method="get"
        role="search"
        onSubmit={onSubmit}
        className={[
          // Mobile/tablet: drops down from the icon. Desktop: permanently inline.
          'xl:static xl:flex xl:w-[280px] xl:items-center 2xl:w-[340px]',
          open
            ? 'absolute right-0 top-full z-50 mt-3 w-[min(92vw,420px)] animate-dropdown-in xl:mt-0'
            : 'hidden',
        ].join(' ')}
      >
        <label htmlFor="global-search" className="sr-only">
          Avtomobil va elektronika bo‘yicha qidirish
        </label>
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 xl:hidden"
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
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
                const trigger = triggerRef.current;
                if (trigger && trigger.offsetParent !== null) trigger.focus();
              }
            }}
            placeholder="Avtomobil yoki elektronika"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-line-strong bg-surface-muted pl-10 pr-3 text-[0.9375rem] text-ink-900 transition-colors placeholder:text-ink-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 xl:rounded-l-xl xl:rounded-r-none xl:pl-10"
          />
        </div>
        <button
          type="submit"
          aria-label="Qidirish"
          className="hidden h-11 items-center justify-center rounded-r-xl border border-l-0 border-line bg-brand-500 px-3 text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 xl:inline-flex"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
        </button>
      </form>
    </div>
  );
}
