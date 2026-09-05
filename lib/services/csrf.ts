/**
 * CSRF double-submit cookie.
 *
 * SameSite=Lax session cookies already block classic cross-site form POSTs.
 * We add a double-submit token as defence-in-depth: any state-changing API
 * request must carry `x-csrf-token` matching the readable `markab_csrf`
 * cookie. Because an attacker on a different origin cannot read our cookie,
 * they cannot produce a matching header.
 *
 *   • The cookie is readable (not httpOnly). It carries no authority — the
 *     session cookie remains httpOnly and is what authenticates the request.
 *   • We set the cookie on page load via ensureCsrfCookie() so a GET always
 *     precedes a POST with a matching token in place.
 *   • Anonymous POSTs (contact, financing apply) also require a token — this
 *     makes bulk cross-origin spam harder.
 *   • Constant-time comparison (XOR over charcodes, no early exit).
 */
import 'server-only';

import { cookies as getCookies } from 'next/headers';
import { generateCsrfToken } from '@/lib/auth/crypto';
import { serverEnv } from '@/lib/env/server';

export const CSRF_COOKIE_NAME = 'markab_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

type CookieOpts = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
};

function csrfCookieOpts(maxAgeSec: number): CookieOpts {
  const env = serverEnv();
  return {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  };
}

export async function ensureCsrfCookie(): Promise<string> {
  const jar = await getCookies();
  const existing = jar.get(CSRF_COOKIE_NAME)?.value;
  if (existing && /^[0-9a-f]{64}$/.test(existing)) return existing;
  const token = generateCsrfToken();
  const opts = csrfCookieOpts(60 * 60);
  jar.set({ name: CSRF_COOKIE_NAME, value: token, ...opts });
  return token;
}

export async function rotateCsrfCookie(maxAgeSec = 60 * 60): Promise<string> {
  const jar = await getCookies();
  const token = generateCsrfToken();
  const opts = csrfCookieOpts(maxAgeSec);
  jar.set({ name: CSRF_COOKIE_NAME, value: token, ...opts });
  return token;
}

export async function clearCsrfCookie() {
  const jar = await getCookies();
  jar.delete(CSRF_COOKIE_NAME);
}

/** Constant-time equality of two 64-char hex CSRF tokens. */
export function csrfTokensMatch(a: string, b: string): boolean {
  if (a.length !== 64 || b.length !== 64) return false;
  let mismatch = 0;
  for (let i = 0; i < 64; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function validateCsrfHeader(request: Request): Promise<boolean> {
  const jar = await getCookies();
  const cookie = jar.get(CSRF_COOKIE_NAME)?.value;
  const header = request.headers.get(CSRF_HEADER_NAME);
  if (!cookie || !header) return false;
  return csrfTokensMatch(cookie, header);
}
