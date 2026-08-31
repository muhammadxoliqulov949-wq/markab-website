# markab-website

## Phase status

| Phase | Deliverable | Status |
|---|---|---|
| **0** | Deep website audit | ✅ Complete — [`docs/MARKAB-2.0-PHASE-0-AUDIT.md`](docs/MARKAB-2.0-PHASE-0-AUDIT.md) |
| **0.5** | Critical foundation (adapter, real 404s, routes, states) | ✅ Complete — built from scratch in this repo as the Markab 2.0 prototype |
| **1** | Homepage redesign | ✅ Implemented — awaiting stakeholder visual sign-off |
| **2** | Automobile marketplace experience (`/cars`, `/cars/[slug]`) | ✅ Implemented — awaiting stakeholder visual sign-off |
| **3** | Electronics marketplace + cart foundation (`/electronics`, `/electronics/[id]`, `/cart`) | ✅ Implemented — awaiting stakeholder visual sign-off |

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
source of truth the card, the detail page and the cart all read. Only
`out_of_stock` is unavailable — a sold-out product's add-to-cart button is
disabled and stays disabled in the sticky bar. `unknown` means the source
published nothing; it is never rendered as "Mavjud", and the pending marker says
the availability is confirmed after the application.

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
