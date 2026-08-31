'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * DEMO AUTHENTICATION — prototype only.
 *
 * The production site authenticates with a phone number + SMS code. There is no
 * backend in this prototype, so the session is held in localStorage and is
 * explicitly labelled as a demo wherever it is used.
 *
 * When the real API is connected, replace this provider with the OTP flow — the
 * UI only depends on `user`, `signIn` and `signOut`.
 */

export type DemoUser = { phone: string; name: string | null };

type AuthContextValue = {
  user: DemoUser | null;
  ready: boolean;
  signIn: (phone: string) => void;
  signOut: () => void;
};

const STORAGE_KEY = 'markab.demo.session';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as DemoUser);
    } catch {
      // Corrupt or unavailable storage → treat as signed out.
    }
    setReady(true);
  }, []);

  const signIn = useCallback((phone: string) => {
    const next: DemoUser = { phone, name: null };
    setUser(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — session stays in memory for this tab.
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
