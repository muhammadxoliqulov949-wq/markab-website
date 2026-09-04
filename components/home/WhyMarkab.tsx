import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { PendingValue } from '@/components/ui/StateBlock';
import { PENDING_LABEL } from '@/lib/investment/status';
import { repository } from '@/lib/data';

/**
 * Why Markab — calm, editorial, four items.
 *
 * No cards, no boxes: a large statement on the left and a numbered hairline list
 * on the right. Each item is a published Markab value proposition; none is a
 * superlative ("eng yaxshi", "eng tez"), and where supporting documentation is
 * missing (AAOIFI) the gap is stated on the item itself.
 */
export async function WhyMarkab() {
  const content = await repository.getSiteContent();
  const valueProps = content.status === 'success' ? content.data.valueProps : [];

  return (
    <section aria-labelledby="why-heading" className="relative overflow-hidden bg-surface-muted section-y dot-pattern">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              id="why-heading"
              eyebrow="Nima uchun Markab?"
              title="Har bir qadamni oldindan bilasiz."
              description="Saytda e’lon qilingan asosiy tamoyillar. Tasdiqlanmagan ma’lumot ko‘rsatilmaydi."
            />
            <div className="mt-8 rounded-card border border-line bg-surface p-5 shadow-subtle">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                Printsip
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
                Moliya — ishonch asosida. Shaffof shartnoma, ochiq oylik to‘lov va qo‘llab-quvvatlash
                — har bir bosqichda.
              </p>
            </div>
          </div>

          <ol className="space-y-0">
            {valueProps.map((prop, index) => (
              <Reveal key={prop.id} delay={index * 70}>
                <li className="border-t border-line py-7 first:border-t-0 first:pt-0 last:pb-0">
                  <div className="flex gap-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 max-w-xl pt-1">
                      <h3 className="text-lg font-semibold leading-snug text-ink-900">
                        {prop.title}
                      </h3>
                      {prop.description ? (
                        <p className="mt-2 text-body leading-relaxed text-ink-500">
                          {prop.description}
                        </p>
                      ) : (
                        <p className="mt-2">
                          <PendingValue label={PENDING_LABEL} />
                        </p>
                      )}
                      {prop.note ? (
                        <p className="mt-2.5 text-caption leading-relaxed text-ink-400">
                          {prop.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
