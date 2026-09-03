# MARKAB 2.0 — PHASE 0: DEEP WEBSITE AUDIT

**Subject:** https://markab.uz/
**Audit date:** 2026-08-30
**Scope:** Research, UX/UI audit, information architecture, journeys, conversion & trust audit, product & mobile experience, modernization roadmap.
**Status:** ANALYSIS ONLY — **nothing is redesigned or implemented in this phase.** This document is the foundation for *Phase 1: Markab 2.0 Homepage Redesign*.

---

## 0. METHOD, EVIDENCE & HONEST LIMITATIONS

**How this audit was produced**

* Every public route was requested server-side and the rendered content was read and compared (no JavaScript execution).
* Route existence was proven by *differential testing*: a known-good page renders unique content; an unknown route silently renders the **homepage** with the homepage `<title>` (a "soft 404"). This let me map the real route inventory.
* App-store listings (Google Play, App Store), the live `/privacy` legal text and listing/detail pages were read as primary evidence.
* Each route below was visited directly; page quotes are verbatim (translated in brackets).

**Verified route inventory (markab.uz, 2026-08-30)**

| Route | What it is | State |
|---|---|---|
| `/` | Single, very long landing page (≈12 stacked sections) | Live |
| `/cars` | Car listing: **20 vehicles**, filters (price / brand / year / fuel / transmission / colour / "installment available"), UZS-USD toggle, sort, 12-per-page pagination | Live |
| `/car/{slug}` | Car detail, e.g. `/car/chevrolet-cobalt-2023`, `/car/bmw-i3-2024` | Live (slug only — numeric IDs are explicitly rejected) |
| `/electronics` | Electronics listing: **42 products**, tabs (Barchasi / Smartfonlar / Kompyuter va noutbuklar / **Phones**), filters, sort, 4 pages | Live |
| `/electronics/{id}` | Detail route exists, but **every ID tested (1, 3, 10, 25, 100, 1000) returns “Ma'lumotlar topilmadi.”**; ID `2` returned HTTP 500 | Effectively unreachable |
| `/news` | News index → **empty** ("Yangiliklar topilmadi") | Live, empty |
| `/news/{id}` | Article route → error state, typo “Yangiliklar**qa** qaytish” | Live, empty |
| `/loyalty` | Full bonus programme (Bronza / Kumush / Oltin / Platina, earn & redeem tables) | Live, **not linked from homepage** |
| `/sell` | 4-step “sell your car” wizard (car data → photos → contacts → price & confirmation) | Live |
| `/login` | Phone + SMS OTP only | Live |
| `/privacy` | Long legal document, v1.0, operator **“Markab Mulk” MChJ**, cites O'RQ-547 | Live |
| `/terms` | **BROKEN** → “Hujjatni yuklashda xatolik yuz berdi” (error loading the document) | Broken |
| `/invest`, `/investor`, `/investments`, `/about`, `/contact`, `/faq`, `/education`, `/courses`, `/lessons`, `/blog`, `/cart`, `/wishlist`, `/compare`, `/register`, `/sell-car` | **Do not exist** → silently render the homepage | Soft 404 |
| `/profile` | Auth-protected → redirects to **homepage**, not to `/login` | Mis-routed |
| `/sitemap.xml`, `/robots.txt` | Both return empty | Missing |

**Limitations (stated honestly, so the next phase can close them)**

1. **No JavaScript execution** — client-rendered widgets (modals, drawers, carousels, client-side calculators, sticky bars, mobile menu) could not be observed. Where something *may* exist client-side, it is marked **[VERIFY]**.
2. **No CSS access** — colours, type scale, shadows and spacing could not be read from source; visual judgements are marked **[INFERRED]** and are based on marked-up structure, content density and copy patterns.
3. **No device testing** — mobile/responsive behaviour is assessed structurally (page length, element density, form field count, touch-target risk) and marked **[INFERRED]** where relevant.
4. **No analytics access** — no traffic, funnel or performance numbers were available, and none are invented anywhere in this document.
5. `site:markab.uz` returned **no indexed results** in web search, and the server-rendered HTML contains **no navigational `<a href>` links** (only the two app-store links) — i.e. navigation and CTAs are JS-handled. Two independent signals that crawlability is currently very weak. **[VERIFY with Search Console + a rendered-HTML check]**
6. Intermittent **HTTP 500s** were observed on several requests during this audit (`/terms`, `/cars/1`, `/electronics/2`, `/cars/{uuid}`); some succeeded on retry. Treat backend stability as an observed risk, not a one-off.

---

## 0.1 O‘ZBEKCHA QISQACHA XULOSA (Uzbek executive summary)

> Markab — Toshkentda ishlovchi, qadriyatlarga asoslangan (Islomiy) moliya modeli asosida **avtomobil va elektronikani muddatli to‘lovga sotish** hamda **investitsiya (sarmoya) jalb qilish** bilan shug‘ullanuvchi platforma. Sayt hozirda **korporativ vitrina** ko‘rinishida: mahsulotlar bor, lekin ularni sotib olish yoki ariza berish yo‘li yo‘q.

**Eng muhim topilmalar (P0):**

1. **Investitsiya sahifasi umuman yo‘q.** Bosh sahifadagi asosiy CTA (“Markab bilan sarmoyalash” / “Sarmoyalashni boshlash”) hech qayerga olib bormaydi — foydalanuvchi yana bosh sahifaga qaytadi.
2. **Avtomobil kartochkasida “Muddatli to‘lov” bo‘limi bo‘sh.** Oylik to‘lov summasi, kalkulyator va ariza tugmasi — eng muhim konversiya elementlari — yo‘q.
3. **Bosh sahifadagi “Tanlangan takliflar” bo‘sh** (“Hozircha avtomobillar mavjud emas”), holbuki bazada 20 ta avtomobil va 42 ta mahsulot bor.
4. **Elektronika mahsuloti kartochkasi ochilmaydi** — barcha tekshirilgan ID lar “Ma'lumotlar topilmadi” qaytaradi. 42 ta mahsulot — o‘lik nuqta.
5. **Foydalanish shartlari sahifasi ishlamaydi**, lekin login sahifasidagi rozilik matni aynan shu sahifaga havola qiladi.
6. **Moliyaviy shaffoflik yo‘q:** taqsit/murobaha farqi, ustama (marja), foyda stavkasi, xavf haqida ogohlantirish, shartnoma namunasi — hech biri yo‘q. Bu investitsiya sohasida eng katta ishonch muammosi.
7. **Backend beqaror:** bir necha so‘rovlarda 500-xatolik; noto‘g‘ri URL lar jimgina bosh sahifaga qaytaradi.
8. **Ma'lumotlar sifati past:** “1 so‘m” narxli avtomobil, “100 GB / 256%” telefon, "petrol"/"automatic" kabi tarjima qilinmagan qiymatlar.

**Keyingi qadam (Phase 1):** avval *poydevor* — yo‘nalishlar (routes), mahsulot kartochkasi, kalkulyator, “Moliyalashtirish” va “Investitsiya” sahifalari, shartnomalar; keyin — **bosh sahifa 2.0**.

*(Quyidagi to‘liq hisobot ingliz tilida.)*

---

# 1. UNDERSTANDING THE EXISTING PRODUCT

## 1.1 What Markab appears to be

Markab is an Uzbek (Tashkent-based) **values-based / Islamic-finance-style commerce + financing + investment platform**. From the live content, the offer has three legs that share one money engine:

1. **Commerce in installments ("muddatli to'lov")** — buy a car or electronics now, pay over 2–36 months.
2. **Sharia-compliant contract structures** — the site names **taqsit** (deferred sale) and **murabaha** (cost-plus sale) as the contract types, and claims alignment with **AAOIFI** standards.
3. **Investment / profit-share** — "Sarmoyadorlar uchun: Biznesdagi ulush → Oylik foyda → Pul yechish/qo'shish" (*a share in the business → monthly profit → withdraw/top up*), 2–36 month terms, profit withdrawable any time.

So Markab is *not* a classic marketplace, *not* a bank, and *not* a pure investment fund. It is a **closed-loop, inventory-backed halal financing platform**: investors fund the asset pool, customers buy that inventory on murabaha/taqsit terms, and the markup is shared as profit.

That is a genuinely differentiated and defensible model — **and the website currently communicates almost none of it.**

## 1.2 Page inventory, navigation and structure

**Homepage (`/`) — a single scrolling page with ~12 stacked sections, in this order:**

1. Hero — “Qadriyatlarga asoslangan xotirjamlik!” (*Values-based peace of mind*), 2 CTAs (**Avtomobillarni ko'rish** / **Markab bilan sarmoyalash**), 3 micro-badges (Xavfsiz to'lovlar · Qadriyatlarga mos moliya · Ishonchli va oson)
2. “Nima uchun Markab?” — 4 value props: AAOIFI-aligned finance · fair profit distribution via official agreement + monthly reporting · flexible 2–36 months · withdraw profit any time
3. “Tanlangan takliflar” (Featured) — **empty** for both cars and electronics
4. “Muddatli to'lov qanday ishlaydi” — 4 steps: *Tanlang → Tasdiqlash → Shartnoma → Oling*
5. “Yangiliklar” (News) — **empty**
6. “Mijozlar fikri” (Testimonials) — **“Hozircha fikr-mulohazalar yo'q”**
7. “Sarmoyadorlar uchun” (For investors) — 3-step diagram + CTA “Sarmoyalashni boshlash”
8. “Sadoqat dasturi” (Loyalty) — **“Ishlab chiqilmoqda” (under development)**
9. “Ta'lim markazi” (Education centre) — 3 lessons, 5–10 min each, + “Barcha darslarni ko'rish”
10. “Markab ilovasini yuklab oling” — App Store + Google Play + 4 bullets
11. Phone mock-up image: “Halol moliya platformasi”, next payment 3 days / 5,000,000 so'm, 12,450 bonus points, Avtomobillar / Elektronika
12. FAQ (5 Qs: approval time, required documents, free delivery, early repayment, how investors withdraw) + Office (map, Toshkent shahri, Kukcha Aryk, Yunusobod tumani, Mon–Fri 9:00–18:00) + Contact form (name, phone, product type, subject, message)

**Other live surfaces:** `/cars` (listing) · `/car/{slug}` (detail) · `/electronics` (listing) · `/electronics/{id}` (detail, broken) · `/news` (empty) · `/loyalty` (full, unlinked) · `/sell` (4-step wizard) · `/login` (phone OTP) · `/privacy` (legal) · `/terms` (broken).

**Navigation:** there is **no discoverable primary navigation system** in rendered markup — no About, no Invest, no Education, no Contact page, no FAQ page, no account area. Everything collapses into one homepage. **[VERIFY]** whether a header nav exists client-side; from the server-rendered HTML and from direct route testing, the site behaves as a one-page site with three working destinations (cars, electronics, and a phone form).

## 1.3 Services, products, journeys, forms, trust elements

| Category | What actually exists |
|---|---|
| **Products** | 20 cars (used & new: Zeekr, Chevrolet, BMW, KIA, Chery), 42 electronics items (almost all Apple iPhones, sold with battery-health % in the title) |
| **Services** | Installment sale (muddatli to'lov / taqsit / murabaha), sell-your-car (`/sell`), become-a-seller entry (electronics), investment participation, loyalty/bonus programme |
| **CTAs** | “Avtomobillarni ko'rish”, “Markab bilan sarmoyalash”, “Sarmoyalashni boshlash”, “Barchasini ko'rish”, “Batafsil”, “Savatchaga”, “Avtomobil sotish”, “Sotuvchi bo'lish”, “Yuborish” (contact form), app-store badges, “Telefon / Xabar” on seller block |
| **Forms** | Contact form (home) · 4-step sell-car wizard · login OTP · electronics add-to-cart (no reachable cart page) |
| **Trust elements** | AAOIFI mention · “official agreement + monthly accountability” claim · “Tasdiqlangan sotuvchi” badge · “Kafolatli xavfsizlik – Barcha avtomobillar tekshirilgan” · “Foizsiz to'lov imkoniyati” · office address + map + working hours · “Ma'lumotlaringiz xavfsiz va maxfiy saqlanadi” line under the contact form |
| **Financial info** | Terms 2–36 months; profit withdrawable any time; per-item monthly payment on *some* listing cards. **No markup/rate disclosure, no total-cost, no APR-equivalent, no fees, no minimum/maximum amounts, no example calculation, no risk disclosure.** |
| **Educational content** | 3 lesson titles (5–10 min each) — but **no reachable lesson pages** |
| **Mobile/app** | iOS + Android app (Markab / MarkabMulk), promoted with 4 bullets (fast payment, push notifications, special offers, bonus points) |
| **Contact/support** | Contact form, office address & hours, phone & message buttons on the seller block, support email published on Google Play |

## 1.4 Likely target users

| Segment | Intent | How the site serves them today |
|---|---|---|
| **A. Installment buyer (core)** — 25–45, Tashkent, monthly-salaried or remittance-dependent, wants a car/phone **without interest**, often rejected by banks | “Get this specific car/phone, monthly, halal, no hidden cost” | Browse → view photos → **no calculator, no apply** → must call/message or use the generic form |
| **B. Religious-values-driven buyer** | “Is this genuinely halal? Show me the contract and the structure” | A single mention of “taqsit yoki murobaha” and an AAOIFI badge; **no explanation, no proof, no documents** |
| **C. Small investor / saver** | “Park savings, earn monthly profit, halal, withdraw when needed” | One homepage block + a CTA that leads nowhere |
| **D. Seller** (car owner, electronics vendor) | “Sell my car / list my goods with you” | `/sell` wizard exists; the electronics “Sotuvchi bo'lish” path is unexplained |
| **E. Existing customer** | “Check my next payment, pay, get support” | **Nothing on web** — pushed to the mobile app; `/profile` dumps you on the homepage |

**What Markab is trying to communicate:** *trust, values and peace of mind* (“Qadriyatlarga asoslangan xotirjamlik”, “Halol moliya platformasi”, “Shaffof investitsiya”). The intent is right. **The execution contradicts it**: empty product carousels, an unreachable product catalogue, a broken legal page, and an investment CTA that goes nowhere all signal the opposite of “transparent and reliable”.

---

# 2. UX AUDIT

> Format per finding: **PROBLEM · WHY IT MATTERS · SEVERITY · RECOMMENDED SOLUTION**
> Severity: **P0** critical · **P1** high · **P2** medium · **P3** low

### UX-01 — The investment CTA is the site's loudest promise and it leads nowhere
**PROBLEM.** “Markab bilan sarmoyalash” (hero) and “Sarmoyalashni boshlash” (investor block) point to a route that does not exist. `/invest`, `/investor`, `/investments` all silently render the homepage with the homepage title. **WHY IT MATTERS.** This is the highest-value, highest-trust journey on the site. A user who clicks “start investing” and lands back on the hero experiences a broken product — and in a money-collection context, that is a trust-ending event, not a minor bug. It also means **zero** lead capture for the business's funding side. **SEVERITY: P0.**
**SOLUTION.** Build a real `/invest` destination (see IA §4): how the model works, contract type, indicative profit mechanics, term selection, minimums, risks, calculator, reporting cadence, and one primary action (OTP-verified application or a callback booking). Until it ships, replace the CTA with a working placeholder that captures intent (phone + amount + term) rather than a dead link.

### UX-02 — Car detail page: the “Muddatli to'lov” block is empty
**PROBLEM.** On `/car/chevrolet-cobalt-2023` and `/car/bmw-i3-2024` the page shows a “Muddatli to'lov” heading with **no monthly payment, no term selector, no calculator, no total cost, no apply button** — even though the listing card for the same BMW displayed “15,795,000 so'm/oy”. **WHY IT MATTERS.** The PDP is the single highest-intent screen in the product. The one number the user needs (what will I pay per month?) and the one action they want (apply) are missing, so intent dies at the moment of maximum motivation. **SEVERITY: P0.**
**SOLUTION.** PDP must ship with: cash price, monthly payment for a default term, **an interactive term slider (2–36)** that recalculates instantly, total cost + markup amount shown transparently, down-payment input, “Ariza qoldirish” primary CTA, and “what you need to apply” checklist. Make the financing panel sticky on desktop and a sticky bottom bar on mobile.

### UX-03 — The homepage merchandising surface is empty while inventory exists
**PROBLEM.** “Tanlangan takliflar” shows “Hozircha avtomobillar mavjud emas” and “Hozircha mahsulotlar mavjud emas”, while `/cars` lists 20 cars and `/electronics` lists 42 products. **WHY IT MATTERS.** The homepage's only product-discovery module is dead, so the homepage cannot convert browsing intent at all; it also *looks* like an abandoned business to a first-time visitor. **SEVERITY: P0.**
**SOLUTION.** Fix the featured/API query (featured flag or newest-N fallback), and design the section so it never renders empty: carousel/tabs with real inventory, monthly payment on every card, and a “Barchasini ko'rish” link to the filtered listing.

### UX-04 — The entire electronics catalogue is a dead end
**PROBLEM.** 42 products are listed with “Batafsil” buttons, but every product detail ID tested returns “Ma'lumotlar topilmadi.” (`/electronics/1`, `/3`, `/10`, `/25`, `/100`, `/1000`); `/electronics/2` returned HTTP 500. **WHY IT MATTERS.** Roughly two-thirds of the sellable inventory cannot be inspected. Users can see a price but never see photos, condition, warranty or terms — so the catalogue generates interest it cannot convert, and the add-to-cart button is meaningless. **SEVERITY: P0.**
**SOLUTION.** Debug the product-detail route/ID mapping (listing IDs vs detail IDs are evidently different identifiers), add automated monitoring that crawls every listing card and asserts its PDP returns 200, and add a proper “product not available” state that preserves the user in the catalogue with recommendations.

### UX-05 — Terms of Use is broken, and it is the page users must consent to
**PROBLEM.** `/terms` renders “Hujjatni yuklashda xatolik yuz berdi” (error loading the document). The login screen says: “Davom etish orqali siz **Foydalanish shartlari** va Maxfiylik siyosati ga rozilik bildirasiz.” **WHY IT MATTERS.** Users are asked to accept a document they cannot read. For a company collecting personal data and money, this is a legal, compliance and trust failure — and it is on the authentication path. **SEVERITY: P0.**
**SOLUTION.** Fix immediately (static, versioned, non-API-dependent rendering); add `/terms`, `/privacy`, `/offer` (public offer), and an investor **risk disclosure** to a permanent legal footer; version and date every document; never link to a document you cannot guarantee will load.

### UX-06 — Unknown routes silently render the homepage (soft 404)
**PROBLEM.** Any mistyped or stale URL (`/about`, `/contact`, `/faq`, `/education`, `/cart`, `/invest`…) returns the homepage with HTTP success and the homepage title. `/profile` also dumps authenticated-route visitors on the homepage instead of `/login`. **WHY IT MATTERS.** (a) Users lose orientation — the page changes but the URL and title say they are home; (b) analytics cannot distinguish “visited home” from “hit a broken link”; (c) it destroys crawlability and indexation; (d) auth mis-routing makes the product feel unfinished. **SEVERITY: P0.**
**SOLUTION.** Implement a real 404 (correct status code, search + top categories + contact), return **404** for unmatched routes, and send unauthenticated users from protected routes to `/login?next=…`.

### UX-07 — Intermittent HTTP 500s on ordinary URLs
**PROBLEM.** Several plain requests returned HTTP 500 during this audit (`/terms`, `/cars/1`, `/electronics/2`, `/cars/{uuid}`), some succeeding on retry. **WHY IT MATTERS.** Money-adjacent journeys amplify perceived instability: a 500 during an application or a document upload reads as “my money/data may be lost”. It also blocks crawling. **SEVERITY: P0.**
**SOLUTION.** Add error monitoring + alerting, structured error handling for missing records (404 not 500), retry/timeout policy on the content API, and uptime checks on the top 10 routes.

### UX-08 — No calculator anywhere on a financing product
**PROBLEM.** There is no payment calculator on the homepage, the listing, or the PDP. Monthly figures appear on *some* listing cards with no term, no down payment and no total. **WHY IT MATTERS.** “Can I afford this?” is the decisive question for the target user (salary-based, credit-constrained). Without a calculator the user must call or guess — the single biggest drop-off in installment commerce. **SEVERITY: P1.**
**SOLUTION.** A shared calculator component (price, down payment, term 2–36, monthly payment, total, markup) rendered on: hero, every listing card, every PDP, and a dedicated `/financing` page. Persist the user's inputs across pages and pre-fill the application with them.

### UX-09 — No online application flow for the core product
**PROBLEM.** There is no “apply for installment” flow. The only actions available are: call/message the seller from a car PDP, or fill the generic contact form. **WHY IT MATTERS.** The primary business action cannot be completed on the web. Every interested user is forced into an untracked, asynchronous channel (phone call), which loses intent, prevents funnel measurement, and overloads staff. **SEVERITY: P1.**
**SOLUTION.** A 3–4 step, OTP-verified application: product context auto-attached → term/down-payment → passport + selfie + income → review & submit. Show a saved application state, an estimated approval time, and a status screen (“Ariza #… qabul qilindi, 24 soat ichida…”).

### UX-10 — First-time visitors cannot answer “What is Markab?” in 5 seconds
**PROBLEM.** The hero says “Qadriyatlarga asoslangan xotirjamlik!” — a poetic value statement, not a product statement. Nothing above the fold says *what you can buy*, *how payment works*, or *what it costs*. **WHY IT MATTERS.** High-consideration finance requires instant comprehension. A slogan-only hero forces users to scroll ~12 sections to construct the offer themselves — most will leave first. **SEVERITY: P1.**
**SOLUTION.** Hero pattern: one-line product statement + **three concrete entry points** (Avtomobil / Elektronika / Investitsiya) + 2–3 proof facts (0% interest claim framed correctly, contract type, term range, city) + one primary CTA. Keep the values message as a supporting sub-head, not the only message.

### UX-11 — Terminology is undefined at the exact point of confusion
**PROBLEM.** “Muddatli to'lov”, **taqsit**, **murabaha**, “AAOIFI standartlari”, “biznesdagi ulush”, “oylik foyda” are used without explanation. Taqsit and murabaha appear **once**, inside the 4-step block. **WHY IT MATTERS.** These words carry the entire trust proposition for the values-driven segment. Undefined jargon reads as evasion; understood jargon reads as competence. **SEVERITY: P1.**
**SOLUTION.** A “Shaffof moliya” (transparent finance) hub with plain-language definitions, a worked example, a side-by-side “taqsit vs murabaha” comparison, contract type per product, and links from every place the terms appear (inline tooltips on first use).

### UX-12 — Investors get no numbers, no risks, and no contract
**PROBLEM.** The investor block promises “share in the business → monthly profit → withdraw/top up” with no: minimum amount, expected/indicative profit rate, historical reporting example, fee disclosure, **risk statement**, withdrawal terms, contract sample, or legal entity details. **WHY IT MATTERS.** For a product that takes the public's money, the absence of risk and terms disclosure is the largest trust deficit on the site — and a regulatory exposure, not just a UX issue. **SEVERITY: P0 (trust) / P1 (UX).**
**SOLUTION.** Build `/invest` with: model explanation, **explicit risk disclosure**, indicative mechanics with a disclaimer, term & amount selector, reporting cadence, withdrawal rules, FAQ, and a compliant application. Never show a return figure without an adjacent, equally prominent risk statement.

### UX-13 — Zero social proof in every slot where proof is expected
**PROBLEM.** “Mijozlar fikri” → “Hozircha fikr-mulohazalar yo'q”. “Yangiliklar” → empty. The iOS app has **no ratings yet**; Android shows 1K+ downloads. No counts of customers, contracts, or cars delivered anywhere. **WHY IT MATTERS.** Empty proof modules are worse than absent ones — they advertise that nobody has used the product. In halal finance, community proof is the primary decision driver. **SEVERITY: P1.**
**SOLUTION.** (a) Hide empty modules until real content exists; (b) replace with credible substitutes that already exist: process transparency (“how your contract is registered”), office visit booking, team video, and verifiable facts; (c) systematically collect reviews post-delivery and post-payment (in-app + SMS), and publish with date, city and product.

### UX-14 — Loyalty programme is advertised as “under development” while a full page exists
**PROBLEM.** Homepage: “Sadoqat dasturi — Ishlab chiqilmoqda. Ushbu bo'lim hozirda ishlab chiqilmoqda. Tez orada mavjud bo'ladi!” (`/loyalty` is live with Bronze/Silver/Gold/Platinum tiers, earning rules and rewards). The live page is unlinked from the homepage. **WHY IT MATTERS.** Contradictory state confuses users and hides a finished retention feature — a pure, self-inflicted loss of perceived completeness and of a retention hook. **SEVERITY: P1.**
**SOLUTION.** Reconcile: if `/loyalty` is live, show real content on the homepage (tier progress, points value, “1$ = 1 ball”) and link it; if it is not legally live, remove the public page. Delete “under development” placeholders from the main page entirely.

### UX-15 — Education centre exists as decoration
**PROBLEM.** Three lessons are displayed (5–10 min each) with “Barcha darslarni ko'rish”, but `/education`, `/courses`, `/lessons` do not exist — the link leads back to the homepage. **WHY IT MATTERS.** Education is Markab's strongest differentiator and its best SEO/top-of-funnel asset (people search “murobaha nima”, “foizsiz avtomobil qanday olinadi”). Teasing content that cannot be opened wastes the differentiator and creates a dead click. **SEVERITY: P1.**
**SOLUTION.** Ship `/education` as a real library: lesson pages with progress, quizzes, a glossary, and contextual links from financing pages. Publish lesson 1–3 as full articles immediately (they are already named, so the content presumably exists).

### UX-16 — Product data quality undermines credibility at card level
**PROBLEM.** Verified examples: a **Chery Tiggo 7 Pro priced “1 so'm”** with no photo and a detail page that 404s; “iphone 16 Pro Max (A2909/26) E1295/26 **100 GB 256%**”; inconsistent casing (IPhone / Iphone / iphone); internal SKU codes in public titles; one electronics card shows a **“Qolmadi” (out of stock)** button state. **WHY IT MATTERS.** Buyers read listing hygiene as a proxy for how the business handles contracts and money. A “1 so'm” car is the kind of detail that gets screenshotted and shared. **SEVERITY: P1.**
**SOLUTION.** Validation rules (price floors, storage/battery ranges), required fields before publish (photo, price, description, features), a title template (`Brand Model Year · Storage · Battery%`), and a nightly data-quality report; hide or quarantine records failing minimum quality.

### UX-17 — Empty states leak internal language to users
**PROBLEM.** Car PDP: “Xususiyatlar haqida ma'lumot kiritilmagan” (*no feature information entered*) — an admin-facing message rendered to customers. Also “Ma'lumotlar topilmadi.” (no data found) with a bare “Orqaga”. **WHY IT MATTERS.** Every leaked internal state tells the user “nobody is managing this page”. Empty states are cheap to design and disproportionately affect perceived quality. **SEVERITY: P2.**
**SOLUTION.** Rewrite all empty/error states to customer language with a next action: e.g. “Bu avtomobil uchun qo'shimcha jihozlar ro'yxati hozircha ko'rsatilmagan. Batafsil ma'lumot uchun menejerga murojaat qiling.” + button. Add a shared EmptyState component (illustration, message, action).

### UX-18 — Language & localisation leakage
**PROBLEM.** Car PDP shows raw enum values: **“petrol”, “automatic”, “electric”** instead of Benzin / Avtomat / Elektr. Gallery alt text is **“View 1…View 9”**. Electronics category tabs mix **“Phones”** among Uzbek labels. Typo “**Shafof** moliya” (should be *Shaffof*) in the site's own trust badge; “Moshina haydashga tayyor”; “Yangiliklar**qa** qaytish”. **WHY IT MATTERS.** In a trust business, copy errors read as carelessness; mixed-language UI reads as unfinished; and the specific typo sits inside the *transparency* badge — the worst possible place. **SEVERITY: P2 (copy) / P1 (*Shaffof* badge + PDP spec values).**
**SOLUTION.** Central i18n dictionary with enum→label mapping, no raw DB values in UI, locale-aware alt text, and a copy review checklist (spell-check every trust badge, CTA and legal link). Fix the “Shaffof moliya” badge immediately — it is a one-character change on a high-visibility element.

### UX-19 — No product discovery aids: search, compare, save, filter feedback
**PROBLEM.** No keyword search, no comparison, no favourites/wishlist (`/compare`, `/wishlist` do not exist), no active-filter chips, no result counts on filtered views, no “sort by monthly payment”, no saved searches or price-drop alerts. **WHY IT MATTERS.** Considered purchases (a car!) involve 5–15 candidates over days or weeks. Without comparison or saving, the user must keep everything in their head or in screenshots — and will drift to a competitor that supports it. **SEVERITY: P1.**
**SOLUTION.** Persisted filters in URL, active-filter chips, sort by price/monthly/year/mileage, “compare up to 3”, favourites (saved server-side after OTP), and “X ta yangi avtomobil qo'shildi” alerts. Search with typo tolerance and category scoping.

### UX-20 — No account/dashboard experience on web
**PROBLEM.** Existing-customer jobs (next payment, payment history, contract documents, application status, bonus points) are pushed entirely to the mobile app; `/profile` on web redirects to the homepage. **WHY IT MATTERS.** The web is where trust is *evaluated*; the app is where it is *used*. A user who starts on the web has no continuity — and no way to verify their contract or payment schedule before installing an app. **SEVERITY: P1.**
**SOLUTION.** Web parity for the essentials: OTP login → dashboard with instalment schedule, next payment date/amount, contract PDF, payment history, applications, bonus balance, and support. Progressive disclosure of the app as a convenience, not a gate.

### UX-21 — Cognitive load: one page doing every job
**PROBLEM.** The homepage stacks ~12 sections covering 4 different audiences (buyers, investors, learners, sellers) with no segmentation and no clear next step per audience. **WHY IT MATTERS.** When a page serves everyone, it converts no one. The user must self-identify, self-filter and self-route — high effort at the exact moment motivation is highest. **SEVERITY: P1.**
**SOLUTION.** (See IA §4.) Homepage becomes a **router**: one clear hero + three audience entry cards + proof + how-it-works. Deep journeys move to dedicated pages with a single primary CTA each.

### UX-22 — Contact form is the fallback for everything
**PROBLEM.** A single generic form (name, phone, product type, subject, message) is the only structured capture mechanism on the site. No status feedback, no reference number, no response-time expectation, no validation messaging visible. **WHY IT MATTERS.** It converts every distinct intent (buy, invest, sell, complain) into an unqualified, untracked phone call; users have no idea what happens after submitting, so many will not submit. **SEVERITY: P2.**
**SOLUTION.** Intent-specific forms (car application / investor enquiry / sell your car / support) with OTP verification, expected response time, a visible confirmation state with reference ID, and CRM-side intent tagging. Keep one short “callback in 15 minutes” widget globally.

### UX-23 — No guidance, no error prevention, no reassurance in money flows
**PROBLEM.** No visible form validation patterns, no error/retry states for uploads, no “what happens next”, no document checklist until after the user is already committed, no progress indicator on `/sell` beyond step numbers, no autosave. **WHY IT MATTERS.** Financial and KYC flows are abandonment-prone; uncertainty (“will I lose what I typed?”) is the top cause. **SEVERITY: P2.**
**SOLUTION.** Standard patterns: inline validation, autosave drafts, progress bars with step names, explicit “what you'll need” checklists *before* the form, retry-capable uploads, and a persistent help entry on every step.

### UX-24 — Seller-side journeys are undefined
**PROBLEM.** Two different seller entry points with no explanation: “Avtomobil sotish” (cars listing) → `/sell` 4-step wizard; “Sotuvchi bo'lish” (electronics) → unknown destination. No terms, no commission, no valuation guidance, no “what happens after I submit”. **WHY IT MATTERS.** Supply-side is how inventory grows; an unclear or untracked seller path starves the catalogue and leaves partners guessing about economics. **SEVERITY: P2.**
**SOLUTION.** One `/sell` hub: two tracks (car / electronics), each with process, requirements, commission/valuation logic, expected response time, and a tracked submission with status.

### UX-25 — No cross-linking between the three legs of the model
**PROBLEM.** Cars, electronics, investment and education exist as isolated blocks; nothing connects them. An investor never sees the assets their money funds; a car buyer never sees the financing explainer or the investor story. **WHY IT MATTERS.** The model's *entire* differentiator is the loop between inventory, contract and investor. Unlinked, it reads as three unrelated businesses on one domain. **SEVERITY: P2.**
**SOLUTION.** Explicit connective tissue: on PDPs → “Bu avtomobil qanday moliyalashtiriladi (murobaha)” → `/financing`; on `/invest` → “Mablag'laringiz qaysi aktivlarda” → live inventory; in the education hub → links to the relevant product category.

---

# 3. UI / VISUAL AUDIT

> **[INFERRED]** markers appear where the judgement is based on marked-up structure and content patterns rather than on reading the CSS.

## 3.1 Typography

* **Structure is flat.** The homepage runs H1 → H2 → H3 with almost no supporting body copy: four value props are *title + single line*, product cards are *specs only*, the how-it-works block is *4 verbs*. Long stretches of the page are headings with no explanatory text, which reads as a template with unfilled placeholders rather than designed content. **[INFERRED: low text density + no visible editorial layer]**
* **No visible typographic hierarchy strategy** beyond heading level — no eyebrow labels, no lead paragraphs, no numeric emphasis. Prices and monthly payments, the two most important numbers on the site, appear to be styled like ordinary card metadata rather than as the hero data of each card. **[INFERRED]**
* **Numbers are inconsistently formatted**: “53000 km” (no thousands separator) on the PDP vs “53,000 km” on the listing card; “12,450” bonus points; “$” and “so'm” mixed across pages; loyalty uses “1$ = 1 ball” (dollar sign in an Uzbek-soum product). Inconsistent number formatting is the fastest way to look unprofessional in a finance product.
* **Line-length risk:** legal text (`/privacy`) runs in very long clauses with numbered sub-clauses — typical unformatted legal dump with no summary layer. **[VERIFIED structurally]**

**Recommendation:** define a type scale (display / H1–H4 / body / caption), a **dedicated numeric style** for prices with tabular figures and consistent separators, an eyebrow/kicker style for section labels, and a legal-document reading template (summary box + TOC + readable measure).

## 3.2 Spacing & layout

* **Section rhythm is uniform**: ~12 stacked full-width sections, each with a heading and a grid. With no variation in background, band width or vertical rhythm, the page reads as one undifferentiated scroll — there is no visual “beat” that tells the user where they are or what matters. **[INFERRED]**
* **Card grids are dense but content-thin**: listing cards stack image + badges + price + monthly + title + specs + views + button. On electronics cards, the *title* becomes a 3-line block of SKU text (“IPhone 15 Pro Max (A3593/26) E2305/26 256 GB 83%”), which visually dominates and unbalances the grid (variable card heights). **[VERIFIED: title content]**
* **No whitespace strategy around conversion elements**: the most important controls (apply/calculate) are absent, while low-value elements (view counts: “480 marta ko'rilgan”) occupy prime card real estate. **[VERIFIED]**

**Recommendation:** establish a spacing scale (4/8/12/16/24/32/48/64/96), alternate section backgrounds to create rhythm, enforce fixed card skeletons + title clamping (2 lines) for grid balance, and demote view counts to a caption or remove them.

## 3.3 Colour, surfaces, depth

* **Cannot verify palette** without CSS. **[INFERRED]** Based on badge copy (“Yangi”, “Arzon narx kafolati”, “Tasdiqlangan sotuvchi”, “Kafolatli xavfsizlik”) the site uses at least **four different badge treatments** across two templates, which strongly suggests ad-hoc colour usage rather than a semantic token set (success / info / promo / trust).
* **Trust badges are text-only claims** (“Barcha avtomobillar tekshirilgan”, “Foizsiz to'lov imkoniyati”) with no iconography, no certification marks, no links to proof. Text-only trust signals are weak; icon + label + verifiable link is the standard. **[VERIFIED: badge copy]**
* **Depth/shadow usage is unknown**; however, the content pattern (long page, many bordered blocks, “Sadoqat dasturi” placeholder card) suggests a component set built from generic bordered containers rather than a considered elevation system. **[INFERRED]**

**Recommendation:** build a **design-token layer**: 1 primary (brand), 1 accent (CTA), neutral ramp (surface/border/text), plus semantic colours (success / warning / danger / info) — and a 3-level elevation scale. Assign one visual treatment per badge *type* and reuse it everywhere. Give every trust claim an icon and, where possible, a “verify” affordance (document, page, or certificate).

## 3.4 Buttons & controls

* **Weak, generic CTA labels:** “Batafsil” (*Details*) is the primary action on every product card — for a *financing* product, the primary action should be about the money (“Oylik to'lovni hisoblash”, “Ariza qoldirish”), with details secondary. “Barchasini ko'rish”, “Yuborish”, “Keyingi” are equally generic. **[VERIFIED]**
* **Unclear button hierarchy on cards:** electronics cards show “Batafsil” + “Savatchaga” side by side with no visual primary, and the out-of-stock item shows **“Qolmadi”** styled like an actionable button — a classic disabled-state failure. **[VERIFIED]**
* **No sticky/persistent action layer** is evident in rendered markup. **[VERIFY client-side]**
* **Filter UI is heavy** (`/cars` exposes price range, brand, year, fuel, transmission, colour, installment-availability plus a separate sort control) — for 20 cars this is **over-filtering**: seven filter dimensions for twenty results creates effort without payoff and risks a horizontal-scroll or long-scroll panel on mobile. **[VERIFIED: filter inventory vs result count]**

**Recommendation:** a 3-tier button system (primary / secondary / ghost), action-oriented labels, a proper disabled state (non-interactive, explained: “Qolmadi — o'xshashlarini ko'rish”), and **progressive filtering** — show 3 high-signal filters by default (price, brand, monthly payment) and reveal the rest behind “Barcha filtrlar”.

## 3.5 Cards, borders, imagery

* **Inconsistent card anatomy between the two verticals**: car cards carry year/location/mileage/fuel/transmission + views; electronics cards carry price + monthly + a long SKU title + views. Different information orders between verticals is fine; different *visual grammar* (badge placement, price emphasis, CTA placement) is not. **[VERIFIED]**
* **Imagery quality is unverified but structurally suspect**: one listing item (`Chery Tiggo 7 Pro`) has **no image at all**; the BMW i3 PDP has 3 photos, the Cobalt has 9 — no minimum standard, no consistent aspect ratio enforcement visible. **[VERIFIED: counts]**
* **The homepage uses a static phone mock-up** (screenshot-like PNG) to show the app — a dated pattern; modern practice is device frames with real product UI or short looping video. **[VERIFIED: single static asset]**
* **No photography art direction** is evident for the hero — the hero is type-only with badges. For a car business, the product *is* the visual. **[VERIFIED: no hero image in markup]**

**Recommendation:** one card component per vertical with a shared skeleton; enforce image standards (min 5 photos, min resolution, 4:3 listing / 16:9 detail, consistent background where possible); replace the mock-up with a real device frame or motion; and give the hero a genuine product visual with a price and a monthly-payment overlay.

## 3.6 Responsive behaviour

* **Not directly verifiable without rendering.** The structural risk profile is high: a 12-section homepage, 12-item card grids, 7 car filters, a 12-field sell-car wizard step, and a 100+ item colour list (10 colours with entries like “DarkMoon”) are all mobile-fragile. **[INFERRED]**
* **No separate mobile information architecture**: the homepage order (hero → values → featured → steps → news → testimonials → investors → loyalty → education → app → FAQ → office → form) is almost certainly the same on mobile, putting the contact form ~11 screens down. **[INFERRED]**

**Recommendation:** mobile-first section ordering (see §9), sticky bottom action bar, filter bottom-sheet, one-column card list, and collapsible long content (FAQ, specs).

## 3.7 Overall brand perception

**Reads as:** an early-stage, template-driven corporate brochure with a real (and interesting) business behind it. Language is warm and values-led; execution is hollow — empty modules, placeholder states, broken links, untranslated strings.

**Does not yet read as:** a premium, regulated, trustworthy financial platform. There is a large gap between the **promise** (“values, transparency, peace of mind, AAOIFI”) and the **evidence** on screen (empty carousels, 1 so'm cars, broken terms, “Shafof” typo).

### 3.8 What is already strong and should be PRESERVED

1. **The positioning line** — “Qadriyatlarga asoslangan xotirjamlik!” and “Halol moliya platformasi” are distinctive, ownable and emotionally right for the market. Keep the idea; add specifics.
2. **The 4 value props** (AAOIFI alignment · fair profit distribution with monthly reporting · 2–36 month flexibility · profit withdrawal any time) — these are the right promises. Promote them from four small cards to proof-backed sections.
3. **The 4-step “Muddatli to'lov qanday ishlaydi” flow** (Tanlang → Tasdiqlash → Shartnoma → Oling) — clear, honest, and correctly sequenced. It should become the backbone of the financing page and appear on every PDP.
4. **The investor flow diagram** “Biznesdagi ulush → Oylik foyda → Pul yechish/qo'shish” — the clearest single explanation of the model on the entire site. Reuse it verbatim as the hero of `/invest`.
5. **Public, verifiable location** (Toshkent, Kukcha Aryk, Yunusobod + map + Mon–Fri 9:00–18:00). Physical presence is a major trust asset in this market; make it more prominent and add photos of the office.
6. **Showing the monthly payment on listing cards** — exactly the right instinct for an installment product. Extend it to *every* card and make it interactive.
7. **The education-centre concept** — a real differentiator for a market unfamiliar with murabaha. Invest in it.
8. **Local-language-first content (Uzbek Latin)** with a consistent, friendly tone — keep this as the default voice.
9. **The bonus/loyalty programme design** (tiers, earning and redemption rules) — commercially sound and already fully specified at `/loyalty`. Surface it.
10. **Real, working inventory with view counters** — proof that the business operates; make it visible on the homepage instead of showing “no cars available”.

---

# 4. INFORMATION ARCHITECTURE

## 4.1 How it is organised today

There is effectively **no information architecture** — there is a homepage and three working destinations:

```
/ (everything: buy · invest · learn · sell · FAQ · contact · office)
 ├── /cars  ──► /car/{slug}
 ├── /electronics  ──► (broken)
 ├── /sell (4-step wizard)
 ├── /login (OTP)
 ├── /loyalty (orphaned — not linked)
 ├── /news (empty)
 └── /privacy · /terms (broken)
```

**The relationship between the seven domains you asked about is never expressed:**

| Domain | Has a home? | Connected to others? |
|---|---|---|
| **Automobiles** | `/cars` ✓ | No link to financing, investment or education |
| **Electronics** | `/electronics` ✓ (PDP broken) | No link to financing |
| **Financing (muddatli to'lov)** | ✗ Only a 4-step block on the homepage | Names taqsit/murabaha once, never explains |
| **Taqsit** | ✗ | Mentioned in one sentence |
| **Murabaha** | ✗ | Mentioned in one sentence |
| **Investment** | ✗ **No page exists** | Homepage CTA → dead link |
| **Education** | ✗ | 3 titles, no pages |
| **Mobile app** | Promoted (2 badges) | Positioned as the only way to manage your account |

**Critical structural insight:** financing is *not* a product category in the current IA — it is a **process description inside the marketing page**. But it is the engine of the entire business. Taqsit and murabaha — the two things that make the offer legitimate to the target audience — have **no destination at all**.

## 4.2 Can a first-time visitor understand Markab quickly?

**“What is Markab?”** → *Partially, and only after effort.* The homepage indicates: halal/values-based finance + cars + electronics + investment. It never states the mechanism (investors fund inventory → customers buy on murabaha/taqsit → profit is shared). **A visitor can describe the vibe but not the model.**

**“What can I do here?”** → Four things are implied (buy a car, buy electronics, invest, learn) but only **two are actually doable** (browse cars, browse electronics — and electronics PDPs are broken). Investing and learning are advertised but unreachable. **Promise exceeds capability by ~2×.**

**“What should I click first?”** → Ambiguous. Two hero CTAs of equal visual weight (“Avtomobillarni ko'rish” / “Markab bilan sarmoyalash”) with no guidance on which fits whom, plus a page that immediately offers news, testimonials, loyalty, education, app, FAQ and office. **Too many equal-weight choices, no default path.**

**“What happens after I click it?”** → For cars: a working filtered list, then a PDP with photos and specs but **no price plan and no way to apply**. For invest: **you land back on the homepage**. For education: **you land back on the homepage**. For electronics: **you land back on the homepage**. **Three of the four headline journeys dead-end.**

**Verdict: a first-time visitor cannot build a reliable mental model of Markab.** They can guess it, but the site will contradict the guess at the first click.

## 4.3 Weaknesses in the current IA

1. **One page, four audiences, no routing.** Buyers, investors, learners and sellers share a single linear scroll.
2. **The engine (financing) has no page.** The most differentiating part of the business is a 4-step illustration.
3. **Investment — a money-collection product — has no page, no terms, no risk disclosure, no application.**
4. **Taqsit / murabaha have no definitions,** so the values-driven segment cannot self-qualify.
5. **Education is a teaser with no library** (and the biggest SEO opportunity is being wasted).
6. **Orphaned pages** (`/loyalty`) and **phantom pages** (`/about`, `/contact`, `/faq` implied but absent).
7. **No persistent navigation**, so orientation and cross-discovery depend entirely on scrolling. **[VERIFY client-side]**
8. **No account area** → no retention surface on web.
9. **Vertical silos**: cars and electronics share financing, investment and education — but never meet.
10. **Soft-404 catch-all** destroys navigation integrity, analytics and SEO simultaneously.

## 4.4 PROPOSED INFORMATION ARCHITECTURE (not to be implemented in this phase)

**Design principle:** *separate the three jobs (Buy · Finance · Invest), connect them with one transparent explanation layer, and give every audience exactly one primary action.*

```
MARKAB
│
├─ BUY (commerce)
│   ├─ /cars                    Cars (filters, compare, save)
│   │    └─ /car/{slug}         PDP + calculator + apply
│   ├─ /electronics             Electronics
│   │    └─ /product/{slug}     PDP + calculator + apply
│   ├─ /sell                    Sell your car / become a seller (2 tracks)
│   └─ /cart · /checkout        Cart & application basket
│
├─ FINANCE (the engine — one shared explanation layer)
│   ├─ /financing               Muddatli to'lov: how it works
│   ├─ /financing/taqsit        Taqsit explained (plain language + example)
│   ├─ /financing/murabaha      Murabaha explained (plain language + example)
│   ├─ /financing/calculator    Standalone calculator (shareable URL)
│   └─ /apply                   Application (auto-filled from calculator)
│
├─ INVEST (funding side)
│   ├─ /invest                  Model, mechanics, risk disclosure, reporting
│   ├─ /invest/calculator       Amount × term → indicative projection (disclaimer)
│   ├─ /invest/faq              Withdrawals, taxes, terms, documents
│   └─ /invest/apply            OTP-verified application
│
├─ LEARN (education hub — the differentiator)
│   ├─ /learn                   Library: buying · financing · investing
│   ├─ /learn/{slug}            Lesson (progress, quiz, glossary)
│   └─ /glossary                Taqsit, murabaha, AAOIFI, marja…
│
├─ ACCOUNT (retention)
│   ├─ /login                   OTP
│   └─ /account                 Dashboard · /account/contracts · /account/payments
│                               · /account/applications · /account/bonus · /account/settings
│
├─ TRUST / COMPANY
│   ├─ /about                   Story, team, legal entity, licences, office photos
│   ├─ /contact                 Phone, email, office, hours, callback, map
│   ├─ /faq                     Full FAQ (buying · financing · investing)
│   ├─ /reviews                 Customer reviews
│   └─ /legal  → /terms · /privacy · /offer (public offer) · /risk-disclosure
│
└─ UTILITIES (persistent)
    Nav: Avtomobillar · Elektronika · Moliyalashtirish · Investitsiya · Ta'lim
    Utility: UZ/RU/EN · UZS/USD · Search · Favourites · Cart · Kirish
    Mobile: sticky bottom bar — Kalkulyator · Ariza · Aloqa
```

**Mapping the seven domains into this structure**

| Domain | Place in new IA | Notes |
|---|---|---|
| Automobiles | `/cars` | Keep as the flagship commerce surface |
| Electronics | `/electronics` | Fix PDPs before promoting |
| Financing | `/financing` **(new hub)** | Currently the site's biggest missing pillar |
| Taqsit | `/financing/taqsit` | Plain-language + worked example |
| Murabaha | `/financing/murabaha` | Plain-language + worked example + contract type per product |
| Investment | `/invest` **(new hub)** | Must include risk disclosure before any application |
| Education | `/learn` **(new hub)** | Reuse the 3 existing lesson titles as launch content |
| Mobile app | `/app` + contextual banners | Present as convenience, not as the only account access |

**Homepage role in the new IA:** a **router and proof surface**, not a container for everything —
`Hero (what it is + 3 entry cards) → Trust bar → Live inventory strip (2 rows) → How financing works (4 steps + calculator) → Investor block → Education → Reviews → App → FAQ → Office/Contact`.

---

# 5. CUSTOMER JOURNEY ANALYSIS

## Scenario A — A user wants to buy a car

| | |
|---|---|
| **Entry point** | Homepage hero “Avtomobillarni ko'rish” (or direct/organic to `/cars`) |
| **User goal** | “Find a car I can afford, understand the monthly payment, and start the process.” |
| **Current path** | Home → `/cars` (20 results; filters for brand/year/fuel/transmission/colour/price/installment) → card (price, sometimes monthly, mileage, views) → **“Batafsil”** → `/car/{slug}` → gallery + specs (with untranslated `petrol`/`automatic`) + one-line description + **empty “Muddatli to'lov” block** → only actions: “Telefon” / “Xabar” on the seller block |
| **Friction points** | (1) No calculator anywhere; (2) monthly payment missing on ~half the cards; (3) PDP financing panel empty — the exact place the decision is made; (4) no apply → forced to call; (5) no comparison or saving for a multi-day decision; (6) no document checklist; (7) broken data item (“1 so'm” Chery, no photo, 404 PDP); (8) filters are heavy for 20 results; (9) no total cost / markup transparency; (10) no delivery/registration/warranty info |
| **Missing information** | Down-payment requirement, term options (2–36) per car, total cost & markup, approval criteria & documents, approval time, insurance/registration handling, warranty & inspection report, early-settlement terms, who owns the car during the term, what happens on late payment |
| **Ideal future path** | Home → **“Avtomobil” entry card** → `/cars` with 3 default filters + monthly payment on every card → **compare 2–3** → PDP with gallery, inspection report, **live calculator (price/down/term → monthly + total)** → **“Ariza qoldirish”** (auto-filled, OTP, documents checklist, autosave) → confirmation with reference ID + expected decision time → **`/account/applications`** status tracking → e-contract → delivery booking → review request → loyalty points |

## Scenario B — A user wants to buy electronics

| | |
|---|---|
| **Entry point** | Homepage (featured strip — currently empty) or `/electronics` |
| **User goal** | “Buy a specific phone on installment and know exactly what I pay per month.” |
| **Current path** | Home → *(empty featured module)* → `/electronics` (42 items, tabs “Barchasi / Smartfonlar / Kompyuter va noutbuklar / Phones”, filters brand/category/price) → card (price + monthly + long SKU title + views) → **“Batafsil”** → **“Ma'lumotlar topilmadi.”** |
| **Friction points** | (1) The catalogue is unreachable at item level — the journey simply stops; (2) no search, so finding a model among 42 near-identical titles is manual; (3) titles are unstructured internal SKUs (“E2305/26 256 GB 83%”); (4) “Qolmadi” items remain in the grid; (5) add-to-cart with no reachable `/cart`; (6) prices higher than cash market (expected for murabaha) with **no explanation of the difference**; (7) no warranty / condition / battery-health explanation |
| **Missing information** | Condition grading, battery-health meaning, warranty terms & period, what the installment premium is and why, stock status, delivery, returns, why the price differs from cash |
| **Ideal future path** | Home → “Elektronika” entry card → `/electronics` with **search + brand/model filters** + monthly payment on every card → structured titles (`iPhone 15 Pro Max · 256 GB · 83%`) → PDP (photos, condition grade, warranty, **calculator**, “why this price” explainer) → “Savatchaga” → `/cart` (shows installment terms per item) → OTP + application → status tracking → delivery → review + points |

## Scenario C — A user wants financing (not a specific product)

| | |
|---|---|
| **Entry point** | Homepage 4-step block “Muddatli to'lov qanday ishlaydi” (no CTA of its own) |
| **User goal** | “Understand if I qualify, what it costs, and what I need to apply.” |
| **Current path** | Home → scroll to the 4 steps (Tanlang → Tasdiqlash → Shartnoma → Oling) → **no link, no calculator, no requirements, no CTA** → the only exits are browsing cars, or the generic contact form |
| **Friction points** | (1) Financing has **no page and no CTA** — the single biggest structural gap; (2) taqsit vs murabaha undefined; (3) no eligibility criteria; (4) no document list; (5) no calculator; (6) no timeline; (7) no FAQ answers visible (the 5 homepage FAQ questions are collapsed and include “Qanday hujjatlar kerak?”); (8) no cost transparency |
| **Missing information** | Contract type per product, eligibility & scoring criteria, required documents, approval SLA, term range & limits, down-payment rules, markup/cost disclosure, early settlement, late-payment policy, ownership during term, insurance |
| **Ideal future path** | Home → **“Moliyalashtirish” nav item** → `/financing`: “how it works” + **calculator** + eligibility checklist + documents + FAQ + CTA “Ariza qoldirish” → optional pre-qualification (soft check, OTP) → product browsing with a personalised monthly budget badge → application → decision → contract |

## Scenario D — A user wants to invest

| | |
|---|---|
| **Entry point** | Hero CTA “Markab bilan sarmoyalash” or the investor block CTA “Sarmoyalashni boshlash” |
| **User goal** | “Understand the return and the risk, then put money in with confidence.” |
| **Current path** | Home → click “Sarmoyalashni boshlash” → **route does not exist → homepage again** (soft 404). The user's only remaining option is the generic contact form. |
| **Friction points** | (1) **Dead CTA on the highest-value journey** (P0); (2) no risk disclosure (P0); (3) no numbers: no minimum, no indicative rate, no term/yield table, no fees; (4) no contract type (mudaraba? wakala? musharaka?) — the model says “share in the business” but the legal structure is never named; (5) no reporting example; (6) no withdrawal terms; (7) no legal entity or licence information; (8) no FAQ answers visible; (9) no track record; (10) deposits are being solicited with no regulator reference |
| **Missing information** | Legal structure & contract name, risk disclosure, minimum/maximum, indicative profit mechanics, fees, term options (2–36), withdrawal rules & timing, reporting format & cadence, tax treatment, legal entity details, dispute process, what happens if the business underperforms |
| **Ideal future path** | Home → “Investitsiya” entry card → `/invest`: **model diagram (reuse “Biznesdagi ulush → Oylik foyda → Pul yechish/qo'shish”)** + contract explanation + **prominent risk disclosure** + term/amount calculator with disclaimer + reporting example + FAQ + legal entity → “Sarmoya kiritish” (OTP, amount, term, documents) → confirmation → `/account` dashboard with monthly statements & withdrawal requests |

## Scenario E — A user wants to learn about Markab's financial model

| | |
|---|---|
| **Entry point** | Homepage “Ta'lim markazi” or “Nima uchun Markab?” |
| **User goal** | “Is this genuinely halal? How do taqsit and murabaha work? Where does the profit come from?” |
| **Current path** | Home → “Nima uchun Markab?” four cards (AAOIFI · fair profit · 2–36 months · withdraw any time) → “Ta'lim markazi” three lessons (5–10 min) → **“Barcha darslarni ko'rish” → does not exist → homepage**. AAOIFI and murabaha are named but never explained or evidenced. |
| **Friction points** | (1) Education pages do not exist — the most differentiating content is unreachable; (2) claims (AAOIFI) have **no supporting evidence** (no methodology, no supervisory board, no references); (3) taqsit/murabaha mentioned once, inside a process step; (4) no worked example; (5) no glossary; (6) no document/sample contract; (7) the investor side of the model is not explained anywhere |
| **Missing information** | Plain-language explanation of both contracts, a worked numerical example, the flow of money (investor → asset → buyer → profit → distribution), AAOIFI evidence, supervisory/Sharia oversight (if any — **do not invent it**), glossary, FAQ, downloadable materials |
| **Ideal future path** | Home → “Ta'lim” entry card → `/learn` library (buying / financing / investing tracks) → lesson with progress & quiz → inline glossary → “next: how your contract is written” → `/financing/murabaha` → sample contract → “apply” or “invest” with the explanation carried as context. This hub also becomes the site's primary organic-acquisition engine. |

---

# 6. CONVERSION AUDIT

## 6.1 Observed conversion weaknesses

* **CTAs are generic** (“Batafsil”, “Barchasini ko'rish”, “Yuborish”) and describe *navigation*, not *outcome*.
* **The primary business action (apply for installment / invest) does not exist as a flow**, so the entire funnel terminates in a phone call.
* **No calculator** — the single highest-impact conversion component for an installment business is absent.
* **Lead capture is one generic form** with no intent routing, no OTP verification, no confirmation state.
* **Product presentation is thin**: no total cost, no term options, no explainer for why installment prices exceed cash prices, no inspection/warranty proof.
* **Zero personalisation**: no saved filters, no recently viewed, no “based on your monthly budget”, no location or language preference.
* **Trust signals are assertions, not evidence**: “AAOIFI”, “verified seller”, “all cars inspected” — with nothing to verify.
* **Social proof is empty in every slot** (0 testimonials, 0 news, no ratings on iOS).
* **Unnecessary friction**: heavy filters for small catalogues, long single-page scroll, no autosave, no progress indicators.
* **Cross-selling is absent**: cars ↔ electronics ↔ investment ↔ education are never linked; an investor never sees the assets behind their money; a buyer never sees the investor story or the education hub.
* **Retention is absent on web**: no account, no status tracking, no saved items, no alerts — everything is delegated to an app the user has not installed.

## 6.2 TOP 5 CONVERSION OPPORTUNITIES

### CO-1 — The monthly-payment calculator is missing from every decision point
**PROBLEM.** Users see a cash price (and sometimes a monthly figure) but cannot model *their* situation — no down payment, no term slider, no total cost.
**OPPORTUNITY.** Make “what will I pay per month?” the central, interactive promise of the site.
**PROPOSED SOLUTION.** One shared calculator component (price, down payment, term 2–36 → monthly, total, markup shown transparently), embedded in the hero, every listing card, every PDP, and at `/financing/calculator`; inputs persist across pages and pre-fill the application; shareable via URL.
**EXPECTED UX/BUSINESS BENEFIT.** Removes the main unanswered question at the moment of intent; converts passive browsing into a qualified, self-priced lead; makes the halal/no-interest claim concrete and comparable instead of abstract; reduces repetitive support calls.

### CO-2 — The investment journey has a dead CTA and no destination
**PROBLEM.** “Markab bilan sarmoyalash” / “Sarmoyalashni boshlash” lead to a route that does not exist; the funding side of the business captures nothing.
**OPPORTUNITY.** Convert the site's boldest promise into a working, compliant funnel.
**PROPOSED SOLUTION.** Build `/invest` (model diagram, contract explanation, risk disclosure, term/amount calculator with disclaimer, reporting cadence, FAQ, legal entity) + an OTP-verified application + a dashboard in `/account`.
**EXPECTED UX/BUSINESS BENEFIT.** Turns a broken promise into a measurable acquisition channel; builds the trust required before anyone commits money; creates a recurring, reportable relationship rather than anonymous traffic.

### CO-3 — Product pages inform but never convert
**PROBLEM.** Car PDPs end with “Telefon / Xabar”; electronics PDPs do not open at all. There is no “apply”, no “reserve”, no “callback”, no document checklist.
**OPPORTUNITY.** Put the transaction at the point of maximum intent.
**PROPOSED SOLUTION.** PDP conversion block: monthly payment (default term) + inline calculator + **“Ariza qoldirish”** primary CTA + “what you need” checklist + trust items (inspection, contract type, office visit) + secondary “Tez orqaga qaytish: qo'ng'iroq buyurtma”. Fix electronics PDP routing as a prerequisite.
**EXPECTED UX/BUSINESS BENEFIT.** Captures demand that currently evaporates; makes every product view attributable; shifts load from phone calls to structured, trackable applications.

### CO-4 — The homepage cannot merchandise (empty featured modules, no entry routing)
**PROBLEM.** “Tanlangan takliflar” renders “no cars / no products available” while 20 cars and 42 products exist; the hero offers two equal CTAs with no audience guidance.
**OPPORTUNITY.** Make the homepage a router with live inventory as proof of operation.
**PROPOSED SOLUTION.** Fix the featured query; add three audience entry cards (Avtomobil / Elektronika / Investitsiya); show live inventory strips with monthly payments; add a trust bar (contract type, term range, city, office).
**EXPECTED UX/BUSINESS BENEFIT.** Converts the homepage from a brochure into a distribution hub; increases catalogue exposure per session; lets each audience self-route in one click instead of scrolling twelve sections.

### CO-5 — No capture, no nurture, no retention on web
**PROBLEM.** No saved searches, favourites, price-drop alerts, application status, or account area. `/profile` redirects to the homepage. Everything retention-related requires installing an app.
**OPPORTUNITY.** Create a light web account that captures intent *before* commitment and keeps users returning.
**PROPOSED SOLUTION.** OTP-based account with favourites, saved filters + alerts, application status, contract documents, payment schedule and bonus balance; use “save this car” / “notify me when the monthly payment drops below X” as low-friction capture points; promote the app as an enhancement inside the logged-in experience.
**EXPECTED UX/BUSINESS BENEFIT.** Repeat visits without paid acquisition; a measurable pipeline from “interested” to “applied”; continuity between web evaluation and app usage; a natural surface for cross-sell (buyer → investor) and for reviews.

*(No numerical uplift is claimed — none can be measured without analytics, and inventing one would be dishonest.)*

---

# 7. TRUST AUDIT

> Nothing in this section invents a certification, review, licence, number or legal claim. Every item is either observed on the live site/app-store listings or explicitly flagged as **missing**.

## 7.1 What currently builds trust (genuine assets)

| Asset | Evidence |
|---|---|
| **Clear values positioning** | “Qadriyatlarga asoslangan xotirjamlik”, “Halol moliya platformasi”, “Shaffof investitsiya boshqaruvi” |
| **Named, recognisable standard** | “AAOIFI standartlari talablariga mos” — a real, internationally known body |
| **Named contract structures** | taqsit and murabaha are explicitly referenced |
| **Commitment to reporting** | “Rasmiy kelishuv va oylik hisobdorlik” (*official agreement and monthly accountability*) |
| **Flexible, understandable terms** | 2–36 months; profit withdrawable any time |
| **Real physical office** | Toshkent, Kukcha Aryk, Yunusobod tumani + map + Mon–Fri 9:00–18:00 |
| **Real inventory** | 20 cars, 42 electronics items with photos, specs and view counters |
| **Verified seller badge** | “Tasdiqlangan sotuvchi — MARKAB MULK KOMMANDIT SHIRKATI” |
| **Quality claims** | “Kafolatli xavfsizlik — Barcha avtomobillar tekshirilgan”; “Foizsiz to'lov imkoniyati” |
| **A formal privacy document** | `/privacy` v1.0 cites Uzbekistan's personal-data law O'RQ-547 and defines terms properly |
| **Published contact points** | Phone +998 93 392 72 22 and emails via the Google Play listing |
| **Active maintenance** | App updated 2026-08-26 with a long, steady release history |

## 7.2 What creates doubt (verified observations)

| # | Doubt factor | Evidence |
|---|---|---|
| T-1 | **No risk disclosure on an investment product** | The investor block promises monthly profit with no risk statement, no “capital at risk” language, no underperformance scenario. |
| T-2 | **No pricing transparency** | No markup/marja, no total cost, no fee schedule, no rate range, no minimum/maximum, for either buyers or investors. |
| T-3 | **Broken Terms of Use on the consent path** | `/terms` fails to load; `/login` requires accepting it. |
| T-4 | **Legal entity is inconsistent across surfaces** | `/privacy`: “Markab Mulk” **MChJ** · Car PDP seller: “MARKAB MULK **KOMMANDIT SHIRKATI**” (limited partnership) · App Store seller: “**TOWN PROPERTY MANAGEMENT SOLUTIONS**, MCHJ” / developer “TPM Solutions”. A user or journalist checking this will find three different answers. |
| T-5 | **Two domains, inconsistent legal URLs** | Site is `markab.uz`; App Store lists the developer website as `markabstore.uz` and the privacy policy as `markabstore.uz/privacy`, while Google Play points to `markab.uz/privacy`. (**`markabstore.uz` did not respond during this audit — [VERIFY].**) |
| T-6 | **Privacy declaration contradicts the privacy policy** | App Store & Google Play both declare **“No data collected / No data shared”**, while `/privacy` states the operator collects full name, gender, birth date, address, passport number & expiry, **JSHSHIR (PIN)**, passport/selfie photos, phone, **bank card number & expiry**, device contacts, camera photos and device identifiers. These statements cannot both be accurate. |
| T-7 | **Contradictory addresses** | Homepage: Toshkent shahri, Kukcha Aryk, Yunusobod tumani. Google Play developer address: 17 Chustiy MFY, Beruniy B1 village, Tashkent. Different locations, same brand. |
| T-8 | **Unsubstantiated standards claim** | “AAOIFI standartlari talablariga mos” is stated with **no evidence**: no methodology page, no named supervisory board or scholar, no certificate reference, no audit mention. *(Not asserting the claim is false — asserting it is currently unverifiable by a user.)* |
| T-9 | **No company registration details** | No STIR/INN, no registration date, no licence or regulator reference, no ownership/team information anywhere on the site. |
| T-10 | **No sample contracts** | The product *is* a contract, yet no template, no sample murabaha/taqsit agreement, no explanation of ownership during the term, no early-settlement or late-payment terms. |
| T-11 | **Empty social proof** | “Hozircha fikr-mulohazalar yo'q”; `/news` empty; iOS app: “hasn't received enough ratings”; no customer counts, no completed-contract counts, no case studies. |
| T-12 | **Empty showcases and dead links** | Empty featured carousels, unreachable electronics PDPs, dead invest/education CTAs, “under development” loyalty placeholder contradicting a live `/loyalty` page. |
| T-13 | **Data-quality errors on money-adjacent content** | A car priced “1 so'm” with no photo and a 404 PDP; “100 GB / 256%” phone specs; untranslated `petrol`/`automatic`; typo “Shafof moliya” inside the transparency badge. |
| T-14 | **No security communication** | Only a single line under the contact form: “Ma'lumotlaringiz xavfsiz va maxfiy saqlanadi”. No payment-security information, no data-residency statement, no OTP/2FA explanation, no fraud-avoidance guidance — despite collecting passport and card data. |
| T-15 | **No “who owns the asset” explanation** | For murabaha/taqsit, ownership, repossession and default handling are legally and religiously central — and entirely unexplained. |
| T-16 | **Contact/support is thin** | One generic form; support phone/email only discoverable via the app-store listing, not prominent on the website; no response-time commitment; no status tracking. |

## 7.3 Trust priorities (ordered)

1. **Fix `/terms` + publish a real risk disclosure** (P0 — legal exposure on the consent path and on the investment offer).
2. **Reconcile the legal entity, address and domain inconsistencies** across site, app stores and legal docs (P0 — a single verifiable identity is the foundation of trust).
3. **Reconcile the app-store “no data collected” declaration with `/privacy`** (P0 — the contradiction is publicly visible and easy to find).
4. **Publish pricing mechanics**: how the installment price is built, what the markup is, total cost, fees (P1).
5. **Substantiate or soften the AAOIFI claim** — name the standard(s) applied, describe the internal governance, and if there is supervisory oversight, publish it; if there is not, state precisely what “mos” means in practice (P1). **Do not imply a certification that does not exist.**
6. **Publish sample contracts** (murabaha and taqsit) with plain-language annotation (P1).
7. **Add company facts**: registered name, STIR/INN, registration date, team, office photos (P1).
8. **Build real social proof**: post-delivery reviews with date/city/product; case studies; a live count of delivered contracts (P2).
9. **Add a security & data page**: what is collected, why, how it is stored, OTP, fraud guidance (P2).
10. **Add support commitments**: response time, channels, status tracking (P2).

---

# 8. PRODUCT EXPERIENCE AUDIT

## 8.1 Verdict: corporate brochure or digital product?

**It is a corporate brochure with two working catalogue pages.** The evidence:

| Digital-product capability | Markab today |
|---|---|
| Product discovery | Partial — two listings with filters; **no search, no recommendations, no featured content** |
| Product cards | Present but inconsistent between verticals; monthly payment on some; SKU-laden titles |
| Product detail (cars) | Works: gallery + specs + seller + trust badges — but **financing panel empty, no apply** |
| Product detail (electronics) | **Broken for every item tested** |
| Filtering | Present and reasonably rich; over-engineered for small catalogues; no URL persistence evidence |
| Comparison | None |
| Application flow | **None** (contact form only) |
| Account experience | **None on web** (`/profile` → homepage) |
| Investment experience | **None** (no page) |
| Financing experience | **None** (4-step illustration only, no calculator or application) |
| Cart / checkout | Add-to-cart on electronics, but `/cart` does not exist as a page |
| Notifications / alerts | None on web |
| Self-service after sale | None on web |
| Personalisation | None |

A digital product lets a user **complete the job**. Here, the user can *look* but cannot *act*, *track* or *manage*. The business logic lives offline (phone calls) and in the mobile app.

## 8.2 What is missing to become a modern digital product

**Core transaction layer (P0/P1)**
1. Working product detail pages for electronics.
2. Financing panel + calculator + apply on every PDP.
3. An end-to-end application flow with documents, autosave and status.
4. A real cart/checkout for electronics with installment terms shown.
5. A real `/invest` flow with risk disclosure and application.

**Account & lifecycle layer (P1/P2)**
6. OTP account with dashboard: contracts, payment schedule, next payment, history, applications, bonus balance, documents.
7. Notifications: payment reminders, application status, new inventory matching saved filters, price/payment drops.
8. Post-purchase: review request, referral, loyalty points, service reminders.

**Discovery layer (P1/P2)**
9. Search with typo tolerance and category scoping.
10. Comparison (up to 3), favourites, recently viewed.
11. URL-persisted filters + active-filter chips + sort by monthly payment.
12. Recommendations (“similar monthly payment”, “others also viewed”, “new in your budget”).

**Intelligence layer (P2/P3)**
13. Affordability badge on every card based on the user's saved budget.
14. Personalised homepage (budget, saved items, application status).
15. AI product advisor (see §10).

**Trust layer (P0/P1)**
16. Contract documents, sample contracts, transparent cost breakdown, risk disclosure, verified reviews.

---

# 9. MOBILE UX AUDIT

> **Method note:** rendering could not be observed directly. Findings below are **structural** (content volume, element density, control counts, page length) and are flagged **[INFERRED]** where they depend on layout rather than on content. Each item should be confirmed on a device in Phase 1.

### M-1 — The homepage is ~12 sections long with no mobile reprioritisation **[INFERRED]**
**Problem.** On a phone, the single linear scroll puts the contact form, the office and the FAQ roughly 10–12 screens down, behind news (empty), testimonials (empty) and a loyalty placeholder.
**Impact.** The two highest-value mobile actions (see a car, ask a question) require long scrolling; users abandon before reaching any conversion element.
**Fix.** Mobile-first ordering: hero → 3 entry cards → trust bar → live inventory (2 rows) → calculator → how-it-works → invest → education → app → FAQ → contact. Move empty modules out entirely. Add a **sticky bottom action bar**: `Kalkulyator · Ariza · Aloqa`.

### M-2 — No persistent mobile navigation is evident **[VERIFY]**
**Problem.** Server-rendered markup exposes no nav links; if the menu is client-only, orientation depends entirely on scrolling. **[INFERRED]**
**Fix.** Sticky header with a compact logo + 3 primary items, plus a bottom tab bar (Avtomobillar / Elektronika / Kalkulyator / Investitsiya / Profil) — the pattern the local market already knows from Uzum, OLX and banking apps.

### M-3 — Seven filter dimensions for 20 cars **[VERIFIED: control inventory]**
**Problem.** Price, brand, year-to, fuel, transmission, colour (10 values incl. “DarkMoon”), installment-availability + sort — for a 20-item catalogue. On a phone this is a long scroll or a cramped panel before any result is seen.
**Fix.** Bottom-sheet filters with **3 defaults** (price, brand, monthly payment), everything else behind “Barcha filtrlar”; apply-on-close; result count on the apply button; active-filter chips above the list.

### M-4 — Card density and variable card height **[VERIFIED: content]**
**Problem.** Car cards stack image + badge + price + monthly + title + 3 lines of specs + views + button; electronics cards add a 2–3-line SKU title. Variable heights break grid rhythm and push CTAs below the fold.
**Fix.** One-column list on mobile (or 2-up for electronics), fixed image ratio (4:3), title clamped to 2 lines, specs collapsed to one line (“2023 · 53,000 km · Benzin · Avtomat”), price + monthly payment on one aligned row, and a full-width primary CTA.

### M-5 — Touch targets and dual-action cards **[VERIFIED: two buttons per electronics card]**
**Problem.** Electronics cards place “Batafsil” and “Savatchaga” side by side; the out-of-stock variant shows “Qolmadi” styled like an active button. Two adjacent, visually similar targets invite mis-taps and confusion about which is primary.
**Fix.** One primary action per card (≥44×44 pt, ≥8 px separation); secondary actions behind an overflow or icon; disabled states that are visibly non-interactive with an explanation and an alternative (“O'xshashlarini ko'rish”).

### M-6 — Long forms without mobile affordances **[VERIFIED: field counts]**
**Problem.** `/sell` step 1 alone has ~12 fields (brand, model, year, mileage, fuel, transmission, condition, expected price, currency, engine size, colour, title, description, features) plus “Orqaga/Keyingi”; the home contact form has 5 fields. No evidence of autosave, progress persistence or input-specific keyboards. **[INFERRED for keyboard types]**
**Fix.** One question per screen on mobile, numeric keyboards for mileage/price, native selects, autosave draft, visible progress (“2/4”), and a “save and continue later” option.

### M-7 — No sticky conversion action on product pages **[VERIFIED: no apply CTA in content]**
**Problem.** With no calculator and no apply button, the mobile exit is a phone call — a high-friction action even when a tap-to-call link is present.
**Fix.** Sticky footer on PDP: monthly payment + “Ariza qoldirish” (primary) + call icon (secondary).

### M-8 — Calculator absent — an acute mobile problem **[VERIFIED]**
**Problem.** “Can I afford this?” is a mobile-first question (people browse cars on their phones) and cannot be answered.
**Fix.** Thumb-friendly slider for term + numeric input for down payment, instant recalculation, and a shareable result (so a spouse can review it).

### M-9 — Galleries **[VERIFIED: 9 images on one PDP, 3 on another]**
**Problem.** No standards for photo count or aspect ratio; alt text is untranslated (“View 1…9”). On mobile, inconsistent ratios cause jumpy carousels.
**Fix.** 16:9 gallery with swipe, pinch-zoom, dot indicators, a counter (3/9), full-screen mode, and lazy loading.

### M-10 — Typography and spacing on small screens **[INFERRED]**
**Problem.** Long unbroken legal text (`/privacy`), long product titles, and dense spec rows are the classic mobile-readability failures; number formatting (“53000 km”) is harder to parse on small screens.
**Fix.** Minimum 16 px body, 1.5 line-height, clamped titles, spec rows as label/value pairs with adequate spacing, and thousands separators everywhere.

### M-11 — Page length vs. engagement **[INFERRED]**
**Problem.** A 12-section homepage plus paginated listings (12 per page) means a lot of scrolling for a small catalogue.
**Fix.** Infinite scroll or larger pages for mobile listings; a compact homepage; a persistent “back to top / filters” control.

### M-12 — App promotion on mobile **[VERIFIED: two store badges + static mock-up]**
**Problem.** Both stores are promoted equally with a static mock-up image; there is no deep link, no platform detection, and no QR option.
**Fix.** Detect platform and show the relevant badge first; add a QR code for desktop; use a real device frame or short looping video.

---

# 10. MODERNIZATION OPPORTUNITIES

## MUST HAVE (ship in Phase 1–2 — without these the redesign cannot succeed)

1. **Interactive installment calculator** (price, down payment, term 2–36 → monthly, total, transparent markup) — shared by hero, listings, PDPs and `/financing`.
2. **Complete, converting PDP template** (cars + electronics) with gallery, specs, financing panel, apply CTA, trust block, related items.
3. **Online application flow** (OTP, documents, autosave, progress, status) — the core business action.
4. **Real `/invest` page** with model explanation, risk disclosure, calculator-with-disclaimer and application.
5. **Real `/financing` hub** with plain-language taqsit & murabaha explanations and worked examples.
6. **Fixed route architecture**: real 404s, no soft-404 fallback, correct auth redirects, stable URLs, sitemap + robots.
7. **Working homepage merchandising**: live featured inventory, audience entry cards, no empty modules.
8. **Mobile foundation**: sticky header + bottom action bar, bottom-sheet filters, one-column lists, thumb-sized targets.
9. **Trust pack**: fixed `/terms`, risk disclosure, sample contracts, consistent legal identity, security page.
10. **Data-quality gates** before publish (price floors, required photos, structured titles, translated enums).
11. **Analytics & event tracking** (view → calculate → start-apply → submit) so later phases can be measured.
12. **Design system foundation**: tokens (colour/type/space/elevation), button set, card set, form kit, empty/error states.

## SHOULD HAVE (Phase 2)

13. **Search** with typo tolerance, category scoping and recent searches.
14. **Comparison** (up to 3) and **favourites** synced to an OTP account.
15. **Account dashboard (web)**: contracts, payment schedule, next payment, history, applications, bonus balance.
16. **Saved filters + alerts** (“yangi avtomobil qo'shildi”, “oylik to'lov X dan pastga tushdi”).
17. **Education hub** (`/learn`) with progress, quizzes and a glossary.
18. **Reviews system** with post-delivery collection and rich display (date, city, product).
19. **Loyalty integration** — real tier progress and points visible in the account and on PDPs.
20. **Seller hub** (`/sell`) with two clear tracks, requirements and submission status.
21. **Notifications** (web push/SMS) for payment reminders and application status.
22. **Content/SEO foundation**: `/news` with real articles, structured data, localised metadata, indexable navigation (`<a href>` everywhere).
23. **Motion & micro-interaction layer**: purposeful transitions, skeleton loading, optimistic UI, reduced-motion support.

## NICE TO HAVE (Phase 3)

24. **Personalised homepage** (budget, saved items, application status, recently viewed).
25. **Affordability badge** on every card based on the user's saved monthly budget.
26. **Product recommendations** (“o'xshash oylik to'lov”, “boshqalar ham ko'rgan”).
27. **Interactive onboarding** for first-time visitors (3 questions → routed to the right entry point).
28. **Rich media**: 360°/video walkthroughs for cars, condition videos for electronics.
29. **Live chat / WhatsApp / Telegram** integration with office-hours awareness.
30. **Booking** (test drive, office visit, inspection) with calendar slots.
31. **Comparison of financing structures** (taqsit vs murabaha vs cash) as a side-by-side interactive table.
32. **Investor reporting sample** (anonymised monthly statement) as a trust artefact.

## FUTURE (beyond Phase 3)

33. **AI product advisor** — “I have X so'm/month and need a family car” → ranked, explainable recommendations. Requires clean data, a calculator API and a knowledge base first; it should sit on top of a working transaction layer, not substitute for it.
34. **Predictive affordability / soft pre-qualification** (no hard credit check) shown on listings.
35. **Full financial dashboard** — instalments, investments, bonus and referrals in one timeline.
36. **Marketplace expansion** — third-party verified sellers with ratings, escrow-like flows and inspection reports.
37. **PWA / offline** for low-connectivity users, plus app-clip-style sharing of a car or a calculation.
38. **Open “transparency API”** — a public page showing live contract counts, funded assets and aggregate performance, which would be a genuinely differentiating trust asset in this market.
39. **Multi-language (RU/EN)** once the Uzbek foundation is stable — the App Store listing is currently English-only while the app content is Uzbek, so language strategy needs a decision anyway.

---

# 11. COMPETITIVE PRODUCT STANDARD

Evaluated against the quality bar set by modern **fintech** (Uzum Bank, Payme, Click-like flows), **automotive marketplaces** (Avtoelon, Abozor, OLX-classifieds), **e-commerce** (Uzum Market, Wildberries-class) and **investment platforms** (IMAN Invest and similar halal-investment apps locally).

| Dimension | Modern standard | Markab today | Gap |
|---|---|---|---|
| **UX** | Task-oriented, 3-click core journeys, clear next step on every screen | ~12-section scroll; 3 of 4 headline journeys dead-end | **Far behind** |
| **Trust** | Named legal entity, licence/regulator, risk disclosure, sample contracts, verifiable claims, security page | Inconsistent entity names/addresses/domains, broken terms, unsubstantiated AAOIFI claim, no risk disclosure, contradictory data declarations | **Far behind** — and this is the dimension that matters most for this business |
| **Product discovery** | Search + filters + sort + compare + save + recommendations + personalisation | Two listings with filters; no search, compare, save, recommendations or personalisation; featured modules empty | **Far behind** |
| **Conversion** | Calculator → pre-qualification → application → status, all on-site | No calculator, no application, no status; ends in a phone call | **Far behind** |
| **Mobile** | App-like bottom nav, sticky CTAs, thumb-friendly forms, push | Long scroll, no evident bottom nav, heavy filters, no sticky action, no web account | **Behind** |
| **Personalisation** | Saved state, alerts, budget-aware listings, recommendations | None | **Far behind** |
| **Information architecture** | Distinct pillars with clear ownership and cross-links | One page + three destinations; the engine (financing) has no home | **Far behind** |
| **Digital experience** | Complete the job online, self-service afterwards, continuity web→app | Browse only; everything else offline or app-only | **Far behind** |

## Where Markab is genuinely ahead (and can differentiate)

1. **A structurally different model.** Inventory-backed, values-based financing with taqsit/murabaha is rare and defensible. Competitors offer either conventional credit (banks), plain classifieds (Avtoelon), or generic halal investment (IMAN-style apps). **Nobody in the market combines all three legs** — if Markab explains the loop, it owns a category.
2. **The education need is unmet.** The market does not understand murabaha. Whoever explains it best, in Uzbek, with examples, wins the values-driven segment — and wins organic search.
3. **Trust is the market's weakest point.** Car classifieds in Uzbekistan are full of unverified sellers and hidden problems. A platform that publishes **inspection reports, transparent pricing, sample contracts and real office visits** can out-trust incumbents on substance rather than on design.
4. **Physical presence.** A real Tashkent office with published hours is a strong differentiator against pure-digital competitors — currently under-used.
5. **Values-led brand voice.** The tone is warm, local and human. Most fintech competitors sound like banks. Preserved and backed by evidence, this voice is an asset.

## Where Markab must catch up first (table stakes)

* Fix routes/404s/500s and broken pages — everything else is built on sand.
* Ship a calculator and an online application — the market already expects this from banks and instalment providers.
* Publish transparent pricing and risk information — non-negotiable for a money business.
* Provide an account area with schedules, contracts and status — the baseline for a financing relationship.

---

# 12. FINAL AUDIT REPORT

## 12.1 CURRENT STRENGTHS — Top 10

1. **A genuinely differentiated business model** — inventory-backed halal financing (taqsit/murabaha) plus investment participation, in one loop. Rare, defensible, and not yet communicated.
2. **Clear, ownable positioning** — “Qadriyatlarga asoslangan xotirjamlik” and “Halol moliya platformasi” are distinctive and emotionally right for the market.
3. **The right value propositions already exist** — AAOIFI alignment, fair profit distribution with monthly accountability, 2–36 month flexibility, profit withdrawal any time.
4. **The 4-step financing flow (Tanlang → Tasdiqlash → Shartnoma → Oling)** is clear, honest and correctly sequenced — the backbone of a future `/financing` hub.
5. **The investor diagram “Biznesdagi ulush → Oylik foyda → Pul yechish/qo'shish”** is the clearest explanation of the model anywhere on the site.
6. **Real inventory with real photos and specs** — 20 cars and 42 electronics items prove the business operates.
7. **Monthly payment shown on listing cards** — the right instinct for an instalment product; extend and make interactive.
8. **A real physical office with published hours and a map** — a major trust asset in this market.
9. **A complete, well-written privacy policy** with proper legal referencing (O'RQ-547) and defined terms.
10. **A live, actively maintained mobile app** (iOS + Android, steady release cadence, OTP login, push, bonus points) plus a full, well-designed loyalty programme — assets the website does not yet use.

## 12.2 CURRENT WEAKNESSES — Top 10

1. **No investment page** — the loudest CTA on the site leads to a soft 404.
2. **No financing page** — taqsit and murabaha are named but never explained; the product's engine is invisible.
3. **No calculator and no application flow** — the core business action cannot be completed online.
4. **Homepage merchandising is empty** (“no cars / no products available”) while 62 items exist in the catalogue.
5. **Electronics product pages are unreachable** — every detail ID tested returns “Ma'lumotlar topilmadi.”
6. **Trust evidence is absent where it matters most** — no risk disclosure, no pricing/markup transparency, no sample contracts, no company registration details, and an unsubstantiated standards claim.
7. **Broken legal page on the consent path** (`/terms`), plus inconsistent legal entity names, addresses and domains across site and app stores, and a public contradiction between “no data collected” and the privacy policy.
8. **Zero social proof** — empty testimonials, empty news, no iOS ratings, no customer or contract counts.
9. **No account/retention surface on web** — `/profile` redirects to the homepage; schedules, contracts and status exist only in the app.
10. **Content/UX quality defects that erode confidence** — “1 so'm” car with a 404 page, “100 GB / 256%” specs, untranslated `petrol`/`automatic`/“Phones”/“View 1”, typo “Shafof moliya” inside the transparency badge, admin-language empty states, and heavy filters for small catalogues.

## 12.3 CRITICAL PROBLEMS — P0 and P1

**P0 — Critical (fix before or alongside any redesign)**

| ID | Problem |
|---|---|
| P0-1 | **Investment has no page**: “Markab bilan sarmoyalash” / “Sarmoyalashni boshlash” are dead links (soft 404 → homepage) |
| P0-2 | **No risk disclosure, no pricing/markup transparency, no sample contracts** on a product that solicits public funds |
| P0-3 | **`/terms` is broken** while `/login` requires users to accept it |
| P0-4 | **Car PDP financing panel is empty** — no monthly payment, no calculator, no apply on the highest-intent screen |
| P0-5 | **Electronics PDPs are unreachable** — the entire 42-item catalogue is a dead end |
| P0-6 | **Homepage featured modules render empty** despite live inventory (broken query / no fallback) |
| P0-7 | **Soft-404 catch-all**: unknown routes silently render the homepage; `/profile` mis-routes to home instead of `/login` |
| P0-8 | **Intermittent HTTP 500s** on ordinary URLs, including a legal page |
| P0-9 | **Inconsistent legal identity** (three entity names, two addresses, two domains) + **contradictory data-collection declarations** between `/privacy` and the app-store listings |
| P0-10 | **No crawlable navigation / no sitemap / no robots / no search presence** — the site is effectively invisible to search |

**P1 — High (fix in Phase 1–2)**

| ID | Problem |
|---|---|
| P1-1 | No calculator anywhere (hero, listings, PDPs, financing) |
| P1-2 | No online application flow for installment purchase |
| P1-3 | Financing has no destination: taqsit & murabaha unexplained, AAOIFI claim unsubstantiated |
| P1-4 | Education hub is a teaser: 3 lessons, no pages, no glossary |
| P1-5 | Loyalty contradiction: “under development” on the homepage vs. a full, unlinked `/loyalty` page |
| P1-6 | No About / Contact / FAQ pages; company facts (STIR/INN, licence, team) unpublished |
| P1-7 | Zero social proof; empty modules left visible |
| P1-8 | No search, comparison, favourites, saved filters or recommendations |
| P1-9 | No web account/dashboard (contracts, schedule, status, bonus) |
| P1-10 | Localisation defects on user-facing data (raw `petrol`/`automatic`/`electric`, “Phones”, “View 1”, “Shafof moliya”, number formatting) |
| P1-11 | Data-quality failures (price “1 so'm” with a broken PDP, nonsensical specs, missing photos, out-of-stock cards with active buttons) |
| P1-12 | Homepage tries to serve four audiences with no routing; no clear “click this first” |
| P1-13 | No cross-linking between the three legs (buy ↔ finance ↔ invest ↔ learn) |
| P1-14 | Mobile foundation missing (no evident bottom nav, no sticky action bar, heavy filters, long forms, no autosave) **[VERIFY on device]** |
| P1-15 | Seller journeys undefined and untracked (car vs electronics paths with no terms or status) |

## 12.4 MARKETING OPPORTUNITIES — Top 5

1. **“Halol, foizsiz, shaffof” as a proof-led brand promise.** The market is full of vague halal claims. Backing the claim with a published contract, an explained murabaha structure, a visible markup and sample documentation turns a slogan into a reason to choose Markab — and is defensible in a way design alone is not.
2. **Education-led acquisition.** Uzbek-language explainers (“Murobaha nima?”, “Taqsit va kredit farqi”, “Foizsiz avtomobil qanday olinadi?”) are high-intent, low-competition queries. `/learn` becomes the top-of-funnel engine and the brand's authority signal.
3. **The “loop” story as content marketing.** “Your money funds a real car, a real family drives it, profit is shared monthly” is a story no bank or classifieds site can tell. Use real (anonymised, consented) asset stories across the site, `/invest` and social.
4. **Calculator as a marketing asset.** A shareable “my monthly payment” result is inherently viral in a market where people compare affordability in Telegram groups. Add share cards, deep links and a “compare with a friend” flow.
5. **Trust transparency as a campaign.** Publish what others hide: inspection reports, total cost breakdowns, sample contracts, office photos, team, registration details. In a low-trust category, radical transparency *is* the marketing.

## 12.5 PRODUCT OPPORTUNITIES — Top 10

1. **Universal installment calculator** (price · down payment · term 2–36 → monthly, total, transparent markup), shared by every surface and pre-filling the application.
2. **Converting PDP template** (cars + electronics): gallery, verified specs, inspection/condition report, financing panel, apply CTA, trust block, related items.
3. **Online application flow** with OTP, document upload, autosave, progress indicator, status tracking and a confirmation reference.
4. **`/financing` hub** with plain-language taqsit & murabaha explanations, worked examples, eligibility, documents, FAQ and calculator.
5. **`/invest` hub** with the model diagram, contract explanation, **risk disclosure**, term/amount projection (disclaimer), reporting cadence, FAQ and application.
6. **Account dashboard (web)**: contracts, payment schedule, next payment, history, applications, bonus balance, documents, support.
7. **Discovery suite**: search, comparison (3), favourites, saved filters, price/payment-drop alerts, sort by monthly payment, URL-persisted filters.
8. **`/learn` education hub**: lessons with progress and quizzes, glossary, and contextual links from financing and investing pages.
9. **Reviews & social proof system**: post-delivery collection, rich display (date/city/product), verified badges, and aggregate counts surfaced on the homepage.
10. **Loyalty integration** (the design already exists at `/loyalty`): tier progress, points on PDPs, balance in the account, referral flows.

*Runner-up (Phase 3+):* AI product advisor, personalised homepage, investor transparency dashboard, marketplace expansion, PWA.

## 12.6 RECOMMENDED INFORMATION ARCHITECTURE

*(Full structure in §4.4. Summary below.)*

```
PRIMARY NAV (5 + utilities)
Avtomobillar · Elektronika · Moliyalashtirish · Investitsiya · Ta'lim
Utilities: Qidiruv · Sevimlilar · Savatcha · Kirish · UZ|RU|EN · UZS/USD

BUY       /cars · /car/{slug} · /electronics · /product/{slug} · /sell · /cart · /checkout
FINANCE   /financing · /financing/taqsit · /financing/murabaha · /financing/calculator · /apply
INVEST    /invest · /invest/calculator · /invest/faq · /invest/apply
LEARN     /learn · /learn/{slug} · /glossary
ACCOUNT   /login · /account · /account/{contracts,payments,applications,bonus,settings}
COMPANY   /about · /contact · /faq · /reviews · /news
LEGAL     /terms · /privacy · /offer · /risk-disclosure
MOBILE    Sticky bottom bar: Kalkulyator · Ariza · Aloqa

HOMEPAGE (router + proof, not container)
Hero (what it is + 3 entry cards + trust bar) → Live inventory strip (cars · electronics, with
monthly payment) → How financing works (4 steps + inline calculator) → Investor block (diagram +
risk link) → Education → Reviews → App → FAQ → Office & contact
```

**IA rules to enforce:** every audience gets one primary action per page · financing is a first-class pillar, not a process illustration · the three legs are explicitly cross-linked · no module ships without real content or a defined fallback · every route returns a correct status code · every navigation element is a real `<a href>`.

## 12.7 RECOMMENDED DEVELOPMENT PRIORITY

### PHASE 1 — STABILISE & MAKE IT CONVERTIBLE (foundation, before/during homepage redesign)
*Goal: remove everything that makes the product feel broken, and give users a way to act.*

1. **Routing & stability**: real 404s, fix the soft-404 catch-all, fix `/profile` → `/login`, fix `/terms`, add error monitoring, sitemap + robots, crawlable `<a href>` navigation, structured data.
2. **Fix the catalogue**: electronics PDP routing (with automated crawl checks), homepage featured query + no-empty fallback, data-quality gates (price floors, required photos, structured titles, translated enums), remove/hide broken listings, proper out-of-stock state.
3. **Calculator + financing panel**: shared calculator component; PDP financing panel with monthly payment, term slider, total cost and markup.
4. **Application flow**: OTP-verified, product-context-aware, autosave, document checklist, status screen.
5. **`/financing` hub**: taqsit & murabaha explained with worked examples, eligibility, documents, FAQ.
6. **`/invest` hub (v1)**: model diagram, contract explanation, **risk disclosure**, term/amount calculator with disclaimer, FAQ, legal-entity block, application.
7. **Trust pack (v1)**: consistent legal entity/address/domain across site + app stores, reconcile the data-collection declarations, publish company registration details, sample contracts, security page.
8. **Analytics foundation**: events for view → calculate → start-apply → submit → status; funnel instrumentation.
9. **Design system (v1)**: tokens, buttons, cards, forms, empty/error states, badges — the minimum kit the homepage redesign needs.

### PHASE 2 — HOMEPAGE 2.0, IA ROLLOUT & MOBILE
*Goal: turn the site into a router with a premium, consistent experience.*

10. **Homepage 2.0**: hero with product statement + 3 entry cards + trust bar; live inventory strips; how-it-works with inline calculator; investor block; education; reviews; app; FAQ; office/contact.
11. **New IA live**: primary nav, `/financing`, `/invest`, `/learn`, `/about`, `/contact`, `/faq`, `/reviews`, `/account` scaffolding.
12. **Mobile foundation**: sticky header + bottom action bar, bottom-sheet filters, one-column lists, thumb-sized targets, one-question-per-screen forms, sticky PDP CTA.
13. **Discovery v1**: search, sort by monthly payment, URL-persisted filters + chips, favourites, comparison (3).
14. **Account v1**: dashboard with contracts, schedule, next payment, applications, bonus balance, documents.
15. **Education hub v1**: the 3 existing lessons as full pages + glossary + progress.
16. **Reviews system**: collection flow, display components, aggregate counts.
17. **Loyalty surfaced**: real tier progress and points across homepage, PDP and account.
18. **Motion & micro-interactions**: purposeful transitions, skeleton loading, optimistic UI, reduced-motion support.
19. **SEO/content engine**: `/news` with real articles, localised metadata, structured data, internal linking from education to products.

### PHASE 3 — INTELLIGENCE, RETENTION & DIFFERENTIATION
*Goal: become a product users return to, and a brand competitors cannot copy on trust.*

20. **Personalisation**: saved budget → affordability badges, personalised homepage, saved filters + alerts, recommendations.
21. **Notifications**: payment reminders, application status, new inventory, price drops (push + SMS + email).
22. **Post-purchase lifecycle**: review requests, referrals, loyalty rewards, service reminders.
23. **Seller hub v2**: two tracks with commission/valuation logic, submission status, seller ratings.
24. **Investor experience v2**: monthly statements, withdrawal requests, portfolio view, reporting archive.
25. **Transparency dashboard (public)**: aggregate, consented, verifiable figures (contracts funded, assets financed, reporting cadence) — a category-defining trust asset.
26. **AI advisor (foundation-gated)**: rule-based recommendation assistant first, model-based later, once data quality and the calculator API are reliable.
27. **Rich media & PWA**: video walkthroughs, condition videos, offline-friendly shell, shareable calculation cards.
28. **Multi-language (RU/EN)** once the Uzbek foundation is stable and the app/website language strategy is aligned.

## 12.8 FINAL PRODUCT VISION — Markab in 2026

**Markab should stop being a website that describes a financing company and become the digital product that *is* the financing company.**

> **Vision statement**
> *“Markab — O'zbekistondagi eng ishonchli qadriyatlarga asoslangan moliya platformasi: har kim o'z byudjetiga mos avtomobil yoki elektronikani shaffof shartnoma bilan muddatli to'lovga olishi, har kim real aktivlarga asoslangan halol sarmoya kiritishi va barchasini bitta hisobda, bitta shaffof hisobotda boshqarishi mumkin.”*
>
> *“Markab is Uzbekistan's most trusted values-based finance platform: anyone can buy a car or electronics on transparent, Sharia-compliant installment terms that fit their budget; anyone can invest in real, asset-backed halal deals; and both sides manage everything in one account with one transparent monthly statement.”*

**What that means concretely**

* **Calculator-first.** The first thing a visitor does is not read — it is *calculate*. “What is my monthly payment?” is answered in one interaction, everywhere, and the answer carries the contract structure with it.
* **Transparent by default.** Every price shows the cash price, the installment price, the term, the markup and the total. Every claim (AAOIFI, verified seller, inspected cars) links to something verifiable. Every investment page carries a risk statement as prominent as the return.
* **One loop, one story.** Buyers see how their contract is financed. Investors see the actual cars and devices their money funds. Education explains the mechanism in plain Uzbek. The loop is the product.
* **Complete the job online.** Browse → calculate → apply → track → sign → receive → pay → review, without leaving the site, with the office as an option rather than an obligation.
* **One account, web and app.** Contracts, schedule, next payment, documents, bonus points, applications and investments in a single dashboard — the app as convenience, not as a gate.
* **Mobile-native.** Bottom navigation, sticky actions, thumb-sized targets, one-question forms, bottom-sheet filters — because this market shops on a phone.
* **Trust as a feature, not a claim.** Published legal entity, sample contracts, inspection reports, real reviews with dates and cities, an office you can visit, and eventually a public transparency dashboard.

**The single most important strategic point:** Markab's problem is not visual. It sells trust, and the product currently has the *substance* of trust (a real model, a real office, real inventory, real contracts) but none of the *evidence* of trust on screen. Fix the evidence — routes, numbers, documents, contracts, consistency — and the redesign will amplify a business that deserves it. Redesign the surface first, and it will only make the emptiness look better.

---

## APPENDIX A — Verbatim evidence samples (Uzbek, with translation)

| # | Verbatim (as rendered) | Translation | Where |
|---|---|---|---|
| 1 | “Hozircha avtomobillar mavjud emas” | “No cars available yet” | Homepage, featured cars |
| 2 | “Hozircha mahsulotlar mavjud emas” | “No products available yet” | Homepage, featured electronics |
| 3 | “Hozircha fikr-mulohazalar yo'q” | “No feedback yet” | Homepage, testimonials |
| 4 | “Ishlab chiqilmoqda — Ushbu bo'lim hozirda ishlab chiqilmoqda. Tez orada mavjud bo'ladi!” | “Under development — this section is currently being developed. Available soon!” | Homepage, loyalty |
| 5 | “Hujjatni yuklashda xatolik yuz berdi” | “An error occurred while loading the document” | `/terms` |
| 6 | “Noto'g'ri URL formati — Avtomobil sahifasiga ID orqali kira olmaysiz.” | “Invalid URL format — you cannot access the car page by ID.” | `/car/1` |
| 7 | “Ma'lumotlar topilmadi.” | “No data found.” | `/electronics/{id}`, unknown car slugs |
| 8 | “Xususiyatlar haqida ma'lumot kiritilmagan” | “No feature information has been entered” | Car PDP |
| 9 | “Shafof moliya” | (typo for “Shaffof moliya” = transparent finance) | Car PDP trust badge |
| 10 | “petrol” / “automatic” / “electric” | untranslated enum values | Car PDP specs |
| 11 | “View 1 … View 9” | untranslated alt text | Car PDP gallery |
| 12 | “Barchasi / Smartfonlar / Kompyuter va noutbuklar / **Phones**” | “All / Smartphones / Computers & laptops / Phones” | `/electronics` tabs |
| 13 | “Iphone 16 Pro Max (A2909/26) E1295/26 100 GB 256%” | nonsensical spec values | `/electronics` listing |
| 14 | “Chery Tiggo 7 Pro — **1 so'm**” | price = 1 soum | `/cars` listing (PDP 404s) |
| 15 | “Qolmadi” | “None left / out of stock” | `/electronics` card button |
| 16 | “Yangiliklar**qa** qaytish” | typo for “back to news” | `/news/{id}` |
| 17 | “Biznesdagi ulush → Oylik foyda → Pul yechish/qo'shish” | “Share in the business → Monthly profit → Withdraw/top up” | Homepage investor block |
| 18 | “Barchasi / Saralash: Eng yangi / Mashhur — Yangiliklar topilmadi” | “All / Sort: Newest / Popular — No news found” | `/news` |
| 19 | “Ma'lumotlaringiz xavfsiz va maxfiy saqlanadi” | “Your data is stored safely and confidentially” | Contact form |
| 20 | “Davom etish orqali siz Foydalanish shartlari va Maxfiylik siyosati ga rozilik bildirasiz” | “By continuing you agree to the Terms of Use and Privacy Policy” | `/login` |

## APPENDIX B — Open questions for the Markab team (answers needed before Phase 1)

1. **Legal entity** — which single registered name, form (MChJ / kommandit shirkat) and STIR/INN should appear everywhere? Is “TOWN PROPERTY MANAGEMENT SOLUTIONS / TPM Solutions” the same group, and what is the correct public relationship?
2. **Address** — which is the official office: Kukcha Aryk (Yunusobod) or Beruniy B1 (Chustiy MFY)? Are there two locations?
3. **Domains** — what is `markabstore.uz`? Should it redirect to `markab.uz`, or vice versa? (It did not respond during this audit.)
4. **AAOIFI claim** — what does “talablariga mos” mean in practice? Is there internal governance, external supervision, or a certification? *(We will publish only what can be evidenced.)*
5. **Contract structures** — which contract applies to cars vs electronics (taqsit / murabaha, or both)? Who owns the asset during the term? What are the early-settlement and late-payment rules?
6. **Pricing** — how is the installment price built (markup / marja)? Fixed or term-dependent? What down-payment range, minimum and maximum amounts, and term limits apply?
7. **Investment product** — what is the legal structure (mudaraba / wakala / musharaka / other)? Minimum amount? Profit calculation and distribution mechanics? Fees? Withdrawal notice period? What happens if the underlying assets underperform?
8. **Eligibility** — what are the approval criteria and required documents for buyers, and the KYC requirements for investors?
9. **Insurance/inspection** — are cars inspected? Is there a report customers can see? Is insurance required, and is it included in the monthly payment?
10. **Data & compliance** — which statement is correct: the `/privacy` policy (passport, JSHSHIR, selfie, card data, contacts) or the app-store declaration (“no data collected/shared”)? This must be reconciled on both surfaces.
11. **Operations** — is the electronics catalogue live for purchase, or is it a catalogue-only preview? Are out-of-stock items intentionally displayed?
12. **Roadmap** — is `/loyalty` officially launched? Which of the three education lessons have real content today? When is the investment product legally cleared to be marketed publicly?

---

*End of Phase 0. No design or code changes were made. This document is the input for **Markab 2.0 — Homepage Redesign (Phase 1)**, which should begin only after the P0 items in §12.3 are either fixed or scheduled in parallel.*
