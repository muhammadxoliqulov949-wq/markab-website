import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { howItWorks } from '@/lib/data/fixtures/content';

export function HowItWorks() {
  return (
    <section className="bg-surface py-16 sm:py-20 lg:py-24" aria-labelledby="how-heading">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Jarayon"
            title="Muddatli to‘lov qanday ishlaydi"
            description="To‘rt bosqichli jarayon — tanlashdan tortib mahsulotni olishgacha."
          />
          <ButtonLink href="/financing" variant="secondary" className="shrink-0">
            Batafsil yo‘l xaritasi
          </ButtonLink>
        </div>
        <h2 id="how-heading" className="sr-only">
          Muddatli to‘lov qanday ishlaydi
        </h2>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step) => (
            <li
              key={step.step}
              className="relative flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                {step.step}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{step.description}</p>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-xs leading-relaxed text-ink-400">
          Shartnoma turi bo‘yicha batafsil ma’lumot Academy bo‘limida paydo bo‘ladi:{' '}
          <Link href="/academy" className="text-brand-700 underline underline-offset-2">
            Murabaha darslari
          </Link>
          . Rasmiy shartlar tasdiqlangach shu yerda ko‘rsatiladi.
        </p>
      </Container>
    </section>
  );
}
