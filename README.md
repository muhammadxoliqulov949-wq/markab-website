# markab-website

## Phase status

| Phase | Deliverable | Status |
|---|---|---|
| **0** | Deep website audit | ✅ Complete — [`docs/MARKAB-2.0-PHASE-0-AUDIT.md`](docs/MARKAB-2.0-PHASE-0-AUDIT.md) |
| **0.5** | Critical foundation & functionality fix | 🟡 **Blocked — awaiting the frontend source in this repo** |
| **1** | Homepage redesign | ⏳ Not started (must follow 0.5) |

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
