'use client';

import { useState, type ReactNode } from 'react';

export type AccordionItem = {
  id: string;
  title: ReactNode;
  content: ReactNode;
};

export function Accordion({
  items,
  defaultOpenId,
  className = '',
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className={`divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                aria-controls={`accordion-panel-${item.id}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-muted sm:px-6"
              >
                <span className="text-[0.9375rem] font-medium text-ink-900">{item.title}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300 ease-smooth ${open ? 'rotate-45' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </h3>
            <div
              id={`accordion-panel-${item.id}`}
              hidden={!open}
              className="px-5 pb-5 text-sm leading-relaxed text-ink-500 sm:px-6"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
