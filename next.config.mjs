/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    /**
     * Server-side image optimisation is ON by default. That is the
     * production-correct setting: responsive `srcset`, width-constrained
     * variants and WebP, and no phone downloading full-resolution originals.
     *
     * `MARKAB_IMAGE_UNOPTIMIZED=true` is an escape hatch for deployments where
     * the *server* cannot reach the media host. It makes `next/image` emit
     * direct URLs so the *visitor's browser* fetches the file instead.
     *
     * That distinction is not cosmetic, and the earlier comment here was wrong
     * to wave it away. With optimisation on, the server is the HTTP client: an
     * environment that can open a TCP socket to api.markab.uz but is reset
     * during the TLS handshake turns every photograph into a 500 from
     * `/_next/image` — even for a visitor whose own browser could fetch the
     * same file perfectly well. With optimisation off, the browser fetches
     * directly and the server's egress rules are irrelevant. The setting is
     * therefore a property of the deployment, not only of the codebase, and it
     * has to be switchable per environment.
     *
     * Production must leave this unset.
     */
    unoptimized: process.env.MARKAB_IMAGE_UNOPTIMIZED === 'true',

    /**
     * Allow-listed per host and path. Catalogue media is the only remote image
     * source the data layer references; the previous `markab.uz/assets/**`
     * entry matched nothing, so it was removed rather than left as a pattern
     * nobody could justify. Add a host here only when data actually uses it.
     */
    remotePatterns: [{ protocol: 'https', hostname: 'api.markab.uz', pathname: '/media/**' }],

    // WebP is the default and the safe choice: AVIF is smaller but encodes
    // markedly slower, and that trade-off has not been measured here.
    formats: ['image/webp'],
  },

  // Dev-server previews are served through a proxy host (Arena/e2b). The
  // browser loads HTML from a sandbox subdomain like
  // https://<port>-<sandbox>.e2b.app and requests /_next/static/* chunks,
  // HMR websockets and RSC flight payloads against the same origin. Next.js
  // 15's dev server blocks any cross-origin request to /_next/* unless the
  // Origin/Referer host is allow-listed here. A leading ".*" matches any
  // subdomain per the docs. Without this entry, every client-side chunk
  // returns HTTP 403 and React never boots in the preview (the page renders
  // SSR HTML but mount/useEffect never fire).
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai'],

  /**
   * Static security headers — everything that does not vary per response.
   *
   * Three headers deliberately live in `middleware.ts` instead:
   *
   *   • Content-Security-Policy — carries a per-response nonce, so it cannot
   *     be a static string (see `lib/security/csp.ts`);
   *   • Strict-Transport-Security and X-Frame-Options — both depend on
   *     whether this deployment is the production host or a framed preview.
   *
   * Keeping each header in exactly one place matters: when two headers of the
   * same name reach the browser, both are enforced and the effective policy is
   * the intersection — the stricter one wins, silently and invisibly.
   */

  async headers() {

    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Stops a browser guessing a different content type from the one
            // declared. Without it a text/plain response can be re-interpreted
            // as HTML and executed.
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Full URL on same-origin requests, origin only cross-origin, and
            // nothing at all on a downgrade to http.
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Nothing on this site needs a sensor. Declaring that removes the
            // prompt rather than relying on the visitor to refuse it.
            key: 'Permissions-Policy',
            value:
              'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()',
          },
          {
            // Isolates the browsing context. There is no cross-window messaging
            // here to preserve.
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            // Constrains who may EMBED our responses, not whom we may load:
            // catalogue photography still comes from api.markab.uz.
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          {
            // Do not resolve hostnames in links the visitor has not followed.
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
