/**
 * Lightweight phone formatter used by form inputs to produce a friendly
 * display string (e.g. "90 123 45 67") while tracking the raw digits for
 * submission. Server-side normalisation lives in lib/format/phone.ts.
 */

export function normalisePhone(input: string): { digits: string; display: string } {
  const raw = typeof input === 'string' ? input.replace(/[^\d]/g, '') : '';
  // Strip leading 998 if present so the input always looks like subscriber.
  let digits = raw;
  if (digits.startsWith('998') && digits.length >= 12) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  // Build display groups: XX YYY ZZ ZZ.
  const a = digits.slice(0, 2);
  const b = digits.slice(2, 5);
  const c = digits.slice(5, 7);
  const d = digits.slice(7, 9);
  const parts = [a, b, c, d].filter(Boolean);
  const display = parts.join(' ');
  return { digits: `998${digits}`, display };
}
