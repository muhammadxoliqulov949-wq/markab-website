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

export type CartItem = {
  id: string;
  name: string;
  priceUzs: number;
  image: string | null;
  href: string;
};

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
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
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
    setItems((current) =>
      current.some((entry) => entry.id === item.id) ? current : [...current, item],
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

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
