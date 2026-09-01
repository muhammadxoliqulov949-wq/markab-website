import type { LoyaltyProgram } from '../types';
import { loyaltyEarning, loyaltyRewards, loyaltyTiers } from './content';

/**
 * Loyalty program — composed, not invented.
 *
 * PROVENANCE
 *  • `tiers`, `earning`, `rewards` are verbatim from Markab's public /loyalty
 *    page. Nothing here was authored to fill the page: every number that
 *    appears does so because the public page states it, and each section
 *    carries that attribution.
 *
 * WHY THE STATUS IS 'unconfirmed'
 *  • The homepage presents the program as "ishlab chiqilmoqda" (in
 *    development) while /loyalty publishes full terms. That contradiction is
 *    recorded, not resolved — engineering cannot decide which is true.
 *  • There is no backend: no enrollment, no balance, no membership state.
 *
 * So the published mechanics are kept, clearly attributed and clearly separated
 * from `availableNow` (what a visitor can actually do) and `pending` (what
 * needs a backend). Presenting them as an operational rewards program would be
 * the dishonest move; deleting published information would be a different kind
 * of dishonest, so it is kept with its provenance attached.
 */
export const loyaltyProgram: LoyaltyProgram = {
  status: 'unconfirmed',
  statusTitle: 'Rasmiy dastur tafsilotlari kutilmoqda.',
  statusDescription:
    'Bonus dasturining amaldagi holati tasdiqlanmagan: bosh sahifada dastur “ishlab chiqilmoqda” deb ko‘rsatilgan, /loyalty sahifasida esa to‘liq shartlar e’lon qilingan. Bu tafovut Markab tomonidan aniqlashtirilishi kerak. Prototipda ro‘yxatdan o‘tish, ball hisoblash yoki daraja olish ishlamaydi.',
  source: 'markab.uz /loyalty sahifasi',
  conflictNote:
    'Manbalar bir-biriga mos kelmaydi: bosh sahifa dasturni ishlab chiqilayotganini bildiradi, /loyalty esa to‘liq shartlarni e’lon qilgan. Ikkala manba ham ko‘rsatiladi — ulardan biri tanlanmagan.',

  // ── published half (attributed, never embellished) ──────────────────────
  tiers: loyaltyTiers.map((tier) => ({
    id: tier.id,
    name: tier.name,
    threshold: tier.threshold,
    bonus: tier.bonus,
    perks: tier.perks,
  })),
  earning: loyaltyEarning.map((item, index) => ({
    id: `earning-${index}`,
    action: item.action,
    reward: item.reward,
  })),
  rewards: loyaltyRewards.map((item, index) => ({
    id: `reward-${index}`,
    title: item.title,
    description: item.description,
    cost: item.cost,
  })),

  // ── what a visitor can genuinely do today ───────────────────────────────
  availableNow: [
    {
      id: 'catalogue',
      label: 'Katalogdan foydalanish',
      value: 'Mavjud',
      source: null,
    },
    {
      id: 'advisor',
      label: 'Tanlov yordamchisi',
      value: 'Mavjud',
      source: null,
    },
    {
      id: 'financing-info',
      label: 'Moliyalashtirish shartlari bilan tanishish',
      value: 'Mavjud',
      source: null,
    },
    {
      id: 'enrollment',
      label: 'Dasturga a’zo bo‘lish',
      value: null,
      source: null,
    },
    {
      id: 'balance',
      label: 'Ball balansi',
      value: null,
      source: null,
    },
    {
      id: 'membership-tier',
      label: 'Shaxsiy daraja holati',
      value: null,
      source: null,
    },
  ],

  // ── structural placeholders for a future backend ────────────────────────
  pending: [
    {
      id: 'membership',
      title: 'A’zolik holati',
      description:
        'Daraja va ball balansi shaxsiy kabinetda ko‘rsatiladi. Real hisob manbasi ulanmagani uchun bu yerda hech qanday qiymat ko‘rsatilmaydi.',
    },
    {
      id: 'history',
      title: 'Ball tarixi',
      description:
        'Ballarning qanday to‘plangani va sarflangani bo‘yicha tarix rasmiy hisob ma’lumotlari asosida shakllanadi.',
    },
    {
      id: 'benefits',
      title: 'Imtiyozlar',
      description:
        'Amaldagi imtiyozlar ro‘yxati dastur rasmiy ishga tushgach e’lon qilinadi.',
    },
    {
      id: 'notifications',
      title: 'Yangiliklardan xabardor bo‘lish',
      description:
        'Dastur ishga tushganda xabar berish uchun real obuna xizmati kerak. Prototipda bunday xizmat ulanmagan.',
    },
  ],
};
