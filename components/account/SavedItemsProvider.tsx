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

/**
 * Saved products — browser-local prototype state.
 *
 * WHAT THIS IS: a wishlist that lives in this browser, so the dashboard has
 * something real to show that the visitor actually did.
 *
 * WHAT THIS IS NOT: an account feature. Nothing syncs to Markab, nothing
 * survives a different device or browser, and clearing site data removes it.
 * The dashboard says exactly that next to the list, because a saved-product
 * grid that looks account-backed is the kind of small lie that makes the rest
 * of the page untrustworthy.
 */

const STORAGE_KEY = 'markab.demo.saved';
const MAX_ITEMS = 24;

type SavedContextValue = {
  items: SavedItem[];
  ready: boolean;
  has: (ref: string) => boolean;
  toggle: (item: Omit<SavedItem, 'savedAt'>) => void;
  remove: (ref: string) => void;
  clear: () => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

function isSavedItem(value: unknown): value is SavedItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.ref === 'string' &&
    typeof v.title === 'string' &&
    typeof v.href === 'string' &&
    typeof v.priceUzs === 'number' &&
    (v.kind === 'car' || v.kind === 'electronics')
  );
}

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);

  // Read once after mount so server and client render the same first paint.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) setItems(parsed.filter(isSavedItem).slice(0, MAX_ITEMS));
      }
    } catch {
      // Unreadable or blocked storage simply starts from an empty list.
    }
    setReady(true);
  }, []);

  // Persist only after hydration, so the initial empty state cannot wipe
  // whatever the previous visit stored.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or blocked; the list still works in memory.
    }
  }, [items, ready]);

  const toggle = useCallback((item: Omit<SavedItem, 'savedAt'>) => {
    setItems((current) =>
      current.some((entry) => entry.ref === item.ref)
        ? current.filter((entry) => entry.ref !== item.ref)
        : [{ ...item, savedAt: new Date().toISOString() }, ...current].slice(0, MAX_ITEMS),
    );
  }, []);

  const remove = useCallback((ref: string) => {
    setItems((current) => current.filter((entry) => entry.ref !== ref));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<SavedContextValue>(
    () => ({
      items,
      ready,
      has: (ref: string) => items.some((entry) => entry.ref === ref),
      toggle,
      remove,
      clear,
    }),
    [items, ready, toggle, remove, clear],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSavedItems(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSavedItems must be used inside SavedItemsProvider');
  return ctx;
}
