import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';

/**
 * Trust layer — verified facts only.
 *
 * No invented certifications, no invented reviews. Where a claim exists publicly
 * but has no published evidence (AAOIFI), the gap is stated openly and linked to
 * the verification register instead of being silently asserted.
 */
const facts = [
  {
    title: 'Qadriyatlarga asoslangan moliya',
    detail: 'AAOIFI standartlari talablariga mos',
    note: 'Tasdiqlovchi hujjatlar: rasmiy ma’lumot bilan to‘ldiriladi',
  },
  {
    title: 'Rasmiy kelishuv',
    detail: 'Oylik hisobdorlik asosida ishlaydi',
    note: null,
  },
  {
    title: 'Moslashuvchan muddat',
    detail: '2 oydan 36 oygacha',
    note: null,
  },
  {
    title: 'Ochiq ofis',
    detail: site.office.hours,
    note: site.office.address,
  },
];

export function TrustLayer() {
  return (
    <section aria-label="Ishonch ma’lumotlari" className="border-b border-line bg-surface-muted">
      <Container className="py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.title} className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink-900">{fact.title}</h2>
              <p className="mt-1.5 text-sm text-ink-600">{fact.detail}</p>
              {fact.note ? <p className="mt-2 text-xs leading-relaxed text-ink-400">{fact.note}</p> : null}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-400">
          Huquqiy va moliyaviy ma’lumotlarning ayrim qismlari turli manbalarda farqli
          ko‘rsatilgan, shuning uchun ular tasdiqlangunga qadar ko‘rsatilmaydi.{' '}
          <Link href="/about" className="text-brand-700 underline underline-offset-2">
            Tekshiruv kutilayotgan maydonlar
          </Link>
        </p>
      </Container>
    </section>
  );
}
