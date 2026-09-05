/**
 * Content-Security-Policy — built per response in `middleware.ts`.
 *
 * Why nonce + strict-dynamic and not a host allow-list is documented in
 * earlier iterations of this file (see git log). The key constraint here is
 * that middleware runs in a bundle that may execute in the Edge runtime
 * subset, so we keep the CSP builder self-contained and free of Node
 * imports. The richer env validation (zod schemas, secrets) lives in
 * lib/env/server.ts and only runs on Node route handlers.
 */

export type CspOptions = {
  nonce: string;
  frameAncestors: string;
  upgradeInsecure: boolean;
  /**
   * Development-only escape hatch. `next dev` compiles modules through the
   * webpack runtime and the react-refresh overlay, both of which evaluate
   * strings as JavaScript (`eval`/`new Function`). The strict production
   * policy has no `unsafe-eval`, so under `next dev` those modules are
   * refused and NO client JavaScript ever hydrates — every slider, tilt and
   * tab stays dead while the SSR HTML looks fine.
   *
   * The middleware sets this ONLY when `NODE_ENV !== 'production'` (see
   * isProduction in lib/security/csp-preview.ts); a production build never
   * enables it. The allow-list check enforces that the literal appears only
   * behind this guard.
   */
  scriptUnsafeEval?: boolean;
};

const IMAGE_SOURCES = "'self' data: https://api.markab.uz https://tile.openstreetmap.org";
const FRAME_SOURCES = "'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org";

export function buildCsp({ nonce, frameAncestors, upgradeInsecure, scriptUnsafeEval }: CspOptions): string {
  const evalSource = scriptUnsafeEval ? " 'unsafe-eval'" : '';
  const directives: [string, string][] = [
    ['default-src', "'self'"],
    ['script-src', `'self' 'nonce-${nonce}' 'strict-dynamic'${evalSource}`],
    ['style-src', "'self' 'unsafe-inline'"],
    ['img-src', IMAGE_SOURCES],
    ['font-src', "'self'"],
    ['connect-src', "'self'"],
    ['media-src', "'self'"],
    ['manifest-src', "'self'"],
    ['frame-src', FRAME_SOURCES],
    ['object-src', "'none'"],
    ['base-uri', "'self'"],
    ['form-action', "'self'"],
    ['frame-ancestors', frameAncestors],
  ];
  if (upgradeInsecure) directives.push(['upgrade-insecure-requests', '']);
  return directives.map(([name, value]) => (value ? `${name} ${value}` : name)).join('; ');
}
