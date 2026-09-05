/**
 * Contact-request repository + service.
 *
 * Validation lives here (zod schema) so the API route cannot bypass it. The
 * service normalises input, persists a row, then best-effort notifies;
 * notification failure does NOT fail the request — submissions always
 * persist first.
 */
import 'server-only';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db';
import { contactRequests, type ContactRequestRow } from '@/lib/db/schema';
import { normalisePhoneE164 } from '@/lib/format/phone';
import { getNotifier } from '@/lib/services/notifier';

export const CONTACT_TOPICS = [
  'general',
  'sales',
  'financing',
  'service',
  'partnership',
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ism kamida 2 ta belgi bo‘lishi kerak.')
    .max(80, 'Ism juda uzun.'),
  phone: z.string().trim().min(5, 'Telefon raqamini kiriting.'),
  topic: z.enum(CONTACT_TOPICS, {
    errorMap: () => ({ message: 'Mavzuni tanlang.' }),
  }),
  message: z
    .string()
    .trim()
    .min(10, 'Xabar kamida 10 ta belgi bo‘lishi kerak.')
    .max(2000, 'Xabar 2000 belgidan oshmasligi kerak.'),
});

export type ContactInput = z.infer<typeof contactSchema>;

export interface ContactSubmission {
  id: string;
  name: string;
  phoneE164: string;
  topic: ContactTopic;
  message: string;
  status: 'new';
}

export async function submitContact(
  input: ContactInput,
  meta: { ip: string | null; userAgent: string | null; userId?: string | null },
): Promise<
  | { ok: true; submission: ContactSubmission }
  | { ok: false; error: 'invalid_phone'; message: string }
  | { ok: false; error: 'validation'; message: string; fields?: Record<string, string> }
> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string') fields[key] = issue.message;
    }
    return { ok: false, error: 'validation', message: 'Forma to‘ldirilmagan.', fields };
  }
  const phoneE164 = normalisePhoneE164(parsed.data.phone);
  if (!phoneE164) {
    return { ok: false, error: 'invalid_phone', message: 'Telefon raqami noto‘g‘ri.' };
  }

  const id = randomUUID();
  const now = Date.now();
  const { db } = getDb();
  const row: ContactRequestRow = {
    id,
    name: parsed.data.name,
    phoneE164,
    topic: parsed.data.topic,
    message: parsed.data.message,
    status: 'new',
    ip: meta.ip,
    userAgent: meta.userAgent,
    notifiedAt: null,
    createdAt: now,
    updatedAt: now,
    // contact_request doesn't carry a userId column; drop it.
  } as ContactRequestRow;
  await db.insert(contactRequests).values({
    id: row.id,
    name: row.name,
    phoneE164: row.phoneE164,
    topic: row.topic as 'general' | 'sales' | 'financing' | 'service' | 'partnership',
    message: row.message,
    status: row.status,
    ip: row.ip,
    userAgent: row.userAgent,
    notifiedAt: row.notifiedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

  try {
    const notifier = getNotifier();
    const delivered = await notifier.notifyContact(row);
    if (delivered) {
      await db
        .update(contactRequests)
        .set({ notifiedAt: Date.now(), updatedAt: Date.now() })
        .where(eq(contactRequests.id, id));
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'contact.notify_failed',
        id,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }

  return {
    ok: true,
    submission: {
      id,
      name: row.name,
      phoneE164,
      topic: row.topic as ContactTopic,
      message: row.message,
      status: 'new',
    },
  };
}
