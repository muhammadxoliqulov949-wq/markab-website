'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Mobile-first bottom navigation.
 *
 * The primary goals of the product are one tap away on every screen — this is
 * the mobile answer to "what should I click first?".
 */
const tabs = [
  {
    href: '/cars',
    label: 'Avtomobil',
    icon: (
      <path d="M5 16.5h14M6.5 16.5V12l1.4-4.2A2 2 0 0 1 9.8 6.3h4.4a2 2 0 0 1 1.9 1.5l1.4 4.2v4.5M7 16.5v1.8M17 16.5v1.8" />
    ),
  },
  {
    href: '/electronics',
    label: 'Elektronika',
    icon: (
      <>
        <rect x="7" y="3" width="10" height="18" rx="2.5" />
        <path d="M11 18h2" />
      </>
    ),
  },
  {
    href: '/financing/calculator',
    label: 'Kalkulyator',
    icon: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 8h8M8 12h3M8 16h3M15 12v4" />
      </>
    ),
  },
  {
    href: '/invest',
    label: 'Sarmoya',
    icon: <path d="M4 17l5-5 3.5 3L20 8M20 8h-4M20 8v4" />,
  },
  {
    href: '/profile',
    label: 'Kabinet',
    icon: (
      <>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20c1.4-3.4 4-5 7-5s5.6 1.6 7 5" />
      </>
    ),
  },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Tezkor navigatsiya"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Height pinned to --tabbar-h so the value in globals.css stays true. */}
      <ul className="grid h-[var(--tabbar-h)] grid-cols-5 items-center">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors',
                  active ? 'text-brand-700' : 'text-ink-500',
                ].join(' ')}
              >
                <svg
                  className="h-[22px] w-[22px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {tab.icon}
                </svg>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
