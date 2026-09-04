import 'server-only';
import { z } from 'zod';

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
 * VALIDATION
 *
 * A zod schema validates every env var on first access and throws a clear
 * error listing the misconfigured keys, so the server refuses to boot with a
 * half-wrong environment instead of silently misbehaving.
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

const envSchema = z.object({
  MARKAB_DATA_SOURCE: z.enum(['mock', 'http']).optional().default('mock'),
  MARKAB_API_BASE_URL: z.string().url().optional().default(DEFAULT_API_BASE_URL),
  MARKAB_API_TOKEN: z.string().optional().default(''),
  MARKAB_API_TIMEOUT_MS: z.coerce.number().int().min(500).max(30000).optional().default(DEFAULT_TIMEOUT_MS),
  MARKAB_API_MAX_RETRIES: z.coerce.number().int().min(0).max(3).optional().default(DEFAULT_MAX_RETRIES),
  MARKAB_IMAGE_UNOPTIMIZED: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
  MARKAB_DYNAMIC_SITEMAP: z.enum(['true', 'false']).optional(),
  MARKAB_ALLOW_PREVIEW_FRAME: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('production'),
});

function parseEnv(): z.infer<typeof envSchema> {
  const raw = {
    MARKAB_DATA_SOURCE: process.env.MARKAB_DATA_SOURCE,
    MARKAB_API_BASE_URL: process.env.MARKAB_API_BASE_URL,
    MARKAB_API_TOKEN: process.env.MARKAB_API_TOKEN,
    MARKAB_API_TIMEOUT_MS: process.env.MARKAB_API_TIMEOUT_MS,
    MARKAB_API_MAX_RETRIES: process.env.MARKAB_API_MAX_RETRIES,
    MARKAB_IMAGE_UNOPTIMIZED: process.env.MARKAB_IMAGE_UNOPTIMIZED,
    MARKAB_DYNAMIC_SITEMAP: process.env.MARKAB_DYNAMIC_SITEMAP,
    MARKAB_ALLOW_PREVIEW_FRAME: process.env.MARKAB_ALLOW_PREVIEW_FRAME,
    NODE_ENV: process.env.NODE_ENV,
  };
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`[serverEnv] Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

let cached: ServerEnv | null = null;
let cachedPreview: boolean | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const e = parseEnv();
  const dataSource: DataSource = e.MARKAB_DATA_SOURCE;
  cached = {
    dataSource,
    apiBaseUrl: e.MARKAB_API_BASE_URL,
    apiToken: e.MARKAB_API_TOKEN,
    apiTimeoutMs: e.MARKAB_API_TIMEOUT_MS,
    apiMaxRetries: e.MARKAB_API_MAX_RETRIES,
    unoptimizedImages: e.MARKAB_IMAGE_UNOPTIMIZED,
    dynamicSitemap:
      dataSource === 'http'
        ? e.MARKAB_DYNAMIC_SITEMAP !== 'false'
        : e.MARKAB_DYNAMIC_SITEMAP === 'true',
  };
  cachedPreview = e.MARKAB_ALLOW_PREVIEW_FRAME;
  return cached;
}

/** Whether the preview-iframe escape hatch is enabled (zod-validated). */
export function allowPreviewFraming(): boolean {
  if (cachedPreview === null) serverEnv();
  return cachedPreview === true;
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
