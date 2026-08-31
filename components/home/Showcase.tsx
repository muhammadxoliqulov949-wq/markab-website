import type { ReactNode } from 'react';

/**
 * Responsive showcase shell used by the homepage marketplaces.
 *
 * Mobile (<640px): a swipeable, scroll-snapped rail — not a squeezed grid.
 * Tablet and up: a regular grid, so nothing overflows and nothing is hidden.
 */
export function Showcase({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 3 | 4;
}) {
  const grid = columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    // Negative margin lets the mobile rail bleed to the screen edge (premium
    // pattern) while the grid stays inside the container from sm upwards.
    <div className="-mx-5 px-5 sm:mx-0 sm:px-0">
      <ul
        className={[
          'no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:gap-5 sm:overflow-visible sm:pb-0',
          grid,
        ].join(' ')}
      >
        {children}
      </ul>
    </div>
  );
}

export function ShowcaseItem({
  children,
  className = 'w-[80%]',
}: {
  children: ReactNode;
  /** Width inside the mobile rail; ignored from sm upwards. */
  className?: string;
}) {
  return <li className={`${className} shrink-0 snap-start sm:w-auto`}>{children}</li>;
}
