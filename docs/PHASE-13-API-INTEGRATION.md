# Phase 13 — Real API integration and production data strategy

**Status: built, exercised against a local stand-in, NOT live against api.markab.uz.**

Read the first line again before you read anything else in this document.

* No Bearer token has ever been available in this environment.
* `api.markab.uz` is not reachable from the sandbox that produced this work
  (every connection attempt fails before TLS).
* Therefore **no response from the real API has ever been read**, and the
  response schema remains unconfirmed — the same state recorded in
  `docs/API-CONTRACT.md` §3 before this phase began.

What Phase 13 delivers is the *integration*, proved against a local server
that speaks the shape DRF would speak: authentication, pagination, timeouts,
retries, validation, quarantine, honest failure states and a data-caching
strategy, all behind the existing `UI → Repository → Adapter → Provider`
architecture. Switching `MARKAB_DATA_SOURCE` to `http` in production is now a
configuration change plus one schema confirmation — not a code project.

---

## 1. The honest headline

| Question | Answer |
|---|---|
| Is real API data active? | **No.** No credentials exist in this environment. |
| Is the integration code complete and testable? | **Yes**, and it is exercised end to end against a local stand-in API. |
| Would it work against the real API today? | **Unknown, and it must not be switched on until the schema is confirmed.** Field names are inferred (§4). |
| Does `http` mode ever serve fixture data? | **Never.** Verified across six failure scenarios (§9). |
| Is the token exposed to browsers? | **No.** Verified by scanning the built client bundle (§5). |

---

## 2. What was actually verified, and how

The sandbox cannot reach `api.markab.uz`, so "it works" was not available as a
claim. Instead the HTTP path was exercised against a local HTTPS stand-in
(`/tmp/apimock/server.mjs`, outside the repository, never committed) that
reproduces what `docs/API-CONTRACT.md` has confirmed about the real API:
Bearer authentication with the same 401 body and
`WWW-Authenticate: Bearer realm="api"`, a DRF `{count, next, previous, results}`
envelope, and twelve records per page.

The stand-in deliberately includes the corruption classes already documented in
`docs/DATA-QUALITY-REGISTER.md`, so the safety rules are tested against the
records that motivated them rather than against invented examples.

### 2.1 Verified behaviours

| Behaviour | Result |
|---|---|
| Bearer token sent on every request; 401 without it | 401 returned by the stand-in; provider maps it to `unavailable` |
| Multi-page crawl | 15 records across two pages → both fetched, then filtered in memory |
| Pagination bug found and fixed | `new URL('vehicles/', '…/api/v1')` silently dropped `/v1` → every call 404'd. Fixed in `buildUrl` (§3.2) |
| Quarantine: vehicle at `1 so'm` (V-1 class) | Dropped, rule `VEHICLE_PRICE_FLOOR`, logged |
| Quarantine: year 2050 | Dropped, rule `VEHICLE_YEAR_RANGE` |
| Quarantine: iPhone "100 GB" / 256 % battery (E-1 class) | Dropped, rule `PRODUCT_STORAGE_IMPOSSIBLE` |
| Not published without a photograph (vehicles **and** products) | Dropped as unusable, not rendered as an empty frame |
| Unknown fuel type (`Hydrogen`) | Dropped — **not** rendered as "petrol" |
| Missing mileage | Dropped — **not** rendered as `0 km` |
| HTTP and off-host image URLs | Rejected by the existing image allow-list |
| Unrecognised stock value (`mavjud` → `in_stock`) | Mapped from the published Uzbek vocabulary |
| Unknown stock value | `unknown`, never `in_stock` |
| Search, facets, filters, sorting, featured strip | Identical semantics to mock mode (§6) |
| True 404 | `/cars/vehicle-9999` → 404; a quarantined product → 404 |
| No quarantine vocabulary in HTML | 0 matches for rule names in served pages |

### 2.2 Failure scenarios (no fixture fallback in any of them)

| Scenario | Visitor sees | Upstream requests | Fixture data on page |
|---|---|---|---|
| `http` mode, no token | "Avtomobillar ro'yxatini olishda xatolik yuz berdi. Iltimos, sahifani yangilab ko'ring." | **0** | 0 |
| Base URL on a host outside the allow-list | same error state | **0** | 0 |
| Base URL using `http://` | same error state | **0** | 0 |
| Upstream returns 500 | "Ma'lumotlar vaqtincha mavjud emas / Katalog ulanmaguncha bu bo'lim bo'sh turadi." | retried once, then `unavailable` | 0 |
| Upstream returns 429 | same unavailable state | `Retry-After` honoured, then `unavailable` | 0 |
| Upstream hangs past the timeout | same unavailable state | aborted at the timeout, retried, then `unavailable` | 0 |

In every scenario `/cars` returned HTTP 200 with zero vehicle cards and zero
fixture slugs. A failed catalogue looks like a failed catalogue.

### 2.3 What the render actually contains in http mode

With the stand-in, `/cars` published 9 of 15 records (4 unusable, 2
quarantined), `/electronics` published 4 of 6 (1 unusable: no usable
photograph; 1 quarantined: the E-1 iPhone), the homepage showed 3 + 3
featured items, search returned 2 Chevrolet matches, detail pages rendered, and
`/electronics/e-2004` — the quarantined iPhone — returned 404 rather than a
"corrected" listing. Server logs carried the rule ids; the HTML carried none.

---

## 3. Architecture: what changed and what did not

### 3.1 Unchanged by design

```
UI (server components) → lib/data/index.ts (repository)
                       → DataAdapter (lib/data/adapter.ts)
                       → mockProvider | httpProvider
                       → lib/data/http/client.ts → api.markab.uz
```

No page, component or route handler calls the API. No component imports the
HTTP client. The repository remains the only door, and `import 'server-only'`
in `lib/data/index.ts` still turns any client-side import into a build error.

### 3.2 New files

| File | Role |
|---|---|
| `lib/data/http/client.ts` | The only place that performs `fetch`. Timeout, bounded retries, `Retry-After`, status mapping, structured logs, SSRF boundary. |
| `lib/data/http/mapping.ts` | DTO → domain mapping. The single place to edit when the schema is confirmed. |
| `lib/data/http/validate.ts` | Untrusted-input validation and the quarantine rules. |
| `lib/data/paginate.ts` | Pagination shared by both providers. |
| `lib/vehicles/applyQuery.ts` | Filter/sort semantics shared by both providers. |
| `lib/products/applyQuery.ts` | Same, for electronics. |
| `lib/vehicles/facets.ts`, `lib/products/facets.ts` | Facet derivation shared by both providers. |
| `lib/search/catalogue.ts` | Search ranking shared by both providers. |

### 3.3 Refactor: one semantic per concern, shared by both providers

Filtering, sorting, pagination, facet derivation and search used to live inside
`mockProvider.ts`. They were moved into the shared modules above so the HTTP
provider cannot drift into different behaviour. `mockProvider` now calls the
same functions.

**Regression proof.** Two builds were rendered side by side — commit `d2a102b`
(the pre-Phase-13 state) on port 3100 and the Phase 13 working tree on port
3000 — and the visible text of 11 routes was compared after stripping scripts,
styles and tags:

```
IDENTICAL  home  cars  cars-filtered  car-detail  electronics
IDENTICAL  product-detail  search  academy  faq  invest  loyalty
```

All 11 routes byte-identical. The refactor is behaviour-preserving in mock
mode.

---

## 4. The schema problem (read this before switching anything on)

`docs/API-CONTRACT.md` §3 states that the field names in use were **inferred
from rendered UI labels and never confirmed against the API**. That has not
changed, because no token has been available to confirm them with.

`lib/data/http/mapping.ts` therefore treats the schema as untrusted input:

* every read is defensive and typed;
* a record missing anything the listing card displays is **dropped**, not
  filled in;
* a record with an impossible value is **quarantined**, not corrected;
* unknown extra fields are ignored;
* image fields are read tolerantly — an array of URL strings **or** an array of
  objects carrying a `url` / `image` key, which is what a nested DRF serializer
  typically emits. This is shape tolerance, not invention: if neither shape is
  present the record is simply not published.

There is one consequence that matters operationally and is handled explicitly:
if the real API's field names differ from `FIELDS`, **every** record will be
dropped, and the UI will show the *error* state — not an empty catalogue.

That distinction is deliberate. Reporting "we could not read the catalogue" is
true; reporting "Markab has no cars" would be a lie told by a bug. The server
logs the event as `unmappable` with the record count, so the failure is
immediately diagnosable.

**Before `MARKAB_DATA_SOURCE=http` is enabled in production, Markab must supply
one of:** an OpenAPI/Swagger export, a documented field list, or a single
authenticated sample response per endpoint. Then `FIELDS` is edited and
`SCHEMA.confirmed` is flipped to `true` — a one-file change.

### 4.1 Why filtering happens in memory (and when it should stop)

Django REST Framework ignores unrecognised query parameters by default. So
sending a guessed `brand=chevrolet` would not error — it would return the
unfiltered page while looking like it worked. A wrong page that looks correct
is worse than a slower one.

Filtering, sorting and pagination therefore run over the records actually
fetched, using the same functions mock mode uses. Filtering stops early when a
short page comes back, and the crawl is capped at 20 pages (240 records) so a
misbehaving `count` cannot turn a page render into an unbounded crawl.

The seam is `listVehicles` / `listProducts` in `lib/data/httpProvider.ts`. When
the filter and pagination parameters are confirmed, push them down to the API
and delete the in-memory pass.

---

## 5. Credential handling and SSRF

**The token lives only in `lib/env/server.ts`, behind `import 'server-only'`,
and is read only inside `lib/data/http/client.ts`.**

* Never in `NEXT_PUBLIC_*`.
* Never in a client component, a prop, `localStorage`, `sessionStorage`, or an
  HTML attribute.
* Never in a log line. The client logs path, status, duration and byte count —
  never the URL, never headers, never the token.
* Never in a URL. The origin comes from configuration; only the path and query
  are built at runtime.

### SSRF boundary

`ALLOWED_API_HOSTS = ['api.markab.uz']` is fixed in code. `apiConfig()` refuses
any base URL that is not `https` and not on that list, and returns a reason
(`disabled` / `missing_token` / `untrusted_base_url`) instead of throwing, so a
misconfiguration becomes an honest UI state rather than a crash. No request
parameter, header or cookie can influence the origin — verified: pointing the
base URL at another host produced **zero** outbound requests.

### Client-bundle scan

After a production build in `http` mode, `.next/static` was scanned for
`MARKAB_API_TOKEN`, `MARKAB_API_BASE_URL`, `MARKAB_DATA_SOURCE`, `httpProvider`,
`mockProvider`, `api.markab.uz/api` and `Bearer`. **0 hits.**

---

## 6. Data quality: validation and quarantine

Three outcomes, never two:

| Outcome | Meaning | Example |
|---|---|---|
| valid | used as-is | `price: 139_725_000` |
| unknown | `null`, renders as "not specified" | `storageGb: null` |
| quarantined | record dropped from every listing, logged with a rule id | `battery_health: 256` |

Nothing is corrected. A battery health of 256 % does not become 100 %; a price
of `1 so'm` is not "fixed"; a missing mileage is not zero. This is the policy
`docs/DATA-QUALITY-REGISTER.md` already established for fixtures, applied to
live data.

### Rules implemented

| Rule | Field | Behaviour |
|---|---|---|
| `VEHICLE_PRICE_FLOOR` / `_CEILING` / `_NON_POSITIVE` | `price` | quarantine |
| `PRODUCT_PRICE_FLOOR` / `_CEILING` / `_NON_POSITIVE` | `price` | quarantine |
| `VEHICLE_YEAR_RANGE` | `year` | outside 1900 … current + 2 → quarantine |
| `VEHICLE_MILEAGE_NEGATIVE` / `_IMPLAUSIBLE` | `mileage_km` | quarantine |
| `PRODUCT_STORAGE_IMPOSSIBLE` | `storage` | value outside real capacities (E-1) → quarantine |
| `PRODUCT_BATTERY_RANGE` | `battery_health` | outside 0–100 (E-1) → quarantine |
| no usable image | `images` | dropped as unusable |
| unknown fuel type / transmission | enums | dropped — never defaulted |
| missing year / mileage | — | dropped — never defaulted |

Two deliberate thresholds deserve their own note. The price floors
(1 000 000 so'm for vehicles, 10 000 for electronics) are **not pricing
policy**: they are set far below any real listing so they catch only the
corruption class already on the register, and they never adjust a value.

### Stock safety

`mapStockStatus` maps the published vocabulary (including the Uzbek `mavjud` /
`qolmadi`) and returns `unknown` for anything else. `unknown` is never
promoted to `in_stock`.

### Financing and investment conservatism

The domain `Financing` object produced by the HTTP provider is **always the
null object**. No monthly payment is computed from a price, no term is
inferred, and a partial financing payload is not turned into a number — the
existence of a field does not establish its contractual meaning. The same
applies to investment: no returns, guarantees, eligibility or AAOIFI claims are
derived from catalogue data.

---

## 7. Per-route rendering strategy (measured, not assumed)

| Route group | Rendering | Why |
|---|---|---|
| All document routes (`/`, `/cars`, `/cars/[slug]`, `/electronics`, `/electronics/[id]`, `/search`, `/invest`, …) | **dynamic, per request** | Unchanged from Phase 12: the nonce-based CSP requires a render to stamp the nonce. Re-measured in Phase 12 §C1 with an interleaved A/B — no systematic difference against prerendering. |
| `/robots.txt`, `/sitemap.xml` | static at build | No request-scoped input. |
| **Catalogue data** | **300 s reuse window per resource** (`MARKAB_API_REVALIDATE_SECONDS`) | The only cache in the path. Pages still render per request; the fetch does not. |

Measured on `/cars` against the local stand-in (5 renders per configuration):

| `MARKAB_API_REVALIDATE_SECONDS` | Upstream fetches in the window | Steady-state fetch duration |
|---|---|---|
| `0` (no reuse) | every render | 2 – 41 ms (round trip each time) |
| `300` (default) | first render only | 0 – 1 ms (served from cache) |

Per render, `/cars` performs **two** upstream GETs (the two pages of the
vehicle listing) even though it asks the repository for the list, the facets and
the search index. That is the effect of `cache()` around the collection loader:
one crawl per request, shared by every block on the page.

**These numbers are not production-representative.** The stand-in is on
localhost; the real API adds internet latency that the 300 s window is
specifically there to amortise. What the measurement establishes is the shape
of the behaviour — dedupe within a render, reuse across renders, and no
multiplication of upstream traffic by the number of blocks on a page — not the
absolute milliseconds.

---

## 8. What is not served by the API, and what that looks like

Markab documents no endpoint for Academy lessons, FAQ, site content, the
investment profile or the loyalty programme. The HTTP provider returns
`unavailable` for all of them rather than reaching for fixtures.

In `http` mode those blocks render as honest gaps:

* `/academy` — "Darslar yuklanmadi. Academy ma'lumotlari Markab tomonidan
  to'ldiriladi."
* `/faq` — "Hozircha savol-javoblar mavjud emas. Katalog ulangandan so'ng
  savollar shu yerda ko'rsatiladi."
* `/invest` — "Sarmoya profili ma'lumot manbasidan olinmadi."
* `/loyalty` — "Rasmiy dastur tafsilotlari kutilmoqda."
* `/profile` — unchanged: `unavailable` in both providers, by design.

Every consumer already guards on `status === 'success'`, so a missing content
source is a gap on the page — never a crash and never invented copy. If Markab
prefers to serve editorial content from a separate content provider while the
catalogue comes from the API, that is a new adapter behind the same interface,
not a fallback inside this one.

---

## 9. Production rollout checklist

1. Obtain an **OpenAPI export or documented field list** (§4). Update `FIELDS`
   in `lib/data/http/mapping.ts`; set `SCHEMA.confirmed = true`.
2. Confirm the **pagination envelope** (`{count, results}` vs array) and the
   page-size parameter, then move filtering server-side (§4.1) if the
   catalogue outgrows a single crawl.
3. Confirm the **detail endpoints**. Until then, `/cars/[slug]` and
   `/electronics/[id]` are resolved from the fetched listing, which is correct
   but does not scale past the page cap.
4. Put the token in the platform secret store as `MARKAB_API_TOKEN`. Never in a
   file that is committed, never in `NEXT_PUBLIC_*`.
5. Set `MARKAB_DATA_SOURCE=http` **in one environment first**, and watch the
   server log for `api.records.dropped` and `unmappable` before promoting it.
6. Keep `MARKAB_API_REVALIDATE_SECONDS` at the default 300. Raise it for a
   catalogue that changes slowly; set 0 only for debugging.
7. Confirm the **media host** is publicly readable. `docs/API-CONTRACT.md`
   marks the `/media/...` paths as *assumed public — verify*; production image
   optimisation depends on that assumption.

Environment variables (all optional except the token in `http` mode):

| Variable | Default | Purpose |
|---|---|---|
| `MARKAB_DATA_SOURCE` | `mock` | `mock` or `http`. |
| `MARKAB_API_BASE_URL` | `https://api.markab.uz/api/v1` | Must be https on an allow-listed host. |
| `MARKAB_API_TOKEN` | *(empty)* | Bearer token. Without it, `http` mode refuses to call the API. |
| `MARKAB_API_TIMEOUT_MS` | `8000` | Per-attempt timeout (clamped 1000–30000). |
| `MARKAB_API_MAX_RETRIES` | `1` | Extra attempts after the first (clamped 0–3). 4xx and 401/403 are never retried. |
| `MARKAB_API_RETRY_BASE_MS` | `400` | Base backoff, jittered (clamped 100–5000). `Retry-After` wins when present. |
| `MARKAB_API_REVALIDATE_SECONDS` | `300` | Reuse window for successful responses (clamped 0–3600). |

---

## 10. Explicitly not done

* **Not live.** No credentials, no reachable host, no confirmed schema.
* **No payments, checkout, cart submission, fake auth or OTP.** Auth remains out
  of scope; `/login` and `/profile` remain prototype.
* **No endpoint probing.** Only the two documented endpoints are called. No
  guessed paths, no guessed POST endpoints, no brute force, no credential
  discovery.
* **No customer data is submitted** to any endpoint.
* **No Phase 14 work** was started.
* **No UI redesign.** Every change here is server-side. The visible-text diff
  across 11 routes is empty (§3.3).

---

## 11. Verification log

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` (mock) | clean |
| `npm run build` (`http`, unreachable API) | clean; sitemap degrades to static routes, no fabricated URLs |
| Visible text, 11 routes, pre-Phase-13 build vs Phase 13 | identical |
| HTTP path against local stand-in | 9/15 vehicles, 4/6 products published; 8 drops by design |
| Failure scenarios (6) | honest states, 0 fixture records, 0 requests to untrusted hosts |
| True 404 | `/cars/vehicle-9999` → 404; quarantined product → 404 |
| Client-bundle secret scan | 0 hits |
| `npm run security:allowlists` | 17/17 (the three new HTTP files are asserted server-only) |
| `npm run security:headers` | 22/22 (production and preview mode) |
| Quarantine vocabulary in served HTML | 0 matches |
