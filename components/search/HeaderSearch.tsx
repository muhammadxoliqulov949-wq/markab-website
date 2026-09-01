'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

/**
 * Global catalogue search.
 *
 * A plain GET form pointing at /search — it needs no JavaScript, keeps the
 * query in the URL (shareable, reloadable, back-button friendly) and cannot
 * disagree with what the page actually rendered.
 *
 * Desktop shows the field inline. Below the `nav` breakpoint it collapses to a
 * single icon and expands to a full-width row, so the mobile bar stays compact
 * without hiding discovery.
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const params = useSearchParams();

  // Reflect the current query when landing on /search so the field is not lying.
  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  // "/" focuses search, the way most marketplaces behave — but never while the
  // visitor is typing somewhere else.
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

  return (
    <div className="relative flex items-center">
      {/* Mobile trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="global-search-form"
        aria-label="Qidirish"
        className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900 xl:hidden"
      >
        <SearchIcon />
      </button>

      <form
        id="global-search-form"
        action="/search"
        method="get"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = value.trim();
          router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
          setOpen(false);
        }}
        className={[
          // Mobile: expands into its own row. Desktop: always inline.
          'xl:static xl:block xl:w-[260px] 2xl:w-[340px]',
          open
            ? 'absolute right-0 top-full z-50 mt-3 w-[min(90vw,420px)] animate-dropdown-in xl:mt-0'
            : 'hidden',
        ].join(' ')}
      >
        <label htmlFor="global-search" className="sr-only">
          Avtomobil va elektronika bo‘yicha qidirish
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
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
                // Return focus to the trigger on the way out. Blurring alone
                // drops a keyboard visitor at the top of the document.
                setOpen(false);
                // Above the nav breakpoint the field is permanently inline and
                // the trigger is display:none — focusing it is a silent no-op
                // that strands focus in the input with no visible way out. Only
                // restore focus when the trigger can actually receive it.
                const trigger = triggerRef.current;
                if (trigger && trigger.offsetParent !== null) trigger.focus();
              }
            }}
            placeholder="Avtomobil yoki elektronika"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-line-strong bg-surface-muted pl-10 pr-3 text-[0.9375rem] text-ink-900 transition-colors duration-200 placeholder:text-ink-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </form>
    </div>
  );
}

export function SearchIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
