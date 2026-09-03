'use client';

import { useState, type ReactNode } from 'react';

export type TabItem = { id: string; label: string; content: ReactNode };

export function Tabs({ items, initialId }: { items: TabItem[]; initialId?: string }) {
  const [active, setActive] = useState(initialId ?? items[0]?.id);
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Bo‘limlar"
        className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line"
      >
        {items.map((item) => {
          const selected = item.id === current?.id;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`tabpanel-${item.id}`}
              id={`tab-${item.id}`}
              onClick={() => setActive(item.id)}
              className={[
                'relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
                selected ? 'text-brand-700' : 'text-ink-500 hover:text-ink-800',
              ].join(' ')}
            >
              {item.label}
              <span
                className={[
                  'absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-all duration-300 ease-smooth',
                  selected ? 'bg-brand-600 opacity-100' : 'opacity-0',
                ].join(' ')}
              />
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${current?.id}`}
        aria-labelledby={`tab-${current?.id}`}
        className="pt-6"
      >
        {current?.content}
      </div>
    </div>
  );
}
