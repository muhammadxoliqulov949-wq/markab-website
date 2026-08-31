'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { primaryNav, secondaryNav, site } from '@/lib/site';
import { useCart } from '@/components/cart/CartProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { ButtonLink } from '@/components/ui/Button';

function MarkabMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.6l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 15.2l-5 3.3 1.4-5.9L3.8 8.7l6-.5L12 2.6z" />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  /** Subtle sticky state: the strip condenses and the bar gains a hairline shadow. */
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
        'sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ease-smooth',
        scrolled ? 'border-line-strong shadow-card' : 'border-line',
      ].join(' ')}
    >
      {/* Prototype transparency strip — condenses once the page is scrolled. */}
      <div
        className={[
          'overflow-hidden bg-ink-900 text-white/70 transition-[max-height,opacity] duration-300 ease-smooth',
          scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100',
        ].join(' ')}
      >
        <div className="container-page flex items-center justify-between py-1.5 text-[11px]">
          <span className="truncate">
            Markab 2.0 kontsept-prototip · real API ulanmagan · namuna ma’lumotlari
          </span>
          <span className="hidden sm:inline">{site.positioning}</span>
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Markab bosh sahifa">
          <MarkabMark />
          <span className="text-lg font-semibold tracking-[-0.02em] text-ink-900">Markab</span>
        </Link>

        <nav aria-label="Asosiy navigatsiya" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={[
                    'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink-600 hover:bg-surface-sunken hover:text-ink-900',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label={`Savatcha${count ? `, ${count} ta mahsulot` : ''}`}
            className="relative rounded-lg p-2.5 text-ink-600 transition-colors hover:bg-surface-sunken hover:text-ink-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.55L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>

          <ButtonLink href={user ? '/profile' : '/login'} variant="secondary" size="sm" className="hidden sm:inline-flex">
            {user ? 'Kabinet' : 'Kirish'}
          </ButtonLink>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
            className="rounded-lg p-2.5 text-ink-700 transition-colors hover:bg-surface-sunken lg:hidden"
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

      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-white lg:hidden">
          <nav aria-label="Mobil navigatsiya" className="container-page py-4">
            <ul className="flex flex-col">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      'block rounded-lg px-3 py-3 text-[0.9375rem] font-medium transition-colors',
                      isActive(item.href) ? 'bg-brand-50 text-brand-800' : 'text-ink-800 hover:bg-surface-muted',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-4">
              {secondaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={user ? '/profile' : '/login'}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
              >
                {user ? 'Kabinet' : 'Kirish'}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
