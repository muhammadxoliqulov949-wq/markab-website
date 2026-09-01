/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    /**
     * Optimisation is ON.
     *
     * It used to be disabled globally for the prototype so the app rendered
     * identically offline. That cost was real, not cosmetic: with `unoptimized`
     * set, next/image emits a plain <img> pointing at the original file, so a
     * phone downloads the full-resolution original and the `sizes` prop every
     * caller carefully provides does nothing. Turning it back on gets
     * responsive srcset, width-constrained variants and WebP.
     *
     * Offline behaviour is unchanged in practice: when the media host is
     * unreachable the optimiser fails, the browser fires `onError`, and
     * CatalogueImage swaps in its neutral placeholder — which is exactly what
     * happened before.
     */
    unoptimized: false,

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
};

export default nextConfig;
