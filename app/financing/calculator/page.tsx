import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { InstallmentCalculator } from '@/components/calculator/InstallmentCalculator';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'To‘lov kalkulyatori',
  description:
    'Muddatli to‘lov kalkulyatori: narx, boshlang‘ich to‘lov va muddat bo‘yicha interfeys. Hisob-kitob formulasi rasmiy manba ulanganda ishga tushadi.',
  path: '/financing/calculator',
});

export default function CalculatorPage() {
  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2">
          <Badge tone="pending">Prototip</Badge>
        </div>
        <h1 className="mt-3 text-display-sm sm:text-display-md">To‘lov kalkulyatori</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Narx, boshlang‘ich to‘lov va muddatni tanlang. Hisob-kitobning o‘zi Markab’ning rasmiy
          formulasi ulangandan so‘ng ishga tushadi — oraliqda esa aniq bo‘lmagan qiymatlar
          ko‘rsatilmaydi.
        </p>
      </header>

      <InstallmentCalculator initialPrice={160_000_000} />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StateBlock
          compact
          variant="pending"
          title="Oylik to‘lov"
          description="Rasmiy hisob-kitob formulasi kutilmoqda."
        />
        <StateBlock
          compact
          variant="pending"
          title="Jami to‘lov"
          description="Ustama va komissiyalar rasmiy shartnomada ko‘rsatiladi."
        />
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink-900">Keyingi qadam</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Shartlar bilan tanishib, ariza yuboring yoki menejer bilan bog‘laning.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/financing/apply" size="sm">
              Ariza yuborish
            </ButtonLink>
            <ButtonLink href="/financing" variant="secondary" size="sm">
              Shartlar
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="sm">
              Bog‘lanish
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading
          eyebrow="Eslatma"
          title="Nima uchun ba’zi qiymatlar ko‘rsatilmagan?"
          description="Moliyaviy ko‘rsatkichlar taxminiy hisoblab ko‘rsatilmaydi — ular faqat rasmiy manbadan olinadi."
        />
      </div>
    </Container>
  );
}
