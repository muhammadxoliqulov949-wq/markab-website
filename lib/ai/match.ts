import type { Product, Vehicle } from '@/lib/data/types';

/**
 * Rule-based "AI Product Advisor" — CONCEPT, NOT A LANGUAGE MODEL.
 *
 * Hard rules:
 *  • It only matches against real catalogue records (fixtures today, API later).
 *  • It never states a monthly payment, approval chance, return, rate or legal fact.
 *  • Financial / legal / religious questions are not answered — the user is routed
 *    to official information or a human instead.
 */

export type AdvisorAnswer = {
  kind: 'results' | 'sensitive' | 'empty' | 'unclear';
  note: string;
  vehicles: Vehicle[];
  products: Product[];
  parsed: { budget: number | null; category: 'vehicles' | 'products' | null };
};

const SENSITIVE_PATTERNS = [
  /foiz|процент|ставка/i,
  /shartnoma|huquqiy|yuridik|sud|da’vo|da'vo/i,
  /kafolat|garantiya/i,
  /risk|xavf|zarar/i,
  /soliq|nalog/i,
  /aaoifi|fatvo|halolmi|harommi/i,
  /murabaha nima|taqsit nima|muddatli to’lov nima|muddatli to'lov nima/i,
  /litsenziya|sertifikat|ruxsatnoma/i,
];

const VEHICLE_PATTERNS = /mashina|avtomobil|avto\b|malibu|cobalt|lacetti|bmw|kia|zeekr|monza|nexia/i;
const PRODUCT_PATTERNS = /telefon|iphone|smartfon|elektronika|noutbuk|kompyuter|planshet|aksessuar/i;

function parseBudget(input: string): number | null {
  const normalized = input.replace(/\s/g, ' ');

  const mln = normalized.match(/(\d+(?:[.,]\d+)?)\s*(mln|mln\.|million|млн|million so‘m)/i);
  if (mln) return Math.round(parseFloat(mln[1].replace(',', '.')) * 1_000_000);

  const ming = normalized.match(/(\d+(?:[.,]\d+)?)\s*(ming|ming\.|тыс|k\b)/i);
  if (ming) return Math.round(parseFloat(ming[1].replace(',', '.')) * 1_000);

  const plain = normalized.match(/\b(\d{2,3})(?:[ .](\d{3})){1,3}\b/);
  if (plain) return Number(plain[0].replace(/[ .]/g, ''));

  const flat = normalized.match(/\b(\d{7,12})\b/);
  if (flat) return Number(flat[1]);

  return null;
}

export function matchAdvisorQuery(
  input: string,
  vehicles: Vehicle[],
  products: Product[],
): AdvisorAnswer {
  const text = input.trim();
  const budget = parseBudget(text);

  const sensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));

  let category: 'vehicles' | 'products' | null = null;
  if (VEHICLE_PATTERNS.test(text)) category = 'vehicles';
  else if (PRODUCT_PATTERNS.test(text)) category = 'products';

  if (sensitive) {
    return {
      kind: 'sensitive',
      note: 'Bu savol moliyaviy, huquqiy yoki diniy mazmunga ega. Bunday ma’lumot faqat rasmiy hujjatlar va mutaxassis tomonidan berilishi kerak.',
      vehicles: [],
      products: [],
      parsed: { budget, category },
    };
  }

  if (!budget && !category) {
    return {
      kind: 'unclear',
      note: 'Maqsadingizni aniqlashtiring: qaysi toifa, qancha byudjet va qaysi muddat qulay?',
      vehicles: [],
      products: [],
      parsed: { budget, category },
    };
  }

  const scopeVehicles = category !== 'products';
  const scopeProducts = category !== 'vehicles';

  const vehicleMatches = scopeVehicles
    ? [...vehicles]
        .filter((vehicle) => (budget ? vehicle.priceUzs <= budget * 1.6 : true))
        .sort((a, b) =>
          budget
            ? Math.abs(a.priceUzs - budget) - Math.abs(b.priceUzs - budget)
            : b.views - a.views,
        )
        .slice(0, 3)
    : [];

  const productMatches = scopeProducts
    ? [...products]
        .filter((product) => (budget ? product.priceUzs <= budget * 1.6 : true))
        .sort((a, b) =>
          budget
            ? Math.abs(a.priceUzs - budget) - Math.abs(b.priceUzs - budget)
            : b.views - a.views,
        )
        .slice(0, 3)
    : [];

  if (vehicleMatches.length === 0 && productMatches.length === 0) {
    return {
      kind: 'empty',
      note: 'Bu parametrlar bo‘yicha e’lon topilmadi. Byudjetni oshirib ko‘ring yoki katalogni ko‘rib chiqing.',
      vehicles: [],
      products: [],
      parsed: { budget, category },
    };
  }

  return {
    kind: 'results',
    note: budget
      ? 'E’lonlar katalog narxi bo‘yicha saralandi. Moliyalashtirish imkoniyati rasmiy hisob-kitob formulasisiz aniqlanmaydi.'
      : 'E’lonlar mashhurlik bo‘yicha saralandi.',
    vehicles: vehicleMatches,
    products: productMatches,
    parsed: { budget, category },
  };
}

export const advisorExamples = [
  'Menda 50 mln so‘m boshlang‘ich to‘lov bor. Qaysi avtomobillarni ko‘rishim mumkin?',
  '200 mln so‘mgacha bo‘lgan avtomobillar',
  '10 mln so‘m atrofidagi telefonlar',
  'Elektronika bo‘yicha mashhur mahsulotlar',
];
