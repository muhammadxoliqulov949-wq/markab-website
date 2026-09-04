'use client';

import { useRef, useState } from 'react';
import { useSavedItems } from '@/components/account/SavedItemsProvider';
import type { SavedItem } from '@/lib/account/types';

/**
 * Save / unsave a catalogue item.
 *
 * Purely local. The button never claims the item was synced, added to an
 * account or saved "to your Markab profile" — it says it is stored in this
 * browser, because that is all it does.
 *
 * Two variants so the same control can live in two very different places:
 *  • `overlay` — a compact icon button floated over a card image. It is
 *    absolutely positioned inside the existing 4:3 frame, so adding it changes
 *    no card height and cannot disturb the tuned marketplace grids.
 *  • `inline` — a full-width labelled button for detail pages.
 */

type Props = {
  item: Omit<SavedItem, 'savedAt'>;
  variant?: 'overlay' | 'inline';
  className?: string;
};

function HeartIcon({ filled, popping }: { filled: boolean; popping: boolean }) {
  return (
    <svg
      className={[
        'h-4 w-4',
        filled ? 'text-brand-600' : 'text-current',
        popping ? 'animate-heart-pop' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.7}
      aria-hidden="true"
    >
      <path
        d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.7c0 5-7.5 9.6-7.5 9.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SaveButton({ item, variant = 'inline', className = '' }: Props) {
  const { has, toggle } = useSavedItems();
  const saved = has(item.ref);
  const [popping, setPopping] = useState(false);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const label = saved ? 'Saqlangan' : 'Saqlash';
  const describedById = `save-note-${item.ref}`;

  const trigger = () => {
    const wasUnsaved = !saved;
    toggle(item);
    if (wasUnsaved) {
      setPopping(false);
      // Re-arm on next frame so the animation replays on repeated taps.
      requestAnimationFrame(() => {
        setPopping(true);
        if (popTimer.current) clearTimeout(popTimer.current);
        popTimer.current = setTimeout(() => setPopping(false), 500);
      });
    }
  };

  if (variant === 'overlay') {
    return (
      <>
        <button
          type="button"
          onClick={(event) => {
            // The whole card is a link; saving must not navigate.
            event.preventDefault();
            event.stopPropagation();
            trigger();
          }}
          aria-pressed={saved}
          aria-describedby={describedById}
          className={[
            'absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur-[2px] transition-ctrl',
            saved
              ? 'border-brand-200 text-brand-700 hover:bg-brand-50'
              : 'border-line text-ink-500 hover:border-line-strong hover:text-ink-800',
            className,
          ].join(' ')}
        >
          <HeartIcon filled={saved} popping={popping} />
          <span className="sr-only">
            {saved ? `${item.title} saqlangan — olib tashlash` : `${item.title} ni saqlash`}
          </span>
        </button>
        <span id={describedById} className="sr-only">
          Saqlangan mahsulotlar faqat shu brauzerda qoladi va Markab hisobiga yuborilmaydi.
        </span>
      </>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => trigger()}
        aria-pressed={saved}
        aria-describedby={describedById}
        className={[
          'inline-flex h-11 w-full items-center justify-center gap-2 rounded-btn border px-4 text-sm font-medium transition-ctrl',
          saved
            ? 'border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100'
            : 'border-line-strong bg-surface text-ink-900 hover:border-ink-300 hover:bg-surface-muted',
        ].join(' ')}
      >
        <HeartIcon filled={saved} popping={popping} />
        {label}
      </button>
      <p id={describedById} className="mt-1.5 text-xs leading-relaxed text-ink-400">
        Faqat shu brauzerda saqlanadi — Markab hisobiga yuborilmaydi.
      </p>
    </div>
  );
}
