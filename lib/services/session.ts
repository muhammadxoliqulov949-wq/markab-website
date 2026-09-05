/**
 * Session service — HttpOnly cookie-based session management.
 *
 * SESSION MODEL
 *
 *   • On successful OTP verification, a random 32-byte token is generated.
 *   • The cookie carries the raw token; the DB stores sha256(token). This
 *     means a DB leak alone cannot be used to impersonate users (no cookie
 *     value that the browser will accept can be derived from a hash).
 *   • Sessions expire after `sessionTtlHours`. Expired sessions are swept on
 *     access and periodically.
 *   • Logout revokes the session (sets revoked_at) and clears the cookie.
 *   • Sessions store an IP (/64 mask) and truncated user-agent for the
 *     "My sessions" screen only.
 *
 * COOKIE SHAPE
 *
 *   name:        markab_sid
 *   httpOnly:    true           (no JS access — defeats XSS cookie theft)
 *   secure:      true in prod   (no plaintext)
 *   sameSite:    lax            (safe default; CSRF token covers state changes)
 *   path:        /
 *   maxAge:      ttl seconds
 *   We do NOT set domain explicitly so the cookie is scoped to the exact host.
 */
import 'server-only';

import { cookies as getCookies } from 'next/headers';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db';
import { sessions, users, type SessionRow, type UserRow } from '@/lib/db/schema';
import { serverEnv } from '@/lib/env/server';
import { generateToken, hashToken, verifyTokenDigest } from '@/lib/auth/crypto';
import { log } from '@/lib/request/logger';

export const SESSION_COOKIE_NAME = 'markab_sid';

function sessionTtlMs() {
  return serverEnv().sessionTtlHours * 60 * 60 * 1000;
}

function cookieOptions() {
  const env = serverEnv();
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: env.isProduction, // allow http in local dev/previews
    sameSite: 'lax' as const,
    path: '/',
    maxAge: env.sessionTtlHours * 60 * 60,
  };
}

async function findUserByPhone(phoneE164: string): Promise<UserRow | null> {
  const { db } = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.phoneE164, phoneE164))
    .limit(1);
  return rows[0] ?? null;
}

async function createUser(phoneE164: string): Promise<UserRow> {
  const { db } = getDb();
  const id = randomUUID();
  const now = Date.now();
  await db.insert(users).values({ id, phoneE164, createdAt: now, lastSeenAt: now });
  return { id, phoneE164, displayName: null, createdAt: now, lastSeenAt: now };
}

export async function createSession(
  phoneE164: string,
  meta: { ip: string | null; userAgent: string | null },
): Promise<{ token: string; cookie: ReturnType<typeof cookieOptions>; user: UserRow }> {
  const { db } = getDb();
  const user = (await findUserByPhone(phoneE164)) ?? (await createUser(phoneE164));
  const token = generateToken();
  const id = hashToken(token); // the DB primary key is the digest
  const now = Date.now();
  const expiresAt = now + sessionTtlMs();
  await db.insert(sessions).values({
    id,
    userId: user.id,
    userAgent: meta.userAgent,
    ip: meta.ip,
    createdAt: now,
    expiresAt,
    revokedAt: null,
  });
  await db.update(users).set({ lastSeenAt: now }).where(eq(users.id, user.id));
  return { token, cookie: cookieOptions(), user };
}

/**
 * Read the session from the incoming cookie. Returns {user, session} when
 * valid, or null when no cookie / expired / revoked / tampered.
 *
 * As a side effect this removes expired cookies and sweeps long-expired
 * rows opportunistically.
 */
export async function loadSession(): Promise<{ user: UserRow; session: SessionRow } | null> {
  const cookieStore = await getCookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  if (!/^[0-9a-f]{64}$/.test(token)) return null;

  const { db } = getDb();
  const digest = hashToken(token);
  const rows = await db.select().from(sessions).where(eq(sessions.id, digest)).limit(1);
  const session = rows[0];
  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }
  // Verify via timingSafeEqual as a second line of defence (primary match is
  // the primary key lookup; this ensures no string compare leaks).
  if (!verifyTokenDigest(token, session.id)) return null;

  const userRows = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const user = userRows[0];
  if (!user) return null;

  // Opportunistic last_seen update — at most once per minute per session.
  if (user.lastSeenAt < Date.now() - 60_000) {
    db.update(users)
      .set({ lastSeenAt: Date.now() })
      .where(eq(users.id, user.id))
      .run();
  }

  return { user, session };
}

export async function setSessionCookie(token: string, cookie: ReturnType<typeof cookieOptions>) {
  const jar = await getCookies();
  jar.set({
    name: cookie.name,
    value: token,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
}

export async function clearSessionCookie() {
  const jar = await getCookies();
  const opts = cookieOptions();
  jar.delete(opts.name);
}

/**
 * Revoke the current session and clear the cookie. Safe to call even when no
 * session exists.
 */
export async function logout(): Promise<void> {
  const current = await loadSession();
  if (current) {
    const { db } = getDb();
    await db
      .update(sessions)
      .set({ revokedAt: Date.now() })
      .where(eq(sessions.id, current.session.id));
  }
  await clearSessionCookie();
}

/** Sweep expired/revoked sessions older than a day — called once per hour. */
export function sweepSessions() {
  try {
    const { raw } = getDb();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const deleted = raw
      .prepare(
        `DELETE FROM session WHERE (expires_at < ? AND revoked_at IS NULL) OR revoked_at IS NOT NULL AND revoked_at < ?`,
      )
      .run(Date.now(), cutoff);
    if (deleted.changes > 0) {
      log.info('session.sweep', { removed: deleted.changes });
    }
  } catch (err) {
    log.error('session.sweep_failed', { error: err instanceof Error ? err.message : String(err) });
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(sweepSessions, 60 * 60 * 1000).unref?.();
}

export async function revokeAllUserSessions(userId: string) {
  const { db } = getDb();
  await db
    .update(sessions)
    .set({ revokedAt: Date.now() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

/**
 * Used by the auth provider to gate whether a real account exists. In this
 * codebase loadSession is the only way to confirm a user is authenticated,
 * so we export a small helper used in API routes.
 */
export async function currentUser(): Promise<UserRow | null> {
  const s = await loadSession();
  return s?.user ?? null;
}
