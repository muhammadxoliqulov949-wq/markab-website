import type { FaqItem, Lesson } from '../types';

/**
 * Academy + FAQ fixtures — provenance
 * ---------------------------------------------------------------------------
 * Lessons: the three titles, their category and the "5–10 daqiqa" duration are
 * verbatim from the homepage "Ta'lim markazi" block. Lesson BODIES were never
 * publicly available (the live site has no reachable lesson page), so
 * `hasContent: false` → the UI shows "Rasmiy ma'lumot bilan to'ldiriladi"
 * instead of fabricated educational content.
 *
 * FAQ: the five questions are verbatim from the homepage FAQ block. The answers
 * were collapsed and not publicly rendered, so `answer: null` → pending.
 */

export const academyCategories = [
  { id: 'avtomobil', name: 'Avtomobil', description: 'Avtomobil tanlash va tekshirish asoslari.' },
  {
    id: 'moliyaviy-savodxonlik',
    name: 'Moliyaviy savodxonlik',
    description: 'Shaxsiy byudjet va to‘lov intizomi.',
  },
  {
    id: 'moliyalashtirish',
    name: 'Moliyalashtirish',
    description: 'Muddatli to‘lov shartlari va to‘lov rejasi.',
  },
  { id: 'murabaha', name: 'Murabaha', description: 'Murabaha shartnomasi qanday ishlaydi.' },
  { id: 'sarmoya', name: 'Sarmoya', description: 'Sarmoya kiritish va hisobot asoslari.' },
];

export const lessons: Lesson[] = [
  {
    slug: 'ishlatilgan-avtomobil-tanlash',
    title: 'Ishlatilgan avtomobil tanlash',
    category: 'avtomobil',
    durationLabel: '5–10 daqiqa',
    summary: null,
    hasContent: false,
    // No lesson in the public source publishes topic tags. Empty is the truth;
    // related-lesson ranking falls back to category proximity.
    topics: [],
  },
  {
    slug: 'tolvch-rejangizni-tushunish',
    title: 'To‘lov rejangizni tushunish',
    category: 'moliyalashtirish',
    durationLabel: '5–10 daqiqa',
    summary: null,
    hasContent: false,
    // No lesson in the public source publishes topic tags. Empty is the truth;
    // related-lesson ranking falls back to category proximity.
    topics: [],
  },
  {
    slug: 'sarmoyadorlar-uchun-asoslar',
    title: 'Sarmoyadorlar uchun asoslar',
    category: 'sarmoya',
    durationLabel: '5–10 daqiqa',
    summary: null,
    hasContent: false,
    // No lesson in the public source publishes topic tags. Empty is the truth;
    // related-lesson ranking falls back to category proximity.
    topics: [],
  },
];

export const faqItems: FaqItem[] = [
  { id: 'tasdiqlash', question: 'Tasdiqlash qancha vaqt oladi?', answer: null },
  { id: 'hujjatlar', question: 'Qanday hujjatlar kerak?', answer: null },
  { id: 'yetkazib-berish', question: 'Yetkazib berish bepulmi?', answer: null },
  { id: 'erta-tolash', question: 'Erta to‘lashga imkoniyat bormi?', answer: null },
  { id: 'pul-yechish', question: 'Sarmoyadorlar qanday pul yechadilar?', answer: null },
];
