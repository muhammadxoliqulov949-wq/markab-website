import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { Accordion } from '@/components/ui/Accordion';
import { investorFlow } from '@/lib/data/fixtures/content';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sarmoya',
  description:
    'Markab sarmoya modeli: biznesdagi ulush, oylik foyda, pul yechish/qo‘shish. Rasmiy shartlar tasdiqlangach to‘ldiriladi.',
  path: '/invest',
});

const terms = [
  { label: 'Minimal miqdor', value: null },
  { label: 'Muddat', value: '2 oydan 36 oygacha' },
  { label: 'Foyda mexanizmi', value: null },
  { label: 'To‘lov davriyligi', value: 'Oylik' },
  { label: 'Pul yechish', value: 'Istalgan vaqt' },
  { label: 'Shartnoma turi', value: null },
];

const documentation = [
  { title: 'Shartnoma namunasi', note: 'Rasmiy hujjat kutilmoqda' },
  { title: 'Ommaviy oferta', note: 'Rasmiy hujjat kutilmoqda' },
  { title: 'Risk haqida ogohlantirish', note: 'Rasmiy hujjat kutilmoqda' },
  { title: 'Oylik hisobot namunasi', note: 'Rasmiy hujjat kutilmoqda' },
];

export default function InvestPage() {
  return (
    <>
      <section className="border-b border-line bg-ink-900 py-14 text-white sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="pending" className="border-white/20 bg-white/5 text-white/70">
              Rasmiy ma’lumot bilan to‘ldiriladi
            </Badge>
            <h1 className="mt-4 text-display-sm text-white sm:text-display-md">Sarmoya</h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Markab modelida sarmoya real aktivlar bilan ta’minlangan savdo bitimlariga
              yo‘naltiriladi. Bu sahifada faqat ochiq e’lon qilingan ma’lumotlar ko‘rsatilgan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact" size="lg">
                Menejer bilan bog‘lanish
              </ButtonLink>
              <ButtonLink
                href="/academy/sarmoyadorlar-uchun-asoslar"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
              >
                Sarmoya asoslari
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Model"
            title={investorFlow.title}
            description="Uch bosqichli model — ochiq e’lon qilingan ko‘rinishda."
          />

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {investorFlow.steps.map((step, index) => (
              <li
                key={step}
                className="relative rounded-xl border border-line bg-surface p-6 shadow-card"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink-900">{step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  Bosqich tavsifi rasmiy hujjatlar bilan to‘ldiriladi.
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-surface-muted py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Shartlar"
              title="Asosiy shartlar"
              description="Ochiq manbalarda e’lon qilingan qiymatlar. Qolganlari rasmiy tasdiqdan so‘ng qo‘shiladi."
            />
            <dl className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {terms.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
                  <dt className="text-sm text-ink-500">{item.label}</dt>
                  <dd className="text-right text-sm text-ink-900">
                    {item.value ?? <PendingValue label="Rasmiy ma’lumot bilan to‘ldiriladi" />}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              Bu sahifada hech qanday daromad foizi, kafolatlangan foyda yoki investitsiya
              tavsiyasi ko‘rsatilmagan.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-line bg-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-ink-900">Risk haqida</h2>
                <Badge tone="pending">Rasmiy ma’lumot kutilmoqda</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Har qanday sarmoya xavf bilan bog‘liq. Markab’ning risklar bo‘yicha rasmiy
                ogohlantiruvi e’lon qilingach, u shu yerda to‘liq ko‘rsatiladi. Rasmiy hujjat
                mavjud bo‘lmaganda hech qanday xavf darajasi ko‘rsatilmaydi.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-base font-semibold text-ink-900">Hujjatlar</h2>
              <ul className="mt-4 divide-y divide-line">
                {documentation.map((doc) => (
                  <li key={doc.title} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-ink-800">{doc.title}</span>
                    <span className="text-xs text-ink-400">{doc.note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <StateBlock
              variant="pending"
              title="Sarmoyador kabineti"
              description="Shaxsiy kabinet (oylik hisobot, pul yechish so‘rovlari, portfolio ko‘rinishi) kontsept sifatida ishlab chiqilgan. Real ma’lumotlar ulanishi kutilmoqda."
              actions={
                <ButtonLink href="/profile" variant="secondary" size="sm">
                  Kabinet kontsepti
                </ButtonLink>
              }
            />
          </div>
        </Container>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Savollar"
            title="Sarmoyadorlar uchun savol-javoblar"
            description="Rasmiy javoblar tasdiqlangach shu yerda paydo bo‘ladi."
            align="center"
          />
          <div className="mt-8">
            <Accordion
              items={[
                {
                  id: 'withdraw',
                  title: 'Sarmoyadorlar qanday pul yechadilar?',
                  content: (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-600">
                        Ochiq ma’lumotga ko‘ra, foydani istalgan vaqt yechib olish mumkin.
                      </p>
                      <PendingValue label="Jarayon tafsiloti rasmiy manba bilan to‘ldiriladi" />
                    </div>
                  ),
                },
                {
                  id: 'reporting',
                  title: 'Hisobot qanday taqdim etiladi?',
                  content: (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-600">
                        Ochiq ma’lumotga ko‘ra, oylik hisobdorlik mavjud.
                      </p>
                      <PendingValue label="Hisobot shakli rasmiy manba bilan to‘ldiriladi" />
                    </div>
                  ),
                },
                {
                  id: 'minimum',
                  title: 'Minimal sarmoya miqdori qancha?',
                  content: <PendingValue label="Rasmiy ma’lumot bilan to‘ldiriladi" />,
                },
                {
                  id: 'returns',
                  title: 'Kutilayotgan daromad qancha?',
                  content: (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-600">
                        Hech qanday daromad foizi yoki kafolat e’lon qilinmagan, shuning uchun bu
                        yerda ko‘rsatilmaydi.
                      </p>
                      <p className="text-xs text-ink-400">
                        Moliyaviy ko‘rsatkichlar faqat rasmiy hujjatlar asosida joylashtiriladi.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
