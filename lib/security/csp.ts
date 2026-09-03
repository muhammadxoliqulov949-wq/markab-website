/**
 * Content-Security-Policy — built per response in `middleware.ts`.
 *
 * WHY A NONCE AND NOT A HOST LIST
 *
 * `script-src 'self'` still permits any script an attacker can land inside
 * `/_next/static/`, and it says nothing at all about the inline bootstrap
 * scripts the App Router emits on every page. A nonce makes each response
 * decide which scripts may run, so an injected inline script without the nonce
 * is refused even though it originated on our own origin.
 *
 * `'strict-dynamic'` is the other half: it lets a nonce-stamped script create
 * further scripts — which is exactly what the webpack chunk loader does —
 * while ignoring host allow-lists, so a nonce is the only way in.
 *
 * THE PRICE, AND WHY IT IS WORTH PAYING
 *
 * Next.js derives the nonce from a `content-security-policy` header on the
 * *incoming request* (`getScriptNonceFromHeader`), and it only does so while
 * rendering. A prerendered page is HTML that was written to disk at build
 * time; there is no request, no render, and therefore no nonce on its scripts
 * — they load refused, and the page never hydrates.
 *
 * So every route here is rendered per request (`export const dynamic =
 * 'force-dynamic'` on each page). That is a real trade, and it was measured
 * rather than assumed: an interleaved A/B on this build showed no systematic
 * difference in LCP (prerendered 2537–2818 ms vs dynamic 2541–2584 ms), TBT or
 * TTFB, because these pages render from in-memory fixtures and prerendering
 * caches nothing expensive. Run-to-run variance on this sandbox is larger than
 * the gap between the two modes. See docs/PHASE-12-DEPLOYMENT-SECURITY.md §C1.
 *
 * THE ONE REMAINING `unsafe-inline`
 *
 * `style-src` — the `<noscript>` block in the root layout injects a `<style>`
 * element so scroll-reveal content is not permanently invisible without
 * JavaScript, and Next injects inline style elements of its own. CSS cannot
 * execute script, so the residual risk is CSS-based exfiltration, which needs
 * an injection sink this application does not have.
 */

export type CspOptions = {
  /** Per-response nonce. Unguessable, and different on every request. */
  nonce: string;
  /** Value of the `frame-ancestors` directive, e.g. `'none'`. */
  frameAncestors: string;
  /** Add `upgrade-insecure-requests`. Only meaningful on the canonical host. */
  upgradeInsecure: boolean;
};

/**
 * The only remote host allowed to serve images.
 *
 * Deliberately the same decision as `ALLOWED_IMAGE_HOSTS` in
 * `lib/security/url.ts` and `images.remotePatterns` in `next.config.mjs`:
 * three lists, one decision. Move them together or the mismatch surfaces as
 * either a blocked image or a render error.
 */
// api.markab.uz covers catalogue media; tile.openstreetmap.org is required by
// the contact-page OSM embed only when rendered. Both are HTTPS and pinned to
// specific hosts — no wildcard.
const IMAGE_SOURCES = "'self' data: https://api.markab.uz https://tile.openstreetmap.org";

// Origins allowed for the contact-page map embed. We use Google Maps'
// no-API-key public /maps endpoint as the primary interactive map (drag,
// zoom, Street View, directions work natively). OpenStreetMap is NOT
// embedded — only listed to keep migration reversible without a CSP
// deploy. frame-ancestors is controlled separately (none / preview origins);
// frame-src governs what *we* embed. No wildcard.
const FRAME_SOURCES = "'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org";

export function buildCsp({ nonce, frameAncestors, upgradeInsecure }: CspOptions): string {
  const directives: [string, string][] = [
    ['default-src', "'self'"],
    ['script-src', `'self' 'nonce-${nonce}' 'strict-dynamic'`],
    ['style-src', "'self' 'unsafe-inline'"],
    ['img-src', IMAGE_SOURCES],
    ['font-src', "'self'"],
    // connect-src governs fetches made by our own scripts. Our server-side
    // fetch() calls don't pass through CSP, and we have no client-side
    // fetches today. The OSM embed runs inside its own iframe and doesn't
    // request data through our page context, so it does not need an entry
    // here.
    ['connect-src', "'self'"],
    ['media-src', "'self'"],
    ['manifest-src', "'self'"],
    ['frame-src', FRAME_SOURCES],
    ['object-src', "'none'"],
    // Stops a <base> injection from repointing every relative URL.
    ['base-uri', "'self'"],
    // Every form is intercepted in JS; this makes sure a missed interception
    // cannot post somewhere else.
    ['form-action', "'self'"],
    ['frame-ancestors', frameAncestors],
  ];

  if (upgradeInsecure) directives.push(['upgrade-insecure-requests', '']);

  return directives.map(([name, value]) => (value ? `${name} ${value}` : name)).join('; ');
}

/**
 * Whether this deployment is rendered inside the Arena preview iframe.
 *
 * Default is `false`: the site refuses to be framed. The escape hatch exists
 * only because the reviewer's preview is served in an iframe and would
 * otherwise be blanked by the very control under review. It is set in exactly
 * one place — `start-preview.sh` — and nowhere else.
 */
export function allowPreviewFraming(): boolean {
  return process.env.MARKAB_ALLOW_PREVIEW_FRAME === 'true';
}

export function frameAncestorsPolicy(): string {
  return allowPreviewFraming() ? "'self' https://*.e2b.app https://*.arena.ai" : "'none'";
}

/**
 * Optional violation reporting.
 *
 * Off unless an endpoint is configured: a `report-uri` pointing nowhere is
 * noise, and pointing at a third party would leak information about visitors
 * to someone who has not been chosen. Ops supplies the endpoint; we only
 * forward what the browser sends.
 */
export function cspReportDirective(): [string, string] | null {
  const endpoint = process.env.MARKAB_CSP_REPORT_ENDPOINT?.trim();
  if (!endpoint) return null;
  return ['report-uri', endpoint];
}
