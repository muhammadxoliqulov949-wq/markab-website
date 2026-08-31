import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { legal, legalFlags } from '@/lib/legal';
import { site } from '@/lib/site';
import { valueProps } from '@/lib/data/fixtures/content';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Markab haqida',
  description:
    'Markab — avtomobil va elektronikani muddatli to‘lovga taqdim etuvchi, qadriyatlarga asoslangan moliya platformasi. Kompaniya ma’lumotlari va tekshiruv kutilayotgan maydonlar.',
  path: '/about',
});

const legs = [
  {
    title: 'Avtomobil',
    description: "Muddatli to'lov asosida avtomobillar.",
    href: '/cars',
  },
  {
    title: 'Elektronika',
    description: "Smartfonlar va boshqa mahsulotlar muddatli to'lov asosida.",
    href: '/electronics',
  },
  {
    title: 'Sarmoya',
    description: 'Biznesdagi ulush orqali ishtirok etish modeli.',
    href: '/invest',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="brand" className="mb-4">
              {site.positioning}
            </Badge>
            <h1 className="text-display-sm sm:text-display-md">Markab haqida</h1>
            <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
              Markab — avtomobil va elektronikani muddatli to‘lovga taqdim etuvchi,
              qadriyatlarga asoslangan moliya platformasi. Saytda e’lon qilingan ma’lumotlar asosida
              tayyorlangan.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Yo‘nalishlar"
            title="Uchta yo‘nalish, bitta model"
            description="Avtomobil va elektronika muddatli to‘lov orqali taqdim etiladi, sarmoya esa shu jarayonni ta’minlaydi."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {legs.map((leg) => (
              <Link
                key={leg.title}
                href={leg.href}
                className="group rounded-xl border border-line bg-surface p-6 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
              >
                <h3 className="text-base font-semibold text-ink-900">{leg.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{leg.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                  Ochish
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface-muted py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Tamoyillar"
            title="Nima uchun Markab?"
            description="Saytda e’lon qilingan to‘rtta tamoyil."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((prop) => (
              <div key={prop.id} className="rounded-xl border border-line bg-surface p-6">
                <h3 className="text-base font-semibold text-ink-900">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{prop.description}</p>
                {prop.note ? (
                  <p className="mt-3 border-t border-line pt-3 text-xs text-ink-400">{prop.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Transparency: conflicting fields are listed openly instead of being guessed. */}
      <section className="bg-surface py-14 sm:py-20" id="trust">
        <Container>
          <SectionHeading
            eyebrow="Shaffoflik"
            title="Tekshiruv kutilayotgan maydonlar"
            description="Quyidagi ma’lumotlar turli rasmiy manbalarda farqli ko‘rsatilgan. Yagona qiymat tasdiqlangunga qadar ular ko‘rsatilmaydi — taxminiy qiymat bilan almashtirilmaydi."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {legalFlags.map((flag) => (
              <div
                key={flag.id}
                className="rounded-xl border border-line bg-surface p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-ink-900">{flag.field}</h3>
                  <Badge tone={flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'neutral'}>
                    {flag.severity === 'high' ? 'Muhim' : flag.severity === 'medium' ? 'O‘rtacha' : 'Past'}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{flag.summary}</p>
                <p className="mt-3 text-xs text-ink-400">Manbalar: {flag.sources.join(' · ')}</p>
              </div>
            ))}
          </div>

          <dl className="mt-8 grid gap-4 rounded-xl border border-line bg-surface-muted p-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-400">Yuridik shaxs</dt>
              <dd className="mt-1 text-sm text-ink-700">
                {legal.entityName ?? <PendingValue label="rasmiy tekshiruv kutilmoqda" />}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-400">Ro‘yxat raqami</dt>
              <dd className="mt-1 text-sm text-ink-700">
                {legal.registrationNumber ?? <PendingValue label="e’lon qilinmagan" />}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-400">Telefon</dt>
              <dd className="mt-1 text-sm text-ink-700">
                {legal.phone ?? <PendingValue label="saytda e’lon qilinmagan" />}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-400">Email</dt>
              <dd className="mt-1 text-sm text-ink-700">
                {legal.email ?? <PendingValue label="saytda e’lon qilinmagan" />}
              </dd>
            </div>
          </dl>
        </Container>
      </section>

      <section className="bg-surface-muted py-14 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Ofis"
              title="Manzil"
              description="Ochiq e’lon qilingan manzil va ish vaqti."
            />
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Manzil</dt>
                <dd className="mt-1 text-ink-700">{site.office.address}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Ish vaqti</dt>
                <dd className="mt-1 text-ink-700">{site.office.hours}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/contact" size="lg">
                Bog‘lanish
              </ButtonLink>
              <ButtonLink href={site.office.mapUrl} variant="secondary" size="lg">
                Xaritada ochish
              </ButtonLink>
            </div>
          </div>

          <StateBlock
            variant="pending"
            title="Kompaniya hujjatlari"
            description="Ta’sis hujjatlari, litsenziyalar va shartnoma namunalari rasmiy manba tomonidan taqdim etilgach shu yerda joylashtiriladi."
            actions={
              <ButtonLink href="/privacy" variant="secondary" size="sm">
                Maxfiylik siyosati
              </ButtonLink>
            }
          />
        </Container>
      </section>
    </>
  );
}
