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
import {
  unavailableAuthService,
  type AuthService,
  type AuthSession,
  type OtpRequestResult,
  type OtpVerifyResult,
} from '@/lib/auth/service';



/**
 * Account state machine.
 *
 *   loading          — reading the session (first paint, no data yet)
 *   unavailable      — no auth provider exists        ← the truth in this prototype
 *   unauthenticated  — provider exists, no session
 *   authenticated    — a real session (only a real provider can produce this)
 *   error            — the provider failed
 *
 * There is intentionally no 'demo' member. Demo is a *viewing mode* for the
 * dashboard, not an authentication state: a demo dashboard is still an
 * un-authenticated dashboard, and conflating the two is how prototypes end up
 * looking like real customer accounts.
 */
export type AuthStatus = 'loading' | 'unavailable' | 'unauthenticated' | 'authenticated' | 'error';

export type AuthState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'error'; message: string };

type AuthContextValue = {
  state: AuthState;
  status: AuthStatus;
  session: AuthSession | null;
  /** Convenience for gate components. */
  isAuthenticated: boolean;
  requestOtp: (phone: string) => Promise<OtpRequestResult>;
  verifyOtp: (phone: string, code: string) => Promise<OtpVerifyResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  service: injectedService,
}: {
  children: ReactNode;
  /**
   * Injectable so tests / preview can supply a stub. When omitted, the
   * provider starts with the honest `unavailable` stub during SSR/first
   * paint and swaps to the real HTTP service on mount.
   */
  service?: AuthService;
}) {
  const [service, setService] = useState<AuthService>(() => injectedService ?? unavailableAuthService);
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    if (injectedService) {
      setService(injectedService);
      return;
    }
    // On the client, swap to the real HTTP service and hydrate the session.
    // Dynamic import keeps this file tree-shakeable from the server bundle.
    let cancelled = false;
    (async () => {
      const mod = await import('@/lib/auth/http-service');
      if (cancelled) return;
      setService(mod.httpAuthService);
    })();
    return () => {
      cancelled = true;
    };
  }, [injectedService]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await service.getSession();
        if (cancelled) return;
        if (service.name === 'unavailable') setState({ status: 'unavailable' });
        else setState(session ? { status: 'authenticated', session } : { status: 'unauthenticated' });
      } catch {
        if (!cancelled) setState({ status: 'error', message: 'Sessiyani o‘qib bo‘lmadi.' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [service]);

  const requestOtp = useCallback(
    (phone: string) => service.requestOtp(phone),
    [service],
  );

  /**
   * Only a successful provider response may set `authenticated`. The result is
   * checked rather than assumed, so an `unavailable` or `invalid_code` outcome
   * can never be promoted into a session.
   */
  const verifyOtp = useCallback(
    async (phone: string, code: string) => {
      const result = await service.verifyOtp(phone, code);
      if (result.status === 'authenticated') {
        setState({ status: 'authenticated', session: result.session });
      } else if (result.status === 'invalid_code') {
        setState({ status: 'unauthenticated' });
      }
      return result;
    },
    [service],
  );

  const signOut = useCallback(async () => {
    await service.signOut();
    setState(service.name === 'unavailable' ? { status: 'unavailable' } : { status: 'unauthenticated' });
  }, [service]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      status: state.status,
      session: state.status === 'authenticated' ? state.session : null,
      isAuthenticated: state.status === 'authenticated',
      requestOtp,
      verifyOtp,
      signOut,
    }),
    [state, requestOtp, verifyOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
