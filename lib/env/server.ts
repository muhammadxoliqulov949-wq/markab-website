import 'server-only';

/**
 * Server-only environment access.
 *
 * THE BOUNDARY
 *
 * `import 'server-only'` makes this module a build-time and runtime error in any
 * client bundle. That is the point: it is the single door through which
 * configuration — including the production API token — enters the process, and
 * the door does not open towards the browser.
 *
 * Next.js only inlines `NEXT_PUBLIC_*` variables into client bundles, so a
 * stray `process.env.MARKAB_API_TOKEN` in a component would not by itself leak
 * the value. It would, however, leave the codebase one careless refactor away
 * from a leak, with nothing to catch it. This module turns that silent risk
 * into a loud failure.
 *
 * DEFAULTS HERE ARE PRODUCTION-CORRECT:
 *   • data source   = mock       (HTTP mode is opt-in; never silently on)
 *   • timeouts/retry = bounded   (8s per request, 1 retry on 5xx/network only)
 *   • images        = optimized  (escape hatch MARKAB_IMAGE_UNOPTIMIZED=true
 *                                 for deployments whose server cannot fetch media)
 */

export type DataSource = 'mock' | 'http';

export type ServerEnv = {
  /** 'mock' (default) or 'http'. Selects the data provider. */
  dataSource: DataSource;
  /** Base URL of the production Markab API. Trailing slash optional. */
  apiBaseUrl: string;
  /**
   * Bearer token for the production API.
   *
   * Empty in the prototype. When it is set, it must come from the platform's
   * secret store — never from a committed file, and never from a
   * `NEXT_PUBLIC_*` variable, which would publish it to every visitor.
   */
  apiToken: string;
  /** Per-request timeout for API calls. */
  apiTimeoutMs: number;
  /** Maximum retry attempts on transient failure (0 = no retries). */
  apiMaxRetries: number;
  /** When true, `next/image` emits direct URLs instead of optimising. */
  unoptimizedImages: boolean;
  /** When true (HTTP mode), catalogue sitemap entries are omitted at build time
   *  and a request-time sitemap is used instead of a static snapshot. */
  dynamicSitemap: boolean;
};

const DEFAULT_API_BASE_URL = 'https://api.markab.uz/api/v1';
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_RETRIES = 1;

function readPositiveInt(value: string | undefined, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export function serverEnv(): ServerEnv {
  const dataSource: DataSource = process.env.MARKAB_DATA_SOURCE === 'http' ? 'http' : 'mock';
  return {
    dataSource,
    apiBaseUrl: process.env.MARKAB_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
    apiToken: process.env.MARKAB_API_TOKEN ?? '',
    apiTimeoutMs: readPositiveInt(process.env.MARKAB_API_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 500, 30000),
    apiMaxRetries: readPositiveInt(process.env.MARKAB_API_MAX_RETRIES, DEFAULT_MAX_RETRIES, 0, 3),
    unoptimizedImages: process.env.MARKAB_IMAGE_UNOPTIMIZED === 'true',
    // In HTTP mode the sitemap must not freeze a snapshot of the catalogue at
    // build time. Default to on in HTTP mode; can be explicitly opted out for
    // deployments that serve a pre-generated sitemap through another channel.
    dynamicSitemap:
      dataSource === 'http'
        ? process.env.MARKAB_DYNAMIC_SITEMAP !== 'false'
        : process.env.MARKAB_DYNAMIC_SITEMAP === 'true',
  };
}

/**
 * Whether the real API can be called at all.
 *
 * Used as a guard rather than as a value: the HTTP provider refuses to run
 * without a token, so a missing secret can never degrade into an
 * unauthenticated call against a protected service.
 */
export function hasApiCredentials(): boolean {
  return serverEnv().apiToken.trim().length > 0;
}
