import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { goals } from '@/lib/site';

/**
 * "Choose your goal" — the answer to "what should I click first?".
 * Each card maps one user goal to one destination.
 */
export function GoalChooser() {
  return (
    <section className="bg-surface py-16 sm:py-20 lg:py-24" aria-labelledby="goals-heading">
      <Container>
        <SectionHeading
          eyebrow="Yo‘nalish tanlang"
          title="Nima qilmoqchisiz?"
          description="To‘rtta asosiy maqsad — har biri uchun alohida yo‘l va aniq keyingi qadam."
          align="center"
          className="mb-10"
        />
        <h2 id="goals-heading" className="sr-only">
          Maqsadni tanlang
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              href={goal.href}
              className="group flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
            >
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-surface-sunken text-xl transition-colors duration-300 group-hover:bg-brand-50"
                aria-hidden="true"
              >
                {goal.emoji}
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink-900">{goal.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{goal.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                {goal.cta}
                <svg
                  className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
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
  );
}
