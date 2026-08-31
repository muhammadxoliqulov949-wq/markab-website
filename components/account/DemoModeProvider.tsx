'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
 */

const STORAGE_KEY = 'markab.demo.dashboard';

type DemoContextValue = {
  demo: boolean;
  ready: boolean;
  setDemo: (value: boolean) => void;
  toggle: () => void;
  bannerText: string;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demo, setDemoState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDemoState(window.localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      // Storage blocked → demo stays off, which is the honest default.
    }
    setReady(true);
  }, []);

  const setDemo = useCallback((value: boolean) => {
    setDemoState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // Persistence is a convenience; the session still works in memory.
    }
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
