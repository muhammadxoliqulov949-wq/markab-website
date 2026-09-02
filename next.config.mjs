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

  // Dev-server previews are served through a proxy host.
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai'],

  /**
   * Security headers.
   *
   * All of them live here rather than in middleware: nothing in this policy
   * has to change per response any more, and a middleware layer would cost a
   * request-time hop and a matcher to maintain for no benefit.
   */

  /**
   * WHY `script-src` ALLOWS INLINE SCRIPTS — and what would remove it.
   *
   * The strict version of this policy is `script-src 'self' 'nonce-…'
   * 'strict-dynamic'`, where the nonce changes on every response and Next.js
   * stamps it onto the scripts it injects. That was implemented and measured
   * first, and it failed: Next only derives the nonce for responses it renders
   * *per request*. Sixteen routes here are prerendered at build time, their
   * HTML — including the inline flight-data bootstrap scripts — is written to
   * disk once, and there is no response to attach a nonce to. Those pages
   * loaded with every script refused and no hydration at all.
   *
   * The alternatives were all worse than the allowance:
   *   • forcing every route dynamic would throw away the prerendering that the
   *     Phase 10 performance work measured and depends on;
   *   • a per-route policy would make the security posture depend on which
   *     routes happen to be static, so a route quietly becoming prerendered
   *     would ship a policy its own HTML cannot satisfy — a blank page;
   *   • rewriting prerendered HTML at the edge to inject nonces would double
   *     origin traffic and break streaming.
   *
   * So the allowance is deliberate, and it is the only one:
   *   • `'self'` still blocks scripts from any other origin;
   *   • `unsafe-eval` is absent, so `eval`, `new Function` and string
   *     timeouts are refused;
   *   • `object-src 'none'`, `base-uri 'self'` and `frame-ancestors` are
   *     unaffected;
   *   • the application has no HTML-injection sink — the single
   *     `dangerouslySetInnerHTML` is JSON-LD, and `lib/seo.ts` escapes `<` in
   *     it so no value can close the script element.
   *
   * Removing the allowance is a Phase 12 item: it needs either routes that are
   * rendered per request, or a build step that stamps nonces into prerendered
   * HTML. See docs/PHASE-12-DEPLOYMENT-SECURITY.md.
   */
  async headers() {
    const previewFraming = process.env.MARKAB_ALLOW_PREVIEW_FRAME === 'true';

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // See the note above. 'self' keeps foreign origins out; the
              // inline allowance is the documented cost of prerendering.
              "script-src 'self' 'unsafe-inline'",
              // The <noscript> block in the root layout injects a <style> so
              // scroll-reveal content is not permanently invisible without
              // JavaScript. CSS cannot execute script.
              "style-src 'self' 'unsafe-inline'",
              // 'self' covers /_next/image; the host covers the unoptimised
              // path where the browser fetches the original directly.
              "img-src 'self' data: https://api.markab.uz",
              "font-src 'self'",
              // No fetch calls exist today. When the real API is wired up this
              // is the directive that has to gain https://api.markab.uz —
              // deliberately, not by accident.
              "connect-src 'self'",
              "media-src 'self'",
              "manifest-src 'self'",
              // Nothing in the product embeds a frame or a plugin.
              "frame-src 'none'",
              "object-src 'none'",
              // Stops a <base> injection from repointing every relative URL.
              "base-uri 'self'",
              // Every form is intercepted in JS; this makes sure a missed
              // interception cannot post somewhere else.
              "form-action 'self'",
              previewFraming
                ? "frame-ancestors 'self' https://*.e2b.app https://*.arena.ai"
                : "frame-ancestors 'none'",
              // Long-lived on the real host. On a shared preview domain a
              // two-year includeSubDomains entry would be recorded against
              // infrastructure that is not ours, so it is short and scoped
              // there.
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: previewFraming ? 'max-age=86400' : 'max-age=63072000; includeSubDomains',
          },
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
          // X-Frame-Options cannot express an allow-list, so it is emitted only
          // when framing is refused outright. Sending DENY alongside a
          // permissive `frame-ancestors` would win in older browsers and break
          // the preview.
          ...(previewFraming
            ? []
            : [{ key: 'X-Frame-Options', value: 'DENY' }]),
        ],
      },
    ];
  },
};

export default nextConfig;
