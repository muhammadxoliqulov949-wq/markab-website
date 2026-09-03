import type { Product } from '../types';
import { NO_FINANCING } from '../types';

/**
 * ELECTRONICS FIXTURES — provenance
 * ---------------------------------------------------------------------------
 * Source: public listing at https://markab.uz/electronics (page 1 of 4),
 * captured 2026-08-30 during the Phase 0 audit. 42 products were listed publicly;
 * these are the ones captured on page 1.
 *
 * Rules applied:
 *  • EXCLUDED (quarantine): "iphone 16 Pro Max (A2909/26) E1295/26 100 GB 256%"
 *    — impossible specification values (docs/DATA-QUALITY-REGISTER.md §E-1).
 *  • Display names are cleaned versions of the public titles (internal SKU codes
 *    removed per copy rule C-15/C-16). `rawTitle` keeps the verbatim original.
 *  • IDs are prototype identifiers derived from the public SKU token, because the
 *    production detail identifier is unresolved — /electronics/{id} is a known
 *    P0 defect (docs/MARKAB-2.0-PHASE-0-AUDIT.md §P0-5).
 *  • Only price, monthly payment, views, storage and battery health were publicly
 *    shown. Everything else (warranty, colour, condition grade, delivery) is null
 *    and renders as "ma'lumot tayyorlanmoqda" — never invented.
 *  • Stock status: only the item publicly marked "Qolmadi" is out of stock;
 *    all others are `unknown` because stock was not published per item.
 */

const MEDIA = 'https://api.markab.uz/media/products';

type Seed = {
  id: string;
  name: string;
  rawTitle: string;
  priceUzs: number;
  monthlyPaymentUzs: number;
  image: string | null;
  storageGb: number | null;
  batteryHealthPercent: number | null;
  views: number;
  outOfStock?: boolean;
};

const seeds: Seed[] = [
  {
    id: 'e1570-26',
    name: 'iPhone 16 Max · 256 GB',
    rawTitle: 'iphone 16 max E1570/26 256 GB 100%',
    priceUzs: 16_018_000,
    monthlyPaymentUzs: 1_236_000,
    image: `${MEDIA}/photo_2026-07-10_15-58-20.jpg`,
    storageGb: 256,
    batteryHealthPercent: 100,
    views: 453,
    // Publicly shown as "Qolmadi" (out of stock) on the live listing.
    outOfStock: true,
  },
  {
    id: 'e0992-26',
    name: 'iPhone 17 Max · 256 GB',
    rawTitle: 'iphone 17 max (A2776/26) E0992/26 256 GB 100%',
    priceUzs: 17_560_000,
    monthlyPaymentUzs: 1_577_000,
    image: `${MEDIA}/photo_2026-06-11_19-31-38.jpg`,
    storageGb: 256,
    batteryHealthPercent: 100,
    views: 480,
  },
  {
    id: 'e1334-26',
    name: 'iPhone 16 Pro Max · 512 GB',
    rawTitle: 'iPhone 16 pro max E1334/26 512 GB 100%',
    priceUzs: 14_000_000,
    monthlyPaymentUzs: 1_207_000,
    image: `${MEDIA}/photo_2026-06-26_18-03-48.jpg`,
    storageGb: 512,
    batteryHealthPercent: 100,
    views: 260,
  },
  {
    id: 'e2068-26',
    name: 'iPhone 16 Pro Max · 256 GB',
    rawTitle: 'Iphone 16 Pro max (B1918/26) E2068/26 256 GB 89%',
    priceUzs: 10_080_000,
    monthlyPaymentUzs: 776_000,
    image: `${MEDIA}/photo_2026-08-14_19-05-22.jpg`,
    storageGb: 256,
    batteryHealthPercent: 89,
    views: 243,
  },
  {
    id: 'e2265-26',
    name: 'iPhone 16 Pro · 128 GB',
    rawTitle: 'Iphone 16 pro E2265/26 128 GB 91%',
    priceUzs: 9_741_000,
    monthlyPaymentUzs: 736_000,
    image: `${MEDIA}/photo_2026-08-26_11-26-30.jpg`,
    storageGb: 128,
    batteryHealthPercent: 91,
    views: 112,
  },
  {
    id: 'e2305-26',
    name: 'iPhone 15 Pro Max · 256 GB',
    rawTitle: 'IPhone 15 Pro Max (A3593/26) E2305/26 256 GB 83%',
    priceUzs: 8_792_000,
    monthlyPaymentUzs: 564_000,
    image: `${MEDIA}/photo_2026-08-28_15-20-13.jpg`,
    storageGb: 256,
    batteryHealthPercent: 83,
    views: 83,
  },
  {
    id: 'e0783-26',
    name: 'iPhone 15 Pro · 128 GB',
    rawTitle: 'Iphone 15 Pro E0783/26 128 GB 87%',
    priceUzs: 8_234_000,
    monthlyPaymentUzs: 739_000,
    // Published without any photo — represented honestly as no image.
    image: null,
    storageGb: 128,
    batteryHealthPercent: 87,
    views: 167,
  },
  {
    id: 'e2293-26',
    name: 'iPhone 15 Pro · 256 GB',
    rawTitle: 'IPhone 15 Pro E2293/26 256 GB 85%',
    priceUzs: 8_198_000,
    monthlyPaymentUzs: 732_000,
    image: `${MEDIA}/photo_2026-08-27_17-44-29.jpg`,
    storageGb: 256,
    batteryHealthPercent: 85,
    views: 65,
  },
  {
    id: 'e1136-26',
    name: 'iPhone 14 Pro Max · 512 GB',
    rawTitle: 'iphone 14 pro max E1136/26 512 GB 77%',
    priceUzs: 7_993_000,
    monthlyPaymentUzs: 689_000,
    image: `${MEDIA}/photo_2026-06-17_18-01-18.jpg`,
    storageGb: 512,
    batteryHealthPercent: 77,
    views: 355,
  },
  {
    id: 'e2100-26',
    name: 'iPhone 14 Pro · 128 GB',
    rawTitle: 'Iphone 14 Pro (B3868/26) E2100/26 128 GB 76%',
    priceUzs: 5_957_000,
    monthlyPaymentUzs: 458_000,
    image: `${MEDIA}/photo_2026-08-18_14-47-27.jpg`,
    storageGb: 128,
    batteryHealthPercent: 76,
    views: 267,
  },
  {
    id: 'e1945-26',
    name: 'iPhone 12 Pro · 128 GB',
    rawTitle: 'iPhone 12 Pro (A3353/26) E1945/26 128 GB 80%',
    priceUzs: 11_442_000,
    monthlyPaymentUzs: 1_027_000,
    image: `${MEDIA}/photo_2026-08-03_20-43-42.jpg`,
    storageGb: 128,
    batteryHealthPercent: 80,
    views: 266,
  },
];

export const products: Product[] = seeds.map((seed) => ({
  id: seed.id,
  name: seed.name,
  rawTitle: seed.rawTitle,
  brand: 'Apple',
  category: 'smartfonlar',
  priceUzs: seed.priceUzs,
  images: seed.image ? [seed.image] : [],
  storageGb: seed.storageGb,
  batteryHealthPercent: seed.batteryHealthPercent,
  stockStatus: seed.outOfStock ? 'out_of_stock' : 'unknown',
  views: seed.views,
  specs: [
    { label: 'Xotira', value: seed.storageGb ? `${seed.storageGb} GB` : null },
    {
      label: 'Batareya holati',
      value: seed.batteryHealthPercent ? `${seed.batteryHealthPercent}%` : null,
    },
    { label: 'Rangi', value: null },
    { label: 'Kafolat', value: null },
    { label: 'Holati', value: null },
  ],
  financing: { ...NO_FINANCING, monthlyPaymentUzs: seed.monthlyPaymentUzs },
}));

export const productCategories = [
  { id: 'smartfonlar', name: 'Smartfonlar' },
  { id: 'kompyuter-va-noutbuklar', name: 'Kompyuter va noutbuklar' },
];
