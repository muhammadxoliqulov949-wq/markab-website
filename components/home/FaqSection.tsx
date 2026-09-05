import { Accordion } from '@/components/ui/Accordion';
import { Container, SectionHeading } from '@/components/ui/Section';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ArrowLink } from '@/components/ui/ArrowLink';
import type { FaqItem } from '@/lib/data/types';

/**
 * FAQ — questions are verbatim from the public homepage block; answers were
 * never publicly rendered, so each one carries an explicit pending marker
 * instead of invented text.
 *
 * The "ask a manager" guidance appears ONCE, in the section intro, rather than
 * being repeated inside every unanswered question — five copies of the same
 * sentence read as defensive noise and teach the visitor nothing extra.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-heading" className="bg-surface section-y">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div>
            <SectionHeading
              id="faq-heading"
              eyebrow="Savol-javoblar"
              title="Tez-tez so‘raladigan savollar"
              description="Javoblar Markab tomonidan tasdiqlangach shu yerda paydo bo‘ladi. Aniq ma’lumot kerak bo‘lsa, menejerimizga murojaat qiling."
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
                    <PendingValue label="Javob tayyorlanmoqda" />
                  ),
                }))}
              />
            ) : (
              <StateBlock
                variant="empty"
                title="Hozircha savol-javoblar mavjud emas"
                description="Katalog ulangandan so‘ng savollar shu yerda ko‘rsatiladi."
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
