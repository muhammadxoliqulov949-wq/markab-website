/**
 * Verified editorial content.
 *
 * Everything here is published on markab.uz. Nothing is embellished:
 *  • valueProps      — homepage "Nima uchun Markab?" (4 cards, verbatim)
 *  • howItWorks      — homepage "Muddatli to'lov qanday ishlaydi" (4 steps)
 *  • financingSteps  — 6-step expansion of the public 4-step flow for /financing
 *  • investorFlow    — homepage investor diagram (verbatim)
 *  • appFeatures     — homepage app section (4 bullets, verbatim)
 *  • loyalty         — the live /loyalty page (tiers, earning, rewards)
 *  • trustBadges     — vehicle-detail trust badges (spelling corrected)
 */

export const valueProps = [
  {
    id: 'standards',
    title: 'Qadriyatlarga asoslangan moliya',
    description: 'AAOIFI standartlari talablariga mos',
    // No supporting documentation is published — flagged, not asserted as certified.
    note: 'Tasdiqlovchi hujjatlar: rasmiy ma’lumot bilan to‘ldiriladi',
  },
  {
    id: 'profit',
    title: 'Adolatli foyda taqsimoti',
    description: 'Rasmiy kelishuv va oylik hisobdorlik',
    note: null,
  },
  {
    id: 'flexible',
    title: 'Moslashuvchan',
    description: '2 oydan 36 oygacha muddat',
    note: null,
  },
  {
    id: 'withdraw',
    title: 'Oson chiqarish',
    description: 'Foydani istalgan vaqt chiqaring',
    note: null,
  },
];

export const howItWorks = [
  { step: 1, title: 'Tanlang', description: 'Avtomobil yoki elektronika mahsulotini tanlang' },
  { step: 2, title: 'Tasdiqlash', description: 'Hujjatlaringizni yuklang va tez tasdiqlash oling' },
  {
    step: 3,
    title: 'Shartnoma',
    description: 'Oldi-sotdi (taqsit yoki murobaha) shartnomasini imzolang',
  },
  { step: 4, title: 'Oling', description: 'Avtomobilingizni haydang yoki mahsulotni qabul qiling' },
];

/** 6-step customer journey used on /financing (expansion of the public 4 steps). */
export const financingSteps = [
  {
    step: 1,
    title: 'Mahsulotni tanlang',
    description: 'Avtomobil yoki elektronika bo‘limidan mos mahsulotni tanlang.',
    href: '/cars',
  },
  {
    step: 2,
    title: 'Shartlarni ko‘ring',
    description: 'Narx, muddat va oylik to‘lov shartlari bilan tanishing.',
    href: '/financing/calculator',
  },
  {
    step: 3,
    title: 'Ariza yuboring',
    description: 'Onlayn ariza qoldiring — mahsulot ma’lumotlari avtomatik qo‘shiladi.',
    href: '/profile',
  },
  {
    step: 4,
    title: 'Tasdiqlash',
    description: 'Hujjatlaringizni yuklang va tez tasdiqlash oling.',
    href: null,
  },
  {
    step: 5,
    title: 'Shartnoma',
    description: 'Oldi-sotdi (taqsit yoki murobaha) shartnomasini imzolang.',
    href: null,
  },
  {
    step: 6,
    title: 'Mahsulotni oling',
    description: 'Avtomobilingizni haydang yoki mahsulotni qabul qiling.',
    href: null,
  },
];

export const investorFlow = {
  title: 'Sarmoyadorlar uchun',
  steps: ['Biznesdagi ulush', 'Oylik foyda', 'Pul yechish/qo‘shish'],
  cta: 'Sarmoyalashni boshlash',
};

export const appFeatures = [
  { title: 'Tez to‘lov', description: 'To‘lovlarni ilova orqali amalga oshiring.' },
  { title: 'Push bildirishnomalar', description: 'To‘lov sanasi va ariza holati haqida eslatma.' },
  { title: 'Maxsus takliflar', description: 'Faqat ilovada mavjud takliflar.' },
  { title: 'Bonus ballari', description: 'Har bir xarid uchun ball to‘plang.' },
];

export const trustBadges = [
  {
    title: 'Kafolatli xavfsizlik',
    description: 'Barcha avtomobillar tekshirilgan',
    note: 'Tasdiqlovchi hujjatlar: rasmiy ma’lumot bilan to‘ldiriladi',
  },
  {
    // Spelling corrected: the live site renders "Shafof moliya".
    title: 'Shaffof moliya',
    description: 'Foizsiz to‘lov imkoniyati',
    note: null,
  },
];

export const loyaltyTiers = [
  {
    id: 'bronza',
    name: 'Bronza',
    threshold: "Boshlang'ich",
    bonus: '1% bonus',
    perks: ['Asosiy qo‘llab-quvvatlash'],
  },
  {
    id: 'kumush',
    name: 'Kumush',
    threshold: '500 ball',
    bonus: '2% bonus',
    perks: ['Tezkor qo‘llab-quvvatlash', 'Maxsus chegirmalar'],
  },
  {
    id: 'oltin',
    name: 'Oltin',
    threshold: '1 000 ball',
    bonus: '3% bonus',
    perks: ['Premium qo‘llab-quvvatlash', 'Dastlabki ko‘rish'],
  },
  {
    id: 'platina',
    name: 'Platina',
    threshold: '2 000 ball',
    bonus: '5% bonus',
    perks: ['Shaxsiy menejer', 'VIP voqealar', 'Bepul yetkazib berish'],
  },
];

export const loyaltyEarning = [
  { action: 'Avtomobil sotib olish', reward: '1$ = 1 ball' },
  { action: 'Baho va sharh yozish', reward: '50 ball' },
  { action: 'Do‘st taklif qilish', reward: '200 ball' },
  { action: 'Ijtimoiy tarmoqlarda ulashish', reward: '25 ball' },
];

export const loyaltyRewards = [
  { title: '10% chegirma', description: 'Barcha avtomobillarga', cost: '600 ball' },
  { title: 'Bepul tekshiruv', description: 'Professional texnik ko‘rik', cost: '200 ball' },
  { title: 'VIP qo‘llab-quvvatlash', description: '24/7 shaxsiy konsultant', cost: '1 000 ball' },
];

/** Copy constants used across empty / pending / error states (Uzbek). */
export const stateCopy = {
  pending: 'Ma’lumot tayyorlanmoqda',
  pendingLong: 'Bu ma’lumot rasmiy manba bilan to‘ldiriladi.',
  officialPending: 'Rasmiy ma’lumot bilan to‘ldiriladi',
  calculationPending: 'Hisob-kitob ma’lumoti tayyorlanmoqda',
  notFoundTitle: 'Bu sahifa topilmadi.',
  notFoundDescription:
    'Siz qidirayotgan sahifa mavjud emas yoki ko‘chirilgan bo‘lishi mumkin. Quyidagi bo‘limlar yordam berishi mumkin.',
  errorTitle: 'Nimadir xato ketdi',
  errorDescription:
    'Ma’lumotlarni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring yoki keyinroq qayting.',
  emptyVehicles: 'Hozircha avtomobillar mavjud emas',
  emptyProducts: 'Hozircha mahsulotlar mavjud emas',
  emptySearch: 'Qidiruv bo‘yicha hech narsa topilmadi',
  emptyCart: 'Savatchangiz bo‘sh',
  retry: 'Qayta urinish',
  backHome: 'Bosh sahifaga qaytish',
} as const;
