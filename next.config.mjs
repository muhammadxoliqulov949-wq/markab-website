/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Prototype note:
  // Production media is served from api.markab.uz. Image optimisation is disabled
  // for the prototype so the app renders identically in sandboxed/offline
  // environments. Re-enable `unoptimized: false` (and keep remotePatterns) when
  // deploying against a reachable CDN.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'api.markab.uz', pathname: '/media/**' },
      { protocol: 'https', hostname: 'markab.uz', pathname: '/assets/**' },
    ],
  },

  // Dev-server previews are served through a proxy host.
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai'],
};

export default nextConfig;
