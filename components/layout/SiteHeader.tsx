'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { primaryNav, secondaryNav, site } from '@/lib/site';
import { HeaderSearch } from '@/components/search/HeaderSearch';
import { useCart } from '@/components/cart/CartProvider';
import { CartBadge } from '@/components/cart/CartBadge';
import { useAuth } from '@/components/auth/AuthProvider';

function MarkabMark() {
  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow transition-transform duration-200 sm:h-10 sm:w-10"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
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
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { count } = useCart();
  // No auth provider exists, so this is always false — the header therefore
  // always offers 'Kirish', which is the honest state.
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    try {
      if (window.sessionStorage.getItem('markab.announcement.dismissed') === '1') {
        setAnnouncementDismissed(true);
      }
    } catch { /* storage disabled */ }
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

  // Move focus into the drawer when it opens. Without this the visitor is left
  // tabbing through the page behind a drawer they cannot see past.
  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
    (first ?? menuRef.current)?.focus();
  }, [open]);

  /**
   * Escape closes the drawer and Tab cycles inside it.
   *
   * The trigger stays in the cycle on purpose: while the drawer is open its
   * label is "Menyuni yopish", so it is the close control, and a keyboard
   * visitor must be able to reach it. Background scroll is already locked.
   */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const inside = [...(menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])];
      const order = toggleRef.current ? [toggleRef.current, ...inside] : inside;
      if (order.length === 0) return;
      const first = order[0];
      const last = order[order.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (active instanceof Node && !order.some((el) => el.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Closing for any reason returns focus to the trigger, so keyboard position
  // is never lost (this also covers closing via route change).
  const closeMenu = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    try {
      window.sessionStorage.setItem('markab.announcement.dismissed', '1');
    } catch { /* storage disabled */ }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b transition-all duration-300 ease-smooth',
        scrolled
          ? 'border-line-hairline bg-white/80 shadow-header backdrop-blur-xl'
          : 'border-transparent bg-white/70 backdrop-blur-xl',
      ].join(' ')}
    >
      {/* Top announcement bar — short value message, collapses on scroll. */}
      <div
        className={[
          'overflow-hidden bg-brand-600 text-white transition-[max-height,opacity] duration-300 ease-smooth',
          scrolled || open ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100',
        ].join(' ')}
      >
        <div className="container-page flex items-center justify-between gap-3 py-1.5 text-[11px]">
          <span className="truncate">
            <strong className="font-semibold">Yangi:</strong> Muddatli to‘lov shartlari endi onlayn tarzda mavjud
          </span>
          <Link
            href="/financing"
            className="hidden shrink-0 items-center gap-1 text-white/90 underline-offset-2 transition-colors hover:text-white hover:underline sm:inline-flex"
          >
            Batafsil
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="container-page flex h-14 items-center gap-3 sm:h-16 lg:h-[76px] lg:gap-8">
        <Link
          href="/"
          className="flex h-10 shrink-0 items-center gap-2"
          aria-label="Markab bosh sahifa"
        >
          <MarkabMark />
          <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[1.0625rem]">
            Markab
          </span>
        </Link>

        {/* Desktop primary navigation — the five goals of the product. */}
        <nav aria-label="Asosiy navigatsiya" className="hidden nav:block">
          <ul className="flex items-center gap-0.5">
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'relative flex h-11 items-center rounded-lg px-3 text-[0.9375rem] font-medium transition-colors duration-200 lg:px-4',
                      active
                        ? 'text-brand-700'
                        : 'text-ink-600 hover:bg-surface-muted hover:text-ink-900',
                    ].join(' ')}
                  >
                    {item.label}
                    <span
                      className={[
                        'absolute inset-x-4 bottom-1.5 h-[2px] rounded-full bg-brand-500 transition-transform duration-300 ease-smooth',
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

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:gap-2">
          <Suspense fallback={null}>
            <HeaderSearch />
          </Suspense>

          <Link
            href="/cart"
            aria-label={`Savatcha${count ? `, ${count} ta mahsulot` : ''}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors duration-200 hover:bg-surface-muted hover:text-ink-900 active:bg-surface-sunken lg:h-11 lg:w-auto lg:rounded-lg lg:p-2.5"
          >
            <svg
              className="h-[22px] w-[22px] lg:h-5 lg:w-5"
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
            <CartBadge />
          </Link>

          <span className="mx-0.5 hidden h-6 w-px bg-line lg:mx-1 lg:block" aria-hidden="true" />

          <Link
            href={isAuthenticated ? '/profile' : '/login'}
            className="hidden h-10 shrink-0 items-center rounded-full bg-ink-900 px-5 text-[0.8125rem] font-medium text-white transition-colors duration-200 hover:bg-black active:bg-ink-800 sm:inline-flex sm:h-11 sm:text-sm"
          >
            {isAuthenticated ? 'Kabinet' : 'Kirish'}
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => (open ? closeMenu() : setOpen(true))}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 transition-colors hover:bg-surface-muted active:bg-surface-sunken nav:hidden"
          >
            <svg
              className="h-[22px] w-[22px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
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

      {/* Mobile / tablet drawer — iOS grouped-list look: soft sunken bg,
          white rounded card with hairline separators, chevrons. */}
      {open ? (
        <div
          ref={menuRef}
          id="mobile-menu"
          tabIndex={-1}
          className="border-t border-line-hairline bg-[#f2f3f7] nav:hidden focus:outline-none"
        >
          <nav
            aria-label="Mobil navigatsiya"
            className="container-page max-h-[72vh] overflow-y-auto px-4 pb-6 pt-3 sm:px-6"
          >
            <p className="ios-section-title pt-1">Asosiy bo‘limlar</p>
            <ul className="ios-group">
              {primaryNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        'ios-row',
                        active ? 'text-brand-700' : 'text-ink-900',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-3">
                        {active ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/12 text-brand-600">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                              <path d="M12 2.6l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 15.2l-5 3.3 1.4-5.9L3.8 8.7l6-.5L12 2.6z" />
                            </svg>
                          </span>
                        ) : null}
                        {item.label}
                      </span>
                      <svg
                        className="ios-row-chevron h-[18px] w-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="ios-section-title mt-5">Qo‘shimcha</p>
            <ul className="ios-group">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="ios-row">
                    {item.label}
                    <svg
                      className="ios-row-chevron h-[18px] w-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={isAuthenticated ? '/profile' : '/login'}
              className="mt-5 flex h-[50px] items-center justify-center gap-2 rounded-[14px] bg-brand-600 px-6 text-[15px] font-semibold text-white shadow-glow transition-ctrl active:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              {isAuthenticated ? 'Kabinetga kirish' : 'Kirish / Ro‘yxatdan o‘tish'}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
