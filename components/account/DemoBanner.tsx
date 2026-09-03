'use client';

import { useDemoMode } from '@/components/account/DemoModeProvider';

/**
 * Permanent demo marker.
 *
 * Rendered whenever demo rows are on screen, and never hidden behind a dismiss
 * button: a dashboard with sample data that can be mistaken for a real account
 * is the specific failure this whole phase is built to avoid.
 */
export function DemoBanner() {
  const { demo, bannerText, setDemo, ready } = useDemoMode();
  if (!ready || !demo) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-brand-900">
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 3 2.5 20h19L12 3Z" strokeLinejoin="round" />
          <path d="M12 9.5v4.5M12 17h.01" strokeLinecap="round" />
        </svg>
        {bannerText}
      </p>
      <button
        type="button"
        onClick={() => setDemo(false)}
        className="text-xs font-medium text-brand-800 underline underline-offset-4 hover:text-brand-900"
      >
        Demo rejimdan chiqish
      </button>
    </div>
  );
}
