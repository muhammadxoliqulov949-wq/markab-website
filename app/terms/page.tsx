import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Foydalanish shartlari',
  description:
    'Markab foydalanish shartlari: xizmatdan foydalanish, ariza va shartnoma, to‘lov majburiyatlari. Hujjat holati va tekshiruv kutilayotgan maydonlar.',
  path: '/terms',
});

const status = [
  { label: 'Hujjat holati', value: 'markab.uz saytida yuklanmagan (xato)' },
  { label: 'Versiya', value: null },
  { label: 'Oxirgi yangilanish', value: null },
  { label: 'Kirish sahifasida talab qilinadi', value: 'Ha — rozilik matni orqali' },
];

const summary = [
  {
    title: 'Xizmatdan foydalanish',
    body: 'Sayt va ilova orqali avtomobil, elektronika, muddatli to‘lov va sarmoya bo‘yicha ma’lumot olish hamda ariza qoldirish mumkin.',
  },
  {
    title: 'Ariza va shartnoma',
    body: 'Ariza yuborish majburiyat tug‘dirmaydi — shartlar rasmiy shartnoma bilan tasdiqlanadi.',
  },
  {
    title: 'Ma’lumotlarning to‘g‘riligi',
    body: 'Narx, muddat va shartlar rasmiy hujjatlarda ko‘rsatilgan ko‘rinishda amal qiladi; saytdagi ma’lumotlar ma’lumot xarakteriga ega.',
  },
  {
    title: 'To‘lov majburiyatlari',
    body: 'Oylik to‘lov miqdori, muddati va boshlang‘ich to‘lov shartnomada belgilanadi. Rasmiy shartlar e’lon qilinmaguncha aniq hisob-kitob ko‘rsatilmaydi.',
  },
];

export default function TermsPage() {
  return (
    <Container className="section-y-sm">
      <header className="mb-10 max-w-2xl">
        <Badge tone="danger" className="mb-3">
          Hujjat manbada yuklanmagan
        </Badge>
        <h1 className="text-display-sm sm:text-display-md">Foydalanish shartlari</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Kirish sahifasida “Davom etish orqali siz Foydalanish shartlari va Maxfiylik siyosati ga
          rozilik bildirasiz” deyiladi, biroq manbadagi hujjat yuklanmaydi. Prototipda bu sahifa
          mavjud va har doim ochiladi.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div>
          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {status.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-ink-500">{item.label}</dt>
                <dd className="max-w-[60%] text-right text-sm text-ink-800">
                  {item.value ?? <PendingValue label="Rasmiy ma’lumot kutilmoqda" />}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 space-y-6">
            {summary.map((item) => (
              <section key={item.title}>
                <h2 className="text-lg font-semibold text-ink-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10">
            <StateBlock
              variant="pending"
              title="To‘liq rasmiy matn"
              description="Hujjatning to‘liq matni Markab tomonidan taqdim etilgach shu yerda nashr qilinadi. Prototip hech qanday yuridik da’vo yoki shartni o‘ylab topmaydi."
              actions={
                <ButtonLink href="/contact" variant="secondary" size="sm">
                  Savol yuborish
                </ButtonLink>
              }
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Nega bu muhim?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Rozilik talab qilinadigan hujjat ochilmasa, foydalanuvchi o‘qiy olmagan shartlarga
              rozilik bergan bo‘ladi. Bu huquqiy va ishonch nuqtai nazaridan jiddiy muammo.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Bog‘liq hujjatlar</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-brand-700 underline underline-offset-2">
                  Maxfiylik siyosati
                </a>
              </li>
              <li>
                <a href="/financing" className="text-brand-700 underline underline-offset-2">
                  Moliyalashtirish shartlari
                </a>
              </li>
              <li className="flex items-center justify-between gap-3 text-ink-400">
                Ommaviy oferta
                <span className="text-xs">e’lon qilinmagan</span>
              </li>
              <li>
                <a href="/about#trust" className="text-brand-700 underline underline-offset-2">
                  Tekshiruv kutilayotgan maydonlar
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  );
}
