/**
 * Test bootstrap — configures a deterministic env and primes the DB layer
 * with a CJS `require` function (the DB module uses dynamic require to hide
 * native modules from webpack static analysis; under vitest/ESM that
 * Function-constructor trick returns undefined, so we inject a require
 * through globalThis).
 */
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

(process.env as Record<string, string>).NODE_ENV = 'test';
process.env.MARKAB_DATA_SOURCE = 'mock';
process.env.MARKAB_SESSION_SECRET = randomBytes(32).toString('hex');
process.env.MARKAB_SMS_PROVIDER = 'console';
process.env.MARKAB_NOTIFIER = 'log';

// Allow console SMS sender to run in test env (NODE_ENV=test).
process.env.MARKAB_ALLOW_PREVIEW_FRAME = 'false';

const tmpDir = '/tmp/markab-tests-' + process.pid;
mkdirSync(tmpDir, { recursive: true });
process.env.MARKAB_DB_PATH = 'file:' + tmpDir + '/markab-test.db';

// Inject a CJS require so the DB module's indirect loader can resolve native
// modules under vitest's ESM environment where `require` is not in scope.
(globalThis as unknown as { __non_webpack_require__?: NodeRequire }).__non_webpack_require__ =
  createRequire(import.meta.url);

// Import DB once to trigger migrations.
import { getDb } from '@/lib/db';

getDb();
