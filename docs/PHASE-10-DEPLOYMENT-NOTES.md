# Phase 10 — deployment notes

**Status: documented, not fixed.** These are observations made during the
Phase 10 cleanup that cannot be resolved inside the prototype because they
depend on how a real backend behaves. They are recorded here so the first
person wiring up the production API hits them knowingly rather than by
accident.

---

## 1. Statically prerendered routes capture provider state at build time

`next build` decides, per route, whether to prerender the HTML once at build
time or render it on each request. In the current build the split is:

| Rendered at build time (static) | Rendered per request (dynamic) |
|---|---|
| `/`, `/about`, `/advisor`, `/contact`, `/faq`, `/invest`, `/loyalty`, `/login`, `/privacy`, `/profile`, `/sell`, `/terms`, `/financing*` | `/cars`, `/cars/[slug]`, `/electronics`, `/electronics/[id]`, `/academy`, `/academy/[slug]`, `/search` |

Two consequences follow.

**a) A static route freezes whatever the data source returned while the build
ran.** With `MARKAB_DATA_SOURCE=mock` that is fine — the mock provider is
deterministic and in-process. With `MARKAB_DATA_SOURCE=http`, everything the
static routes read (loyalty tiers, investment copy, FAQ items, the content
blocks behind `getSiteContent`, the vehicles and products shown in homepage
rails) is baked into the deployed HTML at build time and does not change until
the next deploy. A price corrected in the CMS would appear on `/cars` (dynamic)
immediately but stay stale on `/` until a rebuild.

**b) `MARKAB_DATA_SOURCE` is a build-time value for those routes**, not a
runtime one. Changing the environment variable on a running server changes
nothing until the app is rebuilt. This is easy to misread as "the API is not
being called".

**What to decide when wiring the real API.** For each route that reads live
data, either:

* opt it out of prerendering (`export const dynamic = 'force-dynamic'`), or
* keep it static and revalidate it (`export const revalidate = <seconds>`), or
* keep it static and accept that content updates require a deploy.

The right answer is per-route and depends on how often each data set changes;
it is not something to guess now. What must not happen is leaving the current
split in place without noticing it, then being surprised that the homepage
shows prices from the last deploy.

---

## 2. `Last-Modified` in the sitemap is generation time

`sitemap.xml` sets `lastModified` to the time the sitemap was generated. The
data source exposes no publish or update timestamps — vehicles, products and
lessons have no date field at all — so there is no honest per-URL value to put
there.

Crawlers use `Last-Modified` to decide whether to re-fetch. With the current
value, every deploy marks all 41 URLs as modified, which is noise but not a
lie. Once the API exposes a real `updatedAt`, map it through the repository and
use it; until then, an accurate generation timestamp beats an invented per-item
date.

---

## 3. Image optimisation depends on the media host being reachable

`next/image` optimisation was re-enabled in Phase 10 (it had been disabled
globally, which meant every visitor downloaded full-resolution originals). The
optimiser fetches the source image server-side, so `api.markab.uz` must be
reachable **from the server**, not from the visitor's browser.

If it is not reachable, the optimiser returns an error, the browser fires
`onError`, and `CatalogueImage` renders its neutral placeholder. The page still
works; the photography does not appear. Worth knowing when debugging "images
are broken in staging" — the cause may be egress rules rather than the app.

Also check that any CDN or WAF in front of the app does not cache the
`/_next/image` error responses, or a transient outage will be cached as
permanently broken.

---

## 4. Quarantined records are excluded at the fixture level

The two records flagged in `DATA-QUALITY-REGISTER.md` — the `Chery Tiggo 7 Pro`
vehicle and the product whose monthly payment implied a ~256% rate — are absent
from `lib/data/fixtures/*.ts`, so no runtime filter is needed to keep them out
of listings, search and the sitemap.

That holds only while the mock provider is the source. When the HTTP provider
becomes the source, **the exclusion has to move**: either the API stops
returning them, or the adapter filters them. If neither happens, a quarantined
vehicle will reappear in the sitemap and in search, and the sitemap will
faithfully publish a URL for data the business has rejected.

Add an explicit exclusion step in the adapter before switching providers.

---

## 5. Production data needs a Bearer token

`https://api.markab.uz/api/v1/vehicles/` returns `HTTP 401` with
`WWW-Authenticate: Bearer realm="api"` — Django REST Framework. No token has
been provided, so the HTTP provider's behaviour has never been exercised
against real data; it is written to the contract in `docs/API-CONTRACT.md` and
returns `unavailable()` for everything today.

Before switching `MARKAB_DATA_SOURCE=http`, confirm: how the token is supplied,
how it is rotated, and what the adapter should surface when a token expires
mid-request (currently: `unavailable`, which renders the honest "not connected"
state rather than a blank page — the right default, but it should be a
deliberate decision).

---

## 6. Absolute canonical URLs are hard-coded to `https://markab.uz`

`lib/site.ts` sets `site.url`, and every canonical, `og:url` and JSON-LD `@id`
is built from it. Preview and staging deployments will therefore emit canonicals
pointing at production.

That is usually the desired behaviour for a staging site (it prevents the
preview being indexed as a duplicate), but it means a staging URL must never be
crawled by anything that could act on those canonicals. If a staging
environment ever needs its own canonicals, `site.url` has to become
environment-driven.

---

## 7. Dynamic routes stream their metadata into `<body>`, not `<head>`

Measured on the built app. For every **statically prerendered** route the
`<title>`, `<meta name="description">` and `<link rel="canonical">` sit inside
`<head>` where they belong. For every **dynamically rendered** route they do
not — they are appended deep inside `<body>`:

| Route | `</head>` at byte | `<meta name="description">` at byte | Placement |
|---|---|---|---|
| `/invest` (static) | 2 964 | 1 008 | `<head>` |
| `/cars` (dynamic) | 4 596 | 75 985 | `<body>` |
| `/cars/chevrolet-cobalt-2023` (dynamic) | 4 596 | 80 609 | `<body>` |
| `/academy` (dynamic) | 4 596 | 29 199 | `<body>` |

This is Next.js 15's streaming metadata, not a bug in this codebase. Next flushes
the HTML shell before an async `generateMetadata` resolves and inserts the tags
wherever the stream has reached. It *does* block the stream for user agents it
classifies as html-limited, and those get the tags in `<head>`:

| User agent | Placement |
|---|---|
| Bingbot, facebookexternalhit, Twitterbot | `<head>` |
| Googlebot, ordinary Chrome | `<body>` |

Googlebot is excluded from that list on purpose — Next assumes it executes
JavaScript, and it does, so Google still reads the tags. The practical exposure
is narrower than the table suggests:

* **Non-executing crawlers that are not on Next's list** see no title,
  description, canonical or OpenGraph on `/cars`, `/electronics`, `/academy`
  and the three detail-page types — the pages that matter most for indexing.
* **Lighthouse's `meta-description` audit reads `<head>` only**, so it scores 0
  on those routes and drags the SEO category to 91–92 instead of 100. The
  metadata is present; the audit is looking in the wrong place.

**Deliberately not changed.** The only levers are widening
`experimental.htmlLimitedBots` (a regex over user-agent strings) or forcing
these routes to render statically, which is not possible for `/cars`,
`/electronics` and `/academy` — they read `searchParams`. Widening the regex
until it also matches ordinary browsers would disable streaming for everyone to
raise a lab score, which is tuning the application to a measurement tool rather
than fixing a defect. It is recorded here instead.

**What to decide before launch.** Confirm that every crawler the business cares
about either executes JavaScript or matches `htmlLimitedBots`. If a specific
partner crawler needs `<head>` metadata and does not run JS, extend
`experimental.htmlLimitedBots` in `next.config.ts` for that user agent and
re-check placement with the byte-offset check above. Verify against the real
deployment, not this prototype: a CDN that rewrites or buffers the response can
change where the tags land.
