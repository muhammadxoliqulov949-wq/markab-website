import type { AccountSnapshot } from './types';

/**
 * DEMO ACCOUNT DATA — fictional, structural, and never reachable by accident.
 *
 * RULES THIS FILE FOLLOWS:
 *
 *  1. No realistic identity. There is no person here: no name, no phone, no
 *     passport, no JSHSHIR, no card, no address, no customer number that looks
 *     like one.
 *  2. No monetary values. Every amount field is null. A payment schedule is
 *     shown as *structure* — sequence, due slot, status — with
 *     "Rasmiy ma'lumot kutilmoqda" where a figure would go, because an example
 *     amount in a dashboard is indistinguishable from a real instalment.
 *  3. No fake submission. The one application carries status 'draft', which
 *     renders as "Qoralama / yuborilmagan". Nothing here is "under review",
 *     "approved" or "submitted", because no backend received anything.
 *  4. Every string is prefixed or worded so a reader can tell it is a sample.
 *
 * This data is gated behind an explicit demo toggle and rendered under a
 * permanent "Demo rejim — namunaviy ma'lumotlar" banner.
 */
export const DEMO_ACCOUNT: AccountSnapshot = {
  applications: [
    {
      id: 'demo-app-1',
      reference: 'NAMUNA-001',
      productTitle: 'Namuna mahsulot (demo)',
      productHref: null,
      status: 'draft',
      createdAt: null,
    },
  ],

  agreements: [
    {
      id: 'demo-agreement-1',
      reference: 'NAMUNA-SHARTNOMA-001',
      productTitle: 'Namuna mahsulot (demo)',
      productHref: null,
      contractType: null,
      monthlyPaymentUzs: null,
      termMonths: null,
    },
  ],

  /**
   * Structure only: three rows showing what a schedule will look like, with no
   * dates and no amounts, because both would be invented.
   */
  payments: [
    { id: 'demo-pay-1', sequence: 1, dueDate: null, amountUzs: null, status: 'pending_data' },
    { id: 'demo-pay-2', sequence: 2, dueDate: null, amountUzs: null, status: 'pending_data' },
    { id: 'demo-pay-3', sequence: 3, dueDate: null, amountUzs: null, status: 'pending_data' },
  ],

  notifications: [
    {
      id: 'demo-note-1',
      title: 'Namuna bildirishnoma: shartnoma tuzilishi',
      body: 'Bu demo matn. Real tizimda bu yerda hisob bilan bog‘liq xabarlar ko‘rsatiladi.',
      createdAt: null,
      read: false,
    },
    {
      id: 'demo-note-2',
      title: 'Namuna bildirishnoma: hisobot tayyor',
      body: 'Bu ham demo matn. Hech qanday real hisobot mavjud emas.',
      createdAt: null,
      read: true,
    },
  ],
};

/** Shown wherever demo data is on screen, so the label is never forgotten. */
export const DEMO_BANNER_TEXT = 'Demo rejim — namunaviy ma’lumotlar';
