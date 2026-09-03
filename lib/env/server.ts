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
 * NOTHING HERE IS A SECRET TODAY. The prototype ships no credentials — the
 * token is empty and the HTTP provider is an unimplemented stub. The boundary
 * is being drawn now, while it is cheap, so that switching the data source on
 * in production is a configuration change and not a security review.
 */

export type ServerEnv = {
  /** 'mock' (default) or 'http'. Selects the data provider. */
  dataSource: 'mock' | 'http';
  /** Base URL of the production Markab API. */
  apiBaseUrl: string;
  /**
   * Bearer token for the production API.
   *
   * Empty in the prototype. When it is set, it must come from the platform's
   * secret store — never from a committed file, and never from a
   * `NEXT_PUBLIC_*` variable, which would publish it to every visitor.
   */
  apiToken: string;
  /** When true, `next/image` emits direct URLs instead of optimising. */
  unoptimizedImages: boolean;
};

const DEFAULT_API_BASE_URL = 'https://api.markab.uz/api/v1';

export function serverEnv(): ServerEnv {
  return {
    dataSource: process.env.MARKAB_DATA_SOURCE === 'http' ? 'http' : 'mock',
    apiBaseUrl: process.env.MARKAB_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
    apiToken: process.env.MARKAB_API_TOKEN ?? '',
    unoptimizedImages: process.env.MARKAB_IMAGE_UNOPTIMIZED === 'true',
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
