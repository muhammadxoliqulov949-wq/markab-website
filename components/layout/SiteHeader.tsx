'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { primaryNav, secondaryNav, site } from '@/lib/site';
import { useCart } from '@/components/cart/CartProvider';
import { useAuth } from '@/components/auth/AuthProvider';

function MarkabMark() {
  return (
    <span
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.6l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 15.2l-5 3.3 1.4-5.9L3.8 8.7l6-.5L12 2.6z" />
      </svg>
    </span>
  );
}

/**
 * Premium sticky header.
 *
 * Desktop (lg+) is the primary navigation: the five Markab goals, then a
 * divider, then cart and account. The hamburger is a tablet/mobile affordance
 * only — it is never the main way in.
 *
 * The bar is always light and always legible: no route can produce white text
 * on a white page. On scroll it gains a hairline border and a soft shadow.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b transition-all duration-300 ease-smooth',
        scrolled
          ? 'border-line bg-white/90 shadow-[0_1px_2px_rgba(12,17,22,0.05)] backdrop-blur-xl'
          : 'border-transparent bg-white/80 backdrop-blur-xl',
      ].join(' ')}
    >
      {/* Prototype transparency strip — condenses away once the page scrolls. */}
      <div
        className={[
          'overflow-hidden bg-brand-900 text-white/70 transition-[max-height,opacity] duration-300 ease-smooth',
          scrolled || open ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100',
        ].join(' ')}
      >
        <div className="container-page flex items-center justify-between py-1.5 text-[11px]">
          <span className="truncate">
            Markab 2.0 kontsept-prototip · real API ulanmagan · namuna ma’lumotlari
          </span>
          <span className="hidden sm:inline">{site.positioning}</span>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3 lg:h-[76px] lg:gap-8">
        <Link
          href="/"
          className="flex h-11 shrink-0 items-center gap-2.5"
          aria-label="Markab bosh sahifa"
        >
          <MarkabMark />
          <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink-900">
            Markab
          </span>
        </Link>

        {/* Desktop primary navigation — the five goals of the product. */}
        <nav aria-label="Asosiy navigatsiya" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'relative flex h-11 items-center rounded-lg px-4 text-[0.9375rem] font-medium transition-colors duration-200',
                      active
                        ? 'text-brand-700'
                        : 'text-ink-600 hover:bg-surface-muted hover:text-ink-900',
                    ].join(' ')}
                  >
                    {item.label}
                    <span
                      className={[
                        'absolute inset-x-4 bottom-1.5 h-[2px] rounded-full bg-brand-600 transition-transform duration-300 ease-smooth',
                        active ? 'scale-x-100' : 'scale-x-0',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:gap-2">
          <Link
            href="/cart"
            aria-label={`Savatcha${count ? `, ${count} ta mahsulot` : ''}`}
            className="relative rounded-lg p-2 text-ink-600 transition-colors duration-200 hover:bg-surface-muted hover:text-ink-900 lg:p-2.5"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path
                d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.55L21 8H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>

          <span className="mx-0.5 hidden h-6 w-px bg-line lg:mx-1 lg:block" aria-hidden="true" />

          <Link
            href={user ? '/profile' : '/login'}
            className="inline-flex h-10 shrink-0 items-center rounded-lg bg-ink-900 px-3 text-[0.8125rem] font-medium text-white transition-colors duration-200 hover:bg-ink-800 sm:h-11 sm:px-5 sm:text-sm"
          >
            {user ? 'Kabinet' : 'Kirish'}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
            className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-surface-muted lg:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile / tablet: intentionally designed drawer — large targets, grouped. */}
      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-white lg:hidden">
          <nav aria-label="Mobil navigatsiya" className="container-page max-h-[70vh] overflow-y-auto py-5">
            <ul className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      'flex items-center justify-between rounded-xl px-4 py-3.5 text-[1.0625rem] font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-ink-900 hover:bg-surface-muted',
                    ].join(' ')}
                  >
                    {item.label}
                    <svg
                      className="h-4 w-4 text-ink-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              {secondaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              href={user ? '/profile' : '/login'}
              className="mt-4 flex h-12 items-center justify-center rounded-xl bg-ink-900 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
            >
              {user ? 'Kabinet' : 'Kirish'}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
