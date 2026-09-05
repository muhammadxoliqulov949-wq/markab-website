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
};

const IMAGE_SOURCES = "'self' data: https://api.markab.uz https://tile.openstreetmap.org";
const FRAME_SOURCES = "'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org";

export function buildCsp({ nonce, frameAncestors, upgradeInsecure }: CspOptions): string {
  const directives: [string, string][] = [
    ['default-src', "'self'"],
    ['script-src', `'self' 'nonce-${nonce}' 'strict-dynamic'`],
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
