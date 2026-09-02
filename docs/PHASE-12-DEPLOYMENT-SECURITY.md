# Phase 12 — Deployment security requirements

Status: **DOCUMENTATION ONLY — nothing here is implemented.**
Phase 11 wrote this list so that deployment has a specification to work from.
Each item states what is required, why, and what Phase 11 left behind.

Items are graded: **M** must be in place before real user data flows,
**S** should be in place at launch, **C** can follow.

---

## A. Transport and edge

| # | Requirement | Grade | Why / Phase 11 context |
| --- | --- | --- | --- |
| A1 | TLS 1.2 minimum, TLS 1.3 preferred, HSTS `max-age=63072000; includeSubDomains; preload` once the canonical host is confirmed | **M** | Phase 11 already sends HSTS, but without `preload` and only with `includeSubDomains` outside preview mode. `preload` must not be requested until every subdomain is HTTPS — it is effectively irreversible for months. |
| A2 | HTTP → HTTPS redirect at the edge, no mixed content anywhere | **M** | `upgrade-insecure-requests` was considered and omitted from the shipped CSP: it is only meaningful on the canonical host, and Phase 11 had no way to verify it there. |
| A3 | Rate limiting and bot filtering on `/login`, `/financing/apply`, `/contact`, `/search` | **M** | No rate limiting exists anywhere. When OTP is real, `/login` is the first endpoint an attacker will hammer. |
| A4 | Security.txt (`/.well-known/security.txt`) with a disclosure address | **S** | Nothing exists today. |
| A5 | Confirm `Cross-Origin-Resource-Policy: same-origin` does not break legitimate embeds (e.g. an app-store badge or a partner widget) | **S** | Phase 11 added it. It constrains who may embed *our* responses, not what we load, but it is unverified against real marketing embeds. |

## B. Secrets and configuration

| # | Requirement | Grade | Why / Phase 11 context |
| --- | --- | --- | --- |
| B1 | `MARKAB_API_TOKEN` supplied by the platform secret store; never a `NEXT_PUBLIC_*` variable, never a committed file | **M** | `lib/env/server.ts` is the only door. The HTTP provider additionally refuses to call the API without a token. |
| B2 | Token rotation schedule and revocation procedure | **S** | No rotation is possible or needed while no token exists. |
| B3 | Separate secrets per environment; production secrets never present in preview or CI logs | **M** | |
| B4 | `MARKAB_IMAGE_UNOPTIMIZED` and `MARKAB_ALLOW_PREVIEW_FRAME` **unset** in production | **M** | Both default to the production-correct value. Verify on the deployed host that `X-Frame-Options: DENY` and `frame-ancestors 'none'` are present — if the preview flag leaks into production, the site becomes frameable. |
| B5 | Confirm the server can complete a TLS fetch to `api.markab.uz` before enabling image optimisation | **M** | The Phase 10 regression was exactly this: optimisation makes the *server* the HTTP client. Keep the flag as the escape hatch, but verify rather than assume. |

## C. Content-Security-Policy

| # | Requirement | Grade | Why / Phase 11 context |
| --- | --- | --- | --- |
| C1 | Remove the `script-src 'unsafe-inline'` allowance | **S** | Phase 11 measured that with it present, Chromium also permits `eval`. Two routes to removal: (a) render the affected routes per request so Next.js can stamp nonces — it only does so for dynamic responses, which is why prerendered pages broke; or (b) add a build step that injects nonces into prerendered HTML and serves it through a layer that can rewrite the body. Route (a) costs the prerendering that Phase 10 measured; route (b) costs infrastructure. Decide with measurements, not preference. |
| C2 | If C1 is deferred, at minimum split `script-src-elem` (inline allowed) from `script-src` (no `unsafe-eval`) — **only after** deciding the old-browser trade | **C** | Blocks `eval` on browsers with `script-src-elem` support (Chrome 75+, Firefox 105+, Safari 15.4+) but breaks hydration entirely on older ones, because `script-src` then refuses every inline script. |
| C3 | Add `report-to` / `report-uri` and monitor violations | **S** | Without reporting, a policy that silently blocks something is invisible. |
| C4 | Re-check `connect-src 'self'` when the real API is wired up | **M** | Deliberate: adding `https://api.markab.uz` should be a decision, not a side effect. |

## D. Dependencies and supply chain

| # | Requirement | Grade | Why / Phase 11 context |
| --- | --- | --- | --- |
| D1 | Upgrade `next` past the `postcss <=8.5.22` advisories (audit suggests 16.3.4, a semver-major) | **S** | Phase 11 deliberately did not take a major upgrade inside a security phase. Verify against the Phase 9 and Phase 10 regression suites, not just a green build. |
| D2 | `npm audit` in CI, failing on new high/critical findings | **S** | |
| D3 | Lockfile integrity: `npm ci` only, `--ignore-scripts` where possible, provenance review on new dependencies | **S** | |
| D4 | Pin and periodically re-verify the image host allow-list in three places | **S** | `lib/security/url.ts` (`ALLOWED_IMAGE_HOSTS`), `next.config.mjs` (`remotePatterns`), and the CSP `img-src`. Three lists, one decision — they must move together. |

## E. Application and data

| # | Requirement | Grade | Why / Phase 11 context |
| --- | --- | --- | --- |
| E1 | Server-side validation mirroring every client-side rule | **M** | The prototype's validation is a UX affordance. Forms are intercepted in JS and never reach a server; the moment they do, client checks are advisory only. |
| E2 | CSRF protection on every state-changing endpoint, plus `SameSite=Lax` or stricter on any session cookie | **M** | No cookies exist today. |
| E3 | OTP hardening: rate limit per number and per IP, attempt counter, expiry, no enumeration difference between "number unknown" and "code wrong" | **M** | `lib/auth/service.ts` refuses everything today, so none of this exists. |
| E4 | Structured server-side logging with correlation ids, and alerting on error-rate spikes | **S** | `lib/errors.ts` logs to stdout and returns a constant message. Something must consume those logs. |
| E5 | Decide retention and residency for contact, application and sell submissions | **M** | Uzbekistan data-residency rules apply to personal data. The UI already states that drafts keep no name, phone or message — keep that promise at the backend. |
| E6 | Re-audit `localStorage` when real account state arrives | **M** | Cart, saved items and drafts are browser-local and attacker-writable; Phase 11 validates them on read. A real account must not trust them as input. |

## F. Assurance

| # | Requirement | Grade | Why / Phase 11 context |
| --- | --- | --- | --- |
| F1 | Independent penetration test before launch | **M** | Phase 11 is a self-assessment. |
| F2 | Automated header/CSP regression check in CI | **S** | Phase 11 verified headers by hand against a running build; that check should be repeatable. |
| F3 | ESLint (with a security plugin) — still not configured in this repository | **C** | True before Phase 11 and unchanged by it; `tsc` remains the only static gate. |
| F4 | Re-run the accessibility and performance suites after any security change | **S** | The CSP and header changes were re-verified in Phase 11 for hydration, overflow and console errors; keep doing that. |
