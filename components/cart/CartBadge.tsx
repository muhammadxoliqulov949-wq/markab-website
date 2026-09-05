'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';

/**
 * Cart-count badge with a subtle scale-pulse when count changes. Kept in its
 * own component so the pulse doesn't force the whole header to re-render on
 * every count change. The parent header still reads `count` for the
 * aria-label so assistive tech stays accurate.
 */
export function CartBadge() {
  const { count } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (count <= 0) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(t);
  }, [count]);

  if (count <= 0) return null;

  return (
    <span
      aria-hidden="true"
      className={[
        'absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white transition-ctrl',
        pulse ? 'animate-scale-pulse ring-2 ring-brand-600/30' : '',
      ].join(' ')}
    >
      {count}
    </span>
  );
}
