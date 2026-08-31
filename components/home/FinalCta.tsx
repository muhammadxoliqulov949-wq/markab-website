import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';

export function FinalCta() {
  return (
    <section className="border-t border-line bg-surface-muted py-16 sm:py-20" aria-labelledby="final-cta-heading">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-surface-muted p-8 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 id="final-cta-heading" className="text-2xl font-semibold text-ink-900 sm:text-3xl">
              Qaysi yo‘nalish sizga mos?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base">
              Avtomobil, elektronika, moliyalashtirish yoki sarmoya — istalgan yo‘nalishni
              tanlang, qolganini birga ko‘rib chiqamiz.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/cars" size="lg">
              Avtomobillarni ko‘rish
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Bog‘lanish
            </ButtonLink>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">Manzil</dt>
            <dd className="mt-1 text-ink-600">{site.office.address}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">Ish vaqti</dt>
            <dd className="mt-1 text-ink-600">{site.office.hours}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">Hujjatlar</dt>
            <dd className="mt-1">
              <Link className="text-brand-700 underline underline-offset-2" href="/privacy">
                Maxfiylik siyosati
              </Link>
              {' · '}
              <Link className="text-brand-700 underline underline-offset-2" href="/terms">
                Foydalanish shartlari
              </Link>
            </dd>
          </div>
        </dl>
      </Container>
    </section>
  );
}
