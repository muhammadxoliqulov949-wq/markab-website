import Link from 'next/link';
import { Accordion } from '@/components/ui/Accordion';
import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { PendingValue } from '@/components/ui/StateBlock';
import type { FaqItem } from '@/lib/data/types';

/**
 * FAQ — questions are verbatim from the homepage; answers were never publicly
 * rendered, so each one carries an explicit pending marker instead of invented text.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="bg-surface py-16 sm:py-20" aria-labelledby="faq-heading">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="Savol-javoblar"
          title="Tez-tez so‘raladigan savollar"
          description="Rasmiy javoblar tasdiqlangach shu yerda paydo bo‘ladi."
          align="center"
        />
        <h2 id="faq-heading" className="sr-only">
          Tez-tez so‘raladigan savollar
        </h2>

        <div className="mt-10">
          {items.length > 0 ? (
            <Accordion
              items={items.map((item) => ({
                id: item.id,
                title: item.question,
                content: item.answer ? (
                  <p className="text-sm leading-relaxed text-ink-600">{item.answer}</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <PendingValue label="Rasmiy javob tayyorlanmoqda" />
                    <p className="text-xs leading-relaxed text-ink-400">
                      Bu savol bo‘yicha aniq ma’lumotni menejerimizdan olishingiz yoki{' '}
                      <Link href="/faq" className="text-brand-700 underline underline-offset-2">
                        savol-javoblar bo‘limini
                      </Link>{' '}
                      kuzatishingiz mumkin.
                    </p>
                  </div>
                ),
              }))}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-line-strong bg-surface-muted p-8 text-center text-sm text-ink-500">
              Hozircha savol-javoblar mavjud emas.
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <ButtonLink href="/faq" variant="secondary">
            Barcha savollar
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
