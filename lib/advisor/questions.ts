import { formatUzs } from '@/lib/format';
import { fuelLabels, transmissionLabels } from '@/lib/labels';
import type { ProductFacets, VehicleFacets } from '@/lib/data/types';

/**
 * Question definitions for the guided flow.
 *
 * EVERY option comes from repository facets, which are counted against real
 * records. A question is only offered when the catalogue can actually answer
 * it: no brands in the data means no brand question, not a list of plausible
 * brand names. `count` is surfaced so a visitor can see how many listings a
 * choice leads to before making it.
 */

export type AdvisorOption = { value: string; label: string; count: number };

export type AdvisorQuestion = {
  id: string;
  label: string;
  hint?: string;
  kind: 'budget' | 'chips' | 'select' | 'toggle';
  options: AdvisorOption[];
  /**
   * true → the answer is a hard requirement. Everything the visitor states is
   * treated as required, but the label helps the copy read correctly.
   */
  required: boolean;
};

/** Options longer than this become a select instead of a row of chips. */
const CHIPS_LIMIT = 5;

function kindFor(count: number): 'chips' | 'select' {
  return count > CHIPS_LIMIT ? 'select' : 'chips';
}

export function buildCarQuestions(facets: VehicleFacets | null): AdvisorQuestion[] {
  const questions: AdvisorQuestion[] = [];

  questions.push({
    id: 'budgetMax',
    label: 'Byudjetingiz qancha?',
    hint: facets
      ? `Katalogdagi narxlar: ${formatUzs(facets.priceMin)} – ${formatUzs(facets.priceMax)}`
      : undefined,
    kind: 'budget',
    options: [],
    required: true,
  });

  if (facets) {
    if (facets.brands.length >= 2) {
      const options = [...facets.brands].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
      questions.push({
        id: 'brand',
        label: 'Brend muhimmi?',
        kind: kindFor(options.length),
        options: options.map((o) => ({ value: o.value, label: o.value, count: o.count })),
        required: true,
      });
    }

    if (facets.fuelTypes.length >= 2) {
      const options = [...facets.fuelTypes].sort((a, b) => b.count - a.count);
      questions.push({
        id: 'fuelType',
        label: 'Yoqilg‘i turi',
        kind: kindFor(options.length),
        options: options.map((o) => ({
          value: o.value,
          label: fuelLabels[o.value] ?? o.value,
          count: o.count,
        })),
        required: true,
      });
    }

    if (facets.transmissions.length >= 2) {
      const options = [...facets.transmissions].sort((a, b) => b.count - a.count);
      questions.push({
        id: 'transmission',
        label: 'Uzatma turi',
        kind: kindFor(options.length),
        options: options.map((o) => ({
          value: o.value,
          label: transmissionLabels[o.value] ?? o.value,
          count: o.count,
        })),
        required: true,
      });
    }

    if (facets.condition.length >= 2) {
      const options = [...facets.condition].sort((a, b) => b.count - a.count);
      questions.push({
        id: 'condition',
        label: 'Holati',
        kind: 'chips',
        options: options.map((o) => ({
          value: o.value,
          label: o.value === 'new' ? 'Yangi' : 'Ishlatilgan',
          count: o.count,
        })),
        required: true,
      });
    }

    if (facets.years.length >= 2) {
      const options = [...facets.years].sort((a, b) => b.value - a.value);
      questions.push({
        id: 'yearFrom',
        label: 'Qaysi yildan eski bo‘lmasin?',
        hint: 'Tanlangan yil va undan keyingi yillar ko‘rsatiladi.',
        kind: 'select',
        options: options.map((o) => ({ value: String(o.value), label: String(o.value), count: o.count })),
        required: true,
      });
    }

    questions.push({
      id: 'requireFinancing',
      label: 'Faqat oylik to‘lovi e’londa ko‘rsatilgan e’lonlar',
      hint: facets.withFinancing
        ? `Katalogda bunday e’lonlar: ${facets.withFinancing} ta`
        : 'Katalogda hozircha bunday e’lon yo‘q',
      kind: 'toggle',
      options: [],
      required: true,
    });
  }

  return questions;
}

export function buildElectronicsQuestions(facets: ProductFacets | null): AdvisorQuestion[] {
  const questions: AdvisorQuestion[] = [];

  questions.push({
    id: 'budgetMax',
    label: 'Byudjetingiz qancha?',
    hint: facets
      ? `Katalogdagi narxlar: ${formatUzs(facets.priceMin)} – ${formatUzs(facets.priceMax)}`
      : undefined,
    kind: 'budget',
    options: [],
    required: true,
  });

  if (facets) {
    if (facets.categories.length >= 2) {
      const options = [...facets.categories].sort((a, b) => b.count - a.count);
      questions.push({
        id: 'category',
        label: 'Qaysi toifa?',
        kind: kindFor(options.length),
        options: options.map((o) => ({ value: o.value, label: o.label, count: o.count })),
        required: true,
      });
    }

    if (facets.brands.length >= 2) {
      const options = [...facets.brands].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
      questions.push({
        id: 'brand',
        label: 'Brend muhimmi?',
        kind: kindFor(options.length),
        options: options.map((o) => ({ value: o.value, label: o.value, count: o.count })),
        required: true,
      });
    }

    if (facets.storages.length >= 2) {
      const options = [...facets.storages].sort((a, b) => a.value - b.value);
      questions.push({
        id: 'storageMinGb',
        label: 'Xotira kamida qancha bo‘lsin?',
        hint: 'E’londa xotira ko‘rsatilmagan mahsulotlar bu talabga mos kelmaydi.',
        kind: kindFor(options.length),
        options: options.map((o) => ({
          value: String(o.value),
          label: `${o.value} GB dan kam emas`,
          count: o.count,
        })),
        required: true,
      });
    }

    if (facets.batteryHealth.length >= 1) {
      const options = [...facets.batteryHealth].sort((a, b) => b.value - a.value);
      questions.push({
        id: 'batteryMinPercent',
        label: 'Batareya holati',
        hint: 'Faqat batareya holati e’londa ko‘rsatilgan mahsulotlar tanlanadi.',
        kind: kindFor(options.length),
        options: options.map((o) => ({
          value: String(o.value),
          label: `${o.value}% dan kam emas`,
          count: o.count,
        })),
        required: true,
      });
    }

    questions.push({
      id: 'requireInStock',
      label: 'Faqat “Mavjud” deb belgilangan mahsulotlar',
      hint:
        facets.inStock > 0
          ? `Katalogda “Mavjud”: ${facets.inStock} ta · holati noma’lum: ${facets.unknownStock} ta`
          : 'Katalogda “Mavjud” deb belgilangan mahsulot yo‘q',
      kind: 'toggle',
      options: [],
      required: true,
    });

    questions.push({
      id: 'requireFinancing',
      label: 'Faqat oylik to‘lovi e’londa ko‘rsatilgan mahsulotlar',
      hint: facets.withFinancing
        ? `Katalogda bunday mahsulotlar: ${facets.withFinancing} ta`
        : 'Katalogda hozircha bunday mahsulot yo‘q',
      kind: 'toggle',
      options: [],
      required: true,
    });
  }

  return questions;
}
