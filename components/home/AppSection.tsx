import { ExternalLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { DashboardMock } from '@/components/home/DashboardMock';
import { appFeatures } from '@/lib/data/fixtures/content';
import { site } from '@/lib/site';

function StoreBadge({ store, href }: { store: 'App Store' | 'Google Play'; href: string }) {
  return (
    <ExternalLink
      href={href}
      variant="secondary"
      size="lg"
      className="justify-start gap-3 px-5"
      aria-label={`Markab ilovasini ${store} dan yuklab olish`}
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {store === 'App Store' ? (
          <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.7.7 1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.1-3.3ZM14.3 5.9c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.7-.9 2.6 1 .1 2-.5 2.5-1.2Z" />
        ) : (
          <path d="M3.6 2.5c-.3.3-.5.8-.5 1.4v16.2c0 .6.2 1.1.5 1.4l.1.1 9-9v-.2l-9.1-8.9Zm12 6.3L6.9 2.2l8 8 1.3-1.3 1.4.8-2 2 2 2-1.4.8-1.3-1.3-8 8 8.7-6.6 2.4 1.4c.7.4 1.3.2 1.3-.6V3.8c0-.8-.6-1-1.3-.6l-2.4 1.4-.3.1-.2.1Z" />
        )}
      </svg>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-ink-400">
          {store === 'App Store' ? 'Download on the' : 'Get it on'}
        </span>
        <span className="text-sm font-semibold text-ink-900">{store}</span>
      </span>
    </ExternalLink>
  );
}

/**
 * Digital experience section — Markab is more than a website.
 *
 * The dashboard visual is explicitly labelled as a concept so prototype UI is
 * never presented as production capability. Store links are the verified public
 * listings.
 */
export function AppSection() {
  return (
    <section
      aria-labelledby="app-heading"
      className="bg-surface-muted py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              id="app-heading"
              eyebrow="Raqamli tajriba"
              title="Markab ilovasida — hammasi bir joyda"
              description="Buyurtmalar, to‘lovlar, bildirishnomalar, shartnomalar va sarmoya — bitta kabinetdan boshqariladi."
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <StoreBadge store="App Store" href={site.apps.appStore} />
              <StoreBadge store="Google Play" href={site.apps.googlePlay} />
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {appFeatures.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-xl border border-line bg-surface p-4 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <h3 className="text-sm font-semibold text-ink-900">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-xs leading-relaxed text-ink-400">
              Ilova ma’lumotlari rasmiy do‘kon sahifalaridan olingan. Kabinet ko‘rinishi —
              kontsept: real ma’lumotlar ulanishi kutilmoqda.
            </p>
          </div>

          <DashboardMock />
        </div>
      </Container>
    </section>
  );
}
