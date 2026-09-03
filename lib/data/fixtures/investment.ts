import type { InvestmentProfile } from '../types';

/**
 * Investment fixture — the investment product exactly as far as public
 * material goes, and not one step further.
 *
 * PROVENANCE RULES ENFORCED HERE:
 *
 *  • `published` holds only wording that appears in Markab's own public
 *    material (homepage value propositions and the investor diagram). Each row
 *    carries its source so the UI can attribute it instead of asserting it.
 *  • `pending` is the list of things a person actually needs before investing.
 *    Every one of them is empty, because every one of them is unpublished.
 *    They are listed by name so the gap is visible rather than smoothed over.
 *  • There is no return rate, yield, ROI, term, minimum amount, payout
 *    schedule, fee, risk score or historical performance anywhere in this file.
 *
 * REMOVED IN PHASE 5: this file's predecessor carried the term range
 * "2 oydan 36 oygacha". It could not be substantiated for the investment
 * product, so it was deleted and the row moved to `pending`. It was NOT
 * replaced with another guessed duration.
 */
export const investmentProfile: Omit<InvestmentProfile, 'modelTitle' | 'modelSteps'> = {
  published: [
    {
      id: 'profit-principle',
      label: 'Foyda taqsimoti tamoyili',
      value: 'Adolatli foyda taqsimoti — rasmiy kelishuv asosida',
      source: 'markab.uz — “Nima uchun Markab?”',
      note: 'Taqsimot ulushi, hisoblash tartibi va davriyligi rasmiy hujjatda belgilanadi.',
    },
    {
      id: 'accountability',
      label: 'Hisobdorlik',
      value: 'Oylik hisobdorlik',
      source: 'markab.uz — “Nima uchun Markab?”',
      note: 'Hisobot shakli, tarkibi va taqdim etish tartibi rasmiy manbada e’lon qilinmagan.',
    },
    {
      id: 'withdrawal',
      label: 'Pul yechish',
      value: 'Foydani istalgan vaqt chiqarish',
      source: 'markab.uz — “Nima uchun Markab?”',
      note: 'Bu kompaniyaning o‘z e’loni. Yechish tartibi, muddati va cheklovlari rasmiy hujjat bilan tasdiqlanadi.',
    },
  ],

  pending: [
    {
      id: 'minimum',
      label: 'Minimal sarmoya miqdori',
      hint: 'Eng kam qancha mablag‘ bilan qatnashish mumkinligi e’lon qilinmagan.',
    },
    {
      id: 'term',
      label: 'Sarmoya muddati',
      hint: 'Muddat oralig‘i rasmiy manbada e’lon qilingach ko‘rsatiladi.',
    },
    {
      id: 'profit-mechanism',
      label: 'Foyda mexanizmi',
      hint: 'Foyda qanday shakllanishi va hisoblanishi rasmiy hujjatda belgilanadi.',
    },
    {
      id: 'distribution',
      label: 'Taqsimot jadvali',
      hint: 'Foyda qaysi davrda va qanday tartibda taqsimlanishi e’lon qilinmagan.',
    },
    {
      id: 'contract-type',
      label: 'Shartnoma turi',
      hint: 'Qaysi shartnoma turi qo‘llanishi rasmiy manbada ko‘rsatilmagan.',
    },
    {
      id: 'fees',
      label: 'To‘lov va komissiyalar',
      hint: 'Hech qanday to‘lov yoki komissiya e’lon qilinmagan — ular taxmin qilinmaydi.',
    },
    {
      id: 'withdrawal-rules',
      label: 'Pul yechish shartlari',
      hint: 'Yechish muddati, cheklovlari va bosqichlari rasmiy hujjat bilan tasdiqlanadi.',
    },
    {
      id: 'risk',
      label: 'Risk ma’lumoti',
      hint: 'Rasmiy risk ogohlantiruvi e’lon qilingach shu yerda to‘liq keltiriladi.',
    },
    {
      id: 'reporting-format',
      label: 'Hisobot shakli',
      hint: 'Hisobot qanday ko‘rinishda taqdim etilishi e’lon qilinmagan.',
    },
  ],

  /**
   * Compliance is attributed, never asserted. The prototype has no way to
   * verify a standards claim, so it reports what the company says and states
   * plainly that it could not verify it.
   */
  compliance: [
    {
      id: 'aaoifi',
      statement:
        'Markab o‘z ochiq materiallarida AAOIFI standartlariga muvofiqlikni bildiradi.',
      attribution:
        'Tasdiqlovchi rasmiy hujjatlar integratsiyasi kutilmoqda. Bu prototip mustaqil tekshiruv o‘tkazmaydi va da’voni tasdiqlangan deb ko‘rsatmaydi.',
    },
    {
      id: 'model-wording',
      statement:
        'Sarmoya modeli kompaniya tomonidan “biznesdagi ulush → foyda taqsimoti → pul yechish/qo‘shish” tarzida tavsiflanadi.',
      attribution:
        'Bu tavsif kompaniyaning o‘z e’lonidir. Modelning huquqiy mexanikasi va shartnoma asoslari rasmiy hujjatlar bilan tasdiqlanadi.',
    },
  ],

  /**
   * Document categories, all pending. `href` stays null until a real file
   * exists — the UI must never render a download button for a document that
   * does not exist.
   */
  documents: [
    {
      id: 'agreement',
      title: 'Sarmoya shartnomasi',
      description: 'Sarmoyador va kompaniya o‘rtasidagi shartnomaning rasmiy namunasi.',
      href: null,
    },
    {
      id: 'offer',
      title: 'Ommaviy oferta',
      description: 'Taklif shartlarining to‘liq rasmiy matni.',
      href: null,
    },
    {
      id: 'risk',
      title: 'Risk haqida ogohlantirish',
      description: 'Investitsiya risklari bo‘yicha rasmiy hujjat.',
      href: null,
    },
    {
      id: 'reporting',
      title: 'Hisobot namunasi',
      description: 'Oylik hisobotning shakli va tarkibi.',
      href: null,
    },
    {
      id: 'compliance',
      title: 'Muvofiqlik dalillari',
      description: 'Standartlarga muvofiqlikni tasdiqlovchi hujjatlar.',
      href: null,
    },
  ],

  /**
   * The journey is deliberately high level. Steps no official source describes
   * are flagged `confirmed: false` rather than filled in with a plausible
   * description of how such things usually work.
   */
  journey: [
    {
      step: 1,
      title: 'Ma’lumot olish',
      description:
        'Sarmoya modeli, e’lon qilingan tamoyillar va mavjud rasmiy ma’lumotlar bilan tanishasiz.',
      confirmed: true,
    },
    {
      step: 2,
      title: 'Savol va aniqlashtirish',
      description:
        'Qiziqtirgan savollarni mutaxassisga berasiz: shartlar, hujjatlar va jarayon bo‘yicha.',
      confirmed: true,
    },
    {
      step: 3,
      title: 'Shartnoma',
      description:
        'Rasmiy shartnoma shartlari bilan tanishish va kelishish. Bu bosqichning tartibi rasmiy manbada tavsiflanmagan.',
      confirmed: false,
    },
    {
      step: 4,
      title: 'Hisobot va kuzatuv',
      description:
        'Oylik hisobdorlik e’lon qilingan, ammo hisobot qanday taqdim etilishi va qanday kuzatilishi rasmiy manbada ko‘rsatilmagan.',
      confirmed: false,
    },
  ],
};
