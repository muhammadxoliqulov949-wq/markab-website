import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ApplicationForm } from '@/components/financing/ApplicationForm';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { resolveFinancingSubject } from '@/lib/financing/subject';
import { firstParam } from '@/lib/financing/handoff';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Ariza yuborish',
  description:
    'Muddatli to‘lov uchun ariza: mahsulot, xohis bildirilgan boshlang‘ich to‘lov va muddat, ism, telefon hamda qulay aloqa usuli. Ariza rasmiy backendga ulanmagan.',
  path: '/financing/apply',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ApplyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Same resolver the calculator uses, so a handoff behaves identically in both
  // places. An unknown id is a normal outcome, not an error.
  const resolution = await resolveFinancingSubject(firstParam(sp.type), firstParam(sp.ref));
  const subject = resolution.status === 'resolved' ? resolution.subject : null;

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <Badge tone="pending" className="mb-3">
          Prototip — ariza backend ulanmagan
        </Badge>
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[2.25rem]">
          Ariza yuborish
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-600">
          Faqat birinchi bog‘lanish uchun kerakli maydonlar. Ariza yuborilgach, tizim integratsiya
          qilinmagani aniq ko‘rsatiladi — «yuborildi» degan tasdiq chiqmaydi.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <ApplicationForm subject={subject} invalidRef={resolution.status === 'invalid'} />

        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Nima so‘ralmaydi</h2>
            <ul className="mt-3 space-y-2">
              {[
                'Pasport yoki ID-karta ma’lumotlari',
                'JSHSHIR (shaxsiy identifikatsiya raqami)',
                'Bank karta yoki hisob ma’lumotlari',
                'Selfi yoki biometrik ma’lumot',
                'Daromadni tasdiqlovchi hujjatlar',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-ink-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              Bu ma’lumotlar faqat rasmiy jarayon va huquqiy asos tasdiqlangandan so‘ng, real
              tizimda talab qilinishi mumkin. Prototip ularni so‘ramaydi.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Kerakli hujjatlar</h2>
            <p className="mt-2">
              <PendingValue label="Rasmiy ro‘yxat kutilmoqda" />
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              Hujjatlar ro‘yxati rasmiy jarayon tasdiqlangach shu yerda ko‘rsatiladi. Hozircha u
              menejer orqali aniqlashtiriladi.
            </p>
            <ButtonLink href="/contact" variant="secondary" size="sm" className="mt-4">
              Menejer bilan bog‘lanish
            </ButtonLink>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Arizadan keyin</h2>
            <ol className="mt-3 space-y-2 text-sm text-ink-600">
              <li>1. Ariza qabul qilinadi</li>
              <li>2. Menejer bog‘lanadi</li>
              <li>3. Hujjatlar tekshiriladi</li>
              <li>4. Shartnoma tuziladi</li>
              <li>5. Mahsulot topshiriladi</li>
            </ol>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              Bosqichlar va muddatlar rasmiy jarayon tasdiqlangach aniq ko‘rsatiladi.
            </p>
          </div>

          <StateBlock
            compact
            variant="pending"
            title="Shartlar"
            description="Boshlang‘ich to‘lov, muddat, ustama va komissiyalar rasmiy manbada e’lon qilingach ko‘rsatiladi."
            actions={
              <ButtonLink href="/financing" variant="secondary" size="sm">
                Moliyalashtirish bo‘limi
              </ButtonLink>
            }
          />
        </aside>
      </div>
    </Container>
  );
}
