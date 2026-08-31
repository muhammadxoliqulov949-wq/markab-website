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
 * Digital experience — the Markab 2.0 ecosystem concept.
 *
 * The dashboard is explicitly labelled as a concept, so prototype UI is never
 * presented as production capability. Store links are the verified public
 * listings.
 */
export function AppSection() {
  return (
    <section
      aria-labelledby="app-heading"
      className="relative overflow-hidden bg-ink-900 py-20 text-white sm:py-24 lg:py-28"
    >
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              id="app-heading"
              eyebrow="Raqamli tajriba"
              title="Hammasi bitta kabinetda"
              description="Buyurtmalar, to‘lovlar, shartnomalar, sarmoya va bildirishnomalar — bitta ilovada."
              tone="dark"
            />

            <ul className="mt-9 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {appFeatures.map((feature) => (
                <li key={feature.title} className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <StoreBadge store="App Store" href={site.apps.appStore} />
              <StoreBadge store="Google Play" href={site.apps.googlePlay} />
            </div>

            <p className="mt-5 text-xs leading-relaxed text-white/45">
              Ilova ma’lumotlari rasmiy do‘kon sahifalaridan olingan. Kabinet ko‘rinishi — Markab
              2.0 kontsepti: real ma’lumotlar ulanishi kutilmoqda.
            </p>
          </div>

          <div className="pb-8 sm:pb-0">
            <DashboardMock />
          </div>
        </div>
      </Container>
    </section>
  );
}
