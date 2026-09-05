/**
 * Markab 2.0 database schema — Drizzle ORM on SQLite today.
 *
 * WHY SQLITE FIRST
 *
 * The app ships to previews, local dev and CI without provisioning a
 * Postgres cluster. SQLite gives us a zero-config, file-backed persistence
 * layer that exercises real SQL (no InMemory fakery) and proves migrations,
 * indexes and foreign keys the same way Postgres will.
 *
 * PORTABILITY
 *
 * Column types and names are deliberately Postgres-compatible:
 *   • SQLite text  → Postgres text / varchar
 *   • SQLite integer (timestamps) → Postgres bigint / timestamptz
 *   • boolean columns are stored as 0/1 integers (mapped) and will become
 *     boolean in Postgres with a trivial migration.
 * Drizzle abstracts the dialect; `drizzle.config.ts` targets
 * `better-sqlite3` here. A pg target is a one-config change when the deploy
 * target has a Postgres URL.
 *
 * NAMING
 *
 * Tables use snake_case singular names (user, session, contact_request, …).
 * Foreign keys are `*_id` and reference the PK column directly.
 * Every table has `created_at` (ms epoch). Tables that can be soft-updated
 * carry `updated_at`. Records are NEVER hard-deleted from user-facing tables
 * except when the user explicitly revokes something (logout / delete saved
 * item); audit-trail rows use `deleted_at = NULL`.
 */

import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Epoch milliseconds — avoids timezone surprises and maps to Date in JS.
const nowMs = () => Date.now();

export const users = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(), // uuid v4
    // E.164 form, e.g. "998901234567". Normalised without spaces/leading +.
    phoneE164: text('phone_e164').notNull(),
    displayName: text('display_name'),
    createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
    lastSeenAt: integer('last_seen_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
  },
  (t) => ({
    phoneIdx: uniqueIndex('user_phone_e164_idx').on(t.phoneE164),
  }),
);

export const sessions = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(), // 32-byte random, hex-encoded (matches token hash)
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // User-agent first 255 chars, purely for "My sessions" UX. Nullable.
    userAgent: text('user_agent'),
    ip: text('ip'), // first /64 for IPv6 privacy, never logged anywhere else
    createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
    expiresAt: integer('expires_at', { mode: 'number' }).notNull(),
    revokedAt: integer('revoked_at', { mode: 'number' }),
  },
  (t) => ({
    userIdx: index('session_user_id_idx').on(t.userId),
    expiresIdx: index('session_expires_at_idx').on(t.expiresAt),
  }),
);

export const otpCodes = sqliteTable(
  'otp_code',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    phoneE164: text('phone_e164').notNull(),
    // 6-digit hashed code; we hash the same way as session tokens so we never
    // store the plaintext code. Useful for post-hoc audits (why did a login
    // succeed / fail) without making a DB leak useful.
    codeHash: text('code_hash').notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
    expiresAt: integer('expires_at', { mode: 'number' }).notNull(),
    attempts: integer('attempts', { mode: 'number' }).notNull().default(0),
    consumedAt: integer('consumed_at', { mode: 'number' }),
    ip: text('ip'),
  },
  (t) => ({
    phoneIdx: index('otp_phone_e164_idx').on(t.phoneE164),
    expiresIdx: index('otp_expires_at_idx').on(t.expiresAt),
  }),
);

export const contactRequests = sqliteTable(
  'contact_request',
  {
    id: text('id').primaryKey(), // uuid v4
    name: text('name').notNull(),
    phoneE164: text('phone_e164').notNull(),
    topic: text('topic').notNull(), // enum normalised in service layer
    message: text('message').notNull(),
    // Status: 'new' → 'contacted' → 'resolved'; CRM integration flips these.
    status: text('status', { enum: ['new', 'contacted', 'resolved'] })
      .notNull()
      .default('new'),
    ip: text('ip'),
    userAgent: text('user_agent'),
    notifiedAt: integer('notified_at', { mode: 'number' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
  },
  (t) => ({
    createdIdx: index('contact_created_at_idx').on(t.createdAt),
    phoneIdx: index('contact_phone_idx').on(t.phoneE164),
  }),
);

export const financingApplications = sqliteTable(
  'financing_application',
  {
    id: text('id').primaryKey(),
    // Nullable because anonymous visitors may apply (no account required).
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    productTitle: text('product_title'),
    productHref: text('product_href'),
    productKind: text('product_kind'), // 'car' | 'electronics' | null
    initialPaymentUzs: integer('initial_payment_uzs', { mode: 'number' }),
    termMonths: integer('term_months', { mode: 'number' }),
    name: text('name').notNull(),
    phoneE164: text('phone_e164').notNull(),
    contactMethod: text('contact_method').notNull(),
    message: text('message'),
    consent: integer('consent', { mode: 'boolean' }).notNull().default(false),
    // 'new' | 'contacted' | 'approved' | 'declined'
    status: text('status', { enum: ['new', 'contacted', 'approved', 'declined'] })
      .notNull()
      .default('new'),
    ip: text('ip'),
    userAgent: text('user_agent'),
    notifiedAt: integer('notified_at', { mode: 'number' }),
    createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
  },
  (t) => ({
    createdIdx: index('finapp_created_at_idx').on(t.createdAt),
    userIdx: index('finapp_user_id_idx').on(t.userId),
  }),
);

export const savedItems = sqliteTable(
  'saved_item',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['car', 'electronics'] }).notNull(),
    ref: text('ref').notNull(), // slug / product id
    title: text('title').notNull(),
    priceUzs: integer('price_uzs', { mode: 'number' }),
    image: text('image'),
    href: text('href').notNull(),
    createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
  },
  (t) => ({
    // One saved item per (user, kind, ref).
    uniq: uniqueIndex('saved_item_user_kind_ref_idx').on(t.userId, t.kind, t.ref),
  }),
);

export const drafts = sqliteTable(
  'draft',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productTitle: text('product_title'),
    productHref: text('product_href'),
    kind: text('kind', { enum: ['car', 'electronics'] }),
    status: text('status', { enum: ['draft'] }).notNull().default('draft'),
    createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
    updatedAt: integer('updated_at', { mode: 'number' }).notNull().$defaultFn(nowMs),
  },
  (t) => ({
    userIdx: index('draft_user_id_idx').on(t.userId),
  }),
);

/**
 * One-off migration log. We deliberately avoid a migration framework here:
 * the schema is small and we want a single, auditable source of truth.
 * `lib/db/index.ts` runs every migration in order, keyed by name; already
 * applied names are skipped. Adding a new migration means appending to the
 * `MIGRATIONS` array — never editing an existing one.
 */
export const schemaMigrations = sqliteTable('schema_migration', {
  name: text('name').primaryKey(),
  appliedAt: integer('applied_at', { mode: 'number' }).notNull(),
});

/**
 * Helper type exported so service layers can reference a typed row without
 * pulling Drizzle's entire infer API at every call site.
 */
export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type ContactRequestRow = typeof contactRequests.$inferSelect;
export type FinancingApplicationRow = typeof financingApplications.$inferSelect;
export type SavedItemRow = typeof savedItems.$inferSelect;
export type DraftRow = typeof drafts.$inferSelect;

export { sql };
