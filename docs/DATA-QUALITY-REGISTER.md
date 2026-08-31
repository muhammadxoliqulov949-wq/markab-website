# DATA QUALITY REGISTER — Phase 0.5 (Priority 8)

**Method:** every entry below was observed on the live site (markab.uz) during the Phase 0 audit and re-verified by direct request. Nothing here is inferred from assumption.

**Policy:**
* Fix **only** what is provably wrong from existing source data (formatting, enum→label mapping, copy).
* **Quarantine** (hide from public listings) records that fail minimum publish standards.
* **Flag** everything else as *AWAITING OFFICIAL DATA* — do **not** silently invent a replacement value.

Status legend: 🟢 auto-fixable · 🟡 fix + human review · 🔴 quarantine / awaiting official data

---

## A. VEHICLES

| # | Record / field | Observed value | Why it is a defect | Action | Status |
|---|---|---|---|---|---|
| V-1 | **Chery Tiggo 7 Pro** — price | **`1 so'm`** (also no image, 2026 y., 0 km) | Price is 5–8 orders of magnitude below every other vehicle; detail page `/car/chery-tiggo-7-pro` returns *“Ma'lumotlar topilmadi.”* — the listing card links to a record users cannot open | **Quarantine**: unpublish until price, photos and detail record are corrected. Add a price-floor validation rule | 🔴 |
| V-2 | Vehicle detail — fuel type | **`petrol`** | Raw DB enum rendered to users instead of Uzbek | Map enum → `petrol → Benzin`, `diesel → Dizel`, `hybrid → Gibrid`, `electric → Elektr`, `gas → Gaz` | 🟢 |
| V-3 | Vehicle detail — transmission | **`automatic`** | Raw DB enum rendered to users | Map enum → `automatic → Avtomat`, `manual → Mexanik` | 🟢 |
| V-4 | Vehicle gallery — alt text | **`View 1` … `View 9`** | Untranslated English alt text; also an accessibility defect | `Rasm 1` … `Rasm 9` (locale-aware) | 🟢 |
| V-5 | Vehicle detail — mileage | **`53000 km`** | Missing thousands separator; listing shows `53,000 km` for the same car — inconsistent formatting between surfaces | Apply one number formatter everywhere | 🟢 |
| V-6 | Vehicle detail — features | **“Xususiyatlar haqida ma'lumot kiritilmagan”** | Admin-facing message rendered to customers; appears on every vehicle checked | Replace with customer-facing empty state (see UZ-COPY-FIXES) | 🟡 |
| V-7 | Vehicle detail — description | **`Moshina haydashga tayyor`** / **`moshina tayyor holatda turibdi`** | Spelling (`Moshina` → `Mashina`), lowercase start, no editorial standard | Fix spelling/casing; add a description minimum-quality rule | 🟡 |
| V-8 | Monthly payment coverage | Missing on Zeekr 001, Chevrolet Malibu 2 (2023), Chery Tiggo 7 Pro, Chevrolet Monza, KIA K5, Chevrolet Nexia 2 — present on Cobalt, BMW i3s, Lacetti, Malibu 2 (2022) | Financing data is inconsistent within one catalogue; the key number appears on roughly half the cards | Requires the financing field source (API). Do **not** compute missing values | 🔴 |
| V-9 | **BMW i3 2025** — fuel type | Listed as **`Gibrid`** while sibling BMW i3 listings are `Elektr` | Possibly a genuine trim difference (i3 Range Extender exists), possibly a data-entry error — **cannot be determined from public data** | Flag for official verification; do not auto-correct | 🔴 |
| V-10 | Trim naming | `Chevrolet Malibu 2`, `Chevrolet Nexia 2`, `Chevrolet Cobalt 2023`, `BMW i3 2024` | Inconsistent naming convention (some carry the year, one carries a stray “2”) | Awaiting naming standard from Markab | 🔴 |
| V-11 | Vehicle detail — “Muddatli to'lov” | Heading renders with **no content** | The most important block on the page is empty (Priority 5) | Structure + pending-integration marker until API values exist | 🔴 |
| V-12 | Trust badge copy | **`Shafof moliya`** | Spelling error inside the *transparency* badge | `Shaffof moliya` | 🟢 |

---

## B. ELECTRONICS

| # | Record / field | Observed value | Why it is a defect | Action | Status |
|---|---|---|---|---|---|
| E-1 | `iphone 16 Pro Max (A2909/26) E1295/26` | **`100 GB 256%`** | Storage `100 GB` is not an iPhone capacity and battery health `256%` is physically impossible | **Quarantine** the record; add validation (storage ∈ allowed set; battery ≤ 100%) | 🔴 |
| E-2 | Product titles (all) | `IPhone 15 Pro Max (A3593/26) E2305/26 256 GB 83%` | Internal SKU/warehouse codes exposed in public titles; no structure | Enforce a title template: `Brand Model · Storage · Battery%`; keep SKU in a separate admin field | 🟡 |
| E-3 | Brand casing | `IPhone` / `Iphone` / `iphone` / `iPhone` on different cards | Inconsistent capitalisation across identical products | Normalise to the official brand spelling (`iPhone`) | 🟢 |
| E-4 | Category tabs | `Barchasi / Smartfonlar / Kompyuter va noutbuklar / **Phones**` | English label mixed into Uzbek navigation; `Phones` duplicates `Smartfonlar` | Rename to `Telefonlar` **or** remove the duplicate — **needs taxonomy decision** | 🟡 |
| E-5 | Stock state | One card shows **`Qolmadi`** styled like an actionable button | Disabled state rendered as an active control; users can attempt to act on an unavailable item | Proper disabled state + `O'xshashlarini ko'rish` alternative | 🟢 |
| E-6 | Badge claim | **`Arzon narx kafolati`** on every electronics card | A price-guarantee claim applied universally with no terms/verification visible anywhere | **Do not remove unilaterally** — flag; a marketing/legal claim needs owner sign-off | 🔴 |
| E-7 | Product detail route | 42 products listed, **every tested detail ID returns “Ma'lumotlar topilmadi.”** (IDs 1, 3, 10, 25, 100, 1000); ID `2` → HTTP 500 | The entire catalogue is a dead end (Priority 3) | Fix identifier mapping between listing and detail | 🔴 |
| E-8 | Specifications | Unknown — PDP unreachable | Cannot be audited until E-7 is fixed | Re-run this audit after the routing fix | 🔴 |

---

## C. SITE-WIDE

| # | Item | Observed | Action | Status |
|---|---|---|---|---|
| S-1 | Homepage featured modules | *“Hozircha avtomobillar mavjud emas”* / *“Hozircha mahsulotlar mavjud emas”* while 20 cars + 42 products exist | Fix featured query + fallback chain (Priority 4) | 🔴 |
| S-2 | News | `/news` empty; `/news/{id}` → *“Yangiliklar**qa** qaytish”* (typo) | Fix typo; empty state | 🟢 |
| S-3 | Testimonials | *“Hozircha fikr-mulohazalar yo'q”* rendered as a full homepage section | Hide the section until real reviews exist | 🟢 |
| S-4 | Loyalty | Homepage says *“Ishlab chiqilmoqda”* while a complete `/loyalty` page exists | Reconcile — **business decision**, flagged | 🟡 |
| S-5 | Number/currency formatting | `so'm`, `$`, `1$ = 1 ball`, `12,450` used inconsistently across a UZS-denominated product | One currency formatter + one locale | 🟢 |
| S-6 | Intermittent HTTP 500s | `/terms`, `/electronics/2`, `/cars/1`, `/cars/{uuid}` during the audit | Error handling + monitoring (Priority 7) | 🔴 |

---

## D. VALIDATION RULES TO ADD (prevents recurrence)

**Vehicles:** price ≥ sensible floor (e.g. > 1,000,000 so'm) · ≥ 1 image · year within [1990, current+1] · mileage ≥ 0 and plausible for the year · fuel/transmission from the allowed enum · description ≥ 80 characters · detail record must resolve.

**Electronics:** storage ∈ {16, 32, 64, 128, 256, 512, 1024} GB or device-appropriate set · battery health ∈ [1, 100] · ≥ 1 image · title matches the template · brand from a controlled list · stock status ∈ {in_stock, out_of_stock, preorder} · detail record must resolve.

**Both:** a nightly job that crawls every listing card and asserts its detail page returns 200; a report of records failing validation (quarantine candidates), reviewed by a human before unpublishing.

---

## E. SUMMARY

| Status | Count |
|---|---|
| 🟢 Auto-fixable (formatting, enums, typos, states) | 9 |
| 🟡 Fix + human review (copy, taxonomy, naming) | 6 |
| 🔴 Quarantine / awaiting official data | 11 |
| **Total** | **26** |

**Nothing in this register will be auto-corrected by inventing a value.** Where the true value cannot be determined from existing source data, the record is flagged and, if it fails publish standards, quarantined from public listings.
