/**
 * Phone number normalisation.
 *
 * Markab operates in Uzbekistan (country code +998). Local UI accepts a
 * 9-digit subscriber number (e.g. 90 123 45 67); E.164 for storage / SMS
 * delivery is 998901234567.
 *
 * Returns `null` when the input does not match a plausible Uzbek mobile
 * number — we never "repair" bad input into something that looks valid.
 */

export const UZBEKISTAN_CC = '998';

/**
 * Normalise a user-supplied phone string into E.164 without leading '+'.
 *
 * Accepts:
 *   • 9 digits                                      → 998 + digits
 *   • 12 digits starting with 998                   → digits as given
 *   • prefixed with '+', spaces, hyphens, brackets  → stripped first
 *
 * Rejects everything else (wrong length, non-digit characters that survive
 * stripping, country code other than 998, etc.).
 */
export function normalisePhoneE164(input: string): string | null {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[\s+\-()]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 9) {
    // Must start with a valid Uzbek mobile prefix (9x).
    if (!/^9[01345789]/.test(digits)) return null;
    return `${UZBEKISTAN_CC}${digits}`;
  }
  if (digits.length === 12 && digits.startsWith(UZBEKISTAN_CC)) {
    const subscriber = digits.slice(3);
    if (!/^9[01345789]\d{7}$/.test(subscriber)) return null;
    return digits;
  }
  return null;
}

/** Display format: 998XXYYYZZ → "+998 XX YYY ZZ ZZ" */
export function formatPhoneE164(e164: string): string {
  if (e164.length !== 12 || !e164.startsWith(UZBEKISTAN_CC)) return e164;
  const sub = e164.slice(3);
  return `+998 ${sub.slice(0, 2)} ${sub.slice(2, 5)} ${sub.slice(5, 7)} ${sub.slice(7, 9)}`;
}
