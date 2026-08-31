/**
 * Markab — verified public site configuration.
 *
 * RULE: only information published on markab.uz / official store listings is
 * present here. Anything unverified is `null` and surfaces in the UI as an
 * explicit "pending official data" state — never a guessed value.
 * See docs/LEGAL-TRUST-REGISTER.md for the conflict register.
 */

export const site = {
  name: 'Markab',
  shortName: 'Markab',
  url: 'https://markab.uz',
  locale: 'uz_UZ',

  /** Verified homepage heading (markab.uz). */
  tagline: 'Qadriyatlarga asoslangan xotirjamlik!',

  /** Verified positioning line shown in the mobile-app section. */
  positioning: 'Halol moliya platformasi',

  description:
    "Markab — avtomobil va elektronikani muddatli to'lovga taqdim etuvchi, qadriyatlarga asoslangan moliya platformasi.",

  /** Verified office block from the homepage. */
  office: {
    address: 'Toshkent shahri, Kukcha Aryk, Yunusobod tumani',
    hours: 'Dushanba – Juma: 9:00 – 18:00',
    mapUrl:
      "https://www.google.com/maps/place/41%C2%B019'55.1%22N+69%C2%B013'24.8%22E/@41.331985,69.223558,17z",
  },

  /** Verified store listings (Google Play / App Store). */
  apps: {
    appStore: 'https://apps.apple.com/us/app/markab/id6754150329',
    googlePlay: 'https://play.google.com/store/apps/details?id=uz.markab.markab',
  },

  /**
   * Contact details are NOT published on the website — they appear only in
   * store listings (two different phone numbers, two different emails).
   * Left null on purpose; see docs/LEGAL-TRUST-REGISTER.md §3–4.
   */
  contacts: {
    phone: null as string | null,
    email: null as string | null,
  },
} as const;

export type NavItem = { href: string; label: string; description?: string };

export const primaryNav: NavItem[] = [
  { href: '/cars', label: 'Avtomobillar' },
  { href: '/electronics', label: 'Elektronika' },
  { href: '/financing', label: 'Moliyalashtirish' },
  { href: '/invest', label: 'Sarmoya' },
  { href: '/academy', label: 'Academy' },
];

/**
 * The four homepage goal cards.
 *
 * Learning is the fifth Markab goal, but it has its own Academy section on the
 * homepage, so it appears there as a link rather than as a fifth card.
 */
export const homepageGoals = [
  {
    id: 'car',
    title: 'Avtomobil',
    description: 'Avtomobil tanlang va mavjud shartlarni ko‘ring.',
    cta: 'Avtomobillar',
    href: '/cars',
  },
  {
    id: 'electronics',
    title: 'Elektronika',
    description: 'Telefon, noutbuk va boshqa mahsulotlarni ko‘ring.',
    cta: 'Elektronika',
    href: '/electronics',
  },
  {
    id: 'financing',
    title: 'Moliyalashtirish',
    description: 'To‘lov imkoniyatlari va jarayonni tushuning.',
    cta: 'Moliyalashtirish',
    href: '/financing',
  },
  {
    id: 'invest',
    title: 'Sarmoya',
    description: 'Markab sarmoya modeli haqida ma’lumot oling.',
    cta: 'Sarmoya',
    href: '/invest',
  },
] as const;

export const secondaryNav: NavItem[] = [
  { href: '/about', label: 'Markab haqida' },
  { href: '/faq', label: 'Savol-javoblar' },
  { href: '/loyalty', label: 'Bonus dasturi' },
  { href: '/sell', label: 'Avtomobil sotish' },
  { href: '/contact', label: 'Aloqa' },
];

/**
 * Footer groups (Phase 1). Only routes that actually exist are linked; the live
 * site's `/news` is empty and has no prototype route, so it is omitted rather
 * than linked to a dead page.
 */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Markab',
    items: [
      { href: '/about', label: 'Biz haqimizda' },
      { href: '/academy', label: 'Academy' },
      { href: '/advisor', label: 'AI maslahatchi' },
      { href: '/loyalty', label: 'Bonus dasturi' },
    ],
  },
  {
    title: 'Xizmatlar',
    items: [
      { href: '/cars', label: 'Avtomobillar' },
      { href: '/electronics', label: 'Elektronika' },
      { href: '/financing', label: 'Moliyalashtirish' },
      { href: '/invest', label: 'Sarmoya' },
      { href: '/sell', label: 'Avtomobil sotish' },
    ],
  },
  {
    title: 'Yordam',
    items: [
      { href: '/faq', label: 'Savol-javoblar' },
      { href: '/contact', label: 'Aloqa' },
      { href: '/financing/apply', label: 'Ariza yuborish' },
      { href: '/financing/calculator', label: 'To‘lov kalkulyatori' },
    ],
  },
  {
    title: 'Huquqiy',
    items: [
      { href: '/privacy', label: 'Maxfiylik siyosati' },
      { href: '/terms', label: 'Foydalanish shartlari' },
    ],
  },
];

