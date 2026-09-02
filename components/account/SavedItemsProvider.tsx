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

/**
 * What a stored saved-item is allowed to be.
 *
 * Rehydrated from `localStorage`, i.e. from data anything else on the origin
 * can write. The previous check only asked whether the fields were the right
 * *type*, which is exactly the check a hostile value passes: a well-typed
 * `href` of `javascript:alert(1)` renders as a working link, and an `image`
 * pointing at an arbitrary host either leaks a referrer or makes `next/image`
 * throw. Type is not trust — every field is now checked for shape, range and,
 * where it is used as a URL, for scheme and host.
 */
function isSavedItem(value: unknown): value is SavedItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    isBoundedText(v.ref, 200) &&
    isBoundedText(v.title, 200) &&
    isSafeInternalHref(v.href) &&
    isSaneAmount(v.priceUzs) &&
    (v.kind === 'car' || v.kind === 'electronics') &&
    // `image` is optional in the stored shape but still constrained when set.
    (v.image === undefined || v.image === null || isAllowedImageUrl(v.image)) &&
    // A timestamp is either a plausible ISO date or it is not shown at all.
    (v.savedAt === undefined || typeof v.savedAt === 'string')
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
