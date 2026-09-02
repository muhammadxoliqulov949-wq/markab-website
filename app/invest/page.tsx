import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { Accordion } from '@/components/ui/Accordion';
import { FactTable } from '@/components/investment/FactRow';
import { DocumentList } from '@/components/investment/DocumentList';
import { repository } from '@/lib/data';
import type { StateVariant } from '@/components/ui/StateBlock';
import { investmentContactHref, PENDING_LABEL, PUBLISHED_LABEL } from '@/lib/investment/status';
import { legal } from '@/lib/legal';
import { buildMetadata } from '@/lib/seo';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


export const metadata: Metadata = buildMetadata({
  title: 'Sarmoya',
  description:
    'Markab sarmoya modeli: e’lon qilingan tamoyillar, rasmiy tasdiqlanishi kutilayotgan shartlar, risk haqida ogohlantirish va hujjatlar holati. Hech qanday daromad kafolati ko‘rsatilmaydi.',
  path: '/invest',
});

/**
 * /invest — the investment experience.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PRIMARY RULE: no investment information is invented.
 *
 * There is no return rate, yield, ROI, expected income, guaranteed profit,
 * term, minimum amount, withdrawal rule, fee, payout schedule, risk rating or
 * historical performance anywhere on this page. Nothing is derived, implied or
 * illustrated. Where an official value does not exist, the row says
 * "Rasmiy ma'lumot kutilmoqda." and stays empty.
 *
 * This page is information, not investment advice, and it says so.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Map a Result status onto the StateBlock vocabulary. The two use different
 * spellings (`not_found` vs `not-found`), and a cast would hide a real
 * mismatch, so the mapping is explicit.
 */
function toStateVariant(status: string): StateVariant {
  switch (status) {
    case 'error':
      return 'error';
    case 'not_found':
      return 'not-found';
    case 'empty':
      return 'empty';
    default:
      return 'unavailable';
  }
}

/** The disclosure is shown in full near the top and again before the CTA. */
function NotAdviceNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-ink-400 ${className}`}>
      Bu sahifa investitsiya tavsiyasi emas. Hech qanday daromad, foiz yoki foyda miqdori
      ko‘rsatilmagan va kafolatlanmagan.
    </p>
  );
}

export default async function InvestPage() {
  const result = await repository.getInvestmentProfile();
  const profile = result.status === 'success' ? result.data : null;

  // No source, no data — and critically, no fallback content of our own.
  if (!profile) {
    return (
      <Container className="py-16 sm:py-24">
        <StateBlock
          variant={toStateVariant(result.status)}
          title="Sarmoya ma’lumotlari yuklanmadi"
          description="Sarmoya profili ma’lumot manbasidan olinmadi. Bu holatda hech qanday shart, muddat yoki daromad ko‘rsatkichi ko‘rsatilmaydi — taxminiy qiymat bilan almashtirilmaydi."
          actions={
            <ButtonLink href={investmentContactHref()} variant="secondary" size="sm">
              Mutaxassis bilan bog‘lanish
            </ButtonLink>
          }
        />
      </Container>
    );
  }

  return (
    <>
      {/* 1 — Hero ------------------------------------------------------------ */}
      <Section tone="dark" className="border-b border-white/10 section-y">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="pending" className="border-white/20 bg-white/5 text-white/70">
              Rasmiy ma’lumot kutilmoqda
            </Badge>
            <h1 className="mt-4 text-display-sm text-white sm:text-display-md">Sarmoya</h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Markab o‘z ochiq materiallarida sarmoyani biznesdagi ulush orqali taqdim etadi. Bu
              sahifada faqat e’lon qilingan ma’lumotlar keltiriladi — tasdiqlanmagan shartlar
              aniq belgilangan kutish holatida turadi, taxminiy raqam bilan almashtirilmaydi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={investmentContactHref()} size="lg" variant="onDark">
                Batafsil ma’lumot olish
              </ButtonLink>
              <ButtonLink
                href={investmentContactHref('terms')}
                size="lg"
                variant="onDarkOutline"
              >
                Mutaxassis bilan bog‘lanish
              </ButtonLink>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/50">
              Bu sahifa investitsiya tavsiyasi emas. Hech qanday daromad, foiz yoki foyda miqdori
              ko‘rsatilmagan va kafolatlanmagan.
            </p>
          </div>
        </Container>
      </Section>

      {/* 2 — What the investment product is ---------------------------------- */}
      <Section id="what" className="section-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <SectionHeading
              id="what-heading"
              eyebrow="Mahsulot"
              title="Sarmoya mahsuloti nima"
              description="Quyidagi tavsif kompaniyaning o‘z e’loniga asoslanadi. Modelning huquqiy mexanikasi rasmiy hujjatlar bilan tasdiqlanadi."
            />
            <div className="space-y-4 text-[0.9375rem] leading-relaxed text-ink-600">
              <p>
                Markab sarmoyani real biznesdagi ulush shaklida taqdim etadi: sarmoyador
                mablag‘ini kompaniya faoliyatiga yo‘naltiradi, natija esa rasmiy kelishuv asosida
                taqsimlanadi.
              </p>
              <p>
                Bu tavsif kompaniyaning ochiq materiallarida keltirilgan. Uning aniq huquqiy
                shakli — qaysi shartnoma turi qo‘llanishi, mablag‘ qanday hisobga olinishi va
                natija qanday hisoblanishi — rasmiy hujjatlarda belgilanadi va hozircha e’lon
                qilinmagan.
              </p>
              <p className="rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-3 text-sm text-ink-500">
                Hech qanday daromad foizi, kafolatlangan foyda, muddat yoki minimal miqdor bu
                sahifada ko‘rsatilmaydi. Bu ma’lumotlar Markab e’lon qilgach, shu yerga
                aynan keltiriladi.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3 — How the published model works ----------------------------------- */}
      <Section id="model" tone="muted" className="section-y">
        <Container>
          <SectionHeading
            id="model-heading"
            eyebrow="Model"
            title={profile.modelTitle}
            description="Kompaniya tomonidan e’lon qilingan uch bosqichli tavsif. Bu sxema modelning qanday ishlashini emas, kompaniya uni qanday tasvirlashini ko‘rsatadi."
          />

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {profile.modelSteps.map((step, index) => (
              <li
                key={step}
                className="relative rounded-xl border border-line bg-surface p-6 shadow-card"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink-900">{step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  Bosqichning aniq mexanikasi rasmiy hujjatlar bilan tasdiqlanadi.
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-ink-400">
            Bu sxema markab.uz’da e’lon qilingan tavsifdir. Modellarning moliyaviy mexanikasi,
            shartnoma turi va to‘lov tartibi rasmiy hujjatlar bilan tasdiqlanadi — ular bu yerda
            taxmin qilinmaydi.
          </p>
        </Container>
      </Section>

      {/* 4 — Available official information ---------------------------------- */}
      <Section id="published" className="section-y">
        <Container className="max-w-4xl">
          <SectionHeading
            id="published-heading"
            eyebrow="E’lon qilingan"
            title="Mavjud rasmiy ma’lumotlar"
            description="Quyidagi tamoyillar kompaniyaning ochiq materiallarida keltirilgan. Har biri manbasi bilan ko‘rsatilgan — bu tasdiqlangan shartnoma sharti emas, kompaniya e’loni."
          />

          <div className="mt-8">
            <FactTable published={profile.published} pending={[]} />
          </div>

          <NotAdviceNote className="mt-4" />
        </Container>
      </Section>

      {/* 5 — Pending information --------------------------------------------- */}
      <Section id="pending" tone="muted" className="section-y">
        <Container className="max-w-4xl">
          <SectionHeading
            id="pending-heading"
            eyebrow="Kutilmoqda"
            title="Rasmiy tasdiqlanishi kerak bo‘lgan ma’lumotlar"
            description="Sarmoya qilishdan oldin bilish kerak bo‘lgan asosiy maydonlar. Hech biri e’lon qilinmagan, shuning uchun hech biri taxminiy qiymat bilan to‘ldirilmaydi."
          />

          <div className="mt-8">
            <FactTable published={[]} pending={profile.pending} />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Bu maydonlarning hech biri bo‘yicha taxminiy qiymat ko‘rsatilmaydi — ular faqat
            Markab tomonidan taqdim etiladi. Bo‘sh qator — ma’lumot yo‘qligi haqidagi aniq ma’lumotdir.
          </p>
        </Container>
      </Section>

      {/* 6 — Process / journey ----------------------------------------------- */}
      <Section id="journey" className="section-y">
        <Container>
          <SectionHeading
            id="journey-heading"
            eyebrow="Jarayon"
            title="Qanday boshlanadi"
            description="Yuqori darajadagi jarayon. Rasmiy manbada tavsiflanmagan bosqichlar alohida belgilangan — ular to‘ldirilmaydi."
          />

          <ol className="mt-10 space-y-3">
            {profile.journey.map((step) => (
              <li
                key={step.step}
                className="flex gap-4 rounded-xl border border-line bg-surface p-5 sm:p-6"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                  {step.step}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-ink-900">{step.title}</h3>
                    <Badge tone={step.confirmed ? 'neutral' : 'pending'}>
                      {step.confirmed ? 'Jarayon mavjud' : 'Rasmiy tavsif kutilmoqda'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 7 — Transparency & documents ---------------------------------------- */}
      <Section id="documents" tone="muted" className="section-y">
        <Container className="max-w-4xl">
          <SectionHeading
            id="documents-heading"
            eyebrow="Shaffoflik"
            title="Hujjatlar va hisobdorlik"
            description="Quyidagi hujjatlar sarmoya qarori uchun kerak bo‘ladi. Hech biri ochiq manbada mavjud emas — shuning uchun hech biri uchun yuklab olish tugmasi ko‘rsatilmaydi."
          />

          <div className="mt-8">
            <DocumentList documents={profile.documents} />
          </div>

          <div className="mt-6 space-y-3">
            {profile.compliance.map((item) => (
              <div key={item.id} className="rounded-xl border border-line bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="pending">Mustaqil tasdiqlanmagan</Badge>
                </div>
                <p className="mt-3 text-sm font-medium leading-relaxed text-ink-800">
                  {item.statement}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-400">{item.attribution}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-400">
            Prototip mustaqil tekshiruv o‘tkazmaydi va hech qanday sertifikat yoki muvofiqlikni
            tasdiqlamaydi. Kompaniya da’volari uning o‘z e’loni sifatida, manbasi bilan
            keltiriladi.
          </p>
        </Container>
      </Section>

      {/* 8 — Risk disclosure -------------------------------------------------- */}
      <Section id="risk" className="section-y">
        <Container className="max-w-4xl">
          <div className="rounded-2xl border border-line-strong bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2
                id="risk-heading"
                className="text-lg font-semibold text-ink-900 sm:text-xl"
              >
                Risk haqida ogohlantirish
              </h2>
              <Badge tone="warning">Daraja ko‘rsatilmaydi</Badge>
            </div>

            <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-ink-600">
              <p>
                Har qanday sarmoya xavf bilan bog‘liq: mablag‘ning bir qismi yoki to‘liq
                yo‘qotilishi mumkin. Bu sahifa hech qanday daromad, foiz yoki foyda miqdorini
                kafolatlamaydi va kafolatlay olmaydi — bunday ma’lumot e’lon qilinmagan.
              </p>
              <p>
                Yakuniy shartlar — minimal miqdor, muddat, foyda mexanizmi, to‘lovlar, pul yechish
                tartibi va risklar — faqat Markabning rasmiy shartnomasi va hujjatlari asosida
                belgilanadi. Bu sahifa, undagi tavsiflar va kutish holatlari hech qanday moliyaviy
                taklif yoki kafolat emas.
              </p>
              <p>
                Bu prototip investitsiya bo‘yicha maslahat bermaydi. Qaror qabul qilishdan oldin
                rasmiy hujjatlar bilan tanishish va zarur hollarda mustaqil mutaxassis bilan
                maslahatlashish tavsiya etiladi.
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-3">
              <p className="text-sm text-ink-500">
                Markabning risklar bo‘yicha rasmiy ogohlantiruvi e’lon qilingach, u shu yerda
                to‘liq keltiriladi. Rasmiy hujjat mavjud bo‘lmaganda hech qanday xavf darajasi
                (past / o‘rta / yuqori) ko‘rsatilmaydi — bunday baho faqat Markabdan
                olinadi.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9 — FAQ -------------------------------------------------------------- */}
      <Section id="faq" tone="muted" className="section-y">
        <Container className="max-w-3xl">
          <SectionHeading
            id="faq-heading"
            eyebrow="Savollar"
            title="Sarmoyadorlar uchun savol-javoblar"
            description="Rasmiy javoblar tasdiqlangach shu yerda paydo bo‘ladi."
            align="center"
            size="sm"
          />
          <div className="mt-8">
            <Accordion
              items={[
                {
                  id: 'returns',
                  title: 'Kutilayotgan daromad qancha?',
                  content: (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-600">
                        Hech qanday daromad foizi yoki kafolatlangan foyda e’lon qilinmagan. Shu
                        sababli bu yerda hech qanday raqam ko‘rsatilmaydi — taxminiy hisoblash
                        noto‘g‘ri kutish hosil qiladi.
                      </p>
                      <p className="text-xs text-ink-400">
                        Moliyaviy ko‘rsatkichlar faqat rasmiy hujjatlar asosida joylashtiriladi.
                      </p>
                    </div>
                  ),
                },
                {
                  id: 'minimum',
                  title: 'Minimal sarmoya miqdori qancha?',
                  content: (
                    <p className="text-sm text-ink-600">
                      {PENDING_LABEL} Minimal miqdor Markab e’lon qilgach shu yerda
                      ko‘rsatiladi.
                    </p>
                  ),
                },
                {
                  id: 'term',
                  title: 'Sarmoya muddati qancha?',
                  content: (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-600">
                        {PENDING_LABEL} Ilgari bu sahifada muddat oralig‘i ko‘rsatilgan edi,
                        biroq u Markab tomonidan tasdiqlanmadi va olib tashlandi. U boshqa
                        taxminiy muddat bilan almashtirilmaydi.
                      </p>
                      <p className="text-xs text-ink-400">
                        Muddat faqat rasmiy shartnomada belgilanadi.
                      </p>
                    </div>
                  ),
                },
                {
                  id: 'withdraw',
                  title: 'Sarmoyadorlar qanday pul yechadilar?',
                  content: (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-600">
                        Kompaniya o‘z e’lonida foydani istalgan vaqt chiqarish mumkinligini
                        bildiradi. Bu e’lon manbasi bilan yuqorida keltirilgan.
                      </p>
                      <p className="text-xs text-ink-400">
                        Yechish tartibi, muddati, minimal miqdor va cheklovlar rasmiy hujjat bilan
                        tasdiqlanishi kerak — ular taxmin qilinmaydi.
                      </p>
                    </div>
                  ),
                },
                {
                  id: 'risk',
                  title: 'Risklar qanday baholanadi?',
                  content: (
                    <p className="text-sm text-ink-600">
                      Hech qanday xavf darajasi ko‘rsatilmaydi. Rasmiy risk ogohlantiruvi e’lon
                      qilingach, u to‘liq keltiriladi. Prototip mustaqil ravishda “past”, “o‘rta”
                      yoki “yuqori” kabi baho bermaydi.
                    </p>
                  ),
                },
                {
                  id: 'advice',
                  title: 'Bu investitsiya tavsiyasimi?',
                  content: (
                    <p className="text-sm text-ink-600">
                      Yo‘q. Bu sahifa kontsept-prototip bo‘lib, faqat e’lon qilingan ma’lumotlarni
                      ko‘rsatadi. U investitsiya bo‘yicha maslahat, taklif yoki kafolat emas.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </Container>
      </Section>

      {/* 10 — Contact / interest CTA ------------------------------------------ */}
      <Section id="contact" tone="dark" className="section-y">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Shartlar va hujjatlar bo‘yicha mutaxassis bilan gaplashing
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                Rasmiy ma’lumot e’lon qilingach, savollaringizga aniq javob beriladi. Bu
                prototipda sarmoya kiritish, balans yoki to‘lov oqimi mavjud emas — faqat
                ma’lumot so‘rovi.
              </p>
              <NotAdviceNote className="mt-4 !text-white/50" />
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={investmentContactHref()} size="lg" variant="onDark">
                Batafsil ma’lumot olish
              </ButtonLink>
              <ButtonLink href={investmentContactHref('risk')} size="lg" variant="onDarkOutline">
                Risk hujjatini so‘rash
              </ButtonLink>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-xs text-white/50">
            <Link href="/contact" className="inline-flex min-h-[32px] items-center underline underline-offset-4 hover:text-white/80">
              Aloqa
            </Link>
            <Link href="/faq" className="inline-flex min-h-[32px] items-center underline underline-offset-4 hover:text-white/80">
              Savol-javoblar
            </Link>
            {legal.documents.terms ? (
              <Link
                href={legal.documents.terms}
                className="inline-flex min-h-[32px] items-center underline underline-offset-4 hover:text-white/80"
              >
                Foydalanish shartlari
              </Link>
            ) : null}
            {legal.documents.privacy ? (
              <Link
                href={legal.documents.privacy}
                className="inline-flex min-h-[32px] items-center underline underline-offset-4 hover:text-white/80"
              >
                Maxfiylik siyosati
              </Link>
            ) : null}
          </div>
        </Container>
      </Section>
    </>
  );
}
