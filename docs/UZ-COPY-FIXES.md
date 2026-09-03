# UZBEK LANGUAGE / COPY FIX REGISTER — Phase 0.5 (Priority 9)

**Scope:** visible Uzbek UI text only — spelling, untranslated values, inconsistent terminology, malformed strings.

**Excluded (do NOT change without a verified source):** legal wording (`/privacy`, `/terms`), financial/religious terminology (`muddatli to'lov`, `taqsit`, `murabaha`, `marja`, `sarmoya`, `foyda`), contract language, and any marketing claim.

Status: 🟢 safe to fix · 🟡 fix + human review · 🔴 do not touch (needs official source)

---

## 1. SAFE FIXES — typos 🟢

| # | Current (verbatim) | Proposed | Where |
|---|---|---|---|
| C-1 | **`Shafof moliya`** | **`Shaffof moliya`** | Vehicle detail trust badge — *highest-visibility typo on the site; it sits inside the transparency badge* |
| C-2 | **`Yangiliklarqa qaytish`** | **`Yangiliklarga qaytish`** | `/news/{id}` not-found state |
| C-3 | **`Moshina haydashga tayyor`** | **`Mashina haydashga tayyor`** | Vehicle detail description (Chevrolet Cobalt) |
| C-4 | **`moshina tayyor holatda turibdi`** | **`Mashina tayyor holatda turibdi`** | Vehicle detail description (BMW i3) — also sentence case |
| C-5 | **`Sahifada:12`** / **`Jami: 20 ta avtomobil topildi`** | **`Sahifada: 12`** / **`Jami: 20 ta avtomobil topildi`** | Listing pagination — missing space after colon |
| C-6 | **`Telefon raqamingiz`** placeholder `Masalan: 90 123 45 67` | keep (correct) | `/login` — reference only |

---

## 2. SAFE FIXES — untranslated interface values 🟢

| # | Current | Proposed | Where | Implementation |
|---|---|---|---|---|
| C-7 | **`petrol`** | **`Benzin`** | Vehicle detail specs | Central enum map (see §4) |
| C-8 | **`automatic`** | **`Avtomat`** | Vehicle detail specs | Central enum map |
| C-9 | **`electric`** | **`Elektr`** | Vehicle detail specs | Central enum map |
| C-10 | **`View 1` … `View 9`** | **`Rasm 1` … `Rasm 9`** | Vehicle gallery alt text | Locale-aware alt generator |
| C-11 | **`Phones`** (category tab) | **`Telefonlar`**, or remove the duplicate tab | `/electronics` tabs | ⚠️ taxonomy — see 🟡 below |

---

## 3. SAFE FIXES — formatting consistency 🟢

| # | Current | Proposed | Where |
|---|---|---|---|
| C-12 | `53000 km` vs `53,000 km` on the same vehicle | One formatter: `53 000 km` (or `53,000 km` — pick one locale rule) | Vehicle detail vs listing |
| C-13 | `so'm`, `$`, `1$ = 1 ball`, `12,450`, `5,000,000 so'm` mixed | Single currency/number formatter for a UZS-first product | Site-wide |
| C-14 | `IPhone` / `Iphone` / `iphone` / `iPhone` | Official brand spelling `iPhone` | Electronics titles |
| C-15 | Internal SKU codes in public titles (`(A3593/26) E2305/26`) | Title template `Brand Model · Storage · Battery%`; SKU moved to an admin field | Electronics |
| C-16 | Unstructured product titles | `iPhone 15 Pro Max · 256 GB · 83%` | Electronics |

---

## 4. ENUM → UZBEK MAP (single source of truth)

```ts
export const FUEL_TYPE_LABELS = {
  petrol:   'Benzin',
  diesel:   'Dizel',
  hybrid:   'Gibrid',
  electric: 'Elektr',
  gas:      'Gaz',
} as const;

export const TRANSMISSION_LABELS = {
  manual:    'Mexanik',
  automatic: 'Avtomat',
} as const;

export const CONDITION_LABELS = {
  new:  'Yangi',
  used: 'Ishlatilgan',
} as const;
```

**Rule:** raw database values must **never** reach the UI. Any unmapped enum renders as the shared *“Ma'lumot kiritilmagan”* empty value and is logged for the data team — not printed as-is.

---

## 5. EMPTY / ERROR STATE COPY (customer-facing replacements) 🟡

Admin-facing strings currently shown to users — propose replacing, then confirm wording with Markab.

| # | Current (leaks internal language) | Proposed | Where |
|---|---|---|---|
| C-17 | **`Xususiyatlar haqida ma'lumot kiritilmagan`** | **`Bu avtomobil uchun qo'shimcha jihozlar ro'yxati hali kiritilmagan. Batafsil ma'lumot uchun menejerimizga murojaat qiling.`** + CTA | Vehicle detail |
| C-18 | **`Ma'lumotlar topilmadi.`** | **`Bu sahifa topilmadi.`** (route) / **`Mahsulot topilmadi.`** (product) / **`Avtomobil topilmadi.`** (vehicle) + search + links | Not-found states |
| C-19 | **`Noto'g'ri URL formati`** — *“Avtomobil sahifasiga ID orqali kira olmaysiz.”* | Keep the guard, soften the copy: **`Avtomobil topilmadi. Iltimos, ro'yxatdan tanlang yoki qidiruvdan foydalaning.`** | `/car/{numeric}` |
| C-20 | **`Hujjatni yuklashda xatolik yuz berdi`** | **`Hujjatni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.`** + `Qayta urinish` button + support link | `/terms` error state |
| C-21 | **`Hozircha avtomobillar mavjud emas`** (while 20 exist) | Hide the module once the data fix lands; if genuinely empty: **`Hozircha avtomobillar mavjud emas. Yangi e'lonlar paydo bo'lganda xabar beramiz.`** + notify-me | Homepage |
| C-22 | **`Hozircha fikr-mulohazalar yo'q`** | Hide the section entirely until real reviews exist | Homepage |
| C-23 | **`Ishlab chiqilmoqda … Tez orada mavjud bo'ladi!`** | Reconcile with the live `/loyalty` page — **business decision** | Homepage |

---

## 6. TERMINOLOGY CONSISTENCY — review, then standardise 🟡

| Term pair currently mixed | Recommendation |
|---|---|
| `Avtomobillar` / `Avtomobil` / `Moshina` | Standardise on **`Avtomobil`** in UI and **`avtomobil`** in body text; never `Moshina` |
| `Elektronika` / `Mahsulotlar` / `Tovarlar` | Standardise on **`Elektronika`** (section) and **`mahsulot`** (item) |
| `Muddatli to'lov` / `Bo'lib to'lash` | Both appear (listing filter uses `Bo'lib to'lash`). Pick one primary term; keep the other as a synonym — **needs Markab's marketing term** |
| `Sarmoya` / `Investitsiya` | Site uses both (`Sarmoyadorlar uchun`, `Markab bilan sarmoyalash`). Choose a primary, keep the other for SEO |
| `Sadoqat dasturi` / `Bonus dasturi` | Homepage says `Sadoqat dasturi`; `/loyalty` is titled `Bonus dasturi`. Standardise |
| `Ta'lim markazi` / `Ta'lim` | `/loyalty` and homepage differ; align with the new `/education` route |
| `Fikr-mulohaza` / `Sharh` / `Mijozlar fikri` | One term for user reviews |

---

## 7. DO NOT TOUCH 🔴

| Item | Reason |
|---|---|
| All text inside `/privacy` | Legal document — any change needs legal review |
| `/terms` content (once restored) | Legal document |
| `muddatli to'lov`, `taqsit`, `murabaha`, `marja`, `sarmoya`, `foyda`, `ulush` | Financial/religious terminology — requires verified definitions (Phase 0 open questions) |
| `AAOIFI standartlari talablariga mos` | Compliance claim — may not be paraphrased |
| `Arzon narx kafolati`, `Kafolatli xavfsizlik`, `Barcha avtomobillar tekshirilgan`, `Tasdiqlangan sotuvchi` | Marketing/legal claims — flag only, never rewrite |
| `Halol moliya platformasi`, `Qadriyatlarga asoslangan xotirjamlik!` | Brand positioning — preserve |
| Product/vehicle names, prices, specs | Source data — correct only per the DATA-QUALITY-REGISTER |

---

## 8. IMPLEMENTATION RULES

1. All UI strings move into a **single dictionary** (or the project's existing i18n layer) so one edit fixes every occurrence — especially `Shaffof moliya`, which appears per-PDP.
2. Enum mapping lives in **one** module; nothing renders a raw DB value.
3. Number and currency formatting goes through **one** formatter.
4. Every copy change in §5 and §6 is marked `// TODO(copy-review)` for Markab's confirmation.
5. No string is rewritten to change meaning, add a claim, or fill a gap — only to correct a defect.
