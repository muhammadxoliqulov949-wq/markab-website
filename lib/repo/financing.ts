/**
 * Financing application repository + service.
 *
 * Same pattern as contact: zod validation, normalisation, persist first,
 * best-effort notification. The form accepts optional initial payment and
 * term fields, plus a product reference.
 */
import 'server-only';

import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db';
import { financingApplications, type FinancingApplicationRow } from '@/lib/db/schema';
import { normalisePhoneE164 } from '@/lib/format/phone';
import { getNotifier } from '@/lib/services/notifier';
import { isSafeInternalHref, isBoundedText, isSaneAmount } from '@/lib/security/url';

const CONTACT_METHODS = ['Telefon qo‘ng‘irog‘i', 'Telegram / WhatsApp', 'Email'] as const;

export const financingSchema = z.object({
  product: z.string().trim().max(200).optional().default(''),
  productHref: z.string().max(512).optional().default(''),
  productKind: z.enum(['car', 'electronics']).optional().nullable().default(null),
  initialPayment: z
    .string()
    .trim()
    .optional()
    .default('')
    .transform((v) => v.replace(/\s+/g, '')),
  term: z
    .string()
    .trim()
    .optional()
    .default('')
    .transform((v) => v.replace(/\s+/g, '')),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5),
  contactMethod: z.enum(CONTACT_METHODS),
  message: z.string().trim().max(2000).optional().default(''),
  consent: z
    .union([z.literal('on'), z.literal(true), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'on'),
});

export type FinancingInput = z.input<typeof financingSchema>;
export type FinancingValid = Omit<z.infer<typeof financingSchema>, 'consent'> & { consent: boolean };

export interface FinancingSubmission {
  id: string;
  status: 'new';
}

function parseOptionalAmount(input: string): number | null {
  if (!input) return null;
  if (!/^\d{1,12}$/.test(input)) return null;
  const n = Number.parseInt(input, 10);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000_000) return null;
  return n;
}

function parseOptionalTerm(input: string): number | null {
  if (!input) return null;
  if (!/^\d{1,3}$/.test(input)) return null;
  const n = Number.parseInt(input, 10);
  if (!Number.isFinite(n) || n < 1 || n > 60) return null;
  return n;
}

export async function submitApplication(
  rawInput: FinancingInput,
  meta: { ip: string | null; userAgent: string | null; userId?: string | null },
): Promise<
  | { ok: true; submission: FinancingSubmission }
  | { ok: false; error: 'validation'; message: string; fields?: Record<string, string> }
  | { ok: false; error: 'consent_required'; message: string }
  | { ok: false; error: 'invalid_phone'; message: string }
> {
  const parsed = financingSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string') fields[key] = issue.message;
    }
    return { ok: false, error: 'validation', message: 'Formani to‘ldiring.', fields };
  }
  const data = parsed.data as FinancingValid;

  const phoneE164 = normalisePhoneE164(data.phone);
  if (!phoneE164) {
    return { ok: false, error: 'invalid_phone', message: 'Telefon raqami noto‘g‘ri.' };
  }
  if (!data.consent) {
    return {
      ok: false,
      error: 'consent_required',
      message: 'Davom etish uchun rozilik kerak.',
    };
  }

  const initialPaymentUzs = parseOptionalAmount(data.initialPayment);
  const termMonths = parseOptionalTerm(data.term);

  // Product href must be a same-origin path if provided.
  const productHref = data.productHref && isSafeInternalHref(data.productHref) ? data.productHref : null;
  const productTitle = data.product && isBoundedText(data.product, 200) ? data.product : null;
  const productKind = data.productKind === 'car' || data.productKind === 'electronics' ? data.productKind : null;

  const id = randomUUID();
  const now = Date.now();
  const { db } = getDb();

  const row: FinancingApplicationRow = {
    id,
    userId: meta.userId ?? null,
    productTitle,
    productHref,
    productKind,
    initialPaymentUzs,
    termMonths,
    name: data.name,
    phoneE164,
    contactMethod: data.contactMethod,
    message: data.message || null,
    consent: true,
    status: 'new',
    ip: meta.ip,
    userAgent: meta.userAgent,
    notifiedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(financingApplications).values({
    id: row.id,
    userId: row.userId,
    productTitle: row.productTitle,
    productHref: row.productHref,
    productKind: row.productKind,
    initialPaymentUzs: row.initialPaymentUzs,
    termMonths: row.termMonths,
    name: row.name,
    phoneE164: row.phoneE164,
    contactMethod: row.contactMethod,
    message: row.message,
    consent: true,
    status: row.status,
    ip: row.ip,
    userAgent: row.userAgent,
    notifiedAt: row.notifiedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

  try {
    const notifier = getNotifier();
    const delivered = await notifier.notifyApplication(row);
    if (delivered) {
      await db
        .update(financingApplications)
        .set({ notifiedAt: Date.now(), updatedAt: Date.now() })
        .where(eq(financingApplications.id, id));
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'financing.notify_failed',
        id,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }

  return { ok: true, submission: { id, status: 'new' } };
}

export async function listUserApplications(userId: string) {
  const { db } = getDb();
  return db
    .select({
      id: financingApplications.id,
      productTitle: financingApplications.productTitle,
      productHref: financingApplications.productHref,
      productKind: financingApplications.productKind,
      status: financingApplications.status,
      createdAt: financingApplications.createdAt,
    })
    .from(financingApplications)
    .where(eq(financingApplications.userId, userId))
    .orderBy(desc(financingApplications.createdAt));
}

// isSaneAmount imported for future use in stricter validation.
export const _ = isSaneAmount;
