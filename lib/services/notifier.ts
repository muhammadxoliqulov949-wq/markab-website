/**
 * Notification adapter for contact requests and financing applications.
 *
 * Submissions ALWAYS persist in the database regardless of whether the
 * notifier is configured, so no submission is ever lost because email/Slack/
 * Telegram is down. The notifier is best-effort: failure is logged but does
 * not fail the request.
 */
import 'server-only';
import { serverEnv } from '@/lib/env/server';
import { log } from '@/lib/request/logger';
import type { ContactRequestRow, FinancingApplicationRow } from '@/lib/db/schema';
import { formatPhoneE164 } from '@/lib/format/phone';

export interface Notifier {
  readonly name: string;
  notifyContact(row: ContactRequestRow): Promise<boolean>;
  notifyApplication(row: FinancingApplicationRow): Promise<boolean>;
}

class NoopNotifier implements Notifier {
  readonly name = 'disabled';
  async notifyContact() {
    return false;
  }
  async notifyApplication() {
    return false;
  }
}

class LogNotifier implements Notifier {
  readonly name = 'log';
  async notifyContact(row: ContactRequestRow) {
    log.warn('notify.contact_request', {
      id: row.id,
      name: row.name,
      phone: formatPhoneE164(row.phoneE164),
      topic: row.topic,
      message: row.message.slice(0, 400),
    });
    return true;
  }
  async notifyApplication(row: FinancingApplicationRow) {
    log.warn('notify.financing_application', {
      id: row.id,
      name: row.name,
      phone: formatPhoneE164(row.phoneE164),
      product: row.productTitle,
      termMonths: row.termMonths,
      initialPaymentUzs: row.initialPaymentUzs,
      contactMethod: row.contactMethod,
      message: (row.message ?? '').slice(0, 400),
    });
    return true;
  }
}

let cached: Notifier | null = null;
export function getNotifier(): Notifier {
  if (cached) return cached;
  cached = serverEnv().notifier === 'log' ? new LogNotifier() : new NoopNotifier();
  return cached;
}
