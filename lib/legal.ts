/**
 * Legal / trust constants.
 *
 * ⚠️ ENGINEERING DID NOT RESOLVE ANY CONFLICT.
 * Every field below is `null` because multiple conflicting official values were
 * found across markab.uz and the app-store listings. Values are preserved in the
 * conflict register (docs/LEGAL-TRUST-REGISTER.md) for human verification.
 *
 * UI RULE: render nothing for a null legal value — never a placeholder, never a
 * guessed value, never a new claim.
 */

export const legal = {
  /** 4 conflicting forms observed: "Markab Mulk" MChJ · "MARKAB MULK KOMMANDIT SHIRKATI"
   *  · "MARKAB MULK, MCHJ" · "TOWN PROPERTY MANAGEMENT SOLUTIONS, MCHJ" */
  entityName: null as string | null,

  /** Not published anywhere — do not invent. */
  registrationNumber: null as string | null,

  /** Two conflicting addresses published (Yunusobod vs Beruniy B1). */
  address: null as string | null,

  /** Two conflicting phone numbers published. */
  phone: null as string | null,

  /** Two conflicting emails published. */
  email: null as string | null,

  documents: {
    privacy: '/privacy',
    terms: '/terms',
    /** Public offer (ommaviy oferta) — not published. */
    offer: null as string | null,
    /** Risk disclosure — required before any investment marketing; not published. */
    riskDisclosure: null as string | null,
    /** Sample murabaha / taqsit contracts — not published. */
    sampleContracts: null as string | null,
  },
} as const;

export type LegalFlag = {
  id: string;
  field: string;
  summary: string;
  sources: string[];
  severity: 'high' | 'medium' | 'low';
};

/** Shown in the trust layer so the gap is visible instead of hidden. */
export const legalFlags: LegalFlag[] = [
  {
    id: 'entity',
    field: 'Yuridik shaxs nomi',
    summary:
      'Sayt va ilova do‘konlarida yuridik shaxs nomining turlicha shakllari ko‘rsatilgan. Yagona rasmiy nom tasdiqlanishi kerak.',
    sources: ['markab.uz/privacy', 'Avtomobil kartochkasi', 'Google Play', 'App Store'],
    severity: 'high',
  },
  {
    id: 'privacy',
    field: 'Maxfiylik deklaratsiyasi',
    summary:
      'Sayt maxfiylik siyosati va ilova do‘konlaridagi ma’lumot yig‘ish deklaratsiyasi o‘rtasida tafovut mavjud. Rasmiy tekshiruv talab qiladi.',
    sources: ['markab.uz/privacy', 'App Store App Privacy', 'Google Play Data safety'],
    severity: 'high',
  },
  {
    id: 'address',
    field: 'Manzil',
    summary: 'Sayt va Google Play’da ikki xil manzil ko‘rsatilgan.',
    sources: ['markab.uz', 'Google Play'],
    severity: 'medium',
  },
  {
    id: 'contacts',
    field: 'Aloqa ma’lumotlari',
    summary: 'Telefon va email manbalarda turlicha ko‘rsatilgan; saytda asosiy aloqa kanali — forma.',
    sources: ['Google Play'],
    severity: 'medium',
  },
  {
    id: 'domains',
    field: 'Domenlar',
    summary: 'markab.uz va markabstore.uz manbalarida turlicha ko‘rsatilgan.',
    sources: ['markab.uz', 'App Store'],
    severity: 'medium',
  },
  {
    id: 'standards',
    field: 'Standartlar / muvofiqlik',
    summary:
      'AAOIFI va boshqa muvofiqlik bayonotlari e’lon qilingan, biroq tasdiqlovchi hujjatlar saytda mavjud emas.',
    sources: ['markab.uz bosh sahifa'],
    severity: 'medium',
  },
];
