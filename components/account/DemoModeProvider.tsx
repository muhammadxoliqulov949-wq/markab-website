'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEMO_BANNER_TEXT } from '@/lib/account/demo';

/**
 * Demo mode — an explicit, reversible viewing mode for the dashboard.
 *
 * DEMO MODE IS NOT AUTHENTICATION. Turning it on does not log anyone in, does
 * not create a session and does not make the dashboard a customer account. It
 * only swaps empty/pending states for labelled sample rows so the layout can be
 * reviewed.
 *
 * The banner text is exported from here so every surface uses the identical
 * wording and it cannot drift.
 *
 * STATE OWNERSHIP: this provider no longer reads or writes localStorage. Demo
 * mode is driven entirely by the URL (`/profile?holat=demo`) and mirrored in
 * here by the dashboard. Two independent sources — a persisted flag plus local
 * component state — is what let the two disagree and made the "Demo rejimda
 * ko‘rish" button look broken.
 */

type DemoContextValue = {
  demo: boolean;
  ready: boolean;
  setDemo: (value: boolean) => void;
  toggle: () => void;
  bannerText: string;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  // In-memory only. There is nothing to hydrate from, so `ready` is
  // immediately true and there is no first-paint mismatch to reconcile.
  const [demo, setDemoState] = useState(false);
  const ready = true;

  const setDemo = useCallback((value: boolean) => {
    setDemoState(value);
  }, []);

  const toggle = useCallback(() => setDemo(!demo), [demo, setDemo]);

  const value = useMemo<DemoContextValue>(
    () => ({ demo, ready, setDemo, toggle, bannerText: DEMO_BANNER_TEXT }),
    [demo, ready, setDemo, toggle],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoMode(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoMode must be used inside DemoModeProvider');
  return ctx;
}
