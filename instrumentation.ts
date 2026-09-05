/**
 * Server-side instrumentation hook.
 *
 * Runs in Node (NOT Edge). Boots the database once at server start.
 * Uses process.getBuiltinModule when available (Node 22+) with a
 * createRequire fallback so we can load native modules without pulling
 * them into the Edge bundle.
 */
import 'server-only';

export const runtime = 'nodejs';

let cjsRequire: ((id: string) => unknown) | null = null;
try {
  const pg = process as unknown as {
    getBuiltinModule?: (id: string) => { createRequire: (url: string | URL) => NodeRequire };
  };
  if (pg.getBuiltinModule) {
    cjsRequire = pg.getBuiltinModule('node:module').createRequire(import.meta.url);
  }
} catch {
  /* ignored — we try another path below */
}

if (!cjsRequire) {
  try {
    // Webpack-wrapped instrumentation runs in CJS scope where `require`
    // is a local binding. Plain `let cjsRequire = require;` would be
    // rewritten by webpack as an import of 'require'; assigning from a
    // separate scope keeps it opaque to static analysis.
    // eslint-disable-next-line no-new-func
    cjsRequire = new Function('return require')() as NodeRequire;
  } catch {
    /* cjsRequire stays null */
  }
}

if (cjsRequire) {
  (globalThis as unknown as { __non_webpack_require__?: unknown }).__non_webpack_require__ = cjsRequire;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return;
  try {
    if (!cjsRequire) {
      throw new Error('instrumentation: could not acquire CJS require; DB will not boot');
    }
    const { getDb } = await import('./lib/db');
    getDb();
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'server.boot',
        message: 'Database ready.',
      }),
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'server.boot_failed',
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}
