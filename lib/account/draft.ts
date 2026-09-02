/**
 * Application drafts — locally preserved, never submitted.
 *
 * PRIVACY-MINIMAL BY DESIGN: a draft stores NO name, NO phone number, NO
 * message and NO financial preference. It records only that an application was
 * started, for which product, and when. That is enough for the dashboard to
 * show "you have an unsent draft" without writing a person's contact details
 * into browser storage, which nothing in this prototype has a reason to keep.
 *
 * A draft is never an application. It carries `status: 'draft'`, which the UI
 * renders as "Qoralama / yuborilmagan" — never "Ko'rib chiqilmoqda".
 */

import type { FinancingApplication } from './types';
import { isBoundedText, isSafeInternalHref } from '@/lib/security/url';

export const DRAFT_STORAGE_KEY = 'markab.demo.application-drafts';
const MAX_DRAFTS = 10;

export type DraftInput = {
  productTitle: string | null;
  productHref: string | null;
  /** 'car' | 'electronics' | null — which catalogue the item came from. */
  kind: 'car' | 'electronics' | null;
};

/**
 * What a stored draft is allowed to be.
 *
 * Drafts are rehydrated from `localStorage`, which is writable by anything else
 * on the origin. `productHref` is rendered as the target of a "open the
 * listing" link, so a stored `javascript:` or `https://evil.example` value
 * would become a link the dashboard itself offers the visitor. Nothing else on
 * this page has to go wrong for that to be exploitable — the stored value is
 * the payload.
 *
 * `productTitle` is length-capped for the same reason: untrusted input should
 * not be able to put an unbounded string into the layout.
 */
function isDraft(value: unknown): value is FinancingApplication {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    isBoundedText(v.id, 120) &&
    isBoundedText(v.reference, 60) &&
    v.status === 'draft' &&
    (v.productTitle === null || isBoundedText(v.productTitle, 200)) &&
    (v.productHref === null || isSafeInternalHref(v.productHref)) &&
    (v.kind === null || v.kind === 'car' || v.kind === 'electronics') &&
    (v.createdAt === undefined || typeof v.createdAt === 'string')
  );
}

export function readDrafts(): FinancingApplication[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isDraft).slice(0, MAX_DRAFTS) : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: FinancingApplication[]): void {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts.slice(0, MAX_DRAFTS)));
  } catch {
    // Storage may be blocked; the draft simply is not persisted.
  }
}

/**
 * Record that an application was started. One draft per product: starting the
 * same application twice updates the existing draft rather than piling up.
 */
/**
 * Record that an application was started.
 *
 * Input is clamped on the way in as well as validated on the way out: a draft
 * is written from whatever the application form currently holds, and writing
 * an unvalidated `href` would mean trusting the next read to catch it.
 */
export function saveDraft(input: DraftInput): FinancingApplication {
  const existing = readDrafts();
  const match = existing.find((draft) => draft.productHref === input.productHref);
  if (match) return match;

  const draft: FinancingApplication = {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    reference: `QORALAMA-${String(existing.length + 1).padStart(3, '0')}`,
    productTitle: isBoundedText(input.productTitle, 200) ? input.productTitle : null,
    productHref: isSafeInternalHref(input.productHref) ? input.productHref : null,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  writeDrafts([draft, ...existing]);
  return draft;
}

export function removeDraft(id: string): FinancingApplication[] {
  const next = readDrafts().filter((draft) => draft.id !== id);
  writeDrafts(next);
  return next;
}

export function clearDrafts(): void {
  writeDrafts([]);
}
