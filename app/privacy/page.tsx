import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { legal } from '@/lib/legal';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Maxfiylik siyosati',
  description:
    'Markab maxfiylik siyosati: qaysi ma’lumotlar yig‘ilishi, qanday ishlatilishi va foydalanuvchi huquqlari. Rasmiy matn manbasi ko‘rsatilgan.',
  path: '/privacy',
});

const status = [
  { label: 'Hujjat holati', value: 'markab.uz saytida mavjud' },
  { label: 'Versiya', value: 'v1.0 (saytda ko‘rsatilgan)' },
  { label: 'Operator', value: null },
  { label: 'Asosiy qonun', value: "O‘zbekiston Respublikasining shaxsiy ma’lumotlar to‘g‘risidagi qonuni (O‘RQ-547)" },
  { label: 'Oxirgi yangilanish', value: null },
];

const summary = [
  {
    title: 'Qanday ma’lumotlar yig‘iladi',
    body: 'Rasmiy siyosatda shaxsni tasdiqlovchi ma’lumotlar (ism, tug‘ilgan sana, manzil, pasport ma’lumotlari, JSHSHIR), aloqa ma’lumotlari, to‘lov ma’lumotlari, qurilma identifikatorlari va ilova ruxsatlari (kamera, kontaktlar) orqali olingan ma’lumotlar ko‘rsatilgan.',
  },
  {
    title: 'Ma’lumotlar qanday ishlatiladi',
    body: 'Arizalarni ko‘rib chiqish, shartnoma tuzish, shaxsni tasdiqlash (KYC), xizmat sifatini oshirish va qonuniy majburiyatlarni bajarish uchun ishlatiladi.',
  },
  {
    title: 'Uchinchi shaxslarga uzatish',
    body: 'Qonun doirasida vakolatli organlar va shartnoma bo‘yicha hamkorlarga (masalan, to‘lov tashkilotlari) uzatilishi mumkin.',
  },
  {
    title: 'Foydalanuvchi huquqlari',
    body: 'Ma’lumotlardan foydalanishga rozilikni qaytarib olish, ma’lumotlarni to‘ldirish/yangilash va o‘chirishni talab qilish huquqi qonun bilan kafolatlangan.',
  },
];

export default function PrivacyPage() {
  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <Badge tone="brand" className="mb-3">
          Hujjat
        </Badge>
        <h1 className="text-display-sm sm:text-display-md">Maxfiylik siyosati</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Quyida maxfiylik siyosatining qisqacha tavsifi keltirilgan. To‘liq rasmiy matn manbasi
          ko‘rsatilgan holda taqdim etiladi.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div>
          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {status.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-ink-500">{item.label}</dt>
                <dd className="max-w-[60%] text-right text-sm text-ink-800">
                  {item.value ?? <PendingValue label="Rasmiy tekshiruv kutilmoqda" />}
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
              description="Hujjatning to‘liq matni Markab tomonidan taqdim etilgach shu yerda nashr qilinadi — qisqartirilgan yoki qayta yozilgan matn bilan almashtirilmaydi."
              actions={
                <>
                  <a
                    href="https://markab.uz/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-lg bg-brand-700 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
                  >
                    markab.uz/privacy
                  </a>
                  <ButtonLink href="/contact" variant="secondary" size="sm">
                    Savol yuborish
                  </ButtonLink>
                </>
              }
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-sm font-semibold text-amber-900">Tafovut qayd etilgan</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
              Ilova do‘konlaridagi deklaratsiya “ma’lumot yig‘ilmaydi” deb ko‘rsatilgan, saytdagi
              maxfiylik siyosati esa shaxsiy ma’lumotlar yig‘ilishini tasdiqlaydi. Bu tafovut
              Markab tomonidan rasmiy aniqlashtirilishi kerak.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Bog‘liq hujjatlar</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/terms" className="text-brand-700 underline underline-offset-2">
                  Foydalanish shartlari
                </a>
              </li>
              <li className="flex items-center justify-between gap-3 text-ink-400">
                Ommaviy oferta
                <span className="text-xs">e’lon qilinmagan</span>
              </li>
              <li className="flex items-center justify-between gap-3 text-ink-400">
                Risk haqida ogohlantirish
                <span className="text-xs">e’lon qilinmagan</span>
              </li>
              <li>
                <a href="/about#trust" className="text-brand-700 underline underline-offset-2">
                  Tekshiruv kutilayotgan maydonlar
                </a>
              </li>
            </ul>
          </div>

          <p className="text-xs leading-relaxed text-ink-400">
            Yuridik shaxs nomi manbalarda turlicha ko‘rsatilganligi sababli bu sahifada
            ko‘rsatilmagan (
            {legal.entityName ?? 'rasmiy tekshiruv kutilmoqda'}).
          </p>
        </aside>
      </div>
    </Container>
  );
}
