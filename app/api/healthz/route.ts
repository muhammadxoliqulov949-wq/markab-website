/**
 * GET /api/healthz — readiness probe.
 *
 * Returns 200 when the database is reachable and migrations applied;
 * returns 503 when something is wrong so load balancers can yank the pod.
 */
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let dbOk = false;
  try {
    const { raw } = getDb();
    const r = raw.prepare('SELECT 1 as ok').get() as { ok: number } | undefined;
    dbOk = !!(r && r.ok === 1);
  } catch {
    dbOk = false;
  }
  return NextResponse.json(
    {
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk ? 'ok' : 'unavailable',
      ts: Date.now(),
    },
    { status: dbOk ? 200 : 503, headers: { 'cache-control': 'no-store' } },
  );
}
