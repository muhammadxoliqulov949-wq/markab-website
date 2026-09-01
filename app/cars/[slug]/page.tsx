import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { SaveButton } from '@/components/account/SaveButton';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { VehicleGallery } from '@/components/vehicles/VehicleGallery';
import { FinancingPanel } from '@/components/vehicles/FinancingPanel';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { formatKm, formatUzs, formatViews } from '@/lib/format';
import { fuelLabel, transmissionLabel } from '@/lib/labels';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { financingSteps, trustBadges } from '@/lib/data/fixtures/content';
import { relatedReason, selectRelatedVehicles } from '@/lib/vehicles/related';
import { applyHref, calculatorHref } from '@/lib/financing/handoff';

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
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    description: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${formatKm(
      vehicle.mileageKm,
    )}, ${fuelLabel(vehicle.fuelType)}, ${transmissionLabel(
      vehicle.transmission,
    )}. Narxi: ${formatUzs(vehicle.priceUzs)}.`,
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

  // Candidates for the related rail come from the repository, never from
  // fixtures directly. The selection itself is deterministic — see
  // lib/vehicles/related.ts.
  const relatedResult = await repository.listVehicles({ pageSize: 50 });
  const related =
    relatedResult.status === 'success'
      ? selectRelatedVehicles(
          vehicle,
          relatedResult.data.items.filter((item) => item.id !== vehicle.id),
          3,
        )
      : [];

  const monthly = vehicle.financing.monthlyPaymentUzs;

  const specs: { label: string; value: React.ReactNode }[] = [
    { label: 'Brend', value: vehicle.brand },
    { label: 'Model', value: vehicle.model },
    { label: 'Yil', value: String(vehicle.year) },
    { label: 'Holati', value: vehicle.isNew ? 'Yangi' : 'Foydalanilgan' },
    { label: 'Yurgan masofa', value: formatKm(vehicle.mileageKm) },
    { label: 'Yoqilg‘i turi', value: fuelLabel(vehicle.fuelType) },
    { label: 'Uzatma', value: transmissionLabel(vehicle.transmission) },
    { label: 'Manzil', value: vehicle.location },
  ];

  return (
    <Container className="py-8 sm:py-12">
      {/* 1 — Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 text-ink-400">
          <li>
            <Link href="/" className="inline-flex items-center py-1 transition-colors hover:text-ink-700">
              Bosh sahifa
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/cars" className="inline-flex items-center py-1 transition-colors hover:text-ink-700">
              Avtomobillar
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/cars?brand=${encodeURIComponent(vehicle.brand)}`}
              className="inline-flex items-center py-1 transition-colors hover:text-ink-700"
            >
              {vehicle.brand}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate py-1 text-ink-700">
            {vehicle.model} {vehicle.year}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* ---------- LEFT ---------- */}
        <div className="min-w-0">
          {/* 2 — Gallery */}
          <VehicleGallery
            images={vehicle.images}
            title={`${vehicle.brand} ${vehicle.model}`}
          />

          {/* 8 — Detailed information */}
          <section className="mt-8" aria-labelledby="vehicle-details">
            <h2 id="vehicle-details" className="text-base font-semibold text-ink-900">
              Batafsil ma’lumot
            </h2>

            <dl className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between gap-6 px-5 py-3">
                  <dt className="text-sm text-ink-500">{spec.label}</dt>
                  <dd className="text-right text-sm font-medium text-ink-900">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink-900">Qo‘shimcha jihozlar</h3>
              <div className="mt-3">
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
                    title="Jihozlar ro‘yxati kiritilmagan"
                    description="Bu avtomobil uchun jihozlar ro‘yxati Markab tomonidan kiritilgach ko‘rsatiladi."
                    actions={
                      <ButtonLink href="/contact" variant="secondary" size="sm">
                        Menejerga murojaat
                      </ButtonLink>
                    }
                  />
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink-900">Tavsif</h3>
              {vehicle.description ? (
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{vehicle.description}</p>
              ) : (
                <div className="mt-3">
                  <StateBlock
                    compact
                    variant="empty"
                    title="Tavsif kiritilmagan"
                    description="Bu e’lon uchun tavsif Markab tomonidan taqdim etilmagan. Batafsil ma’lumotni menejerdan olishingiz mumkin."
                    actions={
                      <ButtonLink href="/contact" variant="secondary" size="sm">
                        Menejerga murojaat
                      </ButtonLink>
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ---------- RIGHT — purchase column ---------- */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={vehicle.isNew ? 'brand' : 'neutral'}>
              {vehicle.isNew ? 'Yangi' : 'Foydalanilgan'}
            </Badge>
            <span className="text-xs text-ink-400">{formatViews(vehicle.views)}</span>
          </div>

          {/* 3 — Brand / model / year */}
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
            {vehicle.brand}
          </p>
          <h1 className="mt-1.5 text-display-sm sm:text-display-md">
            {vehicle.model} <span className="text-ink-400">{vehicle.year}</span>
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {formatKm(vehicle.mileageKm)} · {fuelLabel(vehicle.fuelType)} ·{' '}
            {transmissionLabel(vehicle.transmission)} · {vehicle.location}
          </p>

          {/* 4 — Price */}
          <div className="mt-6 border-y border-line py-5">
            <p className="text-[0.8125rem] text-ink-500">Narx</p>
            <p className="mt-1 text-[1.75rem] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[2rem]">
              {formatUzs(vehicle.priceUzs)}
            </p>
            <p className="mt-2 flex min-h-[1.375rem] items-center text-sm">
              {monthly ? (
                <span className="text-brand-700">
                  Oylik to‘lov: <span className="font-semibold">{formatUzs(monthly)}</span>
                </span>
              ) : (
                <PendingValue label="Oylik to‘lov: hisob-kitob tayyorlanmoqda" />
              )}
            </p>
            <p className="mt-1 text-xs text-ink-400">
              Narx va oylik to‘lov (agar ko‘rsatilgan bo‘lsa) ochiq e’londan olingan. Yakuniy shartlar
              Markab tomonidan tasdiqlanadi.
            </p>
          </div>

          {/* 5 — Key specifications */}
          <div className="mt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              Asosiy ko‘rsatkichlar
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-line bg-surface-muted p-5">
              <Spec label="Yil" value={String(vehicle.year)} />
              <Spec label="Yurgan" value={formatKm(vehicle.mileageKm)} />
              <Spec label="Yoqilg‘i" value={fuelLabel(vehicle.fuelType)} />
              <Spec label="Uzatma" value={transmissionLabel(vehicle.transmission)} />
              <Spec label="Holati" value={vehicle.isNew ? 'Yangi' : 'Foydalanilgan'} />
              <Spec label="Manzil" value={vehicle.location} />
            </dl>
          </div>

          {/* 6 — Financing panel */}
          <div className="mt-6">
            <FinancingPanel
              financing={vehicle.financing}
              priceUzs={vehicle.priceUzs}
              href={calculatorHref('car', vehicle.slug)}
              applyHref={applyHref('car', vehicle.slug)}
            />
          </div>

          {/* 7 — Main CTA */}
          <div className="mt-4 flex flex-col gap-2">
            <ButtonLink href={applyHref('car', vehicle.slug)} size="lg" fullWidth>
              Ariza yuborish
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg" fullWidth>
              Menejer bilan bog‘lanish
            </ButtonLink>
            <SaveButton
              item={{
                kind: 'car',
                ref: vehicle.slug,
                title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
                priceUzs: vehicle.priceUzs,
                image: vehicle.images[0] ?? null,
                href: `/cars/${vehicle.slug}`,
              }}
            />
          </div>

          {/* 11 — Trust / support */}
          <div className="mt-6 rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Sotuvchi va qo‘llab-quvvatlash</h2>
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

            <ul className="mt-4 space-y-2 border-t border-line pt-4">
              {trustBadges.map((badge) => (
                <li key={badge.title} className="text-sm">
                  <p className="font-medium text-ink-900">{badge.title}</p>
                  <p className="mt-0.5 text-ink-500">{badge.description}</p>
                  {badge.note ? <p className="mt-1 text-xs text-ink-400">{badge.note}</p> : null}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
              <ArrowLink href="/faq" className="text-brand-700">
                Savol-javoblar
              </ArrowLink>
              <ArrowLink href="/contact" className="text-brand-700">
                Aloqa
              </ArrowLink>
              <ArrowLink href="/financing" className="text-brand-700">
                Moliyalashtirish shartlari
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>

      {/* 9 — Financing / process preview */}
      <section className="mt-14 border-t border-line pt-10" aria-labelledby="process-preview">
        <div className="max-w-2xl">
          <h2 id="process-preview" className="text-xl font-semibold tracking-tight text-ink-900">
            Xarid qanday amalga oshiriladi
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Jarayon bosqichlari ochiq ma’lumotlar asosida ko‘rsatilgan. Har bir bosqichning aniq
            muddati va shartlari Markab tomonidan tasdiqlanadi.
          </p>
        </div>

        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {financingSteps.map((step) => (
            <li
              key={step.step}
              className="flex gap-3 rounded-xl border border-line bg-surface p-5"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-xs font-semibold text-brand-700">
                {step.step}
              </span>
              <div>
                <p className="text-sm font-medium text-ink-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5">
          <ArrowLink href="/financing" className="text-sm font-medium text-brand-700">
            Moliyalashtirish bo‘limiga o‘tish
          </ArrowLink>
        </div>
      </section>

      {/* 10 — Related vehicles */}
      <section className="mt-14 border-t border-line pt-10" aria-labelledby="related-vehicles">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="related-vehicles" className="text-xl font-semibold tracking-tight text-ink-900">
              O‘xshash avtomobillar
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
              Brend, yil va narx yaqinligi bo‘yicha saralangan — bu tayyor qoidalar asosidagi
              tanlov, shaxsiy tavsiya emas.
            </p>
          </div>
          <ArrowLink href="/cars" className="text-sm font-medium text-brand-700">
            Barcha avtomobillar
          </ArrowLink>
        </div>

        {related.length > 0 ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id} className="flex flex-col">
                <VehicleCard vehicle={item} />
                <p className="mt-2 text-xs text-ink-400">{relatedReason(vehicle, item)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <StateBlock
              variant="empty"
              title="O‘xshash avtomobillar topilmadi"
              description="Hozircha katalogda bu avtomobilga yaqin boshqa e’lon yo‘q."
              actions={
                <ButtonLink href="/cars" variant="secondary">
                  Katalogga qaytish
                </ButtonLink>
              }
            />
          </div>
        )}
      </section>
    </Container>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}
