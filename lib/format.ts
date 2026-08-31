/**
 * Deterministic formatters.
 *
 * Intl is deliberately avoided: server and client locales can differ, which
 * produces hydration mismatches in SSR. Grouping is computed manually.
 */

function group(value: number, separator = ' '): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded).toString();
  let out = '';
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += separator;
    out += digits[i];
  }
  return sign + out;
}

/** 119 677 500 so'm */
export function formatUzs(value: number): string {
  return `${group(value)} so'm`;
}

/** 119 677 500 */
export function formatNumber(value: number): string {
  return group(value);
}

/** 53 000 km */
export function formatKm(value: number): string {
  return `${group(value)} km`;
}

/** Compact form for cards / badges, e.g. 119,7 mln */
export function formatCompactUzs(value: number): string {
  if (value >= 1_000_000_000) return `${group(value / 1_000_000_000, ',').slice(0, 5)} mlrd`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')} mln`;
  return group(value);
}

export function formatViews(value: number): string {
  return `${group(value)} marta ko‘rilgan`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
