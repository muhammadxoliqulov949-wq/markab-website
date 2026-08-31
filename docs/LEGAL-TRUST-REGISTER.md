# LEGAL / TRUST CONSISTENCY REGISTER — Phase 0.5 (Priorities 10 & 11)

> ## ⚠️ ENGINEERING POLICY
> **No conflict in this document will be resolved by an engineering decision.**
> Every conflicting value is **preserved**, centralised into one constants module, and marked with:
> `// TODO(legal-verify): conflicting sources — see docs/LEGAL-TRUST-REGISTER.md §n`
> The website UI must **not** add any new legal, licensing, certification or privacy claim while a conflict is open.

Sources referenced:
* **[SITE]** markab.uz rendered pages
* **[PRIVACY]** https://markab.uz/privacy (v1.0)
* **[PLAY]** Google Play listing, `uz.markab.markab`
* **[APPLE]** App Store listing, `id6754150329`

---

## 1. LEGAL ENTITY NAME — 4 different forms observed

| Source | Value |
|---|---|
| [PRIVACY] | **“Markab Mulk” MChJ** — named as the personal-data operator (shaxsga doir ma'lumotlar operatori) |
| [SITE] car detail seller block | **“MARKAB MULK KOMMANDIT SHIRKATI”** — badge: *Tasdiqlangan sotuvchi* |
| [PLAY] | **“MARKAB MULK, MCHJ”** |
| [APPLE] | Seller **“TOWN PROPERTY MANAGEMENT SOLUTIONS, MCHJ”** · Developer **“TPM Solutions”** |

**Conflict:** MChJ (limited liability company) vs **kommandit shirkat** (limited partnership) are different legal forms; and two different Romanised names appear across stores.

**Required from Markab (human verification):**
1. The single registered legal name (Uzbek + Latin) to display on the website, in `/privacy`, `/terms` and the footer.
2. The legal form (MChJ / kommandit shirkat / boshqa).
3. STIR / INN and registration date.
4. The relationship — if any — between *Markab Mulk* and *Town Property Management Solutions / TPM Solutions*, and whether that relationship should be disclosed publicly.

**Code action:** `LEGAL_ENTITY` in `src/config/legal.ts` (or project equivalent), all surfaces read from it, conflict marker attached, **no value chosen**.

---

## 2. ADDRESS — 2 different locations

| Source | Value |
|---|---|
| [SITE] office block + map | **Toshkent shahri, Kukcha Aryk, Yunusobod tumani** (map ≈ 41.331985, 69.223558) |
| [PLAY] developer address | **17, Chustiy MFY, Beruniy B1 village, 100020, Tashkent, Tashkent region (Toshkent viloyati)** |

**Conflict:** different districts *and* different administrative levels (Tashkent **city** vs Tashkent **region**).

**Required:** the single official visiting address + any additional office/warehouse, and which one is public-facing.

**Code action:** `OFFICE_ADDRESS` constant, conflict marker, no value chosen.

---

## 3. PHONE NUMBERS — 2 different numbers

| Source | Value |
|---|---|
| [PLAY] main phone | **+998 93 392 72 22** |
| [PLAY] developer section | **+998 92 023 71 00** |

**Note:** neither number appears prominently on the website — the site's main contact affordance is a form plus call/message buttons on the seller block.

**Required:** the official support phone (and sales phone, if different) to publish on `/contact` and in the footer.

---

## 4. EMAIL ADDRESSES

| Source | Value |
|---|---|
| [PLAY] support email | **markabinvest@gmail.com** |
| [PLAY] developer email | **markabmulk@gmail.com** |

**Required:** which address is the public support contact; ideally a domain-based address rather than a free mail provider (advisory only — not an engineering decision).

---

## 5. DOMAINS — brand split across two domains

| Source | Value |
|---|---|
| Canonical site | **markab.uz** |
| [APPLE] developer website | **markabstore.uz** |
| [APPLE] privacy policy URL | **markabstore.uz/privacy** |
| [PLAY] privacy policy URL | **markab.uz/privacy** |

**Observed:** `markabstore.uz` **did not respond** during the Phase 0 audit (request failed). If a store listing points at a domain that does not resolve, users clicking through from the App Store hit a dead site.

**Required:** is `markabstore.uz` owned/active? Should it 301-redirect to `markab.uz`, or should the App Store listing be corrected?

**Code action:** do **not** create cross-domain links. Keep the site canonical on `markab.uz`; flag the store-listing mismatch for the app team.

---

## 6. PRIVACY POLICY vs APP-STORE DECLARATIONS — ⚠️ material contradiction

This is the highest-severity item in this register.

| Source | Statement |
|---|---|
| [PRIVACY] — data collected | Full name · gender · date of birth · home address · passport number & expiry · **JSHSHIR (personal identification number)** · passport and/or **selfie photo** · phone number · **bank card number & expiry** · device contacts · camera photos · device model/OS/unique identifiers · transaction data (location, time, amount, method) |
| [PRIVACY] — purposes | Contract fulfilment, payment services, **scoring / creditworthiness analysis**, identification, AML/CFT compliance, communication |
| [APPLE] App Privacy | **“Data Not Collected — The developer does not collect any data from this app.”** |
| [PLAY] Data safety | **“No data collected”** · **“No data shared with third parties”** |

**Why this matters:** the two statements cannot both be accurate. It is publicly visible on two storefronts and in a signed privacy policy, it concerns national-ID and card data, and store declarations are a compliance artefact in most jurisdictions.

**Engineering action (per instruction — do not modify legal claims on assumptions):**
1. **Preserve** the existing `/privacy` text verbatim. Do not edit, summarise or "harmonise" it.
2. **Do not** change the store declarations — that is the app team's/owner's task.
3. Add a code marker where the privacy link/consent is rendered:
   `// TODO(privacy-verify): website privacy policy lists ID/passport/card/contact data; App Store & Play declare "no data collected". Reconcile before publishing any privacy claim in the UI. See docs/LEGAL-TRUST-REGISTER.md §6.`
4. **UI rule:** add **no new** privacy or security claims in this phase. The existing line *“Ma'lumotlaringiz xavfsiz va maxfiy saqlanadi”* may remain as-is (existing published wording) but must not be amplified or repeated as a badge/certification.
5. Add a `/privacy` **version + last-updated** field (the document already declares *Versiya 1.0*) so future reconciliation is auditable.

**Required from Markab (human/legal):** which statement reflects reality; then correct the policy text **or** the store declarations, and date the change.

---

## 7. STANDARDS / COMPLIANCE CLAIM — unverifiable as published

| Claim | Where | Evidence available |
|---|---|---|
| *“AAOIFI standartlari talablariga mos”* | Homepage “Nima uchun Markab?” | **None published** — no methodology page, no named supervisory board or scholar, no certificate reference, no audit statement |
| *“Rasmiy kelishuv va oylik hisobdorlik”* | Homepage | No sample agreement, no reporting example |
| *“Barcha avtomobillar tekshirilgan”* | Vehicle detail | No inspection report template or sample |
| *“Kafolatli xavfsizlik”* | Vehicle detail | Undefined claim |
| *“Arzon narx kafolati”* | Every electronics card | No terms or verification |

**Engineering action:** preserve the wording; attach `// TODO(trust-verify): claim has no published evidence — supply supporting documentation or soften the wording.` **Do not add any new certification/standard badge.**

**Required:** supporting documentation, or the precise wording Markab is prepared to defend publicly.

---

## 8. TERMS OF USE — broken page on the consent path

| Item | State |
|---|---|
| `/terms` | Renders **“Hujjatni yuklashda xatolik yuz berdi”** (error loading the document) |
| `/login` consent line | *“Davom etish orqali siz **Foydalanish shartlari** va Maxfiylik siyosati ga rozilik bildirasiz”* |

Users are asked to accept a document they cannot open. Fixed under Priority 2; tracked here because it is a legal-integrity issue.

---

## 9. APP-STORE PRESENTATION INCONSISTENCIES (advisory)

| Item | Observation |
|---|---|
| Language | [APPLE] declares language **EN (English)** while the app description and UI shown are **Uzbek** |
| Ratings | [APPLE] *“hasn't received enough ratings or reviews”*; [PLAY] **1K+ downloads** |
| Category | Both stores: **Shopping** — while the product is a financing/investment platform |
| Website link | [APPLE] → `markabstore.uz`; [PLAY] → `markab.uz/privacy` |

**Engineering action:** no website change. Flagged for the app/product owner.

---

## 10. CONFLICT SUMMARY

| § | Field | Conflicting values | Severity | Owner |
|---|---|---|---|---|
| 1 | Legal entity | 4 forms across site/stores | 🔴 High | Legal / founder |
| 2 | Address | Kukcha Aryk (city) vs Beruniy B1 (region) | 🟠 Medium | Founder |
| 3 | Phone | 2 numbers | 🟠 Medium | Founder |
| 4 | Email | 2 addresses | 🟡 Low | Founder |
| 5 | Domains | markab.uz vs markabstore.uz (unresponsive) | 🟠 Medium | App team |
| 6 | Privacy | Policy lists ID/card/contacts vs stores declare “no data collected” | 🔴 **Highest** | Legal / DPO |
| 7 | Standards/claims | AAOIFI + 4 claims, no published evidence | 🟠 Medium | Compliance |
| 8 | Terms | Broken page on the consent path | 🔴 High | Engineering |
| 9 | Store listing | Language/category/website mismatches | 🟡 Low | App team |

---

## 11. IMPLEMENTATION CONTRACT (what engineering will actually ship)

```ts
// src/config/legal.ts  (project-appropriate path)
export const LEGAL = {
  // TODO(legal-verify): FOUR conflicting forms observed. Do not choose one.
  //   [PRIVACY] "Markab Mulk" MChJ · [SITE] "MARKAB MULK KOMMANDIT SHIRKATI"
  //   [PLAY] "MARKAB MULK, MCHJ" · [APPLE] "TOWN PROPERTY MANAGEMENT SOLUTIONS, MCHJ"
  entityName: null,

  registrationNumber: null, // STIR/INN not published anywhere — do not invent

  // TODO(legal-verify): two different addresses published.
  address: null,

  // TODO(legal-verify): two phone numbers published.
  phone: null,

  emails: {
    // TODO(legal-verify): support vs developer address — which is public?
    support: null,
  },

  documents: {
    privacyUrl: '/privacy',   // live — must stay live
    termsUrl: '/terms',       // currently BROKEN — Priority 2
    offerUrl: null,           // public offer — not published
    riskDisclosureUrl: null,  // required before any investment marketing
  },
} as const;
```

**Render rule:** any surface that would display a `null` legal value renders **nothing** (or the existing published variant) — never a placeholder, never a guessed value. `/contact` may display the office address exactly as currently published on the homepage, since that is existing official site content; the *conflicting* Play-store address is **not** to be merged in.
