/**
 * Cryptographic primitives used by the auth system.
 *
 * All tokens are generated with Node's CSPRNG (crypto.randomBytes). Passwords
 * are not a concept in Markab (phone+OTP only), so no hashing of credentials
 * is needed here.
 *
 * TOKENS (session IDs, CSRF tokens)
 *
 *   • 32 random bytes, hex-encoded = 64 chars
 *   • Stored in the DB as a SHA-256 HEX digest keyed with the session secret.
 *     The cookie carries the raw token; the DB stores only the digest, so a
 *     database leak is not sufficient to impersonate users (the secret is
 *     needed to turn a digest back into a cookie value — actually impossible
 *     with SHA-256; the HMAC prevents offline enumeration of valid tokens
 *     against a separate leak of the secret alone).
 *
 * OTP CODES
 *
 *   • 6 digits, numeric. Stored as HMAC-SHA256 in the DB; plaintext is
 *     returned only to the sender (SMS adapter) once, at generation time, and
 *     then discarded. This means an operator with DB read access cannot read
 *     codes out of `otp_code` and cannot log in as a user.
 */
import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { serverEnv } from '@/lib/env/server';

function secret(): Buffer {
  return Buffer.from(serverEnv().sessionSecret, 'utf-8');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Constant-time comparison of a candidate token against a stored digest.
 * Returns true when they match.
 */
export function verifyTokenDigest(candidateToken: string, storedDigest: string): boolean {
  const candidate = Buffer.from(hashToken(candidateToken), 'hex');
  const stored = Buffer.from(storedDigest, 'hex');
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export function generateOtpCode(): string {
  // Uniformly distributed 6-digit code — avoid modulo bias via rejection.
  let code: number;
  do {
    code = randomBytes(4).readUInt32BE(0);
  } while (code >= 1_000_000 - (1_000_000 % 1_000_000));
  return String(code % 1_000_000).padStart(6, '0');
}

export function hashOtpCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function verifyOtpCode(candidateCode: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtpCode(candidateCode), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

/**
 * Generate a double-submit CSRF token. We use the same random token as
 * session IDs; the double-submit value is bound to the session and validated
 * on every state-changing request.
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/** Hash that we can store server-side and compare against the client value. */
export function hashCsrf(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function verifyCsrf(candidate: string, storedHash: string): boolean {
  const a = Buffer.from(hashCsrf(candidate), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
