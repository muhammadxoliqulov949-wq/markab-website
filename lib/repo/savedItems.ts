/**
 * Saved ("sevimlilar") items — server-side persistence for authenticated users.
 *
 * The frontend also keeps localStorage state for anonymous visitors; when a
 * user signs in the server-side list becomes the source of truth. Every input
 * is re-validated against the same strict allowlists used when reading back
 * out of localStorage — even if the client code is well-behaved, a raw HTTP
 * request from curl/httpie should not be able to persist a javascript: href
 * or a non-allowlisted image.
 */
import 'server-only';

import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { savedItems, type SavedItemRow } from '@/lib/db/schema';
import { isSafeInternalHref, isAllowedImageUrl, isSaneAmount, isBoundedText } from '@/lib/security/url';

export const savedItemInput = z.object({
  kind: z.enum(['car', 'electronics']),
  ref: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  priceUzs: z.number().int().min(0).max(1e12).nullable().optional(),
  image: z.string().max(2048).nullable().optional(),
  href: z.string().min(1).max(512),
});
export type SavedItemInput = z.infer<typeof savedItemInput>;

const MAX_SAVED_PER_USER = 100;

function validateItem(input: unknown): { ok: true; data: SavedItemInput } | { ok: false } {
  const parsed = savedItemInput.safeParse(input);
  if (!parsed.success) return { ok: false };
  const d = parsed.data;
  if (!isSafeInternalHref(d.href)) return { ok: false };
  if (d.image !== null && d.image !== undefined) {
    if (!isAllowedImageUrl(d.image) && !isSafeInternalHref(d.image)) return { ok: false };
  }
  if (d.priceUzs != null && !isSaneAmount(d.priceUzs)) return { ok: false };
  if (!isBoundedText(d.title, 200)) return { ok: false };
  if (!isBoundedText(d.ref, 120)) return { ok: false };
  return { ok: true, data: d };
}

export async function listSavedItems(userId: string): Promise<SavedItemRow[]> {
  const { db } = getDb();
  return db
    .select()
    .from(savedItems)
    .where(eq(savedItems.userId, userId))
    .orderBy(savedItems.createdAt);
}

export async function addSavedItem(
  userId: string,
  rawInput: unknown,
): Promise<{ added: true; item: SavedItemRow; deduped: boolean } | { added: false; reason: string }> {
  const check = validateItem(rawInput);
  if (!check.ok) return { added: false, reason: 'invalid_item' };
  const d = check.data;

  const { raw } = getDb();
  const existing = raw
    .prepare(
      `SELECT * FROM saved_item WHERE user_id = ? AND kind = ? AND ref = ? LIMIT 1`,
    )
    .get(userId, d.kind, d.ref) as SavedItemRow | undefined;
  if (existing) return { added: true, item: existing, deduped: true };

  const countRow = raw
    .prepare(`SELECT COUNT(*) as c FROM saved_item WHERE user_id = ?`)
    .get(userId) as { c: number };
  if (countRow.c >= MAX_SAVED_PER_USER) {
    return { added: false, reason: 'limit_reached' };
  }

  const now = Date.now();
  const res = raw
    .prepare(
      `INSERT INTO saved_item (user_id, kind, ref, title, price_uzs, image, href, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .get(userId, d.kind, d.ref, d.title, d.priceUzs ?? null, d.image ?? null, d.href, now) as SavedItemRow;
  return { added: true, item: res, deduped: false };
}

export async function removeSavedItem(
  userId: string,
  kind: 'car' | 'electronics',
  ref: string,
): Promise<{ removed: boolean }> {
  const { raw } = getDb();
  const res = raw
    .prepare(
      `DELETE FROM saved_item WHERE user_id = ? AND kind = ? AND ref = ?`,
    )
    .run(userId, kind, ref);
  return { removed: res.changes > 0 };
}
