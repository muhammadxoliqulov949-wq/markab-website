import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';

/**
 * Trust strip — a hairline band, not a row of boxes.
 *
 * Verified concepts only: no invented certifications, no invented customer
 * counts, no invented statistics. Where a claim is published without evidence
 * (AAOIFI), the gap is stated on the item itself.
 */
const facts = [
  {
    title: 'Qadriyatlarga asoslangan moliya',
    detail: 'AAOIFI standartlari talablariga mos',
    note: 'Tasdiqlovchi hujjat: rasmiy ma’lumot bilan to‘ldiriladi',
    icon: (
      <path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3Zm-1.2 11 4.7-4.7-1.4-1.4-3.3 3.3-1.7-1.7-1.4 1.4 3.1 3.1Z" />
    ),
  },
  {
    title: 'Rasmiy kelishuv',
    detail: 'Shartnoma asosida, oylik hisobdorlik bilan',
    note: null,
    icon: <path d="M7 3h7l5 5v13H7V3Zm7 0v5h5M9.5 13h5M9.5 17h5" />,
  },
  {
    title: 'Shaffof jarayon',
    detail: 'Muddat 2 oydan 36 oygacha',
    note: null,
    icon: <path d="M8 3v3M16 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />,
  },
  {
    title: 'Qo‘llab-quvvatlash',
    detail: site.office.hours,
    note: site.office.address,
    icon: <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />,
  },
];

export function TrustLayer() {
  return (
    <section aria-labelledby="trust-heading" className="border-b border-line bg-surface">
      <Container className="py-10 sm:py-12">
        <h2 id="trust-heading" className="sr-only">
          Nega Markabga ishonish mumkin
        </h2>

        <ul className="grid gap-y-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
          {facts.map((fact, index) => (
            <li
              key={fact.title}
              className={[
                'flex gap-3 lg:px-8',
                index === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-line',
                index === facts.length - 1 ? 'lg:pr-0' : '',
              ].join(' ')}
            >
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {fact.icon}
              </svg>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink-900">{fact.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{fact.detail}</p>
                {fact.note ? (
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">{fact.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs leading-relaxed text-ink-400">
          Huquqiy va moliyaviy ma’lumotlarning ayrim qismlari turli manbalarda farqli
          ko‘rsatilgan, shuning uchun ular tasdiqlangunga qadar ko‘rsatilmaydi.{' '}
          <Link href="/about#trust" className="text-brand-700 underline underline-offset-2">
            Tekshiruv kutilayotgan maydonlar
          </Link>
        </p>
      </Container>
    </section>
  );
}
