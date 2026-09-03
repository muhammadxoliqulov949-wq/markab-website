/**
 * Shared pagination helper.
 *
 * Lives outside the providers so the mock and HTTP providers page identically:
 * a visitor must not be able to tell which data source is configured by
 * watching how a listing behaves.
 */
import type { Paginated } from './types';

/** Matches the page size observed on the live site (API-CONTRACT §1). */
export const DEFAULT_PAGE_SIZE = 12;

export function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: safePage,
    pageSize,
  };
}
