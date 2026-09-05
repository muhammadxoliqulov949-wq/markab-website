import { Container } from '@/components/ui/Section';
import { ContactForm } from '@/components/contact/ContactForm';
import { OfficeInfo } from '@/components/contact/OfficeInfo';
import { OfficeMap } from '@/components/contact/OfficeMap';

/**
 * Homepage contact section — the final operational block before the closing CTA
 * and footer.
 *
 * This is the SAME two-column composition used on /contact, just tighter spacing
 * so it fits as a homepage section rather than a standalone page. It reuses the
 * identical OfficeMap / OfficeInfo / ContactForm components and therefore the
 * same verified office data — there is one source of truth for the address,
 * hours, coordinates and map URL.
 *
 * Visibility: content is always visible. It is NOT gated behind Reveal, not
 * initialised at opacity:0, and does not depend on IntersectionObserver to
 * appear. Motion may enhance a future revision but visibility must not depend
 * on it (same rule as the Reveal regression fix).
 */
export function HomepageContactSection() {
  return (
    <section
      aria-labelledby="home-contact-heading"
      className="border-t border-line bg-surface py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-brand-700">
            Aloqa
          </p>
          <h2 id="home-contact-heading" className="text-display-sm sm:text-display-md">
            Bizning ofis va bog‘lanish
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-500">
            Ofisga tashrif buyuring yoki savol qoldiring. Belgilangan manzil va
            ish vaqti rasmiy manbalardan olingan.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* LEFT: Bizning ofis — interactive map + verified information */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="p-4 sm:p-5">
                <h3 className="text-base font-semibold text-ink-900">Bizning ofis</h3>
                <p className="mt-1 text-sm text-ink-500">
                  Belgilangan manzilga ish vaqti davomida tashrif buyurishingiz mumkin.
                </p>
                <div className="mt-4">
                  <OfficeMap />
                </div>
              </div>
              <div className="px-4 pb-5 sm:px-5">
                <OfficeInfo />
              </div>
            </div>
          </div>

          {/* RIGHT: Biz bilan bog'laning — form */}
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-ink-900">Biz bilan bog‘laning</h3>
              <p className="mt-1 text-sm text-ink-500">
                Shaklni to‘ldiring — rasmiy aloqa kanali ulangach so‘rovlar qabul
                qilinadi.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
