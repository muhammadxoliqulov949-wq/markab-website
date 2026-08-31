# API CONTRACT & DATA ADAPTER — Phase 0.5

**Status:** 🟦 Structure-only mode. **No API token available**, so no live data is consumed yet.
Everything the UI needs flows through one adapter; with no data source configured, every surface renders the shared Loading / Empty / NotFound / Error states. **No fixtures. No invented values.**

---

## 1. WHAT IS VERIFIED ABOUT THE BACKEND

Discovered during Phase 0 / 0.5 reconnaissance (direct requests to the live host):

| Item | Verified value |
|---|---|
| API host | `https://api.markab.uz` |
| Framework | **Django REST Framework** (browsable API HTML returned) |
| Base path | `/api/v1/` |
| Auth | **Bearer token required.** `GET /api/v1/vehicles/` → `HTTP 401 Unauthorized` → `{"error": "Authentication credentials were not provided."}` with `WWW-Authenticate: Bearer realm="api"` |
| Trailing slash | DRF `APPEND_SLASH` behaviour observed (`/api/v1/vehicles` → `/api/v1/vehicles/`) |
| Bad paths | `/`, `/api/vehicles`, `/api/products` → `Not Found` (not a JSON API error) |
| Media | Public asset paths seen in rendered pages: `https://api.markab.uz/media/vehicles/{uuid}.jpg`, `https://api.markab.uz/media/products/{filename}.jpg` — **[ASSUME PUBLIC — verify: images are embedded in public pages, but no direct unauthenticated fetch was possible from the sandbox]** |
| Rate limiting | **HTTP 429 observed** during probing → the client must implement backoff/retry and the UI must degrade gracefully |
| Pagination | 12 items per page observed on both `/cars` and `/electronics` |
| Volumes observed | 20 vehicles · 42 electronics products |

**Not verified (requires a token or docs):** endpoint list, response schemas, field names, filtering/sorting parameters, financing fields, stock fields, image-resolution variants, error-body format.

---

## 2. ADAPTER INTERFACE (framework-agnostic contract)

```ts
type DataSource = 'api' | 'none';   // 'fixtures' intentionally NOT enabled
// 'none' = structure-only: every call resolves to { status: 'unavailable' }

interface Result<T> {
  status: 'success' | 'empty' | 'not_found' | 'error' | 'unavailable';
  data?: T;
  error?: { code: string; correlationId: string }; // never shown raw to users
}

interface MarkabDataSource {
  listVehicles(params: ListParams): Promise<Result<Paged<Vehicle>>>;
  getVehicle(slugOrId: string): Promise<Result<Vehicle>>;
  listProducts(params: ListParams): Promise<Result<Paged<Product>>>;
  getProduct(idOrSlug: string): Promise<Result<Product>>;
  getFeatured(params: { limit: number }): Promise<Result<{ vehicles: Vehicle[]; products: Product[] }>>;
  getFinancing(productId: string): Promise<Result<Financing | null>>;
}
```

**Contract rules**
1. The adapter **never throws** into the render layer — failures return `status: 'error'`.
2. `not_found` (record missing) is **distinct** from `error` (request failed) — this is the core fix for the 500s.
3. `unavailable` = no data source configured → UI renders the *pending integration* state, not fake data.
4. Every call has a timeout, bounded retries with backoff (429/5xx), and a correlation ID for server-side logs.
5. Missing/partial fields render as *“Ma'lumot kiritilmagan”* — never guessed, never defaulted to `0`.

---

## 3. FIELDS THE UI NEEDS (to be confirmed against the real schema)

Field names below are **inferred from rendered UI labels**, not from the API. Confirm before wiring.

### Vehicle (`/cars`, `/car/{slug}`)
`id` · `slug` · `brand` · `model` · `year` · `price` · `currency` · `monthly_payment?` · `mileage_km` · `fuel_type` (enum → map) · `transmission` (enum → map) · `location` · `is_new` · `views` · `images[]` · `features[]` · `description` · `seller{}` · `status` · `is_featured?`

### Product (`/electronics`, `/electronics/{id}`)
`id` · `slug?` · `name` · `brand` · `category` · `price` · `monthly_payment?` · `specs{}` (storage, battery_health, colour…) · `stock_status` (`in_stock | out_of_stock | preorder`) · `images[]` · `views` · `is_featured?`

### Financing (Priority 5 — **display only if the API provides it**)
`product_id` · `down_payment` · `term_months` · `monthly_payment` · `total_amount` · `markup?` · `contract_type` (`taqsit | murabaha`) · `currency`

> ⚠️ **No financing value may be computed, estimated or defaulted by the frontend in this phase.** If `getFinancing()` returns `null`/`unavailable`, the block renders its structure with an explicit pending-integration marker.

---

## 4. ENV CONFIGURATION (to add when the token is supplied)

```
MARKAB_API_BASE_URL=https://api.markab.uz/api/v1
MARKAB_API_TOKEN=                # read-only token — DO NOT commit
MARKAB_DATA_SOURCE=none          # none | api   (fixtures disabled by decision)
MARKAB_API_TIMEOUT_MS=8000
MARKAB_MEDIA_BASE_URL=https://api.markab.uz/media
```

* Secrets live in the platform's secret store / `.env.local` (git-ignored). **Never** in the repository.
* `MARKAB_DATA_SOURCE=none` is the default for this phase.
* Server-side rendering should hold the token; it must not be exposed to the browser.

---

## 5. WHAT I NEED FROM MARKAB TO GO LIVE

1. A **read-only API token** (or a sandbox/staging environment).
2. The **endpoint list** (or an OpenAPI/Swagger schema export from Django REST Framework — `drf-spectacular`/`drf-yasg` usually exposes one).
3. Confirmation of the **actual field names** in §3, especially the financing fields.
4. The **detail-route identifier** used by electronics (the listing→detail mismatch is the `/electronics/{id}` bug).
5. Whether a **staging dataset** exists, so P3/P4/P5 can be verified without touching production.

Until then: structure only, states wired, nothing fabricated.
