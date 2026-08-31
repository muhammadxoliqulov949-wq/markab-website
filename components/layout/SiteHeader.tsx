'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { primaryNav, secondaryNav, site } from '@/lib/site';
import { useCart } from '@/components/cart/CartProvider';
import { useAuth } from '@/components/auth/AuthProvider';

function MarkabMark({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <span
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300',
        tone === 'light' ? 'bg-white text-ink-900' : 'bg-brand-700 text-white',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.6l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 15.2l-5 3.3 1.4-5.9L3.8 8.7l6-.5L12 2.6z" />
      </svg>
    </span>
  );
}

/**
 * Premium responsive header.
 *
 * On the homepage the header starts transparent over the dark hero and becomes a
 * solid, condensed bar once the page scrolls. On every other route the hero is
 * light, so the bar is always solid — white text on a white page would be
 * unreadable.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();

  const overHero = pathname === '/';
  const light = overHero && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const linkClass = (href: string) =>
    [
      'relative flex h-10 items-center rounded-lg px-3.5 text-sm font-medium transition-colors duration-200',
      light
        ? isActive(href)
          ? 'text-white'
          : 'text-white/70 hover:text-white'
        : isActive(href)
          ? 'text-brand-800'
          : 'text-ink-600 hover:text-ink-900',
    ].join(' ');

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300 ease-smooth',
        light
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-line bg-white/90 shadow-[0_1px_0_rgba(12,17,22,0.04)] backdrop-blur-md',
      ].join(' ')}
    >
      {/* Prototype transparency strip — condenses once the page scrolls. */}
      <div
        className={[
          'overflow-hidden bg-ink-900 text-white/70 transition-[max-height,opacity] duration-300 ease-smooth',
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

      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link
          href="/"
          className="flex h-11 items-center gap-2.5"
          aria-label="Markab bosh sahifa"
        >
          <MarkabMark tone={light ? 'light' : 'dark'} />
          <span
            className={[
              'text-lg font-semibold tracking-[-0.02em] transition-colors duration-300',
              light ? 'text-white' : 'text-ink-900',
            ].join(' ')}
          >
            Markab
          </span>
        </Link>

        <nav aria-label="Asosiy navigatsiya" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={linkClass(item.href)}>
                  {item.label}
                  <span
                    className={[
                      'absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 ease-smooth',
                      isActive(item.href) ? 'scale-x-100' : 'group-hover:scale-x-100',
                      light ? 'bg-white/80' : 'bg-brand-700',
                    ].join(' ')}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/cart"
            aria-label={`Savatcha${count ? `, ${count} ta mahsulot` : ''}`}
            className={[
              'relative rounded-lg p-2.5 transition-colors duration-200',
              light ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-ink-600 hover:bg-surface-sunken hover:text-ink-900',
            ].join(' ')}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.55L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>

          <Link
            href={user ? '/profile' : '/login'}
            className={[
              'hidden h-10 items-center rounded-lg px-4 text-sm font-medium transition-all duration-200 sm:inline-flex',
              light
                ? 'border border-white/25 text-white hover:border-white/50 hover:bg-white/10'
                : 'bg-ink-900 text-white hover:bg-ink-800',
            ].join(' ')}
          >
            {user ? 'Kabinet' : 'Kirish'}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
            className={[
              'rounded-lg p-2.5 transition-colors lg:hidden',
              light ? 'text-white hover:bg-white/10' : 'text-ink-700 hover:bg-surface-sunken',
            ].join(' ')}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile: intentionally designed drawer — large targets, grouped, thumb-reachable. */}
      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-white lg:hidden">
          <nav aria-label="Mobil navigatsiya" className="container-page py-5">
            <ul className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      'flex items-center justify-between rounded-xl px-4 py-3.5 text-[1.0625rem] font-medium transition-colors',
                      isActive(item.href) ? 'bg-brand-50 text-brand-800' : 'text-ink-900 hover:bg-surface-muted',
                    ].join(' ')}
                  >
                    {item.label}
                    <svg className="h-4 w-4 text-ink-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
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
