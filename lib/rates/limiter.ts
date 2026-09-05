/**
 * In-memory sliding-window rate limiter.
 *
 * IMPLEMENTATION CHOICE
 *
 * This is a deliberately simple per-process limiter — correct enough for a
 * single Node instance (which is what the preview/sandbox and a modest Vercel
 * deployment run on). It is NOT a distributed limiter: in a fleet of N
 * instances the effective limit is N × limit. When Markab scales past one
 * Node process, swap this implementation for an Upstash Redis / Redis-backed
 * token bucket behind the same `RateLimiter` interface — no call site changes.
 *
 * Two buckets are tracked per route:
 *   • by IP (global abuse protection on unauthenticated endpoints)
 *   • by userId (when authenticated, stricter per-account limits)
 *
 * The limiter is optimistic: when the bucket is full it returns { allowed: false }
 * but still increments the counter so a burst cannot overshoot by retrying.
 */

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

function prune(hits: number[], windowMs: number, now: number) {
  const cutoff = now - windowMs;
  while (hits.length && hits[0]! < cutoff) hits.shift();
}

function hit(key: string, windowMs: number, limit: number): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  prune(bucket.hits, windowMs, now);
  const allowed = bucket.hits.length < limit;
  bucket.hits.push(now);
  const resetMs = bucket.hits[0]! + windowMs - now;
  return { allowed, remaining: Math.max(0, limit - bucket.hits.length), resetMs };
}

export interface RateLimit {
  /** Unique key prefix, e.g. 'contact' */
  key: string;
  /** Maximum hits per window per subject. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export const LIMITS = {
  contact: { key: 'contact', limit: 5, windowMs: 10 * MINUTE_MS },
  financingApply: { key: 'finapp', limit: 5, windowMs: 10 * MINUTE_MS },
  otpRequest: { key: 'otp-req', limit: 3, windowMs: 10 * MINUTE_MS },
  otpVerify: { key: 'otp-ver', limit: 10, windowMs: 10 * MINUTE_MS },
  savedItems: { key: 'saved', limit: 60, windowMs: MINUTE_MS },
  draft: { key: 'draft', limit: 60, windowMs: MINUTE_MS },
  authSession: { key: 'auth-sess', limit: 30, windowMs: MINUTE_MS },
  cspReport: { key: 'csp', limit: 30, windowMs: MINUTE_MS },
} satisfies Record<string, RateLimit>;

/**
 * Check rate limits for a request. Both IP and userId (if present) must pass.
 * Returns `null` when allowed, or a Retry-After value when blocked.
 */
export function checkRateLimit(
  spec: RateLimit,
  ip: string | null,
  userId: string | null,
): { allowed: false; retryAfterSec: number; subject: 'ip' | 'user' } | { allowed: true } {
  // IP bucket.
  if (ip) {
    const ipKey = `${spec.key}:ip:${ip}`;
    const r = hit(ipKey, spec.windowMs, spec.limit);
    if (!r.allowed) {
      return { allowed: false, retryAfterSec: Math.ceil(r.resetMs / 1000), subject: 'ip' };
    }
  }
  if (userId) {
    const userKey = `${spec.key}:user:${userId}`;
    // Authenticated users get a slightly more generous per-account limit.
    const userLimit = Math.max(spec.limit, Math.floor(spec.limit * 2));
    const r = hit(userKey, spec.windowMs, userLimit);
    if (!r.allowed) {
      return { allowed: false, retryAfterSec: Math.ceil(r.resetMs / 1000), subject: 'user' };
    }
  }
  return { allowed: true };
}

/** Test helper — clear all buckets. */
export function _resetRateLimitForTests() {
  buckets.clear();
}

/**
 * Very gentle periodic cleanup so the in-memory map never grows without bound
 * on a long-running process. Called once at module load; safe to call again.
 */
function gc() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    prune(bucket.hits, HOUR_MS, now);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}
// Every 10 minutes.
if (typeof setInterval !== 'undefined') {
  setInterval(gc, 10 * MINUTE_MS).unref?.();
}
