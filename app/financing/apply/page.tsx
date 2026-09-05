import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { Breadcrumb, PageHeader } from '@/components/ui/Breadcrumb';
import { MarkabStar } from '@/components/ui/MarkabStar';
import { ApplicationForm } from '@/components/financing/ApplicationForm';
import { buildMetadata } from '@/lib/seo';

const APPLY_FINANCING = '/financing/apply';

export const metadata: Metadata = buildMetadata({
  title: 'Muddatli to‘lov arizasi',
  description:
    'Markab orqali muddatli to‘lov shartlarini bir daqiqada bilib oling. Arizani to‘ldiring, shaxsiy menejer sizga tez orada javob beradi.',
  path: APPLY_FINANCING,
});

const bullets: string[] = [
  'Dastlabki javob 15 daqiqagacha — sizni kutishga majburlamaymiz.',
  'Shartlar faqat sizning daromadingizga moslashtiriladi, qo‘shimcha to‘lovlarsiz.',
  'Bitim ofisda — hujjatlar va shartnoma bir joyda, kuryer shoshmasdan.',
];

const notAsked: string[] = [
  'Pasport yoki ID-karta ma’lumotlari',
  'JSHSHIR (shaxsiy identifikatsiya raqami)',
  'Bank karta yoki hisob ma’lumotlari',
  'Selfi yoki biometrik ma’lumot',
  'Daromadni tasdiqlovchi hujjatlar',
];

export default function ApplyPage() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Bosh sahifa', href: '/' },
          { label: 'Muddatli to‘lov', href: '/financing' },
          { label: 'Ariza' },
        ]}
      />
      <PageHeader
        eyebrow="Ariza · 2 daqiqa"
        title="Shaxsiy muddatli to‘lov shartlarini oling"
        description="Formani to‘ldiring — shaxsiy menejer sizga mos to‘lov jadvali, boshlang‘ich to‘lov va hujjatlar ro‘yxati bilan tez orada bog‘lanadi."
        align="left"
        className="pb-4"
      />
      <Container className="pb-20 pt-4 sm:pb-28">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
          <div className="min-w-0">
            <ApplicationForm subject={null} />
            <p className="mt-6 flex items-start gap-2 rounded-card bg-ink-50 p-4 text-xs leading-relaxed text-ink-500">
              <MarkabStar size={12} tone="muted" className="mt-0.5 shrink-0" />
              Ma’lumotlaringiz xavfsiz saqlanadi va uchinchi shaxslarga berilmaydi.
            </p>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-panel border border-brand-100 bg-brand-50/50 p-6 shadow-panel-soft">
              <p className="eyebrow text-brand-700">Nima uchun Markab?</p>
              <h2 className="mt-2 text-heading-sm text-ink-900">Shaffof va tez</h2>
              <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-ink-600">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-panel border border-line bg-surface p-6 shadow-panel-soft">
              <p className="eyebrow text-ink-500">Nima so‘ralmaydi</p>
              <ul className="mt-4 space-y-2">
                {notAsked.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-ink-400">
                Bu ma’lumotlar faqat rasmiy jarayon va huquqiy asos tasdiqlangandan so‘ng talab qilinishi mumkin.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
