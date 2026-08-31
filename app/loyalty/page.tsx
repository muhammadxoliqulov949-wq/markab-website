import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { loyaltyEarning, loyaltyRewards, loyaltyTiers } from '@/lib/data/fixtures/content';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Bonus dasturi',
  description:
    'Markab bonus dasturi: Bronza, Kumush, Oltin va Platina darajalari, ball to‘plash yo‘llari va mukofotlar.',
  path: '/loyalty',
});

export default function LoyaltyPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="accent" className="mb-4">
              Sadoqat dasturi
            </Badge>
            <h1 className="text-display-sm sm:text-display-md">Bonus dasturi</h1>
            <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
              Har bir xarid uchun ball to‘plang va maxsus imtiyozlardan foydalaning. Quyidagi
              ma’lumotlar markab.uz bonus dasturi sahifasidan olingan.
            </p>
            <div className="mt-7">
              <ButtonLink href="/login" size="lg">
                Kirish yoki ro‘yxatdan o‘tish
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Darajalar"
            title="Bonus darajalari"
            description="To‘plangan ballarga qarab daraja oshib boradi."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loyaltyTiers.map((tier) => (
              <div
                key={tier.id}
                className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-ink-900">{tier.name}</h3>
                  <Badge tone={tier.id === 'platina' ? 'accent' : 'neutral'}>{tier.bonus}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">{tier.threshold}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-ink-600">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface-muted py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Ball to‘plash"
              title="Ball to‘plash yo‘llari"
              description="E’lon qilingan qoidalar."
            />
            <ul className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {loyaltyEarning.map((item) => (
                <li key={item.action} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="text-sm text-ink-700">{item.action}</span>
                  <span className="text-sm font-medium text-brand-700">{item.reward}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading
              eyebrow="Mukofotlar"
              title="Mukofotlar va imtiyozlar"
              description="Ballarni quyidagi imtiyozlarga almashtirish mumkin."
            />
            <ul className="mt-8 space-y-3">
              {loyaltyRewards.map((reward) => (
                <li
                  key={reward.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">{reward.title}</h3>
                    <p className="mt-1 text-sm text-ink-500">{reward.description}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-700">
                    {reward.cost}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-14">
        <Container>
          <StateBlock
            variant="pending"
            title="Shaxsiy ball balansi"
            description="Ball balansi va daraja holati shaxsiy kabinetda ko‘rsatiladi. Real ma’lumotlar ulanishi kutilmoqda."
            actions={
              <>
                <ButtonLink href="/profile" size="sm">
                  Kabinet
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary" size="sm">
                  Savol berish
                </ButtonLink>
              </>
            }
          />
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-ink-400">
            Eslatma: bonus dasturi holati rasmiy tasdiqlanishi kerak — bosh sahifada dastur
            “ishlab chiqilmoqda” deb ko‘rsatilgan, sahifada esa to‘liq shartlar mavjud. Bu
            tafovut Markab tomonidan aniqlashtirilishi lozim.
          </p>
        </Container>
      </section>
    </>
  );
}
