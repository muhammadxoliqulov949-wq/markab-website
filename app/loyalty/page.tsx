import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sadoqat dasturi',
  description:
    'Markab sadoqat dasturi: hozir nima ishlaydi, nima e’lon qilingan va nima hali kutilmoqda. Rasmiy dastur tafsilotlari kutilmoqda.',
  path: '/loyalty',
});

/**
 * Loyalty.
 *
 * The page is a status page, not a rewards page. Three things stay visibly
 * separate on purpose:
 *
 *   • what works in the prototype today
 *   • what Markab has published publicly (kept, and attributed to its source)
 *   • what needs a backend and therefore shows a pending placeholder
 *
 * Nothing here is authored to fill a table: every percentage, threshold and
 * reward shown comes from the public /loyalty page, and every value that does
 * not exist renders as a pending marker rather than a guess. Enrollment is
 * never presented as working.
 */
export default async function LoyaltyPage() {
  const result = await repository.getLoyaltyProgram();

  if (result.status !== 'success') {
    return (
      <section className="bg-surface section-y">
        <Container>
          <StateBlock
            variant={result.status === 'unavailable' ? 'unavailable' : 'empty'}
            title={
              result.status === 'unavailable'
                ? 'Sadoqat dasturi ma’lumotlari yuklanmadi'
                : 'Sadoqat dasturi ma’lumotlari mavjud emas'
            }
            description="Rasmiy dastur tafsilotlari kutilmoqda. Katalog ulangandan so‘ng dastur holati shu yerda ko‘rsatiladi."
            actions={
              <ButtonLink href="/contact" variant="secondary" size="sm">
                Bog‘lanish
              </ButtonLink>
            }
          />
        </Container>
      </section>
    );
  }

  const program = result.data;

  return (
    <>
      {/* ── Status ─────────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface-muted section-y">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="pending" className="mb-4">
              Holat: tasdiqlanmagan
            </Badge>
            <h1 className="text-display-sm sm:text-display-md">Sadoqat dasturi</h1>
            <p className="mt-4 text-lg font-medium text-ink-900">{program.statusTitle}</p>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              {program.statusDescription}
            </p>

            <div className="mt-6 rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                Manba
              </p>
              <p className="mt-1.5 text-sm text-ink-600">{program.source}</p>
              {program.conflictNote ? (
                <p className="mt-3 text-xs leading-relaxed text-ink-400">{program.conflictNote}</p>
              ) : null}
            </div>

            {/* CTAs that do not pretend a backend exists. */}
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="#published" size="lg">
                Batafsil ma’lumot
              </ButtonLink>
              <ButtonLink href="#notify" size="lg" variant="secondary">
                Yangiliklardan xabardor bo‘lish
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="ghost">
                Bog‘lanish
              </ButtonLink>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              Bu sahifada a’zo bo‘lish tugmasi yo‘q: prototipda ro‘yxatdan o‘tish, ball hisoblash
              va daraja olish ishlamaydi.
            </p>
          </div>
        </Container>
      </section>

      {/* ── What works today ───────────────────────────────────────────── */}
      <section className="bg-surface section-y">
        <Container>
          <SectionHeading
            eyebrow="Hozir"
            title="Bugun nima ishlaydi"
            description="Quyidagilar prototipda ishlaydi. Bo‘sh qiymatlar o‘rniga taxminiy raqam qo‘yilmaydi."
          />
          <ul className="mt-10 divide-y divide-line overflow-hidden rounded-xl border border-line">
            {program.availableNow.map((fact) => (
              <li
                key={fact.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-surface px-5 py-4"
              >
                <span className="text-sm text-ink-700">{fact.label}</span>
                {fact.value ? (
                  <span className="text-sm font-medium text-ink-900">{fact.value}</span>
                ) : (
                  <PendingValue label="Ishlamaydi — ma’lumot kutilmoqda" />
                )}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Published material ─────────────────────────────────────────── */}
      <section id="published" className="scroll-mt-24 bg-surface-muted section-y">
        <Container>
          <SectionHeading
            eyebrow="E’lon qilingan"
            title="Rasmiy sahifada e’lon qilingan ma’lumotlar"
            description="Quyidagi jadvallar Markabning ochiq sahifasidan olingan. Ular e’lon qilingan shartlar bo‘lib, ularning amalda ishlashi tasdiqlanmagan."
          />
          <p className="mt-6 inline-flex rounded-lg border border-line bg-surface px-4 py-2 text-xs text-ink-500">
            Manba: <span className="ml-1 font-medium text-ink-700">{program.source}</span>
          </p>

          <div className="mt-10">
            <h3 className="text-base font-semibold text-ink-900">Darajalar</h3>
            <p className="mt-1 text-sm text-ink-400">
              E’lon qilingan darajalar. Prototipda daraja hisoblanmaydi.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {program.tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex h-full flex-col rounded-xl border border-line bg-surface p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold text-ink-900">{tier.name}</h4>
                    {tier.bonus ? (
                      <Badge tone="neutral">{tier.bonus}</Badge>
                    ) : (
                      <PendingValue label="kutilmoqda" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {tier.threshold ?? <PendingValue label="Chegara ko‘rsatilmagan" />}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-ink-600">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="text-base font-semibold text-ink-900">Ball to‘plash</h3>
              <p className="mt-1 text-sm text-ink-400">E’lon qilingan qoidalar.</p>
              <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {program.earning.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4"
                  >
                    <span className="text-sm text-ink-700">{item.action}</span>
                    {item.reward ? (
                      <span className="text-sm font-medium text-ink-900">{item.reward}</span>
                    ) : (
                      <PendingValue label="kutilmoqda" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-ink-900">Mukofotlar</h3>
              <p className="mt-1 text-sm text-ink-400">E’lon qilingan mukofotlar.</p>
              <ul className="mt-5 space-y-3">
                {program.rewards.map((reward) => (
                  <li
                    key={reward.id}
                    className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-ink-900">{reward.title}</h4>
                      {reward.description ? (
                        <p className="mt-1 text-sm text-ink-500">{reward.description}</p>
                      ) : null}
                    </div>
                    {reward.cost ? (
                      <span className="shrink-0 rounded-md bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-700">
                        {reward.cost}
                      </span>
                    ) : (
                      <PendingValue label="kutilmoqda" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Pending structure ──────────────────────────────────────────── */}
      <section id="notify" className="scroll-mt-24 bg-surface section-y">
        <Container>
          <SectionHeading
            eyebrow="Kutilmoqda"
            title="Dastur ishga tushganda paydo bo‘ladigan bo‘limlar"
            description="Bu bo‘limlar tuzilmaviy namunadir. Real hisob manbasi ulanmagani uchun ularning ichida hech qanday qiymat ko‘rsatilmaydi."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {program.pending.map((item) => (
              <div
                key={item.id}
                className="flex h-full flex-col rounded-xl border border-dashed border-line-strong bg-surface-muted p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-ink-900">{item.title}</h3>
                  <Badge tone="pending">Kutilmoqda</Badge>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-line bg-surface-muted p-6">
            <h3 className="text-base font-semibold text-ink-900">
              Dastur yangiliklari
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Xabar berish uchun obuna xizmati kerak. U ulanmagani sababli bu yerda ro‘yxatdan
              o‘tish shakli yo‘q — ishlamaydigan va’dadan ko‘ra, bo‘sh joy yaxshiroq.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/contact" size="sm">
                Bog‘lanish
              </ButtonLink>
              <ButtonLink href="/faq" variant="secondary" size="sm">
                Savol-javoblar
              </ButtonLink>
            </div>
          </div>

          <p className="mt-10 text-xs leading-relaxed text-ink-400">
            {program.statusTitle} Ballar, darajalar va imtiyozlar faqat dastur rasmiy ishga
            tushgach va shaxsiy hisob ulangach amal qiladi.
          </p>
        </Container>
      </section>
    </>
  );
}
