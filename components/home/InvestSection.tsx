import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { investorFlow } from '@/lib/data/fixtures/content';

/**
 * Investment section — verified information only.
 *
 * Published: the model diagram (share → monthly profit → withdraw/top up) and
 * the 2–36 month range. Everything else (returns, risk level, contract name,
 * documentation) is NOT published → rendered as pending official data.
 * No return figure, percentage or guarantee appears anywhere.
 */
export function InvestSection() {
  return (
    <section className="bg-ink-900 py-16 text-white sm:py-20 lg:py-24" aria-labelledby="invest-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Sarmoyadorlar uchun"
              title={investorFlow.title}
              description="Model uch bosqichli: biznesdagi ulush, oylik foyda, pul yechish yoki qo‘shish."
              tone="dark"
            />
            <h2 id="invest-heading" className="sr-only">
              Sarmoyadorlar uchun
            </h2>

            <ol className="mt-8 space-y-3">
              {investorFlow.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-700/30 text-sm font-semibold text-brand-200">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-white/90">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/invest" size="lg">
                {investorFlow.cta}
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
              >
                Menejer bilan bog‘lanish
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-white">Asosiy shartlar</h3>
              <Badge tone="pending" className="border-white/20 bg-white/5 text-white/60">
                Rasmiy ma’lumot kutilmoqda
              </Badge>
            </div>

            <dl className="mt-6 divide-y divide-white/10">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-sm text-white/60">Muddat</dt>
                <dd className="text-sm font-medium text-white">2 oydan 36 oygacha</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-sm text-white/60">Foydani yechish</dt>
                <dd className="text-sm font-medium text-white">Istalgan vaqt</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-sm text-white/60">Hisobdorlik</dt>
                <dd className="text-sm font-medium text-white">Oylik</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-sm text-white/60">Minimal miqdor</dt>
                <dd className="text-sm text-white/50">Rasmiy ma’lumot bilan to‘ldiriladi</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-sm text-white/60">Foyda mexanizmi</dt>
                <dd className="text-sm text-white/50">Rasmiy ma’lumot bilan to‘ldiriladi</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-sm text-white/60">Shartnoma turi</dt>
                <dd className="text-sm text-white/50">Rasmiy ma’lumot bilan to‘ldiriladi</dd>
              </div>
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-white/45">
              Ushbu bo‘limda hech qanday daromad foizi, kafolat yoki investitsiya tavsiyasi
              ko‘rsatilmagan. Barcha moliyaviy ko‘rsatkichlar rasmiy hujjatlar asosida
              to‘ldiriladi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
