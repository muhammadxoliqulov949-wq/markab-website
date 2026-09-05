/**
 * Financing-application drafts — server-side counterpart of the localStorage
 * draft store for authenticated users.
 *
 * Drafts are intentionally privacy-minimal: no name, no phone, no message.
 * They only record that an application was started for a specific product.
 */
import 'server-only';

import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db';
import { drafts as draftsTable, type DraftRow } from '@/lib/db/schema';
import { isSafeInternalHref, isBoundedText } from '@/lib/security/url';

export interface DraftInput {
  productTitle: string | null;
  productHref: string | null;
  kind: 'car' | 'electronics' | null;
}

function validate(input: DraftInput): { ok: true; data: DraftInput } | { ok: false } {
  if (input.productTitle !== null && !isBoundedText(input.productTitle, 200)) return { ok: false };
  if (input.productHref !== null && !isSafeInternalHref(input.productHref)) return { ok: false };
  if (input.kind !== null && input.kind !== 'car' && input.kind !== 'electronics') {
    return { ok: false };
  }
  return { ok: true, data: input };
}

export async function listDrafts(userId: string): Promise<DraftRow[]> {
  const { db } = getDb();
  return db
    .select()
    .from(draftsTable)
    .where(eq(draftsTable.userId, userId))
    .orderBy(desc(draftsTable.updatedAt));
}

export async function upsertDraft(userId: string, input: DraftInput): Promise<DraftRow | null> {
  const v = validate(input);
  if (!v.ok) return null;
  const { raw } = getDb();
  const now = Date.now();
  // One active draft per (user, productHref). Look up an existing draft by
  // user + href; update in place if found, otherwise insert.
  let existing: DraftRow | undefined;
  if (v.data.productHref === null) {
    existing = raw
      .prepare(
        `SELECT * FROM draft WHERE user_id = ? AND product_href IS NULL AND status = 'draft' ORDER BY updated_at DESC LIMIT 1`,
      )
      .get(userId) as DraftRow | undefined;
  } else {
    existing = raw
      .prepare(
        `SELECT * FROM draft WHERE user_id = ? AND product_href = ? AND status = 'draft' ORDER BY updated_at DESC LIMIT 1`,
      )
      .get(userId, v.data.productHref) as DraftRow | undefined;
  }
  if (existing) {
    raw.prepare(
      `UPDATE draft SET product_title = ?, kind = ?, updated_at = ? WHERE id = ?`,
    ).run(v.data.productTitle, v.data.kind, now, existing.id);
    return { ...existing, productTitle: v.data.productTitle, kind: v.data.kind, updatedAt: now };
  }
  const id = randomUUID();
  const row = raw
    .prepare(
      `INSERT INTO draft (id, user_id, product_title, product_href, kind, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)
       RETURNING *`,
    )
    .get(id, userId, v.data.productTitle, v.data.productHref, v.data.kind, now, now) as DraftRow;
  return row;
}

export async function deleteDraft(userId: string, id: string): Promise<{ removed: boolean }> {
  const { raw } = getDb();
  // Reference by id AND userId so one user cannot delete another's draft.
  const res = raw
    .prepare(`DELETE FROM draft WHERE id = ? AND user_id = ?`)
    .run(id, userId);
  return { removed: res.changes > 0 };
}
