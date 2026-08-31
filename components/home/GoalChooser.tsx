import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { homepageGoals } from '@/lib/site';

const icons: Record<string, React.ReactNode> = {
  car: (
    <path d="M4 16.5h16M6 16.5V12l1.6-4.3A2 2 0 0 1 9.5 6.3h5a2 2 0 0 1 1.9 1.4L18 12v4.5M7 16.5v2M17 16.5v2" />
  ),
  electronics: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  financing: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M7 10h5M7 14h3M15 10v4" />
    </>
  ),
  invest: <path d="M4 19V5M4 15l5-5 4 3.5L20 6M20 6h-4.5M20 6v4.5" />,
};

/**
 * "Sizga nima kerak?" — the answer to "what should I click first?".
 *
 * Four transactional goals, each mapped to exactly one destination. Learning has
 * its own Academy section, so it appears here only as a quiet secondary link.
 */
export function GoalChooser() {
  return (
    <section
      aria-labelledby="goals-heading"
      className="bg-surface py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <SectionHeading
          id="goals-heading"
          eyebrow="Yo‘nalish tanlang"
          title="Sizga nima kerak?"
          description="To‘rtta asosiy maqsad — har biri uchun alohida yo‘l va aniq keyingi qadam."
          align="center"
          className="mb-10"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homepageGoals.map((goal, index) => (
            <Reveal key={goal.id} delay={index * 60}>
              <Link
                href={goal.href}
                className="group flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-surface-sunken text-ink-700 transition-colors duration-300 group-hover:bg-brand-50 group-hover:text-brand-700"
                  aria-hidden="true"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {icons[goal.id]}
                  </svg>
                </span>

                <h3 className="mt-5 text-base font-semibold text-ink-900">{goal.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                  {goal.description}
                </p>

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
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-500">
          O‘rganishni xohlaysizmi?{' '}
          <Link
            href="/academy"
            className="font-medium text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
          >
            Markab Academy
          </Link>
        </p>
      </Container>
    </section>
  );
}
