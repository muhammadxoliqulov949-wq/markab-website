/**
 * URL safety — the ONE place that decides whether a string is allowed to become
 * an `href` or an image `src` in this application.
 *
 * WHY THIS EXISTS
 *
 * Three stores in this prototype (`lib/account/draft.ts`, the saved-items
 * provider and the cart provider) persist values into `localStorage` and read
 * them back on the next visit. Anything in `localStorage` is attacker-writable
 * in practice: another script on the origin, a browser extension, a shared
 * kiosk browser or dev-tools can put whatever it likes there. Reading it and
 * handing the result straight to `<Link href={…}>` or `<Image src={…}>` is a
 * DOM-based injection sink:
 *
 *   • `href="javascript:…"`  → script execution on click;
 *   • `href="//evil.example"` → off-origin navigation (phishing, referrer leak);
 *   • `src="http://…"`        → a remote host chosen by the attacker, and with
 *                               `next/image` a hard render error, because the
 *                               host is not in `remotePatterns`.
 *
 * React escapes text, so none of this is classic XSS — but React does not
 * sanitise `href`/`src` values, and it deliberately refuses to: scheme safety
 * is the application's job, not the framework's.
 *
 * THE RULE
 *
 * Persisted values are data, never instructions. Every value read back out of
 * storage is validated here before it can reach the DOM. Unknown shapes are
 * dropped, not repaired: an item the validator cannot vouch for simply does not
 * render.
 */

/** Internal paths are short. Anything longer is not a route. */
const MAX_PATH_LENGTH = 512;

/**
 * True when `value` is a same-origin path that can safely be handed to
 * `next/link`.
 *
 * Deliberately strict. A value qualifies only if it:
 *   • starts with `/`                      — a path, not a URL;
 *   • does not start with `//` or `/\`     — browsers read both as
 *                                            protocol-relative, i.e. another
 *                                            origin, and the second slips past
 *                                            a naive `startsWith('//')` check;
 *   • contains no control characters       — CRLF and NUL have both been used
 *                                            to split headers and to smuggle
 *                                            values past parsers;
 *   • contains no scheme separator before the first `/` or `?` — `javascript:`,
 *                                            `data:` and `vbscript:` never
 *                                            start with `/`, so this is belt
 *                                            and braces rather than the primary
 *                                            defence;
 *   • is short enough to be a real route.
 *
 * Relative paths (`cars/foo`) and absolute URLs are both rejected: every
 * catalogue href this application produces is root-relative, so anything else
 * is by definition not something this application produced.
 */
export function isSafeInternalHref(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > MAX_PATH_LENGTH) return false;
  if (!value.startsWith('/')) return false;

  // A browser reads both of these as protocol-relative, i.e. another origin.
  // The second slips past a naive startsWith('//') check.
  if (value.startsWith('//') || value.startsWith('/\\')) return false;

  // Control characters (NUL, CR, LF, DEL) have all been used to split headers
  // and to smuggle values past parsers. Whitespace belongs in a path even
  // less. One token, printable characters only.
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f || code === 0x20) return false;
  }

  // Belt and braces: a scheme can only appear before the first path, query or
  // fragment separator, and `javascript:` never starts with '/'.
  const head = value.split(/[/?#]/, 1)[0] ?? '';
  if (head.includes(':')) return false;

  return true;
}

/** `isSafeInternalHref` with a fallback, for values that are rendered directly. */
export function safeInternalHref(value: unknown, fallback = '/'): string {
  return isSafeInternalHref(value) ? value : fallback;
}

/**
 * The only remote host allowed to serve images.
 *
 * Mirrors `images.remotePatterns` in `next.config.mjs`. The two must stay in
 * step: a host that is not in `remotePatterns` makes `next/image` throw at
 * render time, so allowing one here without allowing it there would trade a
 * security problem for an availability problem.
 */
export const ALLOWED_IMAGE_HOSTS: readonly string[] = ['api.markab.uz'];

/**
 * True when `value` may be used as an image source.
 *
 * Accepts a root-relative path served by this app, or an HTTPS URL on an
 * allow-listed host. HTTP is rejected: a mixed-content image is a downgrade,
 * and a tampered `src` is exactly the case where the downgrade is not ours to
 * make.
 */
export function isAllowedImageUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > 2048) return false;

  if (value.startsWith('/')) {
    return isSafeInternalHref(value);
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    return ALLOWED_IMAGE_HOSTS.includes(url.hostname);
  } catch {
    // Not a parseable absolute URL — not an image source either.
    return false;
  }
}

/** Short display strings read back out of storage are length-capped. */
export function isBoundedText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

/** A positive, finite, safely representable amount of UZS. */
export function isSaneAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e12;
}
