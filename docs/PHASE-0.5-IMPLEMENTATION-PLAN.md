# MARKAB 2.0 — PHASE 0.5: IMPLEMENTATION PLAN
## Critical foundation & functionality fix — prepared, awaiting source code

**Status:** 🟡 **BLOCKED — awaiting the Markab frontend source in this repository.**

**Why:** The branch currently contains **only `README.md`**. The live site (markab.uz) is built from a codebase that is not present here, so no routing, data-layer or 500-error fix can be applied to production from this workspace. Per the user's decision, the real source will be pushed to this branch before implementation begins.

**Data decision (recorded):** 🟦 **STRUCTURE ONLY — NO DATA YET.** Every surface will be wired to a data adapter and will render proper Loading / Empty / NotFound / Error states. No fixtures, no invented values, no fabricated financial or legal content. Unavailable values render as an explicit *"pending integration"* state.

---

# 0. Intake checklist — the first thing I do when the source lands

I will not write a line of code until I have read these:

| # | What I inspect | Why it determines the fix |
|---|---|---|
| 1 | Framework + version (Next / Nuxt / Remix / Adonis+Inertia / Vite SPA / Django templates) | Where routing and 404s are defined |
| 2 | Router style (file-based vs explicit route table) | How `/*` catch-all and soft-404 are produced |
| 3 | Rendering mode (SSR / SSG / CSR) | Whether 404s return real HTTP status codes |
| 4 | Data layer (fetch client, SDK, ORM, server actions) | Where to insert the adapter + error boundaries |
| 5 | Auth mechanism (OTP/JWT/cookie/session) and how "current user" is resolved | Fixes `/profile` redirect |
| 6 | Styling system (Tailwind / CSS modules / UI kit / tokens) | Reusable state components match existing style |
| 7 | i18n approach (dictionary? hardcoded strings?) | Where the copy fixes and enum mapping go |
| 8 | Env/config handling (`process.env`, `.env`, runtime config) | API base URL + token wiring |
| 9 | Existing error boundaries / error pages / loading patterns | What to reuse instead of rewrite |
| 10 | Build & deploy pipeline | How `robots.txt` / `sitemap.xml` are served |
| 11 | Existing tests & linting | Where the verification matrix gets encoded |

**Hard rule:** reuse existing architecture. No new framework. No rewrite of working code. No visual redesign, no animations, no AI, no dashboards, no calculators in this phase.

---

# 1. ROUTE DECISION TABLE (Priority 1)

Each currently-broken route is classified. **No route may silently render the homepage.**

| Route | Verdict | Target behaviour | HTTP status | Notes |
|---|---|---|---|---|
| `/invest` | **SHOULD EXIST** — core business pillar, currently a dead CTA | Real page: model explanation, term info, CTA. Financing returns/rates rendered only from API; otherwise an explicit *pending* block | 200 | Highest-value fix. Do **not** invent returns, minimums or risk text |
| `/about` | **SHOULD EXIST** — trust-critical | Company/office/team structure; legal entity block rendered from a **flagged** constants file (see LEGAL-TRUST-REGISTER) | 200 | No invented company facts |
| `/contact` | **SHOULD EXIST** | Page with the officially published office data: *Toshkent shahri, Kukcha Aryk, Yunusobod tumani* · *Dush–Juma 9:00–18:00* + map + form | 200 | Preserve existing official info verbatim; do not add unconfirmed phone numbers |
| `/faq` | **SHOULD EXIST** | Page reusing the 5 existing homepage questions (approval time, documents, delivery, early repayment, investor withdrawals) | 200 | Answers render from CMS/API when available, else marked pending — not invented |
| `/education` | **SHOULD EXIST** | Library index reusing the 3 existing lesson titles (*Ishlatilgan avtomobil tanlash*, *To'lov rejangizni tushunish*, *Sarmoyadorlar uchun asoslar*, 5–10 min) | 200 | Lesson detail only if content exists |
| `/cart` | **SHOULD EXIST** — electronics has an active "Savatchaga" action | Cart page with a proper **empty-cart** state | 200 | Read from cart store/API; no fake line items |
| `/register` | **DECISION NEEDED** — login is phone+OTP (passwordless), so registration is the same flow | **Recommended default:** permanent redirect → `/login`. Alternative: keep `/register` as an alias rendering the identical OTP screen with canonical → `/login` | **308** (or 301) | Flagged for human confirmation; default redirect is reversible |
| `/profile` | **SHOULD EXIST** — authenticated dashboard | **Unauthenticated:** redirect → `/login?next=/profile` (never home). **Authenticated:** structural dashboard shell (*Mening Markabim*) with sections for contracts / payments / applications / bonus, each showing *pending integration* until data exists | 200 / **302** to login | No fake account data |
| `/*` unknown | **MUST NOT** fall back to home | Custom branded 404 page | **404** | See §5 |

**Implementation notes**
* Add an explicit catch-all/last-match route that returns **status 404** — verify the status code in the response header, not just the rendered page.
* Every internal link must be a real `<a href>` (the rendered HTML currently exposes no navigational links — a crawlability defect).
* Canonical URLs: alias routes (`/register`) declare `rel=canonical` to their target.

---

# 2. TERMS PAGE (Priority 2)

| Step | Action |
|---|---|
| 2.1 | Locate the terms source: DB record / CMS entry / static file / API endpoint. **Preserve existing legal text exactly — no rewriting, no summarising.** |
| 2.2 | Identify why `/terms` returns *“Hujjatni yuklashda xatolik yuz berdi”* — likely a failed fetch that throws instead of rendering an error state (same root cause as the intermittent 500s). |
| 2.3 | Wrap the fetch in the shared Error/Loading/NotFound contract (§4). The page must never render a raw exception. |
| 2.4 | If the content genuinely does not exist: render the document **structure** (title, version, last-updated, sectioned body) with each missing section marked `<!-- LEGAL-CONTENT-PENDING -->` and a visible, non-public-facing-safe notice for editors — **never** placeholder legal wording shown to users as if it were real. |
| 2.5 | Fix every link that points at `/terms` (currently the `/login` consent line: *“Davom etish orqali siz Foydalanish shartlari va Maxfiylik siyosati ga rozilik bildirasiz”*). Add a link-integrity check so no consent text can point at a page that fails to load. |
| 2.6 | Add `/privacy` to the same integrity check (currently working — must stay working). |

**Guardrail:** no invented legal text. Missing legal content is *marked*, not filled.

---

# 3. ELECTRONICS PRODUCT PAGES (Priority 3)

Current state: `/electronics/{id}` resolves but every ID tested (`1, 3, 10, 25, 100, 1000`) returns *“Ma'lumotlar topilmadi.”*; ID `2` returned HTTP 500. The listing shows 42 products — so the **listing ID and the detail ID are evidently different identifiers** (or the detail query is broken).

| Step | Action |
|---|---|
| 3.1 | Read the listing data layer and record the **exact primary key** each card uses for its "Batafsil" link. Compare with what the detail route queries. Fix the mismatch at the source. |
| 3.2 | Make the detail route **slug-tolerant**: accept `{id}` or `{slug}`, resolve via the correct field. |
| 3.3 | Missing record → render the shared **NotFound** state (§4), HTTP **404**, with related products — **never** a 500, never fabricated specs. |
| 3.4 | Detail template supports: image(s) · name · price · specifications · availability/status · financing info (only if the API returns it) · CTA · related products. |
| 3.5 | Empty/unknown spec fields render as *“Ma'lumot kiritilmagan”* — not invented values, not hidden gaps. |
| 3.6 | Add a crawl test: for every product returned by the listing, assert its detail URL returns 200 (see §7). |

---

# 4. HOMEPAGE PRODUCT DATA (Priority 4)

Current state: *“Hozircha avtomobillar mavjud emas”* and *“Hozircha mahsulotlar mavjud emas”* while `/cars` (20) and `/electronics` (42) have inventory.

| Step | Action |
|---|---|
| 4.1 | Find the homepage featured query. Likely causes: `is_featured` flag never set on any record, or a different endpoint than the listing uses. |
| 4.2 | Implement a **fallback chain** so the module is never empty when inventory exists: `featured → newest → highest-viewed`. |
| 4.3 | Homepage consumption must go through the **same adapter** as the listing pages — one source of truth, no duplicate query logic. |
| 4.4 | With no API token yet (per the data decision), the module renders the shared **Empty** state with an honest message — **not** demo products, **not** hardcoded items. |
| 4.5 | If fixtures are ever enabled later, they live behind an explicit env flag (`MARKAB_DATA_SOURCE=fixtures`), are labelled in the UI, and are never shipped to production. |

---

# 5. AUTOMOBILE FINANCING BLOCK (Priority 5)

Current state: car PDPs render a *“Muddatli to'lov”* heading with **no content**, while listing cards for the same vehicles show monthly figures (e.g. Cobalt 3,989,250 so'm/oy; BMW i3 15,795,000 so'm/oy).

| Step | Action |
|---|---|
| 5.1 | Locate the financing fields in the API/schema (`down_payment`, `term_months`, `monthly_payment`, `total_amount`, `markup`). |
| 5.2 | Build the block **structure**: product price · initial payment · term · monthly payment · CTA (Ariza qoldirish). |
| 5.3 | **If the API provides values → render them.** **If not → render the structure with an explicit pending-integration marker.** Never compute or display a fabricated figure. |
| 5.4 | The CTA is always present and never implies approval or a specific rate. |
| 5.5 | No formula, no estimation logic, no "typical example" numbers in this phase (that is Phase 2's calculator). |

---

# 6. PROFILE ROUTING (Priority 6)

```
Unauthenticated  /profile  →  302/307  →  /login?next=/profile     (never the homepage)
Authenticated    /profile  →  200      →  dashboard shell
```

Dashboard shell sections (structure only, each with a *pending integration* state):
`Shartnomalar` · `To'lov jadvali` · `Arizalar` · `Bonus ballari` · `Hujjatlar` · `Sozlamalar`.

No mock user name, no fake contract numbers, no invented balances.

---

# 7. ERROR HANDLING (Priority 7)

**Root-cause work:** find why missing records and document fetches throw 500s instead of 404s/empty states (observed on `/terms`, `/electronics/2`, `/cars/1`, `/cars/{uuid}`).

| Area | Required behaviour |
|---|---|
| API/data fetch | Timeout + retry policy; typed `Result` (success / notFound / error); never throw raw exceptions to the render layer |
| Dynamic routes | Missing record → **404** state, never 500 |
| Invalid IDs | Validation before query; reject malformed IDs gracefully (`/car/1` already has a dedicated message — keep it, polish the copy) |
| Legal pages | Failure to load → **Error** state with retry; never a blank screen, never a stack trace |
| Users | **No raw technical errors, ever.** Log server-side with a correlation ID; show friendly copy + retry |

Deliverable: a single shared error-handling module + the five reusable state components (§8).

---

# 8. REUSABLE STATE COMPONENTS (Priority 14)

One contract, five states, Uzbek copy baked in. Built with the project's **existing** styling system.

| State | When | Required content | Uzbek copy (proposed) |
|---|---|---|---|
| **Loading** | Data in flight | Skeleton matching the real layout (never a blank section) | — (skeleton, `aria-busy="true"`) |
| **Empty** | Request succeeded, zero records | Illustration/icon + message + one action | *“Hozircha mahsulotlar mavjud emas”* + CTA *“Barcha mahsulotlarni ko'rish”* |
| **NotFound** | Specific record missing | Message + search + links + back CTA | *“Bu sahifa topilmadi.”* / product: *“Mahsulot topilmadi.”* |
| **Error** | Request failed (5xx, network, timeout) | Friendly message + **Qayta urinish** button + support link | *“Nimadir xato ketdi. Iltimos, qaytadan urinib ko'ring.”* |
| **Success** | Data present | Normal render | — |

Rules: `role="status"` / `role="alert"` + `aria-live` on async states · consistent spacing via existing tokens · no raw error text · every state offers a next action · components accept `title`, `description`, `action`, `secondaryAction`, `children`.

---

# 9. DATA QUALITY (Priority 8) — see `DATA-QUALITY-REGISTER.md`

Fix only what is provably wrong from existing source data. Everything else is **flagged for official correction**, never silently replaced.
Typical fixes: enum→Uzbek label mapping (`petrol → Benzin`), number formatting, empty-state copy, and **quarantining** records that fail minimum publish standards (e.g. the `1 so'm` vehicle whose detail page 404s).

---

# 10. LANGUAGE QUALITY (Priority 9) — see `UZ-COPY-FIXES.md`

Typos, untranslated values and inconsistent terminology are fixed. **Financial and legal wording is not touched** without a verified source.

---

# 11. LEGAL / TRUST + PRIVACY CONSISTENCY (Priorities 10–11) — see `LEGAL-TRUST-REGISTER.md`

**Rule: I do not decide which entity, address or privacy statement is correct.** All conflicting values are preserved and marked in code with `// TODO(legal-verify): conflicting sources — see docs/LEGAL-TRUST-REGISTER.md`, and surfaced in a single constants module so one edit fixes every surface. The UI must not add new trust/privacy claims.

---

# 12. SEO FOUNDATION (Priority 12)

| Item | Implementation |
|---|---|
| `robots.txt` | Real file (currently empty). Allow crawling of public pages; disallow account/API paths; reference the sitemap |
| `sitemap.xml` | Generated from the route table; product/vehicle URLs included **only when data is available** (with `lastmod`) |
| Metadata | Per-route `title` + `description`; existing good titles preserved (`Avtomobillar — muddatli to'lovga — Markab`) |
| Canonical | Self-referencing canonical on every page; aliases point to their target |
| Open Graph | `og:title`, `og:description`, `og:type`, `og:image`, `og:url`, `og:locale` (+ `twitter:*`) |
| Headings | Exactly one `h1` per page; no skipped levels; section headings match IA |
| Semantic HTML | `header` / `nav` / `main` / `section` / `article` / `footer`; real `<a href>` for all navigation |
| Product metadata | PDP metadata from real fields only |
| **Thin content** | Pages still waiting for real content (`/invest`, `/about`, `/education` before content lands) get `noindex, follow` until populated — protects crawl budget and avoids indexing empty shells |

UX is preserved: no keyword stuffing, no hidden text, no doorway pages.

---

# 13. CUSTOM 404 (Priority 13)

**“Bu sahifa topilmadi.”** — branded, intentional, HTTP **404**, containing:
short explanation · search field · quick links (**Bosh sahifa · Avtomobillar · Elektronika · Moliyalashtirish · Investitsiya · Yordam**) · back-to-home CTA · optional popular inventory (from the adapter; empty → omit the block).
Same layout/header/footer as the rest of the site, so it feels designed, not abandoned.

---

# 14. VERIFICATION MATRIX (to be executed against the real code)

| # | Test | Expected |
|---|---|---|
| 1 | `/` | 200, modules render real data or an honest empty state — no fabricated items |
| 2 | `/cars` | 200, real inventory |
| 3 | `/car/{valid-slug}` | 200, gallery + specs + financing block (values or pending marker) |
| 4 | `/electronics` | 200, real inventory |
| 5 | `/electronics/{valid-id}` | 200, full product detail |
| 6 | `/terms` | 200, loads; no error text |
| 7 | `/login` | 200, OTP screen; Terms + Privacy links resolve 200 |
| 8 | `/profile` unauthenticated | 302 → `/login?next=/profile` (**not** home) |
| 9 | `/profile` authenticated | 200, dashboard shell |
| 10 | `/invest` | 200, real page (not home) |
| 11 | `/about` | 200, real page |
| 12 | `/contact` | 200, real page with official office data |
| 13 | `/faq` | 200, real page |
| 14 | `/education` | 200, real page |
| 15 | `/cart` | 200, cart or empty-cart state |
| 16 | `/register` | 308/301 → `/login` (per confirmed decision) |
| 17 | Invalid vehicle URL (`/car/does-not-exist`, `/car/1`) | 404 + NotFound state, no 500 |
| 18 | Invalid electronics ID | 404 + NotFound state, no 500 |
| 19 | Completely unknown route | **404 status** + branded 404 page |
| 20 | Network/API failure | Error state + retry; no stack trace; page still renders |
| 21 | Empty result set | Empty state with CTA; no blank section |
| 22 | Slow response | Skeleton/loading state, no layout shift |
| 23 | Status-code audit | `curl -I` on every route above returns the correct code |
| 24 | Responsive check | 360 / 768 / 1280 widths — no overflow, no broken grids |
| 25 | Regression sweep | `/cars`, `/car/{slug}`, `/electronics`, `/login`, `/privacy`, `/sell`, `/loyalty`, `/news` still behave as before |

---

# 15. GUARDRAILS FOR THIS PHASE

**Do:** fix routing · fix status codes · fix broken pages · build state components · wire the data adapter · quarantine corrupt records · fix typos/untranslated values · add SEO foundation · preserve all existing legal text · flag every conflict for humans.

**Do not:** invent data, prices, specs, stock, financing values, financial formulas, legal text, certifications, or reviews · decide the correct legal entity/address · redesign anything visually · add animations · build calculators, dashboards, AI, loyalty or academy features · introduce a new framework · break working functionality.

---

# 16. RISKS

| Risk | Mitigation |
|---|---|
| Live-site fixes depend entirely on the source landing here | Blocking item — implementation starts on arrival |
| API is token-protected (401) and rate-limited (429 observed) | Adapter defaults to `none`; structure-only states; retry/backoff when a token is supplied |
| 500s may originate in the backend, not the frontend | Graceful degradation: a failing upstream renders an Error state, never a 500 page — while the backend fix is tracked separately |
| Some "empty" pages may be intentional (business not launched) | Confirmed pages get real structure; unconfirmed ones get `noindex` + a pending marker |
| Legal conflicts cannot be resolved by engineering | Preserved + flagged in one constants module; one edit fixes all surfaces after human verification |
| Redirect choice for `/register` is a product decision | Implemented as a reversible 308; flagged for confirmation |
