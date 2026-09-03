# REAL API INTEGRATION — production data strategy

**Status:** 🟨 **PREPARED BUT BLOCKED** in this environment.
The HTTP provider code path is wired (endpoints, auth, validation, error
mapping, timeouts, retries, quarantine, per-request adapter resolution,
dynamic sitemap). Authenticated verification against the live
`https://api.markab.uz/api/v1/` could not be completed in this sandbox:

  * **TLS to `api.markab.uz:443` fails from this sandbox**
    (`curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL`) — a sandbox
    egress restriction, not evidence of an API outage.
  * **No `MARKAB_API_TOKEN`** is configured in the environment.

Both items must be supplied by operations before HTTP mode can serve real
catalogue data. Until then, `MARKAB_DATA_SOURCE=http` will serve the
existing explicit `unavailable` states — it never falls back to fixtures.

---

## 1. Connected endpoints (from verified facts only)

Everything in `docs/API-CONTRACT.md` that was confirmed by public reconnaissance
is wired. No endpoint paths were guessed beyond the two catalogue roots.

| Surface | Method | Path | Status |
|---|---|---|---|
| Vehicle listing   | GET | `/vehicles/` | Wired. DRF `{count, results}` pagination with page_size; falls back to bare array. |
| Vehicle detail    | GET | `/vehicles/{slug}/` | Wired. Returns `not_found` on 404 and on publish-quality failure. |
| Vehicle facets    | GET | `/vehicles/?page=1&page_size=50` | Derived from real records (no guesswork endpoint). |
| Product listing   | GET | `/products/` | Wired. DRF pagination accepted; bare array accepted. |
| Product detail    | GET | `/products/{id}/` | Wired. True 404. |
| Product facets    | GET | `/products/?page=1&page_size=50` | Derived from real records. |
| Featured          | GET | `/vehicles/?ordering=-views&page_size=6` + `/products/?ordering=-views&page_size=6` | Composed from the two verified listings (top 3 by views each). No fabricated `/featured/` guess. |
| Global search     | GET | `/vehicles/?search=…` + `/products/?search=…` | Composed from the two verified listings (no fabricated `/search/` guess). Hits are normalised into the existing `SearchHit` shape. |
| Academy / FAQ / Site content / Investment / Loyalty / Account | — | — | **Not connected.** No verified response schema exists; every method returns `unavailable` (existing pending-integration UX). Financing and investment fields remain nullable/absent until a verified contract arrives. |

When an official OpenAPI/schema export (e.g. `drf-spectacular` or `drf-yasg`)
or a read-only token is supplied, extending `httpProvider.ts` is a mechanical
mapping exercise — no UI or repository change is required.

---

## 2. Authentication boundary

```
Browser ──► Next.js server (React Server Components, middleware)
               │
               │  server-only, Authorization header added here
               ▼
            https://api.markab.uz/api/v1/   (Bearer token)
```

* **Token source:** `MARKAB_API_TOKEN`, read **only** through `lib/env/server.ts`.
* **Module boundary:** `lib/env/server.ts`, `lib/data/index.ts`, `lib/data/httpProvider.ts`,
  `lib/data/apiClient.ts` and `lib/data/dto.ts` all carry `import 'server-only'`.
  Any attempt to import them from a client component is a build-time error.
* **No exposure:** the token is never forwarded to the browser — no
  `NEXT_PUBLIC_*`, no React prop, no rendered HTML, no JSON payload, no query
  string, no `localStorage`, no client log.
* **Hard guard:** `httpProvider` refuses to fire any request when
  `MARKAB_API_TOKEN` is empty. A missing secret returns `unavailable`, never an
  unauthenticated 401 probe, never a silent fallback to fixtures.
* **No proxy endpoint:** there is no `/api/*` route that forwards browser
  requests to the Markab API. SSR fetches run in the server module graph only.

---

## 3. Environment configuration

| Variable | Default | Meaning |
|---|---|---|
| `MARKAB_DATA_SOURCE` | `mock` | `mock` (fixtures) or `http` (real API). `http` is opt-in. |
| `MARKAB_API_BASE_URL` | `https://api.markab.uz/api/v1` | Trusted base URL. Cannot be influenced by request data. |
| `MARKAB_API_TOKEN` | *(empty)* | Bearer token. Server-only; never committed. |
| `MARKAB_API_TIMEOUT_MS` | `8000` | Per-request timeout (500–30000 ms). |
| `MARKAB_API_MAX_RETRIES` | `1` | Bounded retries for transient failures (0–3). |
| `MARKAB_DYNAMIC_SITEMAP` | `true` in http mode, `false` in mock mode | When true, `/sitemap.xml` is rendered per request. |
| `MARKAB_IMAGE_UNOPTIMIZED` | *(unset = OFF)* | Escape hatch for deployments whose server cannot fetch media. Production must leave unset. |
| `MARKAB_ALLOW_PREVIEW_FRAME` | *(unset = OFF)* | Arena preview escape hatch. Production must leave unset. |
| `MARKAB_CSP_REPORT_ENDPOINT` | *(unset)* | Optional CSP report URI. Not set by default. |

---

## 4. DTO → domain mapping

Pipeline (see `lib/data/dto.ts`):

```
fetch JSON  →  ApiOutcome  →  map{Vehicle,Product}{,Page}  →  domain model
                                                               ↓
                                                 quarantine report (server log)
```

* Every field is validated against type, range and business-meaning bounds.
* Unknown enum values map to `null`; the UI renders *“Ma'lumot tayyorlanmoqda”*
  rather than guessing a label.
* Image URLs are validated against the narrow allow-list
  (`https://api.markab.uz/media/**`, via `lib/security/url.ts`). Invalid URLs
  are dropped. `/media/…` root-relative paths are absolutised to
  `https://api.markab.uz`.
* Financing sub-object is mapped defensively: every nullable field stays null
  until published. The frontend never computes monthly payments, down
  payments, terms or totals.
* Stock is mapped through an allow-list: only `in_stock` and `out_of_stock`
  survive as their domain values; `preorder` and other unknowns become
  `unknown`, and the UI does NOT claim availability.

Bounds enforced (consistent with `docs/DATA-QUALITY-REGISTER.md`):

| Field | Rule |
|---|---|
| Vehicle price | [100 000, 10 000 000 000] UZS |
| Product price | [100 000, 10 000 000 000] UZS |
| Year | [1990, currentYear+2] |
| Mileage | [0, 1 000 000] km |
| Battery health % | [1, 100]. Out-of-range values are dropped, not corrected. |
| Storage GB | Must be in `{8,16,32,64,128,256,512,1024,2048}`; otherwise null. |
| Images | ≥0 URLs, each on `api.markab.uz`. |

---

## 5. Quarantine behaviour

Any record failing a publish-quality rule (missing id/slug/brand/title,
impossible price, impossible year, unparseable payload) is quarantined:
omitted from the result set and reported to the server log as
`api_record_quarantined` with `{ kind, reason, identifier }`. The visitor
does not see the record, and the public error message never reveals which
identifier failed or why (avoids enumeration oracle). The existing fixture
quarantines (Chery Tiggo 7 Pro, the malformed iPhone listing) remain in
place in `lib/data/fixtures/`.

---

## 6. HTTP / error mapping

`lib/data/apiClient.ts` classifies every response; `httpProvider` maps
outcomes to `Result<T>`:

| HTTP / network event | Result state |
|---|---|
| 200 + valid JSON, records exist | `success` |
| 200 + valid JSON, empty collection | `empty` (via the empty list) |
| 404 detail | `not_found` → Next.js `notFound()` (true 404 page) |
| 401 / 403 | `unavailable` — credentials/configuration problem. No token detail leaked. |
| 429 | `unavailable`. `Retry-After` respected for one retry (capped 2s). |
| 5xx | `unavailable` after bounded retry. |
| Timeout | `error(timeout, …)` with generic public message. |
| DNS / TCP / TLS failure | `unavailable`. |
| Non-JSON / invalid JSON / unexpected 4xx | `error(bad_response, …)`. Never silently []. |

**No silent mock fallback.** In HTTP mode the visitor only ever sees real
data, or the honest state — no fixtures leak into a production response.

---

## 7. Timeout / retry / rate-limit policy

* **Timeout:** 8 s per request (configurable via `MARKAB_API_TIMEOUT_MS`).
* **Retries:** at most 1 (configurable `MARKAB_API_MAX_RETRIES` 0–3) with
  exponential backoff (300 ms base, capped at 2 s).
* **Never retry:** 401, 403, 404, validation/malformed responses.
* **Rate-limit (429):** one retry after `Retry-After` (capped at 2 s).
* All events are logged server-side as structured JSON:
  `api_timeout`, `api_network_error`, `api_rate_limited`,
  `api_server_error`, `api_malformed_response`, `api_record_quarantined`,
  `api_unauthorized_call`.
* Logs never contain the `Authorization` header, the token value, or any
  request body.

---

## 8. Module-level state consistency

The prior implementation exported `activeDataSourceName` as a module
constant, which captured the adapter at import time and could disagree
with the adapter actually serving a request when build/runtime
environments differed. This is fixed:

* `lib/data/index.ts` no longer caches the adapter at module scope.
* `getAdapter()` is called on every repository method (per request).
* `currentDataSourceName()` and `dataSourceNote()` are functions, read
  fresh each call.
* `cache()` is used only for `getSiteContent()` within a single request
  (same dedupe semantics as React's `fetch` deduping) — never across
  requests.

---

## 9. Query-parameter safety

Browser query strings → parsed/validated in `lib/{vehicles,products}/filters.ts`
→ strongly-typed `VehicleQuery` / `ProductQuery` → mapped to DRF parameters by
`lib/data/queryParams.ts` (whitelist only). No raw query string is ever
forwarded to the API; unknown browser parameters are dropped before the HTTP
call. The provider also never accepts user-controlled URLs or paths — all
fetch targets are built from the server-configured base URL plus paths
hard-coded in `httpProvider.ts`.

---

## 10. Route rendering / caching / revalidation

Because the existing nonce-based `Content-Security-Policy` stamps scripts
per-response (see `docs/PHASE-12-DEPLOYMENT-SECURITY.md`), every document
route is rendered **per request** (`force-dynamic`). This is the
production-correct posture for HTTP mode:

| Route | Rendering | Rationale |
|---|---|---|
| `/` | dynamic | Featured cars/electronics must reflect live API when in http mode. |
| `/cars`, `/cars/[slug]` | dynamic | Prices, stock and financing change; CSP nonce required. |
| `/electronics`, `/electronics/[id]` | dynamic | Same as vehicles; stock especially volatile. |
| `/search` | dynamic | Query-dependent, no stable URL to cache. |
| `/academy`, `/academy/[slug]` | dynamic | CSP nonce; content may later come from CMS. |
| `/financing*`, `/invest`, `/advisor`, `/loyalty`, `/cart`, `/login`, `/profile`, `/about`, `/contact`, `/faq`, `/sell`, `/privacy`, `/terms` | dynamic (explicit) | CSP nonce; forms/session surfaces. |
| `/sitemap.xml` | **dynamic** (newly explicit) | Must reflect live catalogue in HTTP mode; a build snapshot would freeze delisted URLs. |
| `/robots.txt` | static | Contains no catalogue references. |
| `/api/csp-report` | dynamic | Per-request endpoint. |

**ISR is deliberately NOT used** at this stage. DRF does not (from what is
publicly known) emit cache keys or E-Tags that would make incremental
revalidation safe, and revalidating on a fixed interval is a guess — we
would either serve stale inventory or revalidate far more often than
necessary. When a cache-invalidation channel (e.g. webhooks from the
catalogue CMS) exists, `revalidateTag` can be added without changing the
data flow. Until then, dynamic rendering with in-memory provider caching
(`React.cache()`) is the honest choice.

**We are NOT weakening CSP** to regain static rendering. `script-src`
keeps `'strict-dynamic'` with a per-response nonce; there is no
`'unsafe-inline'` on script-src; `object-src 'none'` and other
Phase-12 controls are unchanged.

---

## 11. Image pipeline

* `next/image` optimisation stays ON by default.
* Remote pattern allow-list is still exactly:
  `https://api.markab.uz/media/**` (see `next.config.mjs`).
* `lib/security/url.ts` mirrors the same host list for runtime URL
  validation (`isAllowedImageUrl`).
* `mapImage()` validates every image URL from the API; `/media/…` paths
  are absolutised to `https://api.markab.uz`, and any URL on another
  host is dropped (fails safe, does not crash).
* `MARKAB_IMAGE_UNOPTIMIZED=true` remains an environment-scoped escape
  hatch for servers that cannot complete a TLS fetch to `api.markab.uz`.
  It does not become the default.

---

## 12. Home page / marketing surfaces

* All homepage blocks read through the repository. When `MARKAB_DATA_SOURCE=http`,
  `getFeatured()` fetches live vehicles/products; no fixtures.
* If either catalogue returns `unavailable`/`error` in HTTP mode, the
  homepage featured blocks render the existing `StateBlock` empty/error
  states instead of fixture cards.
* `Reveal` progressive enhancement is untouched — content is visible by
  default.
* Academy / FAQ / Investment / Loyalty blocks in http mode render the
  existing pending state until their endpoint contracts are verified.

---

## 13. Financing / investment / forms / auth

* **Financing:** only fields explicitly present in the verified API
  response are mapped. The frontend does not compute any value.
* **Investment:** no returns, rates, terms, minimums, risk scores or
  certifications are inferred. The endpoint remains `unavailable` until
  a verified contract exists.
* **Forms:** financing/contact/application forms are NOT connected.
  Draft/pending behaviour preserved.
* **Customer auth:** out of scope. The server Bearer token is not a user
  session; `/login`, `/profile`, `/cart` keep their existing
  demo/prototype states.
* **Cart:** stays browser-stored prototype state; no checkout/payment.

---

## 14. Sitemap strategy (critical)

`sitemap.xml` is now `force-dynamic`:

* Build-time: Next generates a route manifest (the route exists) but
  does **not** snapshot URLs at build.
* Request-time: the repository queries the active adapter. In `mock`
  mode, all mock URLs publish. In `http` mode, only URLs the API
  currently returns publish.
* If the API is unavailable / errors / unauthenticated at request time,
  dynamic sections are **omitted** (fail-safe) — static routes still
  publish and the sitemap never advertises URLs to delisted items.
* Quarantine rules apply: a quarantined record never reaches the
  sitemap, because it never enters the provider's result set.
* `/robots.txt` remains static (no catalogue references).

---

## 15. Build-time vs runtime behaviour

Because the repository resolves the adapter per request (no module
singleton) and sitemap is dynamic:

* `MARKAB_DATA_SOURCE=http npm run build` will succeed even when the
  build host cannot reach the API — catalogue pages are dynamic (no
  build-time fetch). Only the route manifest is produced.
* A build started with credentials does NOT bake those credentials or
  any catalogue data into the output; there is no module-level capture.
* `/robots.txt` is produced at build; it contains no catalogue URLs.
* The instrumentation startup log (`security.posture`) records
  `dataSource`, `apiTokenConfigured: boolean`, and
  `imageOptimisation: enabled|disabled` — it logs presence only, never
  the token value.

---

## 16. Known API gaps (PREPARED BUT BLOCKED)

The following cannot be honestly implemented until a read-only token and
schema are supplied:

* Exact field names for vehicles/products beyond what was inferred
  (`price` vs `price_uzs`, etc.). The mapper accepts the common
  alternatives observed in DRF projects but must be re-verified.
* Existence and shape of `/vehicles/{slug}/` vs `/vehicles/{id}/`.
* Existence and shape of a unified `/search/` endpoint (currently
  composed from two list calls).
* Existence and shape of a `/featured/` endpoint (currently derived by
  `-views` ordering on the list endpoints).
* FAQ, Academy lessons/categories, CMS site-content, investment
  profile, loyalty program endpoints and schemas.
* Customer/account/authentication endpoints (out of scope for this
  phase regardless).
* Pagination metadata (whether DRF uses `page`, `page_size`, `offset`,
  cursor, etc.). The mapper accepts DRF's default `{count, results}`
  and bare arrays; cursors are not implemented because none was observed.

---

## 17. Remaining deployment requirements

1. Provision a read-only `MARKAB_API_TOKEN` in the platform secret store.
2. Ensure the production runtime can open a TLS connection to
   `api.markab.uz:443` (the sandbox in which this work was done could not).
3. Set `MARKAB_DATA_SOURCE=http` in the production environment only;
   keep `mock` for staging/preview.
4. Leave `MARKAB_IMAGE_UNOPTIMIZED` unset (ON by default).
5. Leave `MARKAB_ALLOW_PREVIEW_FRAME` unset in production.
6. After first deploy in http mode, verify `/`, `/cars`, `/cars/[slug]`,
   `/electronics`, `/electronics/[id]`, `/search`, `/sitemap.xml`
   against real records; check server logs for
   `api_record_quarantined` events (expected count should be near zero
   against production data; a spike means a schema mismatch to fix).
7. Provide an OpenAPI/schema export so FAQ/Academy/Investment/Loyalty
   surfaces can be mapped accurately.

---

## 18. Files added/changed in this phase

| File | Purpose |
|---|---|
| `lib/env/server.ts` | Added `apiTimeoutMs`, `apiMaxRetries`, `dynamicSitemap`; documented production defaults. |
| `lib/data/apiClient.ts` | **New.** Server-only HTTP client: Bearer auth, finite timeout, retries, rate-limit handling, structured logging, outcome classification. |
| `lib/data/dto.ts` | **New.** DTO → domain mappers for Vehicle and Product with runtime type/range validation, quarantine, financing mapping, image URL allow-list validation, facet derivation. Stubs for unverified content endpoints. |
| `lib/data/queryParams.ts` | **New.** Whitelist mapping from `VehicleQuery`/`ProductQuery` to DRF query parameters. |
| `lib/data/httpProvider.ts` | Rewritten: real implementation for vehicles, products, featured, search, facets (derived), true 404s, error mapping, no silent fallback. Content endpoints stay `unavailable`. |
| `lib/data/index.ts` | Removed module-level adapter singleton and `activeDataSourceName` constant; `currentDataSourceName()` / `dataSourceNote()` are now per-request functions. |
| `components/home/FeaturedShowcase.tsx` | Updated to call `dataSourceNote()` as a function. |
| `app/sitemap.ts` | `force-dynamic`; failsafe omission of dynamic sections when provider cannot answer; preserves static routes; logs diagnostic when mock fails unexpectedly. |
| `app/cars/page.tsx`, `app/cars/[slug]/page.tsx`, `app/electronics/page.tsx`, `app/electronics/[id]/page.tsx`, `app/academy/page.tsx`, `app/academy/[slug]/page.tsx`, `app/search/page.tsx` | Explicit `export const dynamic = 'force-dynamic'` with rationale comments. |
| `.env.example` | Documented `MARKAB_API_TIMEOUT_MS`, `MARKAB_API_MAX_RETRIES`, `MARKAB_DYNAMIC_SITEMAP`; clarified no-fallback rule. |
| `docs/REAL-API-INTEGRATION.md` | This document. |

---

## 19. Verification checklist (run on deploy)

- [ ] `MARKAB_DATA_SOURCE=mock npm run build` → green (mock regression).
- [ ] `npm run typecheck` → clean.
- [ ] `npm run lint` → clean.
- [ ] `npm run security:allowlists` → all checks pass.
- [ ] With `MARKAB_DATA_SOURCE=http` and no token: all catalogue pages render
      the explicit "unavailable" state; no fixtures leak.
- [ ] With token + reachable API: `/cars`, `/cars/<slug>`, `/electronics`,
      `/electronics/<id>`, `/`, `/search?q=…` render real records; 404s are true.
- [ ] `grep -R "MARKAB_API_TOKEN" .next/static/` → no matches (client bundle scan).
- [ ] `/sitemap.xml` lists static + dynamic entries in http mode, only
      static entries when API unavailable.
- [ ] `next/image` optimizes media from `api.markab.uz/media/**`; images from
      other hosts do not render.
- [ ] Response headers include nonce-CSP with `strict-dynamic`; no
      `script-src 'unsafe-inline'`.

---

## 20. Stage 1 addendum — contact page map

The `/contact` page now embeds an **OpenStreetMap** iframe
(`https://www.openstreetmap.org/export/embed.html`) pinned at the verified
office coordinates (41.331985, 69.223558), re-used from the existing
`site.office.mapUrl` Google Maps link on markab.uz. This is the only
third-party iframe permitted.

CSP changes (narrow, deliberate — no wildcards, no `unsafe-inline`/`unsafe-eval`):

* `frame-src: 'self' https://www.openstreetmap.org` (was `'none'`)
* `img-src` additionally allows `https://tile.openstreetmap.org` for map tiles
* `frame-ancestors`, `script-src` (nonce + strict-dynamic), and every other
  directive are unchanged.

Third parties contacted when the map renders:

* `www.openstreetmap.org` — embed HTML/JS (served inside the iframe)
* `tile.openstreetmap.org` — map tile images, fetched by the visitor's browser
  from inside the iframe

OSM's embed does not set cookies in third-party context (per OSM's privacy
policy), and the iframe is loaded with `loading="lazy"`, `sandbox="allow-scripts
allow-pointer-lock"` (no `allow-same-origin`, no `allow-top-navigation`),
`referrerPolicy="no-referrer-when-downgrade"`, and an explicit accessible title.

A 10-second load/failure guard replaces the iframe with a compact unavailable
state if the embed cannot load; the verified address, the "Xaritada ochish"
deep-link to Google Maps and the contact form remain usable regardless.
