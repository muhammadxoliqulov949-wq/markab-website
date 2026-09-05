/**
 * Server environment — database, auth and integration configuration.
 *
 * Replaces and extends the earlier `lib/env/server.ts` block. The same zod
 * contract / server-only guard is kept; new keys default to production-safe
 * values so a developer can boot the app without setting anything.
 */
import 'server-only';
import { z } from 'zod';
import { randomBytes } from 'crypto';

/** Helper: fall back to a random secret when one isn't configured. In
 *  production we log a warning but do NOT refuse to boot — refusing to boot
 *  over a missing secret is worse than a per-process secret that invalidates
 *  cookies on restart; ops should supply MARKAB_SESSION_SECRET explicitly. */
function fallbackSessionSecret(): string {
  const generated = randomBytes(32).toString('hex');
  console.warn(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'warn',
      event: 'server.session-secret.generated',
      message:
        'MARKAB_SESSION_SECRET is not set; using a random per-process secret. Sessions will not survive restarts.',
    }),
  );
  return generated;
}

const DEFAULT_API_BASE_URL = 'https://api.markab.uz/api/v1';
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_RETRIES = 1;

const envSchema = z.object({
  MARKAB_DATA_SOURCE: z.enum(['mock', 'http']).optional().default('mock'),
  MARKAB_API_BASE_URL: z.string().url().optional().default(DEFAULT_API_BASE_URL),
  MARKAB_API_TOKEN: z.string().optional().default(''),
  MARKAB_API_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(500)
    .max(30000)
    .optional()
    .default(DEFAULT_TIMEOUT_MS),
  MARKAB_API_MAX_RETRIES: z.coerce
    .number()
    .int()
    .min(0)
    .max(3)
    .optional()
    .default(DEFAULT_MAX_RETRIES),
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
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .optional()
    .default('production'),

  // ---- Database ------------------------------------------------------------
  // SQLite file path. Default `file:./data/markab.db` keeps persistent storage
  // local to the app directory. Use :memory: for ephemeral tests. The driver is
  // SQLite today; all table/column names are chosen to map 1:1 onto a future
  // PostgreSQL schema without breaking changes.
  MARKAB_DB_PATH: z.string().optional().default('file:./data/markab.db'),

  // ---- Auth / session ------------------------------------------------------
  MARKAB_SESSION_SECRET: z
    .string()
    .optional()
    .default('')
    .transform((v) => {
      if (v && v.length >= 32) return v;
      return fallbackSessionSecret();
    }),
  // Cookie lifetime: 14 days.
  MARKAB_SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).optional().default(24 * 14),
  // OTP lifetime: 5 minutes by default.
  MARKAB_OTP_TTL_MINUTES: z.coerce.number().int().min(1).max(60).optional().default(5),

  // ---- SMS / OTP delivery --------------------------------------------------
  // Currently accepted values: 'console' (development only, logs codes to the
  // server log) or 'disabled' (default in production — honest unavailable).
  // A real provider (Twilio/Eskiz/Clickatell/Beeline) plugs in via the SmsSender
  // interface and adds its own MARKAB_SMS_* keys.
  MARKAB_SMS_PROVIDER: z.enum(['disabled', 'console']).optional().default('disabled'),

  // ---- CRM / notification (contact + financing) ----------------------------
  // Accepted values: 'log' (development, write to server log) or 'disabled'
  // (default). A real CRM/email/telegram sender implements the Notifier
  // interface; disabling it does NOT drop submissions — they persist in the
  // database regardless, so menejerlar keyinroq o'qiy oladi.
  MARKAB_NOTIFIER: z.enum(['disabled', 'log']).optional().default('disabled'),

  // ---- Reporting -----------------------------------------------------------
  MARKAB_CSP_REPORT_ENDPOINT: z.string().optional().default(''),
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
    MARKAB_DB_PATH: process.env.MARKAB_DB_PATH,
    MARKAB_SESSION_SECRET: process.env.MARKAB_SESSION_SECRET,
    MARKAB_SESSION_TTL_HOURS: process.env.MARKAB_SESSION_TTL_HOURS,
    MARKAB_OTP_TTL_MINUTES: process.env.MARKAB_OTP_TTL_MINUTES,
    MARKAB_SMS_PROVIDER: process.env.MARKAB_SMS_PROVIDER,
    MARKAB_NOTIFIER: process.env.MARKAB_NOTIFIER,
    MARKAB_CSP_REPORT_ENDPOINT: process.env.MARKAB_CSP_REPORT_ENDPOINT,
  };
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`[serverEnv] Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

let cached: ServerEnv | null = null;
let cachedPreview: boolean | null = null;

export type DataSource = 'mock' | 'http';

export type ServerEnv = {
  dataSource: DataSource;
  apiBaseUrl: string;
  apiToken: string;
  apiTimeoutMs: number;
  apiMaxRetries: number;
  unoptimizedImages: boolean;
  dynamicSitemap: boolean;
  dbPath: string;
  sessionSecret: string;
  sessionTtlHours: number;
  otpTtlMinutes: number;
  smsProvider: 'disabled' | 'console';
  notifier: 'disabled' | 'log';
  cspReportEndpoint: string;
  isProduction: boolean;
  isDevelopment: boolean;
};

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
    dbPath: e.MARKAB_DB_PATH,
    sessionSecret: e.MARKAB_SESSION_SECRET,
    sessionTtlHours: e.MARKAB_SESSION_TTL_HOURS,
    otpTtlMinutes: e.MARKAB_OTP_TTL_MINUTES,
    smsProvider: e.MARKAB_SMS_PROVIDER,
    notifier: e.MARKAB_NOTIFIER,
    cspReportEndpoint: e.MARKAB_CSP_REPORT_ENDPOINT,
    isProduction: e.NODE_ENV === 'production',
    isDevelopment: e.NODE_ENV !== 'production',
  };
  cachedPreview = e.MARKAB_ALLOW_PREVIEW_FRAME;
  return cached;
}

export function allowPreviewFraming(): boolean {
  if (cachedPreview === null) serverEnv();
  return cachedPreview === true;
}

export function frameAncestorsPolicy(): string {
  return allowPreviewFraming()
    ? "'self' https://*.e2b.app https://*.arena.ai"
    : "'none'";
}

export function hasApiCredentials(): boolean {
  return serverEnv().apiToken.trim().length > 0;
}

/**
 * Where the browser should send CSP violations. Empty = off.
 */
export function cspReportDirective(): [string, string] | null {
  const endpoint = serverEnv().cspReportEndpoint.trim();
  if (!endpoint) return null;
  return ['report-uri', endpoint];
}

export function cspReportEndpoint(): string {
  return serverEnv().cspReportEndpoint.trim();
}
