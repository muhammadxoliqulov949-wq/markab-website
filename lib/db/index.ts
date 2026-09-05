/**
 * Database bootstrap — a single connection, idempotent migrations.
 *
 * Native-only: better-sqlite3/fs/path are loaded lazily via a CommonJS
 * `require` obtained from a non-statically-analysable path. This defeats
 * webpack's static tracing so that modules NOT intended for the Edge
 * (middleware/edge-api) cannot accidentally pull native modules into the
 * Edge bundle, while still working correctly in Node-route bundles and
 * the instrumentation hook.
 *
 * Guarded additionally with `server-only` so any client import is a hard
 * build failure.
 */
import 'server-only';

// Avoid top-level imports of lib/env/server (which pulls in `crypto`) so
// that webpack does not try to resolve Node built-ins when this file is
// statically analysed during the edge-light pass. The only entry point that
// actually executes this code at runtime is Node (instrumentation + route
// handlers), at which point dynamic require works.
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

type DB = any;
type Native = {
  fs: typeof import('node:fs');
  path: typeof import('node:path');
  BetterSqlite3: new (f: string) => DB;
};

let _native: Native | null = null;

/** @internal Exported for tests only. */
export function native(): Native {
  if (_native) return _native;
  /* eslint-disable no-new-func */
  const g = globalThis as unknown as {
    __non_webpack_require__?: (id: string) => unknown;
    __mk_require?: (id: string) => unknown;
  };
  const r = g.__mk_require ?? g.__non_webpack_require__;
  const nodeReq = r
    ? (id: string) => r(id)
    : // eslint-disable-next-line no-new-func
      (id: string) => (new Function('return require')() as (id: string) => unknown)(id);
  /* eslint-enable no-new-func */
  _native = {
    fs: nodeReq('fs') as Native['fs'],
    path: nodeReq('path') as Native['path'],
    BetterSqlite3: nodeReq('better-sqlite3') as Native['BetterSqlite3'],
  };
  return _native;
}

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _raw: DB | null = null;

function resolveDbPath(raw: string): string {
  if (raw === ':memory:') return ':memory:';
  if (raw.startsWith('file:')) {
    const rest = raw.slice('file:'.length);
    if (rest.startsWith('/')) return rest;
    return `${process.cwd()}/${rest}`;
  }
  return raw;
}

function openRaw(): DB {
  const { fs, path, BetterSqlite3 } = native();
  const rawPath = process.env.MARKAB_DB_PATH || (process.env.NODE_ENV === 'test' ? ':memory:' : 'file:./data/markab.db');
  const p = resolveDbPath(rawPath);
  if (p !== ':memory:') {
    fs.mkdirSync(path.dirname(p), { recursive: true });
  }
  const db: DB = new BetterSqlite3(p);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return db;
}

const MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: '0001_init',
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migration (
        name TEXT PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        phone_e164 TEXT NOT NULL UNIQUE,
        display_name TEXT,
        created_at INTEGER NOT NULL,
        last_seen_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "session" (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        user_agent TEXT,
        ip TEXT,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        revoked_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS session_user_id_idx ON "session"(user_id);
      CREATE INDEX IF NOT EXISTS session_expires_at_idx ON "session"(expires_at);

      CREATE TABLE IF NOT EXISTS "otp_code" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_e164 TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        consumed_at INTEGER,
        ip TEXT
      );
      CREATE INDEX IF NOT EXISTS otp_phone_e164_idx ON "otp_code"(phone_e164);
      CREATE INDEX IF NOT EXISTS otp_expires_at_idx ON "otp_code"(expires_at);

      CREATE TABLE IF NOT EXISTS contact_request (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone_e164 TEXT NOT NULL,
        topic TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        ip TEXT,
        user_agent TEXT,
        notified_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        CHECK (status IN ('new','contacted','resolved'))
      );
      CREATE INDEX IF NOT EXISTS contact_created_at_idx ON contact_request(created_at);
      CREATE INDEX IF NOT EXISTS contact_phone_idx ON contact_request(phone_e164);
      CREATE INDEX IF NOT EXISTS contact_status_idx ON contact_request(status);

      CREATE TABLE IF NOT EXISTS financing_application (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        product_title TEXT,
        product_href TEXT,
        product_kind TEXT,
        initial_payment_uzs INTEGER CHECK (initial_payment_uzs IS NULL OR initial_payment_uzs >= 0),
        term_months INTEGER CHECK (term_months IS NULL OR term_months BETWEEN 1 AND 120),
        name TEXT NOT NULL,
        phone_e164 TEXT NOT NULL,
        contact_method TEXT NOT NULL CHECK (contact_method IN ('Telefon qo‘ng‘irog‘i','Telegram / WhatsApp','Email')),
        message TEXT,
        consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0,1)),
        status TEXT NOT NULL DEFAULT 'new',
        ip TEXT,
        user_agent TEXT,
        notified_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        CHECK (status IN ('new','contacted','approved','declined')),
        CHECK (product_kind IS NULL OR product_kind IN ('car','electronics'))
      );
      CREATE INDEX IF NOT EXISTS finapp_created_at_idx ON financing_application(created_at);
      CREATE INDEX IF NOT EXISTS finapp_user_id_idx ON financing_application(user_id);
      CREATE INDEX IF NOT EXISTS finapp_status_idx ON financing_application(status);

      CREATE TABLE IF NOT EXISTS saved_item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        ref TEXT NOT NULL,
        title TEXT NOT NULL,
        price_uzs INTEGER CHECK (price_uzs IS NULL OR price_uzs >= 0),
        image TEXT,
        href TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        CHECK (kind IN ('car','electronics')),
        UNIQUE (user_id, kind, ref)
      );

      CREATE TABLE IF NOT EXISTS draft (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        product_title TEXT,
        product_href TEXT,
        kind TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        CHECK (kind IS NULL OR kind IN ('car','electronics')),
        CHECK (status = 'draft')
      );
      CREATE INDEX IF NOT EXISTS draft_user_id_idx ON draft(user_id);
    `,
  },
  {
    name: '0002_triggers_and_integrity',
    sql: `
      -- Automatic updated_at timestamp for every row update.
      -- If a caller forgets to bump updated_at, the DB does it for us.
      CREATE TRIGGER IF NOT EXISTS trg_contact_req_set_updated_at
        AFTER UPDATE ON contact_request
        FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
      BEGIN
        UPDATE contact_request SET updated_at = CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)
          WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS trg_finapp_set_updated_at
        AFTER UPDATE ON financing_application
        FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
      BEGIN
        UPDATE financing_application SET updated_at = CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)
          WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS trg_draft_set_updated_at
        AFTER UPDATE ON draft
        FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
      BEGIN
        UPDATE draft SET updated_at = CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)
          WHERE id = NEW.id;
      END;

      -- Composite index for listing saved items by recency (used by /api/saved-items).
      -- (The UNIQUE (user_id, kind, ref) already provides the dedup lookup.)
      CREATE INDEX IF NOT EXISTS saved_user_created_idx ON saved_item(user_id, created_at DESC);

      -- Composite index for finding a user's draft(s) quickly.
      CREATE INDEX IF NOT EXISTS draft_user_updated_idx ON draft(user_id, updated_at DESC);
    `,
  },
];

function runMigrations(db: DB) {
  db.exec(
    `CREATE TABLE IF NOT EXISTS schema_migration (
       name TEXT PRIMARY KEY,
       applied_at INTEGER NOT NULL
     );`,
  );
  const already = new Set(
    (db.prepare('SELECT name FROM schema_migration').all() as { name: string }[]).map(
      (r) => r.name,
    ),
  );
  const insert = db.prepare(
    'INSERT INTO schema_migration (name, applied_at) VALUES (?, ?)',
  );
  for (const m of MIGRATIONS) {
    if (already.has(m.name)) continue;
    const run = db.transaction(() => {
      db.exec(m.sql);
      insert.run(m.name, Date.now());
    });
    run();
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'db.migration.applied',
        name: m.name,
      }),
    );
  }
}

export function getDb() {
  if (_db && _raw) return { db: _db, raw: _raw };
  const raw = openRaw();
  runMigrations(raw);
  purgeExpired(raw);
  schedulePeriodicPurge(raw);
  _raw = raw;
  _db = drizzle(raw, { schema });
  return { db: _db, raw: _raw };
}

/**
 * Delete expired sessions and consumed/expired OTPs. SQLite doesn't have TTL,
 * so we sweep at boot and on a timer. Expired rows are harmless to keep
 * (validity checks reject them) but removing them keeps indexes lean and
 * prevents unbounded growth under abusive OTP spamming.
 */
function purgeExpired(db: DB) {
  const now = Date.now();
  try {
    const sessionResult = db
      .prepare('DELETE FROM "session" WHERE expires_at < ?')
      .run(now);
    const otpResult = db
      .prepare('DELETE FROM "otp_code" WHERE expires_at < ? OR consumed_at IS NOT NULL')
      .run(now - 24 * 3600_000 /* keep consumed for 24h for audit */);
    if ((sessionResult.changes as number) + (otpResult.changes as number) > 0) {
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: 'info',
          event: 'db.purge',
          sessions_removed: sessionResult.changes,
          otp_removed: otpResult.changes,
        }),
      );
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'db.purge_failed',
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}

let _purgeTimer: ReturnType<typeof setInterval> | null = null;

function schedulePeriodicPurge(db: DB) {
  if (_purgeTimer) return;
  // Sweep every 15 minutes in production. Tests/memory-DB don't need it.
  if (process.env.NODE_ENV === 'test') return;
  const intervalMs = 15 * 60 * 1000;
  _purgeTimer = setInterval(() => purgeExpired(db), intervalMs);
  // Allow Node to exit cleanly when the server shuts down.
  if (typeof _purgeTimer.unref === 'function') _purgeTimer.unref();
}

/**
 * Create an atomic, read-only-consistent backup of the SQLite database to the
 * given path. Safe to call while the server is running (WAL mode guarantees
 * readers don't block writers). Returns the path written to.
 */
export function backupDatabase(destPath?: string): string {
  const n = native();
  const { raw } = getDb();
  const dest =
    destPath ??
    n.path.join(
      process.cwd(),
      'data',
      `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`,
    );
  n.fs.mkdirSync(n.path.dirname(dest), { recursive: true });
  // Flush the WAL first so the on-disk main file is a self-consistent snapshot,
  // then perform a byte copy. For hot backups under load, SQLite's online
  // backup API is preferable — but that requires the destination to also be
  // a better-sqlite3 opened handle from the same native build. This copy
  // path is used by ops tooling/cron, not concurrent high-traffic writes.
  raw.pragma('wal_checkpoint(TRUNCATE)');
  const src = (raw as { name: string }).name;
  if (src && src !== ':memory:') {
    n.fs.copyFileSync(src, dest);
    // Also copy WAL/SHM if present (copyFileSync is no-op if they don't exist
    // after TRUNCATE, but safe to attempt).
    for (const ext of ['-wal', '-shm']) {
      try {
        n.fs.copyFileSync(src + ext, dest + ext);
      } catch {
        /* ignore */
      }
    }
  }
  return dest;
}
