import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ApplicationForm, type ApplicationContext } from '@/components/financing/ApplicationForm';
import { repository } from '@/lib/data';
import { formatUzs } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Ariza yuborish',
  description:
    'Muddatli to‘lov uchun ariza: mahsulot, boshlang‘ich to‘lov, muddat va aloqa ma’lumotlari.',
  path: '/financing/apply',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const checklist = [
  'Pasport yoki ID-karta',
  'Telefon raqami (SMS tasdiqlash uchun)',
  'Boshlang‘ich to‘lov uchun mablag‘',
  'Daromad manbai haqida ma’lumot',
];

export default async function ApplyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const type = first(sp.type);
  const ref = first(sp.ref);

  // Resolve the chosen item from the fixtures when possible; never invent one.
  const context: ApplicationContext = { type: type ?? null, ref: ref ?? null, title: null, price: null };

  if (ref) {
    if (type === 'electronics') {
      const product = await repository.getProductById(ref);
      if (product.status === 'success') {
        context.title = product.data.name;
        context.price = product.data.priceUzs;
      }
    } else {
      const vehicle = await repository.getVehicleBySlug(ref);
      if (vehicle.status === 'success') {
        context.title = vehicle.data.title;
        context.price = vehicle.data.priceUzs;
      }
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <Badge tone="pending" className="mb-3">
          Prototip — ariza backend ulanmagan
        </Badge>
        <h1 className="text-display-sm sm:text-display-md">Ariza yuborish</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Muddatli to‘lov uchun arizani to‘rt bosqichda to‘ldiring. Prototipda yuborish
          tugmasi ma’lumotlarni saqlamaydi — bu interfeys real tizim ulanganda ishlaydi.
        </p>
        {context.title ? (
          <p className="mt-4 rounded-lg border border-line bg-surface-muted px-4 py-3 text-sm text-ink-700">
            Tanlangan mahsulot: <span className="font-semibold">{context.title}</span>
            {context.price !== null ? ` · ${formatUzs(context.price)}` : ''}
          </p>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <ApplicationForm context={context} />

        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Kerakli hujjatlar</h2>
            <ul className="mt-3 space-y-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              To‘liq ro‘yxat rasmiy tasdiqlangach kengaytiriladi.
            </p>
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
        </aside>
      </div>
    </Container>
  );
}
