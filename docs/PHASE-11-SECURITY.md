# Phase 11 — Threat model and security hardening

Date: 2026-09-02 · Branch: `arena/01a05433-markab-website`

This document records what Phase 11 found, what it changed, and — as
importantly — what it deliberately did not change. Every claim below was
measured on a production build, not inferred from reading code.

---

## 1. Scope

| In scope | Out of scope (Phase 12) |
| --- | --- |
| Threat model for the current prototype | TLS termination, WAF, rate limiting |
| Secret and environment audit | Real authentication backend |
| Security headers and CSP | Payment / PCI concerns |
| Server–client credential boundary | Dependency upgrades with breaking changes |
| XSS, URL, redirect and SSRF audit | Penetration test, monitoring, incident response |
| Form and `localStorage` hardening | Data-residency and retention implementation |
| Authentication / demo-state boundary | |
| Error and logging leakage | |
| Dependency audit | |
| Client-bundle secret scan | |
| Phase 10 image-architecture regression check | |
| Phase 12 deployment-security documentation | |

Nothing in Phase 11 adds a product feature, connects the protected Markab API,
or implements authentication, payments or sessions.

---

## 2. Threat model

### 2.1 Assets

| Asset | Where | Why it matters |
| --- | --- | --- |
| Visitor's browser session | Client | Account panels, saved items, cart, drafts |
| Local prototype state | `localStorage` (4 keys, all `markab.demo.*`) | Treated as data by the UI; attacker-writable |
| Catalogue and content integrity | Server (fixtures → repository → provider) | A fabricated listing is a consumer-harm issue |
| Production API bearer token | Server env only (`MARKAB_API_TOKEN`) | Empty today; a credential tomorrow |
| Application availability | Next.js server, `/_next/image` | Image optimiser is a server-side HTTP client |
| Brand / legal trust | Everywhere | Phishing or framing damages it directly |

### 2.2 Trust boundaries

1. **Browser → application.** Everything crossing this line is untrusted:
   URL paths, query parameters, and anything read back out of `localStorage`.
2. **Server → data provider.** The repository never bypasses authentication and
   never falls back to local data when the provider cannot answer.
3. **Server → media host.** `next/image` makes the *server* the HTTP client for
   `api.markab.uz`; the host is allow-listed per protocol, host and path.
4. **Build → browser bundle.** Only `NEXT_PUBLIC_*` values are inlined. Server
   modules are fenced with `server-only` so the fence is enforced, not assumed.

### 2.3 Adversaries

| Actor | Capability | Primary interest |
| --- | --- | --- |
| Opportunistic scanner | Automated requests, header inspection | Version disclosure, default files |
| Malicious visitor | Crafted URLs, tampered `localStorage`, devtools | Self-XSS, phishing via our own links |
| Co-tenant script on the origin | Writes `localStorage`, injects DOM | Stored payload surfaced by our UI |
| Network attacker (downgrade/MITM) | HTTP interception | Cookie/session theft (no sessions exist yet) |
| Fraudster | Frames or clones the site | Credential and payment phishing |

### 2.4 Threats and current status

| # | Threat | Vector | Severity | Status |
| --- | --- | --- | --- | --- |
| T1 | DOM XSS from stored state | `javascript:` / `//host` `href` or `src` from `localStorage` | **High** | **Mitigated** — validated on read (§4.1) |
| T2 | Clickjacking / UI redress | Framing the site | Medium | **Mitigated** — `frame-ancestors` + `X-Frame-Options` (§4.2) |
| T3 | Information disclosure via errors | Raw data-layer error text in HTML/console | Medium | **Mitigated** — split reporting (§4.3) |
| T4 | Credential leakage to the browser | Server env reaching a client bundle | Medium (High once a token exists) | **Mitigated** — `server-only` fence (§4.4) |
| T5 | Injection into JSON-LD | `</script>` in a structured-data value | Low | Not exploitable — `<` escaped in `lib/seo.ts`; verified |
| T6 | SSRF / unauthorised API access | Server fetching attacker-controlled URL | Low today | Not exploitable — no outbound fetch implemented; host allow-listed for images only |
| T7 | Open redirect | Attacker-controlled navigation target | Low | Not present — no redirect handler and no `window.location` assignment anywhere |
| T8 | MIME sniffing | `text/plain` re-read as HTML | Low | **Mitigated** — `X-Content-Type-Options: nosniff` |
| T9 | Version / stack disclosure | `X-Powered-By` | Low | Already absent (`poweredByHeader: false`) |
| T10 | Untrusted script execution | Any injected script | High | **Mitigated** — Phase 12 C1 replaced the inline allowance with a per-response nonce (§6.1) |
| T11 | Dependency vulnerability | Known CVE in a transitive package | Medium | **Accepted with a decision** — §5 |
| T12 | Media-host SSRF via the optimiser | `/_next/image?url=` | Low | Not exploitable — `remotePatterns` enforced (verified: non-allow-listed host → 400) |

---

## 3. What the audit actually looked at

Every `.ts`/`.tsx` file under `app/`, `components/` and `lib/`, plus
`next.config.mjs`, `package.json`, `package-lock.json`, `.env.example`,
`.gitignore`, and the emitted `.next/static` and `.next/server` output.

Sinks searched for and their status:

| Sink | Found | Notes |
| --- | --- | --- |
| `dangerouslySetInnerHTML` | 1 | `components/seo/JsonLd.tsx` only; `jsonLd()` escapes `<` |
| `innerHTML` / `outerHTML` assignment | 0 | |
| `eval` / `new Function` | 0 | |
| `window.location` assignment / `window.open` | 0 | No redirect logic exists at all |
| `fetch` / `XMLHttpRequest` from the browser | 0 | No client-side network calls |
| `redirect()` / `permanentRedirect()` | 0 | |
| `document.cookie` | 0 | No cookies are set |
| `localStorage` | 4 sites | Cart, saved items, drafts (+ one doc comment) |
| Hard-coded secrets, keys, tokens | 0 | Regex sweep over all tracked files |
| `target="_blank"` without `rel` | 0 | All three carry `rel="noopener noreferrer"` |

---

## 4. Changes implemented

### 4.1 Untrusted-state validation (`lib/security/url.ts`, new)

`isSafeInternalHref`, `isAllowedImageUrl`, `isBoundedText`, `isSaneAmount`.

Three stores rehydrate data from `localStorage` and render it straight into the
DOM. The previous checks asked only whether a field had the right *type* — which
is precisely the check a hostile value passes. Applied to:

| Store | Before | After |
| --- | --- | --- |
| `components/cart/CartProvider.tsx` | `JSON.parse(raw) as CartItem[]`, no validation | Shape-, range-, scheme- and host-checked; 50-item cap |
| `components/account/SavedItemsProvider.tsx` | `typeof === 'string'` only | Same checks, plus `image` host validation |
| `lib/account/draft.ts` | `id`/`reference`/`status` only | `productHref` must be a safe internal path; `productTitle` length-capped — on write *and* on read |

Measured: after seeding a cart containing `javascript:…`, `//evil.example` and
an off-host image, **0 hostile hrefs rendered** and only the legitimate line
survived.

### 4.2 Security headers (`next.config.mjs`)

Emitted on every route: `Content-Security-Policy`, `Strict-Transport-Security`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`,
`X-Permitted-Cross-Domain-Policies`, `X-DNS-Prefetch-Control`, and — in
production only — `X-Frame-Options: DENY`.

Two of them are **deployment properties**, not constants, and both default to
the production-correct value:

* `frame-ancestors 'none'` (production) vs `'self' https://*.e2b.app
  https://*.arena.ai` when `MARKAB_ALLOW_PREVIEW_FRAME=true`. `X-Frame-Options`
  is emitted only in the first case, because DENY cannot express an allow-list
  and would silently win over a permissive `frame-ancestors` in older browsers.
* HSTS `max-age=63072000; includeSubDomains` (production) vs `max-age=86400` in
  preview mode — a two-year `includeSubDomains` entry on a shared preview domain
  would be recorded in the reviewer's browser against infrastructure that is not
  ours.

This follows the same rule as the Phase 10 image setting: a flag whose default
is production-correct, set explicitly by the deployment that needs the other
behaviour, never by the codebase.

### 4.3 Error and logging split (`lib/errors.ts`, new)

`app/academy/page.tsx`, `app/advisor/page.tsx` and `app/search/page.tsx` rendered
`result.error.message` directly into HTML — an internal address, port or
database name waiting for a bad day. Now `reportServerError(context, error)`
logs the real error server-side and returns one fixed Uzbek sentence. A
visitor-facing message that varies with the failure is a channel; a constant one
still tells the truth.

`app/error.tsx` now logs the exception message only in development; production
logs the digest alone.

### 4.4 Server–client credential boundary (`lib/env/server.ts`, new)

`import 'server-only'` on `lib/env/server.ts`, `lib/data/index.ts`,
`lib/data/httpProvider.ts` and `lib/errors.ts`.

`components/sell/SellWizard.tsx` (a client component) used to
`import { vehicleBrands } from '@/lib/data'`, which pulled the entire data layer
— adapters, providers, every fixture — into the browser bundle for `/sell`. It
now receives the brands as a prop from the server page.

Measured effect:

| | Before | After |
| --- | --- | --- |
| `/sell` client chunk | 39.5 kB | **12.6 kB** |
| Provider / env strings in `.next/static` | `MARKAB_DATA_SOURCE` present | **none** |
| `MARKAB_API_TOKEN` in `.next/static` | — | **absent** (server chunks only) |

`lib/advisor/explanation.ts` reads `MARKAB_ADVISOR_EXPLAINER` and does reach the
browser, so it carries a comment recording that anything read there must never
be a secret.

### 4.5 Environment documentation (`.env.example`)

Documents `MARKAB_IMAGE_UNOPTIMIZED` and `MARKAB_ALLOW_PREVIEW_FRAME` as
deployment switches with their production defaults, plus three standing rules:
never put a secret in a `NEXT_PUBLIC_*` variable, read secrets through
`lib/env/server.ts`, and keep real values out of every `.env*` file.

---

## 5. Dependency audit

`npm audit` on the current lockfile:

```
vulnerabilities: 1 moderate, 1 high  (0 critical, 0 low)
  next      moderate  via postcss   node_modules/next
  postcss   high      node_modules/next/node_modules/postcss
```

Both are the same root cause: `postcss` pinned inside `next@15.5.24`
(`<=8.5.22`), covering three advisories — unescaped `</style>` in stringified
CSS output, and two `sourceMappingURL` path-traversal / arbitrary `.map` read
issues. `npm audit fix` wants `next@16.3.4`, a **semver-major** upgrade.

**Decision: not applied, deliberately.** A major framework upgrade is a
migration, not a patch, and doing it inside a security phase would mix a
behavioural change into a hardening change — exactly the situation where a
regression gets misattributed. The exposure is also build-time, not
request-time: `postcss` runs during `next build` against our own CSS, and no
attacker-controlled CSS or source map is processed. It is recorded as Phase
12 item **D1**, where it belongs — with the upgrade verified against the Phase
9/10 regression suite rather than rushed.

---

## 6. Residual risks

### 6.1 Inline script was permitted by the CSP — resolved in Phase 12

At the end of Phase 11 the policy was `script-src 'self' 'unsafe-inline'`,
because Next.js only derives a nonce for responses it renders per request and
sixteen routes were prerendered. Measured consequences: foreign-origin scripts
and frames blocked, inline script allowed, and — because Chromium treats
`unsafe-inline` as also unlocking string compilation — `eval` allowed.

**Resolved.** Phase 12 (item C1) measured the cost of rendering every route per
request, found no systematic difference, and shipped the strict policy:
`script-src 'self' 'nonce-…' 'strict-dynamic'`. Injected inline scripts,
injected `eval`, and foreign-origin scripts are now all refused while the
application's own nonce-stamped scripts run. See
[`docs/PHASE-12-DEPLOYMENT-SECURITY.md`](PHASE-12-DEPLOYMENT-SECURITY.md) §C1
for the A/B numbers and the evidence.

### 6.2 Other residual risks

* **No authentication exists.** `lib/auth/service.ts` refuses every operation
  and the UI says so. The `/profile` preview mode is URL-driven
  (`?holat=…`), which was already true and is unchanged — it changes what the
  *screen* shows, never a session, because there is no session.
* **Forms do not submit.** Contact, application and sell forms are intercepted
  and end in an explicit "backend ulanmagan" state. When a backend arrives it
  needs server-side validation, CSRF protection and rate limiting — this
  prototype's client-side validation is a UX affordance, not a control.
* **No security monitoring.** Errors go to the server log; nothing aggregates
  or alerts on them.
* **No `Security.txt`, no vulnerability disclosure address.**
* **Lint is not configured** in this repository (true before Phase 11 as well).
  `tsc --noEmit` and the build's type check are the static gates that ran.

---

## 7. Verification

Production build (`MARKAB_IMAGE_UNOPTIMIZED=true MARKAB_ALLOW_PREVIEW_FRAME=true`),
Chromium 131, 11 routes × 2 viewports (1440×900, 390×844).

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | 25/25 routes, no warnings |
| CSP violations (securitypolicyviolation events) | **0** |
| Console errors | only `api.markab.uz` image failures (sandbox has no egress to it) and the expected 404 resource |
| Hydration (`__react` container attached) | **true on all 22 page loads** |
| Horizontal overflow | none (≤ 1 px tolerance) |
| JSON-LD blocks parse | yes, all routes |
| True 404 | `/definitely-not-a-route`, `/cars/no-such-car`, `/electronics/nope`, `/academy/no-such-lesson` → **404** |
| `robots.txt` / `sitemap.xml` | 200, unchanged content |
| Interactivity after CSP | mobile menu opens, FAQ accordion toggles, cart add/remove works, sell wizard renders its brand options |
| Hostile `localStorage` payload | 0 hostile hrefs rendered |
| Client-bundle secret scan | no env var, provider or token string in `.next/static` |
| Phase 10 image behaviour | unchanged: default (no env) → optimised `/_next/image` URLs; `MARKAB_IMAGE_UNOPTIMIZED=true` → direct URLs |

---

## 8. Files changed in Phase 11

```
next.config.mjs                            headers() with CSP + 9 headers
lib/security/url.ts                        new — URL/value validation
lib/env/server.ts                          new — server-only env access
lib/errors.ts                              new — server-side error reporting
lib/data/index.ts                          server-only fence, env via lib/env
lib/data/httpProvider.ts                   server-only fence, credential note
lib/account/draft.ts                       validate on write and on read
lib/advisor/explanation.ts                 comment: client-reached env read
components/cart/CartProvider.tsx           validate rehydrated items
components/account/SavedItemsProvider.tsx  tighten rehydration checks
components/sell/SellWizard.tsx             brands via props, no data import
app/sell/page.tsx                          supplies brands server-side
app/error.tsx                              dev-only message logging
app/search/page.tsx                        generic error message
app/academy/page.tsx                       generic error message
app/advisor/page.tsx                       generic error message
.env.example                               document deployment switches
README.md                                  Phase 11 section
docs/PHASE-11-SECURITY.md                  this file
docs/PHASE-12-DEPLOYMENT-SECURITY.md       requirements, not implemented
```
