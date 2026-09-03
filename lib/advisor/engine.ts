import { fuelLabel, transmissionLabel } from '@/lib/labels';
import { stockLabels } from '@/lib/labels';
import { formatUzs } from '@/lib/format';
import type { Product, Vehicle } from '@/lib/data/types';
import type {
  AdvisorCatalogue,
  AdvisorMatch,
  AdvisorPreferences,
  AdvisorResult,
  CarPreferences,
  ElectronicsPreferences,
} from './types';

/**
 * Deterministic recommendation engine.
 *
 * RULES, IN ORDER:
 *   1. Every preference the visitor sets is a HARD constraint. A record that
 *      fails one is never presented as a match — it can only appear as a
 *      labelled "nearest alternative" that states what it failed.
 *   2. Surviving records are ranked by scoring (price distance, year, mileage,
 *      battery, storage) — scoring only ever reorders, it never admits.
 *   3. Explanations are assembled from fields that were both requested and
 *      verified. There is no code path that can produce a sentence about a
 *      feature this engine did not check.
 *
 * Nothing here is a language model and nothing here is probabilistic. The
 * wording the UI uses for that fact lives in `explanation.ts`.
 */

/** How many nearest alternatives to offer when nothing matches exactly. */
const NEAREST_LIMIT = 6;
/** How many exact matches to show. */
const EXACT_LIMIT = 12;

type Constraint<T> = {
  id: string;
  /** Short requirement name, used when summarising blockers. */
  name: string;
  /** Full human phrase shown on a result that failed this requirement. */
  unmetLabel: string;
  test: (item: T) => boolean;
};

/* ------------------------------------------------------------------ */
/* Cars                                                                */
/* ------------------------------------------------------------------ */

function carConstraints(p: CarPreferences): Constraint<Vehicle>[] {
  const list: Constraint<Vehicle>[] = [];

  if (p.budgetMax !== null) {
    const max = p.budgetMax;
    list.push({
      id: 'budget',
      name: 'byudjet',
      unmetLabel: `${formatUzs(max)} gacha bo‘lgan byudjet`,
      test: (v) => v.priceUzs <= max,
    });
  }
  if (p.brand) {
    const brand = p.brand;
    list.push({
      id: 'brand',
      name: 'brend',
      unmetLabel: `${brand} brendi`,
      test: (v) => v.brand === brand,
    });
  }
  if (p.fuelType) {
    const fuel = p.fuelType;
    list.push({
      id: 'fuel',
      name: 'yoqilg‘i turi',
      unmetLabel: `${fuelLabel(fuel)} (yoqilg‘i turi)`,
      test: (v) => v.fuelType === fuel,
    });
  }
  if (p.transmission) {
    const gearbox = p.transmission;
    list.push({
      id: 'transmission',
      name: 'uzatma turi',
      unmetLabel: `${transmissionLabel(gearbox)} uzatma`,
      test: (v) => v.transmission === gearbox,
    });
  }
  if (p.condition) {
    const wantNew = p.condition === 'new';
    list.push({
      id: 'condition',
      name: 'holati',
      unmetLabel: wantNew ? 'yangi e’lon' : 'ishlatilgan e’lon',
      test: (v) => v.isNew === wantNew,
    });
  }
  if (p.yearFrom !== null) {
    const from = p.yearFrom;
    list.push({
      id: 'yearFrom',
      name: 'yil',
      unmetLabel: `${from} yildan eski bo‘lmaslik`,
      test: (v) => v.year >= from,
    });
  }
  if (p.requireFinancing) {
    list.push({
      id: 'financing',
      name: 'oylik to‘lov ko‘rsatilgan',
      unmetLabel: 'e’londa oylik to‘lov ko‘rsatilgan bo‘lishi',
      test: (v) => v.financing.monthlyPaymentUzs !== null,
    });
  }

  return list;
}

/**
 * Clauses for a car, emitted only for constraints the visitor actually set.
 * Every clause reads straight off the record, so it cannot claim a feature the
 * vehicle does not have.
 */
function carReasons(vehicle: Vehicle, p: CarPreferences): string[] {
  const reasons: string[] = [];
  if (p.budgetMax !== null) reasons.push('Byudjetingizga mos');
  if (p.brand) reasons.push(`Tanlangan brend: ${vehicle.brand}`);
  if (p.fuelType) reasons.push(`Siz tanlagan yoqilg‘i turi: ${fuelLabel(vehicle.fuelType)}`);
  if (p.transmission) reasons.push(`${transmissionLabel(vehicle.transmission)} uzatma`);
  if (p.condition) reasons.push(vehicle.isNew ? 'Yangi' : 'Ishlatilgan');
  if (p.yearFrom !== null) reasons.push(`${vehicle.year} yil — ${p.yearFrom} dan eski emas`);
  if (p.requireFinancing) reasons.push('Oylik to‘lov e’londa ko‘rsatilgan');
  return reasons;
}

/* ------------------------------------------------------------------ */
/* Electronics                                                         */
/* ------------------------------------------------------------------ */

function electronicsConstraints(p: ElectronicsPreferences): Constraint<Product>[] {
  const list: Constraint<Product>[] = [];

  if (p.budgetMax !== null) {
    const max = p.budgetMax;
    list.push({
      id: 'budget',
      name: 'byudjet',
      unmetLabel: `${formatUzs(max)} gacha bo‘lgan byudjet`,
      test: (item) => item.priceUzs <= max,
    });
  }
  if (p.category) {
    const category = p.category;
    list.push({
      id: 'category',
      name: 'toifa',
      unmetLabel: `${category} toifasi`,
      test: (item) => item.category === category,
    });
  }
  if (p.brand) {
    const brand = p.brand;
    list.push({
      id: 'brand',
      name: 'brend',
      unmetLabel: `${brand} brendi`,
      test: (item) => item.brand === brand,
    });
  }
  if (p.storageMinGb !== null) {
    const min = p.storageMinGb;
    list.push({
      id: 'storage',
      name: 'xotira',
      unmetLabel: `${min} GB dan kam bo‘lmagan xotira`,
      // Only records with a published capacity can satisfy this; a null
      // capacity is unknown, not "small", so it cannot pass.
      test: (item) => item.storageGb !== null && item.storageGb >= min,
    });
  }
  if (p.batteryMinPercent !== null) {
    const min = p.batteryMinPercent;
    list.push({
      id: 'battery',
      name: 'batareya holati',
      unmetLabel: `${min}% dan yuqori batareya holati`,
      // Same rule: unpublished battery health is unknown, not "good enough".
      test: (item) => item.batteryHealthPercent !== null && item.batteryHealthPercent >= min,
    });
  }
  if (p.requireInStock) {
    list.push({
      id: 'stock',
      name: 'mavjudlik',
      unmetLabel: 'e’londa “Mavjud” deb belgilangan bo‘lishi',
      // Deliberately `=== 'in_stock'`: "unknown" is the absence of published
      // availability and must never be treated as available.
      test: (item) => item.stockStatus === 'in_stock',
    });
  }
  if (p.requireFinancing) {
    list.push({
      id: 'financing',
      name: 'oylik to‘lov ko‘rsatilgan',
      unmetLabel: 'e’londa oylik to‘lov ko‘rsatilgan bo‘lishi',
      test: (item) => item.financing.monthlyPaymentUzs !== null,
    });
  }

  return list;
}

function electronicsReasons(item: Product, p: ElectronicsPreferences): string[] {
  const reasons: string[] = [];
  if (p.budgetMax !== null) reasons.push('Byudjetingizga mos');
  if (p.category) reasons.push(`Tanlangan toifa: ${item.category}`);
  if (p.brand) reasons.push(`Tanlangan brend: ${item.brand}`);
  if (p.storageMinGb !== null) {
    reasons.push(
      item.storageGb !== null
        ? `Xotira ${item.storageGb} GB — ${p.storageMinGb} GB dan kam emas`
        : 'Xotira e’londa ko‘rsatilmagan',
    );
  }
  if (p.batteryMinPercent !== null) {
    reasons.push(
      item.batteryHealthPercent !== null
        ? `Batareya holati ${item.batteryHealthPercent}% — ${p.batteryMinPercent}% dan yuqori`
        : 'Batareya holati e’londa ko‘rsatilmagan',
    );
  }
  if (p.requireInStock) reasons.push('E’londa mavjud deb ko‘rsatilgan');
  if (p.requireFinancing) reasons.push('Oylik to‘lov e’londa ko‘rsatilgan');
  return reasons;
}

/* ------------------------------------------------------------------ */
/* Scoring helpers                                                     */
/* ------------------------------------------------------------------ */

/** 0..1, guarding against a zero-width range. */
function normalise(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

function extent(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

export function advise(prefs: AdvisorPreferences, catalogue: AdvisorCatalogue): AdvisorResult {
  if (prefs.category === 'car') {
    return adviseCars(prefs.car, catalogue.vehicles);
    }
  return adviseElectronics(prefs.electronics, catalogue.products);
}

function adviseCars(p: CarPreferences, vehicles: Vehicle[]): AdvisorResult {
  const considered = vehicles.length;
  if (considered === 0) return unavailableResult();

  const constraints = carConstraints(p);
  const years = extent(vehicles.map((v) => v.year));
  const mileages = extent(vehicles.map((v) => v.mileageKm));

  const scored = vehicles.map((vehicle) => {
    const unmet = constraints.filter((c) => !c.test(vehicle)).map((c) => c.unmetLabel);

    // Price proximity to the stated budget. Without a budget there is no
    // price preference to honour, so the component is simply absent rather
    // than defaulting to "cheapest is best".
    const priceScore =
      p.budgetMax !== null && p.budgetMax > 0
        ? Math.max(0, Math.min(1, vehicle.priceUzs / p.budgetMax)) * 50
        : 0;
    const yearScore = normalise(vehicle.year, years.min, years.max) * 30;
    const mileageScore = (1 - normalise(vehicle.mileageKm, mileages.min, mileages.max)) * 20;

    const match: AdvisorMatch = {
      id: vehicle.id,
      kind: 'car',
      title: `${vehicle.brand} ${vehicle.model}`,
      subtitle: `${vehicle.year} · ${fuelLabel(vehicle.fuelType)} · ${transmissionLabel(vehicle.transmission)}`,
      priceUzs: vehicle.priceUzs,
      image: vehicle.images[0] ?? null,
      href: `/cars/${vehicle.slug}`,
      score: Math.round((priceScore + yearScore + mileageScore) * 100) / 100,
      reasons: carReasons(vehicle, p),
      unmet: [],
      financingMonthlyUzs: vehicle.financing.monthlyPaymentUzs,
      stock: null,
      specs: [
        { label: 'Yil', value: String(vehicle.year) },
        { label: 'Yoqilg‘i', value: fuelLabel(vehicle.fuelType) },
        { label: 'Uzatma', value: transmissionLabel(vehicle.transmission) },
        { label: 'Yurish', value: `${vehicle.mileageKm.toLocaleString('ru-RU')} km` },
        { label: 'Holati', value: vehicle.isNew ? 'Yangi' : 'Ishlatilgan' },
        {
          label: 'Oylik to‘lov',
          value:
            vehicle.financing.monthlyPaymentUzs !== null
              ? formatUzs(vehicle.financing.monthlyPaymentUzs)
              : null,
        },
      ],
      year: vehicle.year,
      brand: vehicle.brand,
    };

    return { match, unmet };
  });

  return assemble(scored, 'Qoidalar asosida saralandi: avval qat’iy talablar, keyin byudjetga yaqinlik, yil va yurish masofasi.');
}

function adviseElectronics(p: ElectronicsPreferences, products: Product[]): AdvisorResult {
  const considered = products.length;
  if (considered === 0) return unavailableResult();

  const constraints = electronicsConstraints(p);
  const storages = extent(products.filter((x) => x.storageGb !== null).map((x) => x.storageGb!));
  const batteries = extent(
    products.filter((x) => x.batteryHealthPercent !== null).map((x) => x.batteryHealthPercent!),
  );

  const scored = products.map((item) => {
    const unmet = constraints.filter((c) => !c.test(item)).map((c) => c.unmetLabel);

    const priceScore =
      p.budgetMax !== null && p.budgetMax > 0
        ? Math.max(0, Math.min(1, item.priceUzs / p.budgetMax)) * 50
        : 0;
    // Unpublished capacity/health scores 0 rather than being assumed average —
    // unknown is not a value.
    const storageScore =
      item.storageGb !== null ? normalise(item.storageGb, storages.min, storages.max) * 25 : 0;
    const batteryScore =
      item.batteryHealthPercent !== null
        ? normalise(item.batteryHealthPercent, batteries.min, batteries.max) * 25
        : 0;

    const match: AdvisorMatch = {
      id: item.id,
      kind: 'electronics',
      title: item.name,
      subtitle: [item.brand, item.category].filter(Boolean).join(' · '),
      priceUzs: item.priceUzs,
      image: item.images[0] ?? null,
      href: `/electronics/${item.id}`,
      score: Math.round((priceScore + storageScore + batteryScore) * 100) / 100,
      reasons: electronicsReasons(item, p),
      unmet: [],
      financingMonthlyUzs: item.financing.monthlyPaymentUzs,
      stock: stockLabels[item.stockStatus],
      specs: [
        { label: 'Brend', value: item.brand || null },
        { label: 'Toifa', value: item.category || null },
        {
          label: 'Xotira',
          value: item.storageGb !== null ? `${item.storageGb} GB` : null,
        },
        {
          label: 'Batareya holati',
          value: item.batteryHealthPercent !== null ? `${item.batteryHealthPercent}%` : null,
        },
        { label: 'Mavjudlik', value: stockLabels[item.stockStatus].label },
        {
          label: 'Oylik to‘lov',
          value:
            item.financing.monthlyPaymentUzs !== null
              ? formatUzs(item.financing.monthlyPaymentUzs)
              : null,
        },
      ],
      year: null,
      brand: item.brand || null,
    };

    return { match, unmet };
  });

  return assemble(scored, 'Qoidalar asosida saralandi: avval qat’iy talablar, keyin byudjetga yaqinlik, xotira va batareya holati.');
}

function unavailableResult(): AdvisorResult {
  return {
    status: 'unavailable',
    exact: [],
    nearest: [],
    blockers: [],
    totalConsidered: 0,
    note: null,
  };
}

/**
 * Splits scored records into exact matches and, when there are none, labelled
 * nearest alternatives. Deterministic: ties break on id so the same answers
 * always produce the same order.
 */
function assemble(
  scored: { match: AdvisorMatch; unmet: string[] }[],
  note: string,
): AdvisorResult {
  const exact = scored
    .filter((entry) => entry.unmet.length === 0)
    .map((entry) => entry.match)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, EXACT_LIMIT);

  if (exact.length > 0) {
    return {
      status: 'success',
      exact,
      nearest: [],
      blockers: [],
      totalConsidered: scored.length,
      note,
    };
  }

  // Nothing matched everything. Rank by "fewest requirements missed", then by
  // score, and tell the visitor exactly which requirement was missed.
  const nearest = scored
    .filter((entry) => entry.unmet.length > 0)
    .map((entry) => ({ ...entry.match, unmet: entry.unmet }))
    .sort(
      (a, b) => a.unmet.length - b.unmet.length || b.score - a.score || a.id.localeCompare(b.id),
    )
    .slice(0, NEAREST_LIMIT);

  const counts = new Map<string, number>();
  for (const entry of scored) {
    for (const label of entry.unmet) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const blockers = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return {
    status: 'success',
    exact: [],
    nearest,
    blockers,
    totalConsidered: scored.length,
    note,
  };
}
