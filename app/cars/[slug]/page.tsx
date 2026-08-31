import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { VehicleGallery } from '@/components/vehicles/VehicleGallery';
import { FinancingPanel } from '@/components/vehicles/FinancingPanel';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { formatKm, formatUzs, formatViews } from '@/lib/format';
import { fuelLabel, transmissionLabel } from '@/lib/labels';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { trustBadges } from '@/lib/data/fixtures/content';

type Params = Promise<{ slug: string }>;

async function loadVehicle(slug: string) {
  return repository.getVehicleBySlug(slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadVehicle(slug);

  if (result.status !== 'success') {
    return buildMetadata({
      title: 'Avtomobil topilmadi',
      description: 'So‘ralgan avtomobil e’loni mavjud emas yoki o‘chirilgan.',
      path: `/cars/${slug}`,
      noindex: true,
    });
  }

  const vehicle = result.data;
  return buildMetadata({
    title: vehicle.title,
    description: `${vehicle.title} — ${vehicle.year} yil, ${formatKm(vehicle.mileageKm)}, ${fuelLabel(
      vehicle.fuelType,
    )}, ${transmissionLabel(vehicle.transmission)}. ${formatUzs(vehicle.priceUzs)}.`,
    path: `/cars/${vehicle.slug}`,
    ogImage: vehicle.images[0],
  });
}

export default async function VehicleDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await loadVehicle(slug);

  // A missing record renders the branded 404 with a real 404 status — never a 500,
  // never a silent redirect to the homepage (P0-4 / P0-6 of the audit).
  if (result.status !== 'success') {
    notFound();
  }

  const vehicle = result.data;
  const relatedResult = await repository.listVehicles({ pageSize: 4 });
  const related = (relatedResult.status === 'success' ? relatedResult.data.items : [])
    .filter((item) => item.id !== vehicle.id)
    .slice(0, 3);

  const specs = [
    { label: 'Yil', value: String(vehicle.year) },
    { label: 'Yurgan', value: formatKm(vehicle.mileageKm) },
    { label: 'Yoqilg‘i', value: fuelLabel(vehicle.fuelType) },
    { label: 'Uzatma', value: transmissionLabel(vehicle.transmission) },
    { label: 'Joylashuv', value: vehicle.location },
  ];

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-ink-400">
          <li>
            <Link href="/" className="hover:text-ink-700">
              Bosh sahifa
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/cars" className="hover:text-ink-700">
              Avtomobillar
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-ink-700">{vehicle.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div>
          <VehicleGallery images={vehicle.images} title={vehicle.title} />

          <div className="mt-8">
            <h2 className="text-base font-semibold text-ink-900">Xususiyatlar</h2>
            <div className="mt-4">
              {vehicle.features.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-md bg-surface-sunken px-3 py-1.5 text-sm text-ink-700"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <StateBlock
                  compact
                  variant="empty"
                  title="Qo‘shimcha jihozlar ro‘yxati kiritilmagan"
                  description="Bu avtomobil uchun jihozlar ro‘yxati rasmiy manbaga kiritilgach ko‘rsatiladi. Batafsil ma’lumot uchun menejerga murojaat qiling."
                  actions={
                    <ButtonLink href="/contact" variant="secondary" size="sm">
                      Menejerga murojaat
                    </ButtonLink>
                  }
                />
              )}
            </div>
          </div>

          {vehicle.description ? (
            <div className="mt-8">
              <h2 className="text-base font-semibold text-ink-900">Tavsif</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{vehicle.description}</p>
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {vehicle.isNew ? <Badge tone="brand">Yangi</Badge> : null}
            <span className="text-xs text-ink-400">{formatViews(vehicle.views)}</span>
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl">{vehicle.title}</h1>

          <p className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-ink-900">
            {formatUzs(vehicle.priceUzs)}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-line bg-surface-muted p-5">
            {specs.map((spec) => (
              <div key={spec.label}>
                <dt className="text-xs uppercase tracking-wide text-ink-400">{spec.label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink-900">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <FinancingPanel
              financing={vehicle.financing}
              priceUzs={vehicle.priceUzs}
              href="/financing/calculator"
              applyHref={`/financing/apply?type=car&ref=${vehicle.slug}`}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <ButtonLink href={`/financing/apply?type=car&ref=${vehicle.slug}`} size="lg">
              Ariza yuborish
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Menejer bilan bog‘lanish
            </ButtonLink>
          </div>

          <div className="mt-6 rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Sotuvchi</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                M
              </span>
              <div>
                <p className="text-sm font-medium text-ink-900">Markab</p>
                <p className="text-xs text-ink-400">
                  Yuridik nomi: <PendingValue label="rasmiy tekshiruv kutilmoqda" />
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {trustBadges.map((badge) => (
              <li
                key={badge.title}
                className="rounded-xl border border-line bg-surface p-4 text-sm"
              >
                <p className="font-medium text-ink-900">{badge.title}</p>
                <p className="mt-1 text-ink-500">{badge.description}</p>
                {badge.note ? <p className="mt-2 text-xs text-ink-400">{badge.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-line pt-10" aria-labelledby="related-vehicles">
          <h2 id="related-vehicles" className="text-xl font-semibold text-ink-900">
            O‘xshash avtomobillar
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <VehicleCard key={item.id} vehicle={item} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
