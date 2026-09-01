'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink, Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDemoMode } from '@/components/account/DemoModeProvider';
import { useSavedItems } from '@/components/account/SavedItemsProvider';
import { DemoBanner } from '@/components/account/DemoBanner';
import { OverviewPanel } from './panels/OverviewPanel';
import { ApplicationsPanel } from './panels/ApplicationsPanel';
import { AgreementsPanel } from './panels/AgreementsPanel';
import { PaymentsPanel } from './panels/PaymentsPanel';
import { SavedPanel } from './panels/SavedPanel';
import { NotificationsPanel } from './panels/NotificationsPanel';
import { SupportPanel } from './panels/SupportPanel';
import { DEMO_ACCOUNT } from '@/lib/account/demo';
import type { AccountSnapshot } from '@/lib/account/types';

/**
 * My Markab — dashboard shell.
 *
 * STATE MACHINE (all six states the brief asks for):
 *
 *   loading           — session not read yet                  → skeleton
 *   unavailable       — no auth provider exists               → honest block   ← the truth today
 *   unauthenticated   — provider exists, no session           → sign-in CTA
 *   authenticated+empty — signed in, account backend absent   → pending panels
 *   demo              — authenticated view with sample rows   → DemoBanner + panels
 *   error             — the provider failed                   → error block
 *
 * Nothing in this file can produce a signed-in state on its own: it reads the
 * status from `useAuth`, and the auth service is `unavailable`.
 *
 * The "Prototip holati" switch exists so a reviewer can see the
 * unauthenticated / empty / demo variants without a backend. It never says the
 * account is real — the demo banner and the unavailable copy stay on screen.
 */

type TabId = 'overview' | 'applications' | 'financing' | 'payments' | 'saved' | 'notifications' | 'support';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Umumiy' },
  { id: 'applications', label: 'Arizalarim' },
  { id: 'financing', label: 'Moliyalashtirish' },
  { id: 'payments', label: 'To‘lovlar' },
  { id: 'saved', label: 'Saqlanganlar' },
  { id: 'notifications', label: 'Bildirishnomalar' },
  { id: 'support', label: 'Yordam' },
];

/**
 * Reviewer-only preview of the auth state.
 *
 * CARRIED IN THE URL, not in component state: `/profile?holat=demo` is
 * deterministic, survives a refresh and can be shared as a link. Unknown or
 * missing values fall back to 'real', so a fresh visit always shows the honest
 * answer first and a mistyped URL can never reach a fake account.
 */
type PreviewState = 'real' | 'kirilmagan' | 'kirilgan' | 'demo';

const PREVIEW_PARAM = 'holat';

function parseHolat(raw: string | null): PreviewState {
  return raw === 'kirilmagan' || raw === 'kirilgan' || raw === 'demo' ? raw : 'real';
}

export function AccountDashboard() {
  const { state, status } = useAuth();
  const { setDemo } = useDemoMode();
  const { items: saved } = useSavedItems();
  const [tab, setTab] = useState<TabId>('overview');
  /** Refs for arrow-key movement across the tab strip. */
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * The ONE source of truth for which account state is on screen.
   *
   * Previously `demo` (a provider flag) and `preview` (local useState) were
   * independent, so pressing "Demo rejimda ko‘rish" set the demo flag but left
   * `preview` on 'real'. The page stayed in the `unavailable` branch and the
   * button looked dead. Both now derive from the URL and cannot drift.
   */
  const holat = parseHolat(searchParams.get(PREVIEW_PARAM));
  const isDemo = holat === 'demo';

  const setHolat = useCallback(
    (next: PreviewState) => {
      const query = next === 'real' ? '' : `?${PREVIEW_PARAM}=${next}`;
      // `replace` keeps switching out of the history stack; scroll is
      // preserved so the reviewer stays where they were.
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router],
  );

  /**
   * Mirror the URL into the provider so the banner and the panels read the
   * same value. The URL wins on every render, so the two cannot drift.
   */
  useEffect(() => {
    setDemo(isDemo);
  }, [isDemo, setDemo]);

  /**
   * The effective status shown to the user. `holat` only ever makes the UI show
   * a state the real service would produce; it cannot invent a session, and
   * 'real' is always the default on a fresh load.
   */
  const effectiveStatus = useMemo(() => {
    if (holat === 'real') return status;
    if (holat === 'kirilmagan') return 'unauthenticated' as const;
    return 'authenticated' as const;
  }, [holat, status]);

  /**
   * Account data comes from the repository in the real build. Both providers
   * return `unavailable` today, so this is null and every panel renders its
   * pending state — demo rows are substituted only when demo mode is on.
   */
  const snapshot: AccountSnapshot | null = isDemo ? DEMO_ACCOUNT : null;
  const hasAccountBackend = false;

  // ---- loading ------------------------------------------------------------
  if (effectiveStatus === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <span className="sr-only">Hisob holati yuklanmoqda</span>
        <div className="h-28 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
      </div>
    );
  }

  // ---- error --------------------------------------------------------------
  if (effectiveStatus === 'error') {
    return (
      <StateBlock
        variant="error"
        title="Hisob ma’lumotlarini o‘qib bo‘lmadi"
        description={state.status === 'error' ? state.message : 'Kutilmagan xatolik yuz berdi.'}
        actions={
          <ButtonLink href="/contact" variant="secondary" size="sm">
            Yordam
          </ButtonLink>
        }
      />
    );
  }

  // ---- authentication unavailable -----------------------------------------
  if (effectiveStatus === 'unavailable') {
    return (
      <div className="space-y-4">
        <StateBlock
          variant="unavailable"
          title="Kirish tizimi ulanmagan"
          description="Kirish tizimi rasmiy autentifikatsiya xizmati bilan integratsiya qilinmoqda. Shaxsiy kabinet real hisob ma’lumotlarisiz ishlay olmaydi, shuning uchun bu yerda hech qanday shaxsiy yoki moliyaviy ma’lumot ko‘rsatilmaydi."
          actions={
            <>
              <ButtonLink href="/login" size="sm">
                Kirish sahifasi
              </ButtonLink>
              <Button variant="secondary" size="sm" onClick={() => setHolat('demo')}>
                Demo rejimda ko‘rish
              </Button>
            </>
          }
        />
        <SavedProductsPreview holat={holat} />
        <PrototypeControls holat={holat} setHolat={setHolat} />
      </div>
    );
  }

  // ---- not signed in ------------------------------------------------------
  if (effectiveStatus === 'unauthenticated') {
    return (
      <div className="space-y-4">
        <StateBlock
          variant="empty"
          title="Hisobga kirilmagan"
          description="Shaxsiy kabinet faqat hisobga kirgandan so‘ng to‘ldiriladi. Kirish telefon raqami va SMS kod orqali amalga oshiriladi."
          actions={
            <>
              <ButtonLink href="/login" size="sm">
                Kirish
              </ButtonLink>
              <Button variant="secondary" size="sm" onClick={() => setHolat('demo')}>
                Demo rejimda ko‘rish
              </Button>
            </>
          }
        />
        <SavedProductsPreview holat={holat} />
        <PrototypeControls holat={holat} setHolat={setHolat} />
      </div>
    );
  }

  // ---- dashboard (empty or demo) ------------------------------------------
  return (
    <div className="space-y-5">
      <DemoBanner />

      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">
              Mening Markabim
            </p>
            {/*
              No "Xush kelibsiz, <name>": there is no customer behind this
              prototype, and a greeting addressed to nobody is what makes a demo
              dashboard read as a real account.
            */}
            <h2 className="mt-1.5 text-lg font-semibold text-ink-900 sm:text-xl">
              Shaxsiy kabinet
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-500">
              Arizalar, shartnomalar, to‘lovlar va saqlangan mahsulotlar shu yerda jamlangan.
              {hasAccountBackend
                ? ''
                : ' Real hisob manbasi ulanmagani uchun qiymatlar ko‘rsatilmaydi — ular taxminiy ma’lumot bilan almashtirilmaydi.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={hasAccountBackend ? 'brand' : 'pending'}>
              {hasAccountBackend ? 'Hisob ulangan' : 'Integratsiya kutilmoqda'}
            </Badge>
            {isDemo ? <Badge tone="warning">Demo</Badge> : null}
          </div>
        </div>
      </div>

      {/*
        Tab strip — horizontally scrollable on mobile, no layout shift.

        Real ARIA tabs: the strip is a tablist, each button is a tab with
        aria-selected and aria-controls, and the panel below is the tabpanel
        they own. Keyboard users get one tab stop and arrow-key movement
        instead of seven.
      */}
      <div
        role="tablist"
        aria-label="Kabinet bo‘limlari"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        onKeyDown={(event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          const index = TABS.findIndex((item) => item.id === tab);
          const next =
            event.key === 'ArrowRight'
              ? (index + 1) % TABS.length
              : (index - 1 + TABS.length) % TABS.length;
          setTab(TABS[next].id);
          tabRefs.current[TABS[next].id]?.focus();
          tabRefs.current[TABS[next].id]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
          });
        }}
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[item.id] = node;
              }}
              type="button"
              role="tab"
              id={`account-tab-${item.id}`}
              aria-selected={active}
              aria-controls="account-tabpanel"
              // Only the selected tab is in the tab sequence; arrows move within.
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(item.id)}
              className={[
                'inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg border px-3.5 text-sm font-medium transition-colors',
                active
                  ? 'border-brand-200 bg-brand-50 text-brand-800'
                  : 'border-line bg-surface text-ink-600 hover:border-line-strong hover:text-ink-900',
              ].join(' ')}
            >
              {item.label}
              {item.id === 'saved' && saved.length > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-sunken px-1.5 text-[11px] font-semibold text-ink-700">
                  {saved.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id="account-tabpanel"
        role="tabpanel"
        aria-labelledby={`account-tab-${tab}`}
        // The panel is not itself focusable; arrow keys are handled on the
        // tablist, which is the pattern screen readers expect.
        tabIndex={-1}
      >
        {tab === 'overview' ? (
          <OverviewPanel
            snapshot={snapshot}
            saved={saved}
            demo={isDemo}
            hasAccountBackend={hasAccountBackend}
          />
        ) : null}
        {tab === 'applications' ? <ApplicationsPanel snapshot={snapshot} demo={isDemo} /> : null}
        {tab === 'financing' ? <AgreementsPanel snapshot={snapshot} demo={isDemo} /> : null}
        {tab === 'payments' ? <PaymentsPanel snapshot={snapshot} demo={isDemo} /> : null}
        {tab === 'saved' ? <SavedPanel /> : null}
        {tab === 'notifications' ? <NotificationsPanel snapshot={snapshot} demo={isDemo} /> : null}
        {tab === 'support' ? <SupportPanel /> : null}
      </div>

      {isDemo ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3">
          <p className="text-xs leading-relaxed text-ink-500">
            Demo rejim yoqilgan: ko‘rsatilgan ariza, shartnoma va bildirishnomalar namuna
            ma’lumotlari bo‘lib, real hisob yoki shartnoma emas.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setHolat('real')}>
            Demo rejimdan chiqish
          </Button>
        </div>
      ) : null}

      <PrototypeControls holat={holat} setHolat={setHolat} />
    </div>
  );
}

/**
 * Saved products are the one part of the dashboard backed by something real, so
 * they are surfaced even when the account itself is unavailable — behind the
 * same "local only" disclosure the full panel carries.
 */
function SavedProductsPreview({ holat }: { holat: PreviewState }) {
  const { items, ready } = useSavedItems();
  if (!ready || items.length === 0) return null;
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink-900">
          Saqlangan mahsulotlar ({items.length})
        </h2>
        <ButtonLink
          href={holat === 'real' ? '/profile?saved=1' : `/profile?holat=${holat}&saved=1`}
          variant="secondary"
          size="sm"
        >
          Barchasini ko‘rish
        </ButtonLink>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-400">
        Saqlanganlar faqat shu brauzerda turibdi va hisob bilan bog‘lanmagan.
      </p>
    </div>
  );
}

/**
 * Prototype-only state switcher.
 *
 * Writes to the URL, so every state is deterministic, refresh-safe and
 * shareable — `/profile?holat=demo` can be sent to a reviewer as a link. These
 * buttons cannot authenticate: they only choose which honest state to display.
 */
function PrototypeControls({
  holat,
  setHolat,
}: {
  holat: PreviewState;
  setHolat: (value: PreviewState) => void;
}) {
  const options: { id: PreviewState; label: string }[] = [
    { id: 'real', label: 'Haqiqiy holat' },
    { id: 'kirilmagan', label: 'Kirilmagan' },
    { id: 'kirilgan', label: 'Kirilgan (bo‘sh)' },
    { id: 'demo', label: 'Demo rejimi' },
  ];
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface-muted px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
        Prototip holati — faqat ko‘rib chiqish uchun
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
        Bu tugmalar real autentifikatsiya qilmaydi. Ular kabinet holatlarini ko‘rsatish uchun
        mo‘ljallangan. Holat URLda saqlanadi, shuning uchun sahifa yangilanganda yoki havola
        orqali ochilganda ham shu holat qoladi.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setHolat(option.id)}
            aria-pressed={holat === option.id}
            className={[
              'inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium transition-colors',
              holat === option.id
                ? 'border-ink-300 bg-surface text-ink-900'
                : 'border-line bg-surface text-ink-500 hover:border-line-strong hover:text-ink-800',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
