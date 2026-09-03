# markab-website

## Phase status

| Phase | Deliverable | Status |
|---|---|---|
| **0** | Deep website audit | ✅ Complete — [`docs/MARKAB-2.0-PHASE-0-AUDIT.md`](docs/MARKAB-2.0-PHASE-0-AUDIT.md) |
| **0.5** | Critical foundation (adapter, real 404s, routes, states) | ✅ Complete — built from scratch in this repo as the Markab 2.0 prototype |
| **1** | Homepage redesign | ✅ Implemented — awaiting stakeholder visual sign-off |
| **2** | Automobile marketplace experience (`/cars`, `/cars/[slug]`) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **3** | Electronics marketplace + cart foundation (`/electronics`, `/electronics/[id]`, `/cart`) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **4** | Financing & calculator (`/financing`, `/financing/calculator`, `/financing/apply`) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **5** | Investment experience (`/invest` + investment truth states) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **6** | My Markab account experience (`/login`, `/profile`, account/dashboard architecture) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **7** | AI Product Advisor (`/advisor`, recommendation engine, guided flow) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **8** | Academy, Loyalty and content experience (`/academy`, `/academy/[slug]`, `/loyalty`, content architecture) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **9** | UX simplification, visual refinement, mobile and motion (+ global catalogue search) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **10** | SEO, performance, accessibility and technical cleanup | ✅ Implemented — awaiting stakeholder sign-off |
| **11** | Threat model and security hardening | ✅ Implemented — awaiting stakeholder sign-off |
| **12** | Deployment security | 🟡 In progress — in-repo items done ([`docs/PHASE-12-DEPLOYMENT-SECURITY.md`](docs/PHASE-12-DEPLOYMENT-SECURITY.md)); edge, secret store and monitoring remain |

### Why 0.5 is blocked

This repository currently contains **only this README** — no application code. The live site
(markab.uz) is built from a codebase that is not present here, so routing, soft-404s, the broken
`/terms`, electronics product pages and the intermittent 500s cannot be fixed from this workspace.

Once the source is pushed to this branch, implementation proceeds against the real architecture
(no new framework, no rewrite of working code).

### Data decision (recorded for Phase 0.5)

**Structure only — no data yet.** Every surface is wired to a single data adapter and renders
proper Loading / Empty / NotFound / Error states. No fixtures, no invented prices, specs, stock,
financing values, legal text or reviews. `api.markab.uz/api/v1/` requires a Bearer token
(HTTP 401 observed), and none has been provided.

### Documentation

| Document | Purpose |
|---|---|
| [`docs/MARKAB-2.0-PHASE-0-AUDIT.md`](docs/MARKAB-2.0-PHASE-0-AUDIT.md) | Full Phase 0 audit: UX, UI, IA, journeys, conversion, trust, product, mobile, roadmap, P0/P1 list |
| [`docs/PHASE-0.5-IMPLEMENTATION-PLAN.md`](docs/PHASE-0.5-IMPLEMENTATION-PLAN.md) | Route decision table, per-priority implementation notes, state-component contract, SEO checklist, 25-test verification matrix |
| [`docs/DATA-QUALITY-REGISTER.md`](docs/DATA-QUALITY-REGISTER.md) | 26 verified data defects with fix/quarantine/flag status + validation rules |
| [`docs/LEGAL-TRUST-REGISTER.md`](docs/LEGAL-TRUST-REGISTER.md) | Legal entity, address, domain, phone and privacy conflicts — flagged, **not** resolved by engineering |
| [`docs/UZ-COPY-FIXES.md`](docs/UZ-COPY-FIXES.md) | Verified Uzbek typos, untranslated values, enum→label map, terminology standards |
| [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) | Verified backend facts (Django REST Framework, Bearer auth, 429s), adapter interface, fields needed |


---

## Phase 6 — My Markab (account experience)

Scope: `/login`, `/profile`, and the account/dashboard data architecture. No other surface was
redesigned.

### No authentication exists in this prototype

There is **no verified production auth or customer backend**, so nothing here authenticates,
identifies or submits. The rules encoded in code:

| Rule | Implementation |
|---|---|
| No fake OTP | `unavailableAuthService` returns `unavailable` — it cannot produce a code |
| No fake success | the auth state machine has **no** `authenticated` path unless a real service returns one |
| Honest unavailable copy | `Kirish tizimi rasmiy autentifikatsiya xizmati bilan integratsiya qilinmoqda.` |
| No fake identity | `AccountSnapshot` has **no** name, phone, balance, debt, income or credit-score field |
| No fake submission | application status `draft` renders **"Qoralama / yuborilmagan"**, never "Ko‘rib chiqilmoqda" |
| Demo is labelled | demo mode renders a persistent **"Demo rejim — namunaviy ma’lumotlar"** banner |
| Structure, not figures | every monetary field in `DEMO_ACCOUNT` is `null`; panels render placeholders |

`/profile` is **not** an authenticated area. Direct navigation lands on the honest
authentication-unavailable state; nothing private is shown.

### Architecture

```
UI (AccountDashboard / panels)  →  repository.getAccountSnapshot()
                                 →  MarketplaceAdapter
                                 →  mockProvider | httpProvider   ← both return `unavailable`
```

Both providers return `unavailable()` because no account backend exists. When one is connected,
`httpProvider.getAccountSnapshot()` is the single place to implement, and the UI needs no change.
`AuthProvider` takes an injectable `AuthService`, so a real OTP provider drops in without touching
the login form.

### Local prototype state (disclosed in the UI)

| Feature | Storage key | Disclosure shown to the visitor |
|---|---|---|
| Saved products | `markab.demo.saved` | "Bu prototipda saqlangan mahsulotlar faqat shu brauzerda turadi — ular Markab hisobiga yuborilmaydi." |
| Application drafts | `markab.demo.application-drafts` | "Qoralamada faqat mahsulot nomi saqlanadi — ism, telefon va izoh saqlanmaydi." |
| Demo mode | `markab.demo.dashboard` | Persistent "Demo rejim" banner + badge; default **off** |

A draft deliberately stores **no name, phone number or message** — only that an application was
started, for which product, and when. Privacy-minimal by construction.

### Verification

`npx tsc --noEmit` clean · `npm run build` clean · no console or hydration errors · zero horizontal
overflow at 320/375/390/430/768/1024/1280/1440 · contrast clean on `/login` and `/profile` ·
no collision with the mobile tab bar · true 404s preserved under `/login/*` and `/profile/*`.


---

## Phase 7 — Tanlov yordamchisi (`/advisor`)

Guided product discovery over the real catalogue. **No language model is
connected**, so the feature is labelled "Tanlov yordamchisi / Qoidalar asosidagi
tavsiya" and never marketed as AI-powered.

### Architecture

```
Advisor UI (components/advisor)
   → app/advisor/page.tsx  (server; loads via repository)
   → repository.listVehicles / listProducts / getVehicleFacets / getProductFacets
   → DataAdapter  →  mockProvider | httpProvider
   → lib/advisor/engine.ts      (pure, deterministic ranking)
   → lib/advisor/explanation.ts (provider seam; today rule-based)
```

The UI never touches fixtures. The engine is a pure function, so it can be
unit-tested and reused unchanged when a real API is connected.

### Recommendation logic

1. **Hard constraints.** Every preference the visitor states must match. A
   record failing one is never shown as a match — it can only appear as a
   labelled "nearest alternative" that says exactly which requirement it failed.
   Nothing is silently relaxed (the previous prototype concept multiplied the
   budget by 1.6 behind the visitor's back; that is gone).
2. **Scoring** reorders survivors only: price distance to budget (50), year
   recency (30), mileage (20) for cars; price distance (50), storage (25),
   battery health (25) for electronics. Deterministic, ties break on id.
3. **Explanations** are assembled only from fields that were both requested and
   verified — e.g. "Byudjetingizga mos, Avtomat uzatma va siz tanlagan
   yoqilg‘i turi: Benzin."

Questions are built from repository facets, so an option is never offered for a
value the catalogue cannot return, and each choice shows how many listings it
leads to.

### No exact match

"Aniq mos variant topilmadi." followed by **Eng yaqin variantlar** — records
missing the fewest requirements, each stating what it failed, plus a count of
which requirement blocked the most listings.

### Safety

The advisor never recommends investment products, predicts returns, calculates
unofficial financing, judges affordability or promises approval. For financing
it only links to `/financing/calculator` and shows values the listing itself
publishes. Unknown availability stays "Holati aniqlanmoqda" — it is never
promoted to "Mavjud".

### Honest labelling

> Hozirgi prototip mavjud katalog ma'lumotlari va qoidalar asosida tavsiya
> beradi. AI modeli integratsiyasi keyingi bosqichda ulanishi mumkin.

`lib/advisor/explanation.ts` defines an `ExplanationProvider` seam.
`MARKAB_ADVISOR_EXPLAINER=ai` selects the AI path, which today resolves to
`unavailableAiProvider` — it returns `null` rather than fabricating text, and
the UI degrades to rule-based reasons.

### Verification

`npx tsc --noEmit` clean · `npm run build` clean · no console or hydration
errors · zero horizontal overflow on 16 routes × 8 widths (320–1440) · contrast
clean in all four advisor states · no mobile tab-bar occlusion · true 404
preserved · prior phases unregressed.

---

## Phase 8 — Academy, Loyalty va kontent tajribasi

### Academy arxitekturasi

```
Academy UI (components/academy)
   → app/academy/page.tsx  ·  app/academy/[slug]/page.tsx   (server; repository only)
   → repository.listLessons / getLessonCategories / getLessonBySlug / listRelatedLessons
   → DataAdapter  →  mockProvider | httpProvider
   → lib/data/fixtures/academy.ts
```

Pages never import fixtures — `components/home/AcademySection.tsx` was also
moved onto the repository so the homepage preview and the hub share one source.

| Rule | Implementation |
| --- | --- |
| No invented articles | the repository publishes **3 lessons**; the hub renders 3 cards and states the count |
| No empty filters | categories are counted against real lessons, so a category with no lesson is never offered |
| No fabricated metadata | no author, publish date, read counter or source list exists in the data, so none is rendered |
| Deterministic related lessons | shared category → shared topics → title order; never called a "recommendation" and never called AI |
| Content pending, not generated | `hasContent: false` renders a pending block plus a labelled "Dars tuzilishi" outline |
| URL state | `?q=` and `?category=` — a plain GET form, so filtering works without JavaScript and survives reload |

### Dars sahifasi

Nine-part structure: breadcrumb → title → category → reading metadata (duration
only, when published) → main content → key takeaways → related lessons → useful
next action → support CTA. The next action is a fixed per-category map
(automobil → `/cars`, moliyalashtirish → `/financing/calculator`, sarmoya →
`/invest`), so the same lesson always offers the same follow-up.

### Ta'lim xavfsizligi

`components/academy/EducationNotice.tsx` appears on the hub and on every lesson.
It keeps three things visibly separate: **general educational information**,
**personalised financial advice** (never given) and **official Markab
contract/process terms**. It also refuses to present an independent
Islamic-legal ruling or a certification Markab has not published.

### Sadoqat dasturi (`/loyalty`)

The page is a status page, not a rewards page. Three things stay separate:

| Layer | Treatment |
| --- | --- |
| Bugun nima ishlaydi | `availableNow` facts; anything without a backend renders "Ishlamaydi — ma'lumot kutilmoqda" |
| E'lon qilingan ma'lumotlar | the published tiers / earning / rewards, kept **with their source** (`markab.uz /loyalty sahifasi`) and labelled "amalda ishlashi tasdiqlanmagan" |
| Kutilmoqda | four structural placeholders (membership, history, benefits, notifications) with no values inside |

Nothing was authored to fill a table. The homepage says the program is "ishlab
chiqilmoqda" while `/loyalty` publishes full terms — that conflict is recorded
on the page, not resolved by engineering. Status badge: **Holat:
tasdiqlanmagan**, headline **"Rasmiy dastur tafsilotlari kutilmoqda."**

CTAs are limited to `Batafsil ma'lumot`, `Yangiliklardan xabardor bo'lish` and
`Bog'lanish`. There is **no enrollment button** and **no signup form**: no
notification service exists, so `#notify` explains the pending integration
instead of showing a form that cannot work.

### Verification

`npx tsc --noEmit` clean · `npm run build` clean · 110/110 browser assertions
pass in production mode · no console or hydration errors · zero horizontal
overflow across 8 widths (320–1440) on `/academy`, a lesson page and `/loyalty`
· true 404 preserved for an invalid slug · `MARKAB_DATA_SOURCE=http` degrades all
three routes to the `unavailable` state · prior phases unregressed.

---

## Phase 9 — Soddalashtirish, vizual sayqal, mobil va harakat

> Production Markab sodadaligi + Markab 2.0 funksionalligi + premium ijro.

Bu bosqich yangi dizayn emas, mavjud tuzilmani sayqallashdir. Hech qanday ishlaydigan
funksiya olib tashlanmagan.

### Global katalog qidiruvi (`/search`)

Yagona yangi imkoniyat — u mahsulot topishni bevosita yaxshilaydi.

```
HeaderSearch (client)  →  GET /search?q=…
   → app/search/page.tsx  (server)
   → repository.searchCatalogue(query)
   → DataAdapter  →  mockProvider | httpProvider
```

| Talab | Amalda |
| --- | --- |
| Repository orqali | `searchCatalogue` adapterda; fixture'ga to'g'ridan murojaat yo'q |
| Haqiqiy maydonlar | avtomobil: nom, brend, model, yil · elektronika: nom, xom sarlavha, brend, kategoriya |
| Kataloglarni ajratish | natijalar **Avtomobil** va **Elektronika** bo'limlariga bo'lingan |
| Chuqur havolalar | har bir natija `/cars/<slug>` yoki `/electronics/<id>` sahifasiga olib boradi |
| Holatlar | loading (Suspense skeleton) · no results · unavailable · error |
| Uydirma yo'q | `httpProvider` `unavailable` qaytaradi — mahalliy ro'yxatga tushish yo'q |
| Klaviatura | `/` qidiruvga fokus beradi (boshqa maydonda yozayotganda emas), `Escape` yopadi |
| Tartib | uch pog'onali, deterministik moslik (prefix → so'z boshi → qismiy), alifbo + id bilan barqarorlashtirilgan. Bu **relevantlik modeli emas** va shunday taqdim etilmaydi |

### Soddalashtirilgan nusxa

Ichki muhandislik lug'ati foydalanuvchi ko'radigan matndan chiqarildi:

| Avval | Hozir |
| --- | --- |
| «rasmiy manba bilan to'ldiriladi» (40+ joyda) | «Markab tomonidan to'ldiriladi» |
| «Ma'lumotlar manbasi ulanmagan» | «Katalog vaqtincha ulanmagan» |
| «rasmiy hisoblash formulasi integratsiya qilingach» | «hisoblash tartibi tasdiqlangach» |
| «tizim integratsiya qilinmagan» | «yuborish hali ishlamaydi» |
| «Markab 2.0 kontsept-prototip · real API ulanmagan · namuna ma'lumotlari» | «Kontsept-prototip · e'lonlar namunaviy» |

Honestlik saqlandi — faqat uzunlik qisqartirildi.

### Shovqinni kamaytirish

* **FAQ**: bir xil «menejerimizdan oling» javobi 5 marta takrorlanardi — endi bo'lim
  kirishida bir marta.
* **Bosh sahifa ilova bloki**: 19 ta yorliq → 7 ta; konsept-dashboard'dagi 3 ta
  skelet qator olib tashlandi.
* **Savatcha bo'sh holati**: «Savatchangiz bo'sh» + bitta amal.
* **Kabinet**: 210 belgili himoyaviy matn → 84 belgi.
* **Loyalty**: 293 belgili holat tavsifi → 153 belgi; takrorlangan sarlavha olib tashlandi.

### Spacing va tipografiya

* Bo'limlar uchun **bitta ritm**: `.section-y` (`py-12 sm:py-16`) va `.section-y-sm`
  (`py-10 sm:py-14`). Avval bir xil element uchun 5 xil padding ishlatilardi.
* Sarlavhalar ierarxiyasi: H1 54px · H2 32px · H3 16px. Sahifa sarlavhasi uchun
  6 xil o'lcham `text-display-sm sm:text-display-md` ga keltirildi; karta sarlavhasi
  uchun 6 xil o'lcham bitta 16px pog'onaga.

### Harakat

Cheklangan va maqsadli: filter paneli (fade + slide-up), accordion (JS o'lchovisiz
`grid-rows-[0fr]→[1fr]`), qidiruv paneli (dropdown entrance), mavjud hover/card
o'tishlari. Halqa animatsiya, parallax va kirish ketma-ketliklari yo'q.
`prefers-reduced-motion` global qoidasi barchasini ~0ms ga tushiradi.

### Mobil

* **Topilgan va tuzatilgan haqiqiy nuqson**: mobil tab-bar har sahifada footer'ning
  oxirgi 63px ini berkitardi. `#main` padding'i faqat kontentni himoya qilardi,
  undan keyin keladigan footer'ni emas.
* `/search` 320–390px da 408px ga chiqib ketardi — asosiy `grid-cols-1` yo'q edi,
  shuning uchun elementlar max-content bo'yicha o'lchanardi.
* Footer havolalari 24px → 40px, dars kategoriya chipi 26px → 40px, invest/contact
  havolalari 16px → 32px.

### Verification

`npx tsc --noEmit` clean · `npm run build` clean · **305/305** mobil tekshiruv
(19 route × 8 kenglik: overflow, sticky to'qnashuv, tab-bar, tap target, console) ·
**27/27** qidiruv + harakat + accessibility · **110/110** Phase 8 regressiya ·
barcha route'lar 200, noto'g'ri slug'lar 404 · `MARKAB_DATA_SOURCE=http` da qidiruv
`unavailable` holatiga tushadi va **0 ta** natija ko'rsatadi.

---

## Markab 2.0 — prototype (this branch)

⚠️ **This is a Markab 2.0 redesign / product prototype. The production markab.uz codebase is NOT
present in this repository and has NOT been modified.** Everything here was built from the
Phase 0 audit plus publicly published information, for evaluation and design purposes.

### Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · React 19. No UI kit, no animation
library, no CMS, no additional framework.

```bash
npm install
cp .env.example .env.local   # MARKAB_DATA_SOURCE=mock
npm run dev                  # http://localhost:3000
npm run build && npm run start
npx tsc --noEmit             # type check
```

### Architecture

```
UI (app/ · components/)
   └── repository (lib/data/index.ts)          ← the only thing UI imports
         └── adapter (lib/data/adapter.ts)     ← interface + Result<T> contract
               ├── mockProvider  (fixtures)    ← default: MARKAB_DATA_SOURCE=mock
               └── httpProvider  (api.markab.uz, Bearer) — every method returns `unavailable()`
```

* `Result<T>` = `success | empty | not_found | error | unavailable`. `not_found` is never an
  `error`, so a missing record renders a real 404 page instead of a 500.
* Swapping to the real API = set `MARKAB_DATA_SOURCE=http` + supply a token in the server env.
  **No UI file changes.** Auth is never bypassed: with no credentials every call returns
  `unavailable`, which the UI renders as "Ulanish kutilmoqda".
* Fixtures live in `lib/data/fixtures/` and are **verified-only**; each file carries a provenance
  header. Two known-bad records are quarantined, not shipped (see the data-quality register).

### Routes

`/` · `/cars` · `/cars/[slug]` · `/electronics` · `/electronics/[id]` · `/financing` ·
`/financing/calculator` · `/financing/apply` · `/invest` · `/academy` · `/academy/[slug]` ·
`/about` · `/contact` · `/faq` · `/loyalty` · `/sell` · `/login` · `/profile` · `/cart` ·
`/privacy` · `/terms` · `/advisor` · custom 404 · `sitemap.xml` · `robots.txt`.

Unknown URLs return **HTTP 404** with a branded page — they never silently render the homepage.

### Data integrity rules (enforced in code)

| Rule | Implementation |
|---|---|
| No invented financing formula | `InstallmentCalculator` shows the inputs; monthly/total render as pending values |
| No invented financial/legal/investment claims | `/invest`, `/privacy`, `/terms`, legal fields render `null` as "Rasmiy ma'lumot bilan to'ldiriladi" |
| No fake testimonials | the trust layer shows verified facts + an explicit "tekshiruv kutilmoqda" list instead |
| No fake success states | contact / sell / application / login forms end in an honest "backend ulanmagan" state |
| No fabricated specs | missing fields are `null` → "Ma'lumot tayyorlanmoqda" |
| No AI-generated advice | `/advisor` is a deterministic rule matcher; sensitive questions escalate to official info/human support |

### Known limitations

* Images are served unoptimized (`images.unoptimized: true`) — no Next image optimizer or remote
  pattern is configured for `api.markab.uz` yet.
* The brand palette is provisional: production CSS was not reachable, so colours are a documented
  placeholder pending official brand guidelines. Typeface is a system stack for the same reason.
* Auth and cart are browser-local demo state, clearly labelled "Demo".
* Academy lessons and FAQ answers are intentionally empty (`hasContent: false`, `answer: null`).

### Phase 1 — homepage

The homepage is composed of 15 blocks in a fixed order, all fed by the repository
(no hardcoded product data):

`header → hero → trust strip → "Sizga nima kerak?" → featured cars → featured
electronics → financing/calculator preview → why Markab → how it works →
investment preview → Academy preview → digital experience → FAQ → final CTA →
footer`

Homepage-specific components live in `components/home/`. Notable behaviours:

* **Hero** prefers a catalogue item whose financing figures are actually published,
  so the financing card shows real values; unavailable fields stay as explicit
  pending markers.
* **Marketplace showcases** are scroll-snap rails below `sm` and grids from `sm`
  up — the mobile homepage is not a compressed desktop page.
* **Calculator preview** on the homepage is a static composition: the interactive
  calculator stays on `/financing/calculator`, which keeps homepage JS at ~1.2 kB.
* **Motion** is scroll-reveal, hover and focus transitions only. `Reveal` honours
  `prefers-reduced-motion`, and a `<noscript>` rule in the root layout forces
  revealed content visible when JavaScript never runs.

### Phase 2 — automobile marketplace

`/cars` and `/cars/[slug]` are built on the same `UI → repository → adapter → provider`
chain as the homepage. Neither page imports fixtures; every option, count and price
comes from the repository.

**Filter state lives in the URL.** `/cars?brand=chevrolet&year=2023&sort=price-asc` is a
real, shareable, reload-safe address. The keys are `q, brand, year, fuel, trans, cond,
fin, minp, maxp, sort, page`; `lib/vehicles/filters.ts` is the single pure translator
between those parameters and the adapter's `VehicleQuery`. Because every filter change is
a navigation, the result grid stays a server component — no client-side data fetching.

**Only filters the data can answer are offered.** `repository.getVehicleFacets()` asks the
provider which brands, years, fuel types, transmissions and conditions actually exist, so
the UI never shows a filter that would return nothing. If the source cannot describe its
own options, the sidebar is dropped and only search + sort remain.

**Sorting** is newest year, price ascending, price descending — nothing else. There is no
popularity ranking, because no popularity data exists.

**Financing is never computed.** A card or detail page prints the monthly payment only
when the source publishes one. `initialPaymentUzs`, `termMonths`, `totalAmountUzs` and
`contractType` are null for every current record, so they render as explicit pending
markers that link to `/financing/calculator`.

**The gallery is honest.** Listings with one photo show one photo — no duplicated
thumbnails, no fake "1 / 1" counter.

**Related vehicles are deterministic.** `lib/vehicles/related.ts` scores candidates on
brand, year gap, relative price distance, fuel type and transmission, with `id` as the
final tie-breaker so a page always renders the same three cars. It is labelled as a
fixed-rule selection, never as AI or a personalised recommendation.

Mobile is first-class: a filter sheet with a live result count replaces the sidebar below
`lg`, search is debounced, and the whole marketplace was measured at 320 / 375 / 390 /
430 / 768 / 1024 / 1280 / 1440 with zero horizontal overflow.

### Phase 3 — electronics marketplace

`/electronics`, `/electronics/[id]` and the cart sit on the same
`UI → repository → adapter → provider` chain as everything else. No page
imports fixtures.

**Filters are counted, never assumed.** `repository.getProductFacets()` asks the
source which categories, brands, storage sizes, battery percentages and stock
states actually exist. A group is only rendered when it can change the result
set: with one brand and one populated category in the current catalogue, the
brand and category chips are not shown, because a filter with a single option is
a label, not a choice. When the production API supplies more, they appear with
no code change.

**Sorting is deterministic.** Options are standard order, price ascending and
price descending. `'popular'` still exists in the adapter contract for the real
API but is deliberately not offered: the prototype will not present a
popularity ranking it cannot substantiate.

**Availability is a rule, not a guess.** `lib/products/stock.ts` is the single
source of truth the card, the detail page and the cart all read. Three states,
three behaviours (this rule was tightened in Phase 4 — see below):

| Stock state | Add to cart | What the visitor sees |
| --- | --- | --- |
| `in_stock` | enabled | "Savatga" |
| `out_of_stock` | disabled | a disabled "Qolmadi" button, in the card and in the sticky bar |
| `unknown` | **not offered** | a neutral "Mavjudligini aniqlash" link to `/contact?type=…&ref=…` |

`unknown` means the source published nothing. It is never rendered as "Mavjud",
and it never produces an add-to-cart button: an unknown stock level is an
unknown stock level, not permission to buy.

**Specifications are only shown when real.** Detailed spec rows with a null
value are dropped rather than printed as "N/A". The current catalogue therefore
shows storage and battery health and nothing else.

**Financing is never calculated.** Only the published monthly payment is
printed; initial payment, term and contract type render as pending markers
linking to `/financing/calculator`.

**The gallery is honest.** One photo means one photo — no duplicated thumbnails,
no fake counter. A listing with no photo gets a real empty state
(`e0783-26` in the current catalogue).

**The cart is a prototype and says so.** It is browser-local state under an
explicitly namespaced demo key, with one line per product: adding the same item
twice is a no-op, not a silent second copy. Delivery, instalment totals and
order submission all render as pending — nothing pretends to check out.

Mobile commerce specifics: a compact sticky action bar on the detail page sits
directly above the mobile tab bar (offset via the shared `--tabbar-h` variable,
so the two never overlap), and the whole flow was measured at 320 / 375 / 390 /
430 / 768 / 1024 / 1280 / 1440 with zero horizontal overflow.

### Phase 4 — financing & calculator

Three routes: `/financing`, `/financing/calculator`, `/financing/apply`. Nothing
else was redesigned for this phase.

**The primary rule of this phase is that no financial logic is invented.** There
is no interest rate, no profit margin, no amortisation, no monthly payment, no
total repayment, no fee, no penalty, no eligibility test and no approval
probability anywhere in the code. Where an official value does not exist, the UI
says so — a calculator that refuses to lie is worth more than one that produces
confident fake numbers.

**`/financing`** carries the ten sections the brief asked for (hero, overview,
process, supported product types, terms, calculator CTA, application CTA,
transparency, FAQ, final CTA). Its spine is a strict split between two lists:

- **Published** — only what an official source actually states: the contract
  types `taqsit` / `murabaha`, the two supported product types, and the fact
  that some listings carry a monthly payment.
- **Pending official** — eight rows (minimum initial payment, term range,
  markup, commissions, required documents, approval time, early-settlement
  terms, penalties) that all render the same pending marker. None of them is
  filled with a plausible number.

Catalogue counts on the page come from `repository.getVehicleFacets()` and
`getProductFacets()`, not from a hard-coded sentence.

**`/financing/calculator` is an interface, not a calculation.** It accepts
product price, initial payment and requested term, and computes exactly one
thing:

```
remaining = product price − initial payment
```

…which is printed under an explicit note that it is ordinary arithmetic and not
a financing result. The result panel is deliberately split into three zones so
the difference is impossible to miss:

1. **Siz kiritgan ma'lumotlar** — the visitor's own inputs plus the labelled
   subtraction.
2. **Rasmiy hisob-kitob** — monthly payment, total payment and contract type,
   each rendering *"Rasmiy hisoblash formulasi kutilmoqda."* inside a dashed
   block that contains no digits at all.
3. **E'londa ko'rsatilgan qiymat** — the only financing figure on the page: a
   monthly payment the product listing itself publishes, shown verbatim and
   labelled as quoted, not computed.

The layout is already shaped for the real values: when an official formula is
supplied, the pending rows are replaced and nothing else has to change.

**Product handoff** works from both catalogues and never copies product data
into fixtures:

- `/financing/calculator?productType=car&productId=<slug>`
- `/financing/calculator?productType=electronics&productId=<id>`
- `/financing/apply?type=car|electronics&ref=<slug|id>`
- `/contact?type=car|electronics&ref=<slug|id>`

`lib/financing/subject.ts` resolves the identifier through
`repository.getVehicleBySlug()` / `getProductById()` and returns
`none | invalid | resolved`. An unknown or malformed identifier is not an error
page and not a silent redirect: the page keeps rendering and shows a
"Ko'rsatilgan mahsulot topilmadi" notice, with the calculator still usable on a
manually entered price.

**`/financing/apply`** is one page — the earlier four-step wizard was removed
because it asked for financial commitments as if they were required fields. It
collects name, phone, product context, preferred contact method and an optional
message. It does **not** collect a passport number, JSHSHIR, bank or card
details, a selfie, or anything else financial; those would only be justified by
a verified backend and a legal basis, and the page says so.

**No fake submission.** There is no production backend, so a completed form
never says "Arizangiz yuborildi". It ends on
*"Ariza yuborish tizimi hali rasmiy backend bilan integratsiya qilinmagan."*,
keeps everything the visitor typed on screen, and offers a copy-to-clipboard
summary plus an edit-back control.

**Phase 3 stock correction.** `unknown` stock no longer allows add-to-cart; it
now renders a neutral "Mavjudligini aniqlash" action that opens `/contact` with
the product pre-filled. Because the current catalogue has zero products in
`in_stock`, this correctly means no electronics product can be added to the cart
right now — the honest outcome, and a good demo of the rule.

**Design.** Two new `Button` variants (`onDark`, `onDarkOutline`) were added for
the dark final-CTA section. They exist because Tailwind resolves conflicting
utilities by stylesheet order rather than class-attribute order, so a
`text-white` inside a variant silently beats a `text-ink-900` passed through
`className` — which had rendered two buttons white-on-white.

**Verified:** `npx tsc --noEmit` and `npm run build` clean; zero horizontal
overflow across 320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 on all three
routes plus the handoff and contact variants; 906 text samples with 0 contrast
failures on the financing surface; no console or hydration errors; invalid
product identifiers fail safely; real 404s intact for unknown routes; 43
internal links across five pages all resolve.

### Phase 5 — investment experience

`/invest`, plus the investment truth states on the homepage. Nothing else was
redesigned for this phase.

**The primary rule is that no investment information is invented.** There is no
return rate, yield, ROI, expected income, guaranteed profit, term, minimum
amount, withdrawal rule, fee, payout schedule, risk rating, historical
performance or investor count anywhere on the page or in the data model. The
rendered `/invest` page contains no percentages and no large numbers except the
office hours in the footer and the step numbers 1–4.

**Removed: "2 oydan 36 oygacha".** That duration range was carried by three
places — `/invest`, the homepage investment section, and the `valueProps`
fixture. It could not be substantiated for the investment product, so it was
deleted from all three and the row moved into the pending list. It was **not**
replaced with another guessed duration; the pending row says only that the term
will be shown once it is officially published. A repository-wide search now
finds the string only inside the three comments that record *why* it was
removed, so it cannot be quietly reintroduced.

Because the same fixture feeds the homepage "Nima uchun Markab?" list and
`/about`, the field is now nullable and both consumers render an explicit
pending marker instead of a value.

**`/invest` carries the ten sections the brief asked for** (hero, what the
product is, how the published model works, available official information,
pending information, journey, transparency & documents, risk disclosure, FAQ,
contact CTA), with deep-link ids.

**Published vs pending is a first-class distinction.** `lib/investment/status.ts`
defines the two labels, and `components/investment/FactRow.tsx` renders them so
they cannot be confused:

| State | Treatment |
| --- | --- |
| Published | solid row, value in strong ink, a `E'lon qilingan` badge **and the named source** underneath, so the claim is attributed rather than asserted |
| Pending | dashed border, muted surface, a clock glyph, the required `Rasmiy ma'lumot kutilmoqda.` marker, and a hint saying what is unknown |

A pending row is never allowed to read as a filled-in one — no dash, no
placeholder number, nothing that looks like a value.

**The data reaches the page through the repository, not through a fixture
import.** `getInvestmentProfile()` was added to the adapter, mock provider,
HTTP provider (which returns `unavailable()`) and repository, so the investment
page obeys the same `UI → repository → adapter → provider` chain as everything
else. The old `/invest` page imported fixtures directly; it no longer does.

**Three facts are published** — the profit-distribution principle, monthly
accountability, and the company's own statement that profit can be withdrawn at
any time. Each names its source and carries a caution that the mechanics are
not published. **Nine fields are pending** — minimum amount, term, profit
mechanism, distribution schedule, contract type, fees, withdrawal rules, risk
information, reporting format.

**Risk is disclosed, not hidden.** A dedicated section states plainly that any
investment can lose money, that no return is promised or promiseable, that
final terms depend on the official Markab contract, and that the prototype
gives no investment advice. It explicitly refuses to show a risk rating
(low/medium/high) until an official source provides one.

**AAOIFI is attributed, never certified.** The page renders Markab's own
statement and pairs it with the reason the prototype cannot verify it:
*"Tasdiqlovchi rasmiy hujjatlar integratsiyasi kutilmoqda. Bu prototip mustaqil
tekshiruv o'tkazmaydi va da'voni tasdiqlangan deb ko'rsatmaydi."*

**Documents show pending, never a fake download.** Five document categories are
listed with `href: null`. A null href renders a pending badge and a "So'rash"
action that opens the contact form — there is no download button for a file
that does not exist, and no fictional contract or certificate.

**There is no fake investing.** No invest-now button, no balance, no deposit,
no confirmation, no successful investment. Every CTA — "Batafsil ma'lumot
olish", "Mutaxassis bilan bog'lanish", "Risk hujjatini so'rash" — opens
`/contact?type=sarmoya`, optionally with `&about=documents|terms|risk`, and
prefills both the topic and the message. An unrecognised `about` value falls
back to the general enquiry rather than producing a broken form.

**Verified:** `npx tsc --noEmit` and `npm run build` clean; zero horizontal
overflow across 320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 on `/invest`
and the investment contact handoffs; 192 text samples on `/invest` with 0
contrast failures; no console or hydration errors; real 404s intact (including
`/invest/nope`); 47 internal links across seven pages all resolve.

---

## Phase 10 — SEO, performance, accessibility and technical cleanup

No new product features. This phase was a correctness pass over what already
existed: metadata, crawl directives, the data layer, accessibility and payload.

### Metadata and crawl strategy

Every route now carries a title, description, canonical, OpenGraph and Twitter
card through a single `buildMetadata` helper in `lib/seo.ts`. Titles are
uniformly `Page | Markab`; the helper emits **absolute** titles so the root
layout's `%s` template cannot double the suffix into `Page | Markab | Markab`.

Canonical strategy: filtered and searched views (`/cars?q=`,
`/electronics?brand=`, `/academy?q=`) canonicalise to the clean route. Those
views also carry `noindex, follow`, which is the directive Google actually
honours — they are deliberately **not** listed in `robots.txt`, because a
`Disallow` stops the crawler fetching the URL, which means it never sees the
canonical or the `noindex` and the URL can still be indexed by URL alone.

`/login`, `/profile`, `/cart` and `/search` are `noindex` and disallowed.
`/search` is disallowed because its results are generated from the query: there
is nothing stable to index and infinite permutations to crawl.

### Sitemap

`sitemap.ts` now resolves vehicles, products and lessons through
`sitemap → repository → adapter → provider`. It imports no catalogue or lesson
fixtures. Each section is guarded by result status, so an unavailable provider
yields an empty section rather than fabricated URLs. Output at the time of
writing: **41 URLs** — 16 static pages, 11 car detail pages, 11 electronics
detail pages, 3 academy lessons.

Marketing content (value propositions, the instalment journey, trust badges,
app features, the investor diagram) used to be imported straight from
`lib/data/fixtures/content` by pages and home sections. It now travels through
`repository.getSiteContent()`. The worst case was `investorFlow`, which had two
access paths — the provider on `/invest` and a direct fixture import on the
homepage — which is exactly how content drifts. The repository call is wrapped
in React `cache()` so the several blocks that read it in one render still cost a
single provider call.

**Result: zero fixture imports remain outside `lib/`.**

### Accessibility

* **Contrast.** Four patterns on dark surfaces failed 4.5:1 where
  `text-white` was used at low alpha. Raised per-pattern rather than defaulting
  everything to full white, so the hierarchy inside the dashboard tiles is
  preserved (label brighter than the pending placeholder, placeholder still
  legible). Measured: **0 failures across all 46 routes**.
* **Keyboard.** The mobile menu locked body scroll but had no Escape handler,
  did not move focus when opened and did not restore it when closed. Escape now
  closes it, focus moves to the first link, and Tab cycles inside. The trigger
  stays in the cycle deliberately: while open its label is *"Menyuni yopish"*,
  so it is the close control and must stay reachable. Global search's Escape
  previously just blurred the input; it now returns focus to the trigger.
* **Headings.** Six routes jumped `h1 → h3`. `StateBlock` now takes a
  `headingLevel` prop, and `/faq` and `/academy` gained a visually hidden `h2`
  above their `h3` item lists.
* **A static audit** across all 46 routes at 1440px and 390px reports 0 issues
  for headings, landmarks, labelled controls, accessible names, alt text,
  positive tabindex and focus visibility.
* **Description lists.** Five `<dl>`s wrapped each row in a `<div>` that also
  held a status badge, a slider, sample chips or a note. The HTML spec allows a
  `<div>` inside a `<dl>` to contain only `<dt>`/`<dd>`, so all five were invalid
  and their pairs orphaned from any list. Where a row is a simple term-over-value
  stack the supporting text now sits inside the `<dd>`; where the row puts term
  and value on one line with controls below, each row becomes its own short
  `<dl>` — same layout, still a real pairing.
* **Heading order.** `/cars` and `/electronics` skipped `h1 → h3` on a phone: the
  filter panel's *"Filtrlar"* `h2` is hidden below the desktop breakpoint, and a
  zero-size heading is not part of the outline. Both listings gained a visually
  hidden `h2` above the results.
* **Label in name (WCAG 2.5.3).** The store badge's caption is styled
  `uppercase`, so it *renders* as "DOWNLOAD ON THE" while its text content is
  "Download on the" — any `aria-label` is compared against the rendered string
  and could never contain it. The override is gone; the visible text is the
  accessible name.

### Performance

* `next/image` optimisation was **disabled globally**. That is not cosmetic: it
  makes `next/image` emit a plain `<img>` pointing at the original file, so a
  phone downloads full-resolution originals and every `sizes` prop in the
  codebase is inert. Re-enabled. Offline behaviour is unchanged because
  `CatalogueImage`'s `onError` already swaps in the neutral placeholder.
* `ProductCard` was marked `'use client'` without using a hook or browser API.
  Making it a server component stops shipping the card's markup as JavaScript
  once per grid item: **−2 kB First Load JS** on `/`, `/electronics` and
  `/electronics/[id]`.
* `/academy` asked for the lesson list twice — once filtered, once unfiltered
  for the hero count — even when nothing was filtered. Now skipped then.
* Typography is a system font stack, so there is no web-font download, no FOUT
  and no font-related shift. `prefers-reduced-motion` is honoured globally.
* `/cars` and `/electronics` emitted **no image preload link at all** — every
  card was `loading="lazy"`, so the listings had no prioritised LCP candidate.
  The first two cards (the whole first screen on a phone, the first row on a
  desktop) now load eagerly; cards below that stay lazy, so nothing extra is
  fetched for content the visitor cannot see yet.

### Structured data

Emitted only where the data supports it: `Organization` and `WebSite` site-wide
(contact phone and email omitted on purpose — they are not published on
markab.uz), `BreadcrumbList` on the three detail page types, and `Product` on
car and electronics detail pages. No `aggregateRating`, `review`, `author`,
`datePublished` or discount is emitted anywhere, because none exists in the data
layer. Availability is mapped from the published stock state and **omitted
entirely** when that state is `unknown` — 10 of 11 products omit it, 1 emits
`OutOfStock`. There is deliberately **no `Article` node for lessons**: all three
have `hasContent: false`, so an Article would describe content that does not
exist.

### Data-layer inconsistency fixed

`Lesson.durationLabel` was required, and all three lessons carried the same
*"5–10 daqiqa"*, published as **"O‘qish vaqti"**. No lesson publishes a
duration, so this was an invented reading time. The field is now nullable and
`null` in the fixtures.

### Verification

All of the following were measured in this environment, not estimated.

* `npx tsc --noEmit` clean; `npm run build` clean.
* **392/392** assertions across 23 routes for the title system, description
  length, canonical (including query → clean base), OpenGraph/Twitter,
  `noindex` on `/profile`, `/cart`, `/login`, `/search` and every `?` route, one
  `<h1>`, landmarks, heading skips, image `alt` and stable boxes, and JSON-LD
  parsing with no fabricated rating.
* **axe-core: 0 violations across 24 routes at 412px** (`wcag2a`, `wcag2aa`,
  `wcag21a`, `wcag21aa`, `best-practice`).
* **0 contrast failures below WCAG AA** across 23 routes. The audit composites
  translucent backgrounds back-to-front and skips visually hidden text; its
  maths is pinned against known reference values (`#777` on white = 4.48:1,
  `#595959` on white = 7.0:1).
* **29/29** keyboard and focus checks: skip link, tab order following DOM order
  with no positive `tabindex`, a visible focus ring on all 60 stops, drawer focus
  movement and containment, Escape + focus restore, `Enter` on accordions with
  `inert` collapsed panels, and a labelled control on every form.
* **120/120** zero-horizontal-overflow checks — 15 routes ×
  320/375/390/430/768/1024/1280/1440 — with a clean console (no hydration
  warnings).
* True 404 intact for invalid car slug, electronics id, academy slug and unknown
  routes.
* Sitemap: **41 URLs**, no quarantined or query-string entries. `robots.txt`
  allows `/` and disallows only `/profile`, `/cart`, `/login`, `/search`.

**Lighthouse 12.8.2**, default mobile emulation, against the production build:

| Route | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 96 | 100 | 1.8 s | 0.001 | 50 ms |
| `/cars` | 97 | 100 | 96 | 92 | 1.5 s | 0.001 | 200 ms |
| `/cars/chevrolet-cobalt-2023` | 99 | 100 | 96 | 92 | 1.9 s | 0.001 | 70 ms |
| `/electronics` | 95 | 100 | 96 | 92 | 2.0 s | 0.001 | 230 ms |
| `/invest` | 98 | 100 | 100 | 100 | 2.1 s | 0.001 | 140 ms |
| `/academy` | 99 | 100 | 100 | 91 | 2.1 s | 0.001 | 70 ms |

Accessibility, best practices and SEO are stable across runs. Performance is
not: repeated runs on this shared sandbox ranged 95–99 with TBT between 40 ms
and 230 ms, so read that column as a band rather than a measurement.

Two caveats on those numbers, both material:

* The SEO score on the four dynamic routes is 91–92 rather than 100 for exactly
  one reason — Next.js streams those routes' metadata into `<body>`, and the
  `meta-description` audit reads `<head>` only. See
  [`docs/PHASE-10-DEPLOYMENT-NOTES.md` §7](docs/PHASE-10-DEPLOYMENT-NOTES.md).
* `best-practices` loses points to `errors-in-console` because this sandbox
  cannot reach `api.markab.uz`, so the image optimiser returns 500 and
  `CatalogueImage` falls back to its placeholder. No catalogue photography loads
  here, which means **LCP is measured against a text element, not the real hero
  image** — treat the performance column as a structural check, not a
  field-accurate measurement.

ESLint has never been configured in this project, so no lint result is reported;
`npm run typecheck` (tsc) is the static gate that exists.

See [`docs/PHASE-10-DEPLOYMENT-NOTES.md`](docs/PHASE-10-DEPLOYMENT-NOTES.md)
for the build-time vs request-time data caveat that must be resolved before a
real API is connected.

## Phase 11 — Threat model and security hardening

No product features. A security pass over what already exists, and a threat
model to give Phase 12 something concrete to work from.

Full record: [`docs/PHASE-11-SECURITY.md`](docs/PHASE-11-SECURITY.md). Phase 12
requirements (documented, **not** implemented):
[`docs/PHASE-12-DEPLOYMENT-SECURITY.md`](docs/PHASE-12-DEPLOYMENT-SECURITY.md).

### What changed

* **Security headers on every route** — CSP, HSTS, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, COOP, CORP and `X-Frame-Options`. Two of them are
  deployment properties with production-correct defaults:
  `frame-ancestors 'none'` and `includeSubDomains` HSTS, relaxed only where
  `MARKAB_ALLOW_PREVIEW_FRAME=true` is set explicitly (the Arena preview is
  served in an iframe).
* **Untrusted-state validation** (`lib/security/url.ts`) — the cart, saved
  items and application drafts are rehydrated from `localStorage`, which is
  attacker-writable. `href` values must be same-origin paths, `src` values must
  be on the allow-listed media host, text is length-capped. Previously the
  check was "is it a string", which a `javascript:` href passes.
* **Server–client credential boundary** (`lib/env/server.ts`, `server-only`
  fences) — `components/sell/SellWizard.tsx` used to import `@/lib/data` from
  the browser, pulling the whole provider graph with it. It now takes the brand
  list as a prop. `/sell`'s client chunk went from 39.5 kB to 12.6 kB and no
  environment variable or provider string remains in any client bundle.
* **Error reporting split** (`lib/errors.ts`) — three pages rendered
  `result.error.message` into the HTML. The real error now goes to the server
  log and the visitor gets one fixed sentence; a message that varies with the
  failure is a channel for internal detail.

### The one thing that is weaker than intended

`script-src` allows inline scripts. The strict nonce policy was implemented
first and measured: Next.js only stamps nonces on responses it renders per
request, and sixteen routes are prerendered, so those pages loaded with every
script refused and no hydration. The measured consequences are recorded in
§6.1 of the Phase 11 doc — foreign-origin scripts and frames are blocked, but
inline script and `eval` are not. Removing the allowance is Phase 12 item C1.

### Verification

`tsc --noEmit` clean · production build clean · Chromium 131, 11 routes ×
1440 and 390 viewports · **0 CSP violations** · hydration successful on all 22
page loads · no horizontal overflow · true 404 on four unknown routes ·
hostile `localStorage` payload rendered 0 hostile hrefs · no secret, token or
provider string in `.next/static` · Phase 10 image behaviour unchanged.

`npm audit` reports 1 moderate and 1 high, both the same `postcss` inside
`next@15.5.24`; the fix is a semver-major `next@16` upgrade, which was
deliberately **not** taken inside a security phase. Recorded as Phase 12 D1.

ESLint remains unconfigured in this repository, as it was before Phase 11 —
`npm run typecheck` is the static gate that exists.

## Phase 12 — Deployment security

Implementing the items from `docs/PHASE-12-DEPLOYMENT-SECURITY.md` that this
repository can own. Items that need infrastructure — TLS termination, WAF and
rate limiting, the secret store, log aggregation, the penetration test — are
marked *environment* in that document and cannot be delivered from here.

### The inline-script allowance is gone (C1)

Phase 11 shipped `script-src 'self' 'unsafe-inline'` because Next.js only
derives a CSP nonce for responses it renders *per request*, and sixteen routes
were prerendered at build time. Phase 12 paid the price instead of accepting
the weakness: every document route now renders per request and carries a
per-response nonce with `'strict-dynamic'`.

The price was measured before it was paid, by interleaving the two builds on
one machine so sandbox drift could not be mistaken for a difference:

| Mode | perf | LCP | TBT | TTFB |
|---|---|---|---|---|
| prerendered | 97 | 2537–2818 ms | 136–168 ms | 32–34 ms |
| per request | 96–97 | 2541–2584 ms | 103–176 ms | 24–39 ms |

No systematic difference, and smaller than the run-to-run variance — these
pages render from in-memory fixtures, so prerendering caches nothing
expensive. (LCP here is measured against the image placeholder, since this
sandbox cannot reach `api.markab.uz`; read the comparison, not the absolute
values.)

Evidence, from injecting into the served HTML: an inline `<script>` with no
nonce is **refused**, `eval()` inside a legitimately nonce-stamped script is
**refused**, a foreign-origin script is **refused**, and the 65–68 scripts the
application legitimately stamps still run and hydrate the page.

### Also in this phase

* **CSP reporting (C3)** — `report-uri` is emitted only when
  `MARKAB_CSP_REPORT_ENDPOINT` is set (a report endpoint is a decision about
  who receives visitor data, so it defaults to nobody), plus a hardened
  in-app receiver at `/api/csp-report`: POST only, content-type allow-list,
  8 KB cap, nothing echoed, four truncated fields logged.
* **Start-up posture log** — `instrumentation.ts` writes one JSON line with the
  CSP mode, framing policy, HSTS lifetime and whether an API token is present
  (presence only, never the value), at `warn` level when a relaxed preview
  flag is set — so a production server started with `MARKAB_ALLOW_PREVIEW_FRAME`
  is visible in the log instead of hidden in a config file.
* **Structured error logs (E4)** — `lib/errors.ts` and the report route emit
  single-line JSON, indexable by `event`.
* **CI (D2, F2)** — the workflow is at [`docs/ci/security.yml`](docs/ci/security.yml)
  and it is **not installed yet**: the GitHub App used on this branch does not
  hold the `workflows` scope, and GitHub rejects writes to
  `.github/workflows/` without it. Install with
  `mkdir -p .github/workflows && cp docs/ci/security.yml .github/workflows/security.yml`.
  It runs types, lint, `npm audit --audit-level=critical`, the allow-list
  check, a build and `npm run security:headers` against the running server,
  plus a weekly cron so advisories that arrive without a commit are seen.
* **Two repeatable gates** — `npm run security:allowlists` (14 assertions: the
  image host appears in all three places, the CSP shape has not regressed, no
  `server-only` fence removed) and `npm run security:headers` (22 assertions
  against a running server, including that the nonce rotates and that
  `script-src` contains neither `unsafe-inline` nor `unsafe-eval`).
* **ESLint (F3)** — configured for the first time in this repository:
  `next/core-web-vitals` plus `no-eval`, `no-implied-eval`, `no-new-func` and
  `no-script-url` as errors. Clean at 0 errors / 0 warnings; the one finding
  (a plain `<a href="/">` in the error boundary) is a deliberate exception with
  the reason recorded inline.

### Regression sweep after the change

Rendering every route per request is an architectural change, so it was swept
against the Phase 9 and Phase 10 acceptance criteria rather than assumed safe:

| Route | Phase 10 recorded | After Phase 12 |
|---|---|---|
| `/` | 99 · LCP 1.8 s · CLS 0.001 | 97 · LCP 2.54 s · CLS 0.0005 |
| `/cars` | 97 · 1.5 s | 99 · 2.22 s |
| `/cars/chevrolet-cobalt-2023` | 99 · 1.9 s | 100 · 2.45 s |
| `/electronics` | 95 · 2.0 s | 99 · 2.38 s |
| `/invest` | 98 · 2.1 s | 99 · 2.08 s |
| `/academy` | 99 · 2.1 s | 99 · 1.99 s |

Scores are equal or better on five of six routes and CLS is unchanged at
0.0005. The LCP column is not comparable across sessions on this sandbox —
Phase 10 documented a 95–99 band with TBT between 40 and 230 ms, and the
prerendered configuration measured 2.46–2.82 s on `/` earlier the same day the
per-request configuration measured 2.54 s. The only trustworthy comparison is
the interleaved A/B above, and it showed no difference.

Also re-run: **0 serious/critical axe-core violations** across six routes at
1440 and 390, and **no horizontal overflow** at 320, 375, 390, 430, 768, 1024,
1280 or 1440.

### Not done, and why

* **`security.txt` (A4)** — blocked on purpose. RFC 9116 requires a `Contact:`,
  and Markab publishes no security contact: `site.contacts.email` is `null`
  deliberately. Inventing an address would break the no-fabrication rule and
  route real reports into a void. Supply a monitored address and the file
  follows.
* **`next@16` / `postcss` (D1)** — still a semver-major migration, still
  deliberately separate from a security phase.
* **Anything needing an edge, a secret store or a log pipeline (A1–A3, B1–B3,
  E1–E3, E5, F1)** — environment work, specified in the doc.

## Phase 13 — Real API integration and production data strategy

**Status: built and exercised against a local stand-in API, not live.**
No Bearer token has ever been available and `api.markab.uz` is unreachable from
the sandbox, so no response from the real API has been read. Full detail —
including what must be confirmed before the switch is flipped — is in
[`docs/PHASE-13-API-INTEGRATION.md`](docs/PHASE-13-API-INTEGRATION.md).

### What changed

* **`lib/data/http/client.ts`** — the only place that calls `fetch`. Bearer
  auth, timeout, bounded jittered retries with `Retry-After`, status mapping,
  structured logging, and an SSRF boundary: the origin comes from
  configuration only (`ALLOWED_API_HOSTS`, https enforced).
* **`lib/data/http/validate.ts` / `mapping.ts`** — API payloads are treated as
  untrusted. Three outcomes per field: valid, unknown (`null`), or quarantined
  (record dropped, rule logged). Nothing is ever corrected — a battery health of
  256 % does not become 100 %, and a missing mileage does not become zero.
* **`httpProvider`** — no silent fixture fallback anywhere in it. If the API is
  unreachable, misconfigured or unreadable, the page shows the honest state.
* **Shared query semantics** — filtering, sorting, pagination, facets and search
  moved out of `mockProvider` into `lib/vehicles/applyQuery.ts`,
  `lib/products/applyQuery.ts`, `lib/vehicles/facets.ts`,
  `lib/products/facets.ts` and `lib/search/catalogue.ts`, so both providers
  behave identically.

### Verified

* **No fixture fallback in `http` mode** across six failure scenarios — missing
  token, host outside the allow-list, `http://` base URL, upstream 500, 429 and
  timeout. Every one: honest state, zero fixture records, and zero outbound
  requests for the two misconfiguration cases.
* **Mock mode unchanged**: the visible text of 11 routes is byte-identical
  between the pre-Phase-13 build and this one.
* **Client bundle**: 0 hits for the token, base URL, provider names or `Bearer`.
* **Data reuse**: routes still render per request (the nonce CSP requires it),
  while catalogue responses are reused for `MARKAB_API_REVALIDATE_SECONDS`
  (default 300). Measured: one crawl per render even when a page asks the
  repository for the list, the facets and the search index.
* Security gates re-run: `security:allowlists` 17/17, `security:headers` 22/22.

### Not done, and why

* **Not live.** Credentials and a reachable host are prerequisites; the response
  schema must be confirmed before `MARKAB_DATA_SOURCE=http` is enabled, or every
  record will be dropped and the UI will show the error state by design.
* **No endpoint probing, no auth work, no payments.** Only the two documented
  endpoints are called.
* **Editorial content has no endpoint** (Academy, FAQ, site content, investment,
  loyalty). In `http` mode those blocks return `unavailable` and render as
  honest gaps rather than silently serving fixture copy.
