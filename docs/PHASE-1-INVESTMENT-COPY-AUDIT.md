# Phase 1 — homepage investment-language audit

**Scope:** every investment-related sentence rendered on `/`.
**Rule applied:** nothing may state or imply a return, rate, ROI, guaranteed profit, fixed
monthly income, risk rating or verified investment mechanic unless it exists in verified
official source data.

## Verdict

| Area | Before the correction pass | After |
|---|---|---|
| Section heading | "Biznesdagi ulush orqali ishtirok etish" (asserts the mechanic) | "Sarmoya imkoniyatlari" |
| Section description | "Markab sarmoya modeli real savdo bitimlariga asoslanadi. Model uch bosqichli: biznesdagi ulush, **oylik foyda**, pul yechish yoki qo‘shish." | "Markab’ning sarmoya yo‘nalishi haqida ma’lumot oling: model qanday tavsiflanadi, qaysi shartlar e’lon qilingan va qaysi ma’lumotlar hali rasmiy tasdiqlanishi kerak." |
| Diagram label | none — the diagram read as established fact | "Markab tomonidan e’lon qilingan model tavsifi" + a "Tasdiqlanmagan" badge |
| Diagram step 2 | "Oylik foyda" | "Foyda taqsimoti" (Markab's own published value-proposition wording, without the monthly cadence) |
| "Asosiy shartlar" — published | Muddat · **Foydani yechish: istalgan vaqt** · **Hisobdorlik: oylik** | **Muddat only**, and it carries an "e’lon qilingan" qualifier |
| "Asosiy shartlar" — pending | Minimal miqdor · Foyda mexanikasi · Shartnoma turi | + Hisobdorlik tartibi · Pul yechish shartlari · **Xavf haqida ogohlantirish** |
| Disclaimer | present | strengthened: "hech qanday daromad, foiz, foyda miqdori, kafolat, xavf darajasi yoki investitsiya tavsiyasi" |

## Why "Foydani yechish: istalgan vaqt" was removed from the published list

The phrase is a close paraphrase of Markab's published value proposition "Foydani istalgan
vaqt chiqaring". It was moved out of the confirmed-shartlar list because presenting it as a
confirmed term asserts both that profit exists and that withdrawal is unconditional. It is
now covered by the pending row **Pul yechish shartlari**, which is honest: the wording is
published, the contractual term is not.

## Why step 2 was reworded rather than deleted

The three-step diagram is the clearest published explanation of the model and was
deliberately preserved (see `docs/MARKAB-2.0-PHASE-0-AUDIT.md`). "Oylik foyda" was replaced
with "Foyda taqsimoti" — Markab's own wording from the public "Adolatli foyda taqsimoti"
value proposition — which keeps the published meaning while removing the monthly-cadence
claim. The fixture change is documented inline in `lib/data/fixtures/content.ts`.

## Remaining homepage occurrences of investment language

| Text | Where | Status |
|---|---|---|
| "Sarmoya" (nav / goal card / eyebrow) | header, goals, section | Neutral noun. No claim. |
| "Sarmoya imkoniyatlari" | hero secondary CTA, section heading | Mandated copy. Neutral. |
| "Sarmoya modeli bilan tanishish" | invest section CTA | Mandated copy. Invitation, not a claim. |
| "Adolatli foyda taqsimoti" / "Rasmiy kelishuv va oylik hisobdorlik" | Why Markab | Verbatim published value propositions. Section states they are completed against official documents. |
| "Oson chiqarish" / "Foydani istalgan vaqt chiqaring" | Why Markab | Verbatim published value proposition. |
| Dashboard "Sarmoya" tile | app concept mock | Labelled "Kontsept"; all values are placeholders. |

## Not present anywhere on `/`

No percentage. No ROI. No annual or monthly return. No "kafolatlangan". No risk rating.
No investor count. No minimum amount. No testimonial. No calculated financing figure.
