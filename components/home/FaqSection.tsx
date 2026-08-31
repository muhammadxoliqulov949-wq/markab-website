import Link from 'next/link';
import { Accordion } from '@/components/ui/Accordion';
import { Container, SectionHeading } from '@/components/ui/Section';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ArrowLink } from '@/components/ui/ArrowLink';
import type { FaqItem } from '@/lib/data/types';

/**
 * FAQ — questions are verbatim from the public homepage block; answers were
 * never publicly rendered, so each one carries an explicit pending marker
 * instead of invented text.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-heading" className="bg-surface py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
          <div>
            <SectionHeading
              id="faq-heading"
              eyebrow="Savol-javoblar"
              title="Tez-tez so‘raladigan savollar"
              description="Rasmiy javoblar tasdiqlangach shu yerda paydo bo‘ladi."
              size="sm"
            />
            <div className="mt-7">
              <ArrowLink href="/faq">Barcha savollar</ArrowLink>
            </div>
          </div>

          <div>
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
              <StateBlock
                variant="empty"
                title="Hozircha savol-javoblar mavjud emas"
                description="Ma’lumotlar manbasi ulangandan so‘ng savollar shu yerda ko‘rsatiladi."
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
