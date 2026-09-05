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
import { isAllowedImageUrl, isBoundedText, isSafeInternalHref, isSaneAmount } from '@/lib/security/url';
import { announce } from '@/components/ui/LiveRegion';

export type CartItem = {
  id: string;
  name: string;
  priceUzs: number;
  image: string | null;
  href: string;
};

/**
 * What a stored cart line is allowed to be.
 *
 * This list is rehydrated from `localStorage`, which is writable by anything
 * else running on the origin — another script, an extension, dev-tools. The
 * values are rendered into `<Link href>` and `<Image src>`, and neither React
 * nor `next/image` sanitises those: React escapes text, but an `href` is not
 * text. `javascript:` in a stored `href` would execute on click, and a remote
 * `src` on a host outside `remotePatterns` makes `next/image` throw at render
 * time, taking the cart page down with it.
 *
 * So every field is checked on the way in, and a line that fails is dropped
 * rather than repaired — a missing row is a puzzle, a hostile row is a bug.
 */
function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    isBoundedText(v.id, 120) &&
    isBoundedText(v.name, 200) &&
    isSaneAmount(v.priceUzs) &&
    (v.image === null || isAllowedImageUrl(v.image)) &&
    isSafeInternalHref(v.href)
  );
}

/** Upper bound on rehydrated lines: storage is untrusted input, not a database. */
const MAX_ITEMS = 50;

type CartContextValue = {
  items: CartItem[];
  /** Distinct products, not units — the prototype carries one line per item. */
  count: number;
  subtotal: number;
  has: (id: string) => boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = 'markab.demo.cart';
const CartContext = createContext<CartContextValue | null>(null);

/**
 * Browser-local cart for the prototype.
 *
 * This is NOT a backend: there is no account, no order and no checkout. The
 * items live in `localStorage` under an obviously namespaced demo key and the
 * cart page says so in as many words.
 *
 * Duplicate handling is intentional: the cart holds one line per product, so
 * adding the same product twice is a no-op rather than a silent second copy.
 * Cards and the detail page read `has(id)` to show "Savatchada" instead.
 *
 * Availability was checked at add time by `isPurchasable()` — a sold-out
 * product can never reach this list.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Read once, after mount, so server and client render the same first paint.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Validate before the values can reach an href or an image src.
          setItems(parsed.filter(isCartItem).slice(0, MAX_ITEMS));
        }
      }
    } catch {
      // Unreadable or disabled storage simply starts from an empty cart.
    }
    setHydrated(true);
  }, []);

  // Persist only after hydration, otherwise the initial empty state would wipe
  // whatever the previous visit stored.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or blocked; the session still works in memory.
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      if (current.some((entry) => entry.id === item.id)) {
        announce(`"${item.name}" allaqachon savatchada`, 'polite');
        return current;
      }
      announce(`"${item.name}" savatchaga qo‘shildi. Savatchada ${current.length + 1} ta mahsulot bor.`, 'polite');
      return [...current, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const removed = current.find((entry) => entry.id === id);
      if (removed) {
        announce(`"${removed.name}" savatchadan olib tashlandi.`, 'polite');
      }
      return current.filter((entry) => entry.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    announce('Savatcha tozalandi.', 'polite');
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.priceUzs, 0);
    return {
      items,
      count: items.length,
      subtotal,
      has: (id: string) => items.some((entry) => entry.id === id),
      addItem,
      removeItem,
      clear,
    };
  }, [items, addItem, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
