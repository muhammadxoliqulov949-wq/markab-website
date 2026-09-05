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
import type { SavedItem } from '@/lib/account/types';
import { isAllowedImageUrl, isBoundedText, isSafeInternalHref, isSaneAmount } from '@/lib/security/url';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch, ApiError } from '@/lib/client/api';

/**
 * Saved products — browser-local for anonymous visitors, server-synced for
 * authenticated users.
 *
 * Before login: items live in localStorage (same honest-demo behaviour the
 * prototype always had). On login: we replace the local list with the server
 * authoritative list, and subsequent toggle/remove calls go to the API. On
 * logout: we keep the local (anonymous) list so returning visitors don't lose
 * their wishlist.
 *
 * No field is trusted on the way back from storage OR the server — both paths
 * are validated by isSavedItem().
 */

const STORAGE_KEY = 'markab.demo.saved';
const MAX_ITEMS = 100; // must stay ≤ server limit (100)

type ServerSavedItem = {
  kind: 'car' | 'electronics';
  ref: string;
  title: string;
  priceUzs: number | null;
  image: string | null;
  href: string;
  createdAt: number;
};

type SavedContextValue = {
  items: SavedItem[];
  ready: boolean;
  has: (ref: string) => boolean;
  toggle: (item: Omit<SavedItem, 'savedAt'>) => Promise<void>;
  remove: (ref: string) => Promise<void>;
  clear: () => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

function isSavedItem(value: unknown): value is SavedItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    isBoundedText(v.ref, 200) &&
    isBoundedText(v.title, 200) &&
    isSafeInternalHref(v.href) &&
    isSaneAmount(v.priceUzs ?? 0) &&
    (v.kind === 'car' || v.kind === 'electronics') &&
    (v.image === undefined || v.image === null || isAllowedImageUrl(v.image)) &&
    (v.savedAt === undefined || typeof v.savedAt === 'string')
  );
}

function fromServer(row: ServerSavedItem): SavedItem | null {
  const candidate: SavedItem = {
    kind: row.kind,
    ref: row.ref,
    title: row.title,
    priceUzs: row.priceUzs ?? 0,
    image: row.image,
    href: row.href,
    savedAt: new Date(row.createdAt).toISOString(),
  };
  return isSavedItem(candidate) ? candidate : null;
}

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);

  // Initial hydration: anonymous reads localStorage; authenticated fetches
  // from the server (falling back to localStorage if that fails).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isAuthenticated) {
        try {
          const res = (await apiFetch('/api/saved-items')) as { items?: ServerSavedItem[] };
          if (cancelled) return;
          const serverItems = (res.items ?? [])
            .map(fromServer)
            .filter((x): x is SavedItem => x !== null);
          setItems(serverItems);
          setReady(true);
          return;
        } catch {
          // Fall through to localStorage below so a network error doesn't
          // wipe the UI — but we mark ready so the UI shows something.
        }
      }
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) setItems(parsed.filter(isSavedItem).slice(0, MAX_ITEMS));
        }
      } catch {
        /* blocked storage */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Persist anonymous list to localStorage after changes. Authenticated list
  // is persisted on the server; we still mirror locally so a logout keeps
  // the visitor's wishlist.
  useEffect(() => {
    if (!ready || isAuthenticated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be blocked */
    }
  }, [items, ready, isAuthenticated]);

  const toggle = useCallback(
    async (item: Omit<SavedItem, 'savedAt'>) => {
      const exists = items.some((entry) => entry.ref === item.ref);
      if (isAuthenticated) {
        try {
          if (exists) {
            await apiFetch(`/api/saved-items?kind=${encodeURIComponent(item.kind)}&ref=${encodeURIComponent(item.ref)}`, { method: 'DELETE' });
            setItems((c) => c.filter((e) => e.ref !== item.ref));
          } else {
            const body = {
              kind: item.kind,
              ref: item.ref,
              title: item.title,
              priceUzs: item.priceUzs || null,
              image: item.image,
              href: item.href,
            };
            const res = (await apiFetch('/api/saved-items', {
              method: 'POST',
              body: JSON.stringify(body),
            })) as { item?: ServerSavedItem };
            if (res.item) {
              const mapped = fromServer(res.item);
              if (mapped) setItems((c) => [mapped, ...c.filter((e) => e.ref !== item.ref)].slice(0, MAX_ITEMS));
            }
          }
        } catch (err) {
          // On network error fall back to local-only state so the UI doesn't
          // appear broken; the change will not sync to the server this visit.
          if (!(err instanceof ApiError)) {
            setItems((current) =>
              exists
                ? current.filter((entry) => entry.ref !== item.ref)
                : [{ ...item, savedAt: new Date().toISOString() }, ...current].slice(0, MAX_ITEMS),
            );
          }
        }
        return;
      }
      setItems((current) =>
        exists
          ? current.filter((entry) => entry.ref !== item.ref)
          : [{ ...item, savedAt: new Date().toISOString() }, ...current].slice(0, MAX_ITEMS),
      );
    },
    [items, isAuthenticated],
  );

  const remove = useCallback(
    async (ref: string) => {
      const entry = items.find((e) => e.ref === ref);
      if (isAuthenticated && entry) {
        try {
          await apiFetch(`/api/saved-items?kind=${encodeURIComponent(entry.kind)}&ref=${encodeURIComponent(ref)}`, { method: 'DELETE' });
        } catch {
          /* fall through to local removal anyway */
        }
      }
      setItems((current) => current.filter((e) => e.ref !== ref));
    },
    [items, isAuthenticated],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<SavedContextValue>(
    () => ({ items, ready, has: (ref) => items.some((e) => e.ref === ref), toggle, remove, clear }),
    [items, ready, toggle, remove, clear],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSavedItems(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSavedItems must be used inside SavedItemsProvider');
  return ctx;
}
