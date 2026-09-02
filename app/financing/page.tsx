import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { Accordion } from '@/components/ui/Accordion';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


export const metadata: Metadata = buildMetadata({
  title: 'Moliyalashtirish',
  description:
    'Muddatli to‘lov qanday ishlaydi: jarayon bosqichlari, qo‘llab-quvvatlanadigan mahsulot turlari hamda e’lon qilingan va rasmiy tasdiqlanishi kutilayotgan shartlar.',
  path: '/financing',
});

/**
 * Terms are split in two, and the split is the point of this page.
 *
 * PUBLISHED comes from Markab's own public listings. PENDING is everything the
 * prototype refuses to guess — no rate, no range, no fee, no approval time.
 * Nothing in PENDING may be rendered as a value.
 */
const PUBLISHED_TERMS = [
  {
    label: 'Qo‘llaniladigan shartnoma turi',
    value: 'Taqsit yoki murabaha',
    note: 'Ochiq e’lonlarda ko‘rsatilgan.',
  },
  {
    label: 'Mahsulot turlari',
    value: 'Avtomobil va elektronika',
    note: 'Har ikkisi katalogda mavjud.',
  },
  {
    label: 'Oylik to‘lov ko‘rsatkichi',
    value: 'Ayrim e’lonlarda chop etilgan',
    note: 'Faqat e’londa ko‘rsatilgan mahsulotlar uchun keltiriladi.',
  },
];

const PENDING_TERMS = [
  { label: 'Minimal boshlang‘ich to‘lov' },
  { label: 'Muddat oralig‘i' },
  { label: 'Ustama yoki foiz miqdori' },
  { label: 'Komissiya va qo‘shimcha xarajatlar' },
  { label: 'Kerakli hujjatlar ro‘yxati' },
  { label: 'Tasdiqlash muddati' },
  { label: 'Erta to‘lash shartlari' },
  { label: 'Jarima va kechiktirish shartlari' },
];

const faq = [
  {
    id: 'formula',
    title: 'Nega kalkulyator oylik to‘lovni hisoblamaydi?',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-ink-600">
          Markab’ning rasmiy hisoblash formulasi ochiq e’lon qilinmagan. Formula mavjud bo‘lmaganda
          taxminiy raqam ko‘rsatish — noto‘g‘ri kutish hosil qiladi. Shuning uchun kalkulyator
          faqat siz kiritgan ma’lumotlarni va oddiy ayirish natijasini ko‘rsatadi, oylik to‘lov
          o‘rnida esa aniq kutish holati turadi.
        </p>
        <p className="text-xs text-ink-400">
          Aniq oylik to‘lov hisoblash tartibi tasdiqlangach ko‘rsatiladi.
        </p>
      </div>
    ),
  },
  {
    id: 'docs',
    title: 'Qanday hujjatlar kerak?',
    content: (
      <div className="space-y-3">
        <PendingValue label="Rasmiy javob tayyorlanmoqda" />
        <p className="text-xs leading-relaxed text-ink-400">
          Hujjatlar ro‘yxati rasmiy jarayon tasdiqlangach ko‘rsatiladi. Ariza formasida pasport,
          JSHSHIR yoki bank ma’lumotlari so‘ralmaydi.{' '}
          <Link href="/contact" className="text-brand-700 underline underline-offset-2">
            Menejerdan so‘rash
          </Link>
        </p>
      </div>
    ),
  },
  {
    id: 'early',
    title: 'Erta to‘lashga imkoniyat bormi?',
    content: (
      <div className="space-y-3">
        <PendingValue label="Rasmiy javob tayyorlanmoqda" />
        <p className="text-xs text-ink-400">
          Erta to‘lash shartlari shartnomada ko‘rsatiladi.
        </p>
      </div>
    ),
  },
  {
    id: 'approval',
    title: 'Tasdiqlash qancha vaqt oladi?',
    content: (
      <div className="space-y-3">
        <PendingValue label="Rasmiy javob tayyorlanmoqda" />
        <p className="text-xs text-ink-400">
          Hech qanday tasdiqlash ehtimoli yoki muddati bu prototipda taxmin qilinmaydi.
        </p>
      </div>
    ),
  },
  {
    id: 'contract',
    title: 'Qaysi shartnoma turi qo‘llaniladi?',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-ink-600">
          Ochiq ma’lumotga ko‘ra, oldi-sotdi shartnomasi <strong>taqsit</strong> yoki{' '}
          <strong>murabaha</strong> asosida rasmiylashtiriladi. Bu Markab’ning o‘zi e’lon qilgan
          ma’lumot.
        </p>
        <p className="text-xs text-ink-400">
          Har bir shartnoma turi bo‘yicha batafsil ta’rif Academy bo‘limida beriladi.
        </p>
        <Link
          href="/academy"
          className="inline-block text-sm font-medium text-brand-700 underline underline-offset-2"
        >
          Academy bo‘limiga o‘tish
        </Link>
      </div>
    ),
  },
];

export default async function FinancingPage() {
  // Real catalogue counts, read through the repository — not invented figures.
  const [vehicleFacets, productFacets, content] = await Promise.all([
    repository.getVehicleFacets(),
    repository.getProductFacets(),
    repository.getSiteContent(),
  ]);
  const carCount = vehicleFacets.status === 'success' ? vehicleFacets.data.total : null;
  const productCount = productFacets.status === 'success' ? productFacets.data.total : null;
  const financingSteps = content.status === 'success' ? content.data.financingSteps : [];

  return (
    <>
      {/* 1 — Hero */}
      <section className="border-b border-line bg-surface-muted section-y">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="brand" className="mb-4">
              Moliyalashtirish
            </Badge>
            <h1 className="text-display-sm sm:text-display-md">
              Muddatli to‘lov qanday ishlaydi
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
              Jarayon olti bosqichdan iborat. Bu sahifada faqat e’lon qilingan ma’lumotlar
              keltiriladi — tasdiqlanmagan shartlar aniq belgilangan kutish holatida turadi, taxminiy
              raqam bilan almashtirilmaydi.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/financing/apply" size="lg">
                Ariza yuborish
              </ButtonLink>
              <ButtonLink href="/financing/calculator" variant="secondary" size="lg">
                Kalkulyatorni ochish
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* 2 — Overview */}
      <section id="overview" className="bg-surface section-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Umumiy ma’lumot"
                title="Muddatli to‘lov — bu qanday model"
                description="Mahsulot narxi bo‘lib-bo‘lib to‘lanadi; yakuniy shartlar shartnomada belgilanadi."
              />
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600">
                <p>
                  Siz katalogdan mahsulot tanlaysiz, boshlang‘ich to‘lov va muddat bo‘yicha
                  o‘z xohishingizni bildirasiz, so‘ng ariza qoldirasiz. Shartnoma{' '}
                  <strong className="font-semibold text-ink-900">taqsit</strong> yoki{' '}
                  <strong className="font-semibold text-ink-900">murabaha</strong> asosida
                  rasmiylashtiriladi — bu Markab’ning ochiq e’lonida ko‘rsatilgan.
                </p>
                <p>
                  Aniq oylik to‘lov, jami summa, ustama va komissiyalar rasmiy hisoblash asosida
                  shakllanadi. Ular ochiq manbada e’lon qilinmagani uchun bu sahifada va
                  kalkulyatorda ko‘rsatilmaydi.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface-muted p-6 sm:p-8">
              <h2 className="text-base font-semibold text-ink-900">Bu sahifadagi ma’lumotlar</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                  <span className="text-ink-600">
                    <strong className="font-semibold text-ink-900">E’lon qilingan</strong> — ochiq
                    manbada chop etilgan ma’lumotlar.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink-300" />
                  <span className="text-ink-600">
                    <strong className="font-semibold text-ink-900">Rasmiy tasdiqlanishi kutilmoqda</strong>{' '}
                    — mavjud bo‘lmagani uchun ko‘rsatilmayotgan ma’lumotlar. Hech biri taxmin
                    qilinmagan.
                  </span>
                </li>
              </ul>
              <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-400">
                Hech qanday foiz stavkasi, ustama foizi, komissiya, tasdiqlash ehtimoli yoki
                investitsiya daromadi bu sahifada ko‘rsatilmaydi — ular uchun Markab tasdiqlashi kerak.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3 — How the process works */}
      <section id="process" className="bg-surface-muted section-y">
        <Container>
          <SectionHeading
            eyebrow="Yo‘l xaritasi"
            title="Olti bosqich"
            description="Mahsulot tanlashdan tortib, uni qabul qilib olishgacha."
          />

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {financingSteps.map((step) => {
              const body = (
                <>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                      {step.step}
                    </span>
                    <h3 className="text-base font-semibold text-ink-900">{step.title}</h3>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                    {step.description}
                  </p>
                  {step.href ? (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                      Ochish
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="mt-4 text-xs text-ink-400">Rasmiy jarayon tasdiqlanadi</span>
                  )}
                </>
              );

              return (
                <li key={step.step} className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card">
                  {step.href ? (
                    <Link href={step.href} className="flex h-full flex-col">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* 4 — Supported product types */}
      <section id="product-types" className="bg-surface section-y">
        <Container>
          <SectionHeading
            eyebrow="Mahsulotlar"
            title="Qo‘llab-quvvatlanadigan mahsulot turlari"
            description="Har ikki katalog ham ochiq manbada mavjud."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              href="/cars"
              className="group rounded-2xl border border-line bg-surface p-6 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover sm:p-8"
            >
              <h3 className="text-base font-semibold text-ink-900">Avtomobillar</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Katalogdagi avtomobillar brend, yil, narx va holat bo‘yicha saralanadi. Ayrim
                e’lonlarda oylik to‘lov chop etilgan.
              </p>
              <p className="mt-4 text-sm font-medium text-ink-800">
                {carCount !== null ? (
                  <>
                    <span className="font-semibold text-ink-900">{carCount}</span> ta e’lon
                  </>
                ) : (
                  <PendingValue label="Katalog yuklanmadi" />
                )}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                Katalogni ochish
                <svg className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>

            <Link
              href="/electronics"
              className="group rounded-2xl border border-line bg-surface p-6 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover sm:p-8"
            >
              <h3 className="text-base font-semibold text-ink-900">Elektronika</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Telefonlar va boshqa elektronika. Mavjudligi e’lon qilinmagan mahsulotlar savatchaga
                qo‘shilmaydi — avval mavjudlik aniqlanadi.
              </p>
              <p className="mt-4 text-sm font-medium text-ink-800">
                {productCount !== null ? (
                  <>
                    <span className="font-semibold text-ink-900">{productCount}</span> ta e’lon
                  </>
                ) : (
                  <PendingValue label="Katalog yuklanmadi" />
                )}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                Katalogni ochish
                <svg className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </Container>
      </section>

      {/* 5 — Available verified terms (published vs pending) */}
      <section id="terms" className="bg-surface-muted section-y">
        <Container>
          <SectionHeading
            eyebrow="Shartlar"
            title="Mavjud shartlar: e’lon qilingan va kutilayotgan"
            description="Ikki ro‘yxat atayin ajratilgan. Kutilayotgan maydonlar hech qachon taxminiy qiymat bilan to‘ldirilmaydi."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <h3 className="text-sm font-semibold text-ink-900">
                  E’lon qilingan ma’lumotlar
                </h3>
              </div>
              <dl className="divide-y divide-line">
                {PUBLISHED_TERMS.map((item) => (
                  <div key={item.label} className="px-5 py-4">
                    <dt className="text-xs uppercase tracking-wide text-ink-400">{item.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900">
                      {item.value}
                      {item.note ? (
                        <p className="mt-1 text-xs font-normal leading-relaxed text-ink-400">
                          {item.note}
                        </p>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <span className="h-2 w-2 rounded-full bg-ink-300" />
                <h3 className="text-sm font-semibold text-ink-900">
                  Rasmiy tasdiqlanishi kutilayotgan
                </h3>
              </div>
              <ul className="divide-y divide-line">
                {PENDING_TERMS.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-ink-600">{item.label}</span>
                    <PendingValue label="Rasmiy ma’lumot kutilmoqda" />
                  </li>
                ))}
              </ul>
              <p className="border-t border-line px-5 py-4 text-xs leading-relaxed text-ink-400">
                Bu maydonlarning hech biri bo‘yicha taxminiy qiymat ko‘rsatilmaydi — ular faqat
                Markab tomonidan taqdim etiladi.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 6 — Calculator CTA */}
      <section id="calculator" className="bg-surface section-y">
        <Container>
          <div className="grid items-center gap-8 rounded-2xl border border-line bg-surface-muted p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-12">
            <div className="max-w-2xl">
              <Badge tone="pending">Rasmiy formula kutilmoqda</Badge>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
                Kalkulyator hisoblamaydi — va bu atayin
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                Narx, boshlang‘ich to‘lov va muddatni kiriting: kalkulyator moliyalashtiriladigan
                qoldiqni (oddiy ayirish) ko‘rsatadi, oylik to‘lov o‘rnida esa rasmiy formula
                hali ishlamasligini bildiradi. Noto‘g‘ri raqam ko‘rsatishdan ko‘ra,
                hisoblamaslik to‘g‘riroq.
              </p>
            </div>
            <ButtonLink href="/financing/calculator" size="lg" className="shrink-0">
              Kalkulyatorni ochish
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* 7 — Application CTA */}
      <section id="apply" className="bg-surface-muted section-y">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Ariza"
                title="Ariza qanday qoldiriladi"
                description="Bitta sahifa, to‘rt maydon guruhi, minimal ma’lumot. Hech qanday moliyaviy majburiyat tug‘dirmaydi."
              />
              <ol className="mt-6 space-y-3 text-sm leading-relaxed text-ink-600">
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                    1
                  </span>
                  Mahsulotni tanlang yoki nomini yozing.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                    2
                  </span>
                  Boshlang‘ich to‘lov va muddat bo‘yicha xohishingizni bildiring.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                    3
                  </span>
                  Ism, telefon va qulay aloqa usulini kiriting.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-700">
                    4
                  </span>
                  Yuborilgach, kiritgan ma’lumotlaringiz ekranda qoladi — nusxa olish mumkin.
                </li>
              </ol>
              <div className="mt-6 flex flex-wrap gap-2">
                <ButtonLink href="/financing/apply">Ariza yuborish</ButtonLink>
                <ButtonLink href="/contact" variant="secondary">
                  Menejer bilan bog‘lanish
                </ButtonLink>
              </div>
            </div>

            <div>
              <StateBlock
                variant="unavailable"
                title="Ariza rasmiy backendga ulanmagan"
                description="Bu prototipda ariza hech qurilma yoki serverga yuborilmaydi. Yuborish tugmasi bosilgach, yuborish ishlamasligi aniq ko‘rsatiladi — “yuborildi” degan yolg‘on tasdiq chiqmaydi."
                actions={
                  <ButtonLink href="/contact" variant="secondary" size="sm">
                    Menejer orqali bog‘lanish
                  </ButtonLink>
                }
              />
              <p className="mt-4 rounded-xl border border-line bg-surface p-5 text-xs leading-relaxed text-ink-400">
                Arizada pasport, JSHSHIR, bank karta ma’lumotlari yoki biometrik ma’lumot
                so‘ralmaydi. Bular faqat rasmiy jarayon va huquqiy asos tasdiqlangandan so‘ng, real
                tizimda talab qilinishi mumkin.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 8 — Transparency / trust */}
      <section id="trust" className="bg-surface section-y">
        <Container>
          <SectionHeading
            eyebrow="Shaffoflik"
            title="Nima aniq, nima emas"
            description="Bu bo‘lim mustaqil tekshiruv o‘tkazmaydi — faqat manbalarda nima e’lon qilinganini ko‘rsatadi."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="text-base font-semibold text-ink-900">AAOIFI va standartlar</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Markab o‘z nashrlarida AAOIFI va boshqa muvofiqlik standartlariga ishora qiladi. Bu{' '}
                <strong className="font-semibold text-ink-900">Markab’ning o‘zi e’lon qilgan
                da’vo</strong> — mustaqil tasdiqlovchi hujjatlar ochiq manbada mavjud emas, shuning
                uchun bu prototip uni tasdiqlangan deb ko‘rsatmaydi.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="text-base font-semibold text-ink-900">Yuridik ma’lumotlar</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Yuridik shaxs nomi, manzil va aloqa ma’lumotlari turli manbalarda turlicha
                ko‘rsatilgan. Yagona rasmiy qiymat tasdiqlanmaguncha bu maydonlar ko‘rsatilmaydi.
              </p>
              <p className="mt-3">
                <Link href="/privacy" className="text-sm font-medium text-brand-700 underline underline-offset-2">
                  Maxfiylik siyosati
                </Link>
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="text-base font-semibold text-ink-900">Yakuniy shartlar</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Barcha narx, muddat va to‘lov shartlari rasmiy Markab shartnomasi va jarayoni
                asosida belgilanadi. Bu sahifa, kalkulyator va ariza hech qanday moliyaviy taklif
                yoki kafolat emas.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 9 — FAQ */}
      <section id="faq" className="bg-surface-muted section-y">
        <Container>
          <SectionHeading
            eyebrow="Savollar"
            title="Ko‘p so‘raladigan holatlar"
            description="Rasmiy javoblar tasdiqlangach shu yerda paydo bo‘ladi."
          />
          <div className="mt-8 max-w-3xl">
            <Accordion items={faq} />
          </div>
        </Container>
      </section>

      {/* 10 — Final CTA */}
      <section id="final-cta" className="bg-ink-900 section-y">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Shartlarni menejer bilan aniqlashtiring
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                Aniq oylik to‘lov va shartlar rasmiy hisoblash asosida shakllanadi. Menejer sizning
                holatingiz bo‘yicha to‘liq ma’lumot bera oladi.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-white/50">
                {site.office.address} · {site.office.hours}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact" size="lg" variant="onDark">
                Bog‘lanish
              </ButtonLink>
              <ButtonLink href="/financing/apply" size="lg" variant="onDarkOutline">
                Ariza yuborish
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
