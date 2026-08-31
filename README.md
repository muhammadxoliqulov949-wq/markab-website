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
