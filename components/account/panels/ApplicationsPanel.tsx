'use client';

import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Panel, PendingIntegration, DetailRow } from './Panel';
import { useApplicationDrafts } from '@/components/account/useApplicationDrafts';
import { APPLICATION_STATUS_LABELS, type AccountSnapshot } from '@/lib/account/types';

/**
 * My applications.
 *
 * The one rule that matters here: an application may only be shown as
 * submitted, under review or approved if a real backend said so. A draft saved
 * in the browser is a draft, and it is labelled "Qoralama / yuborilmagan" —
 * never "Ko'rib chiqilmoqda".
 */
export function ApplicationsPanel({
  snapshot,
  demo,
}: {
  snapshot: AccountSnapshot | null;
  demo: boolean;
}) {
  void demo;
  /** Real visitor actions, held in this browser. Always rendered first. */
  const { drafts, ready, remove } = useApplicationDrafts();
  const applications = snapshot?.applications ?? [];

  return (
    <Panel
      title="Mening arizalarim"
      description="Moliyalashtirish arizalari shu yerda kuzatiladi. Yuborilmagan ariza har doim qoralama sifatida belgilanadi."
    >
      {ready && drafts.length > 0 ? (
        <ul className="mb-4 space-y-3">
          {drafts.map((application) => (
            <li key={application.id} className="rounded-lg border border-dashed border-line-strong bg-surface-muted p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {application.productTitle ?? 'Mahsulot ko‘rsatilmagan'}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">{application.reference}</p>
                </div>
                <Badge tone="pending">{APPLICATION_STATUS_LABELS.draft}</Badge>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-500">
                Bu ariza hech qayerga yuborilmagan — ariza yuborish tizimi rasmiy backend bilan
                integratsiya qilinmagan. Qoralamada faqat mahsulot nomi saqlanadi.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {application.productHref ? (
                  <ButtonLink href={application.productHref} variant="secondary" size="sm">
                    Mahsulotni ochish
                  </ButtonLink>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(application.id)}
                  className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-white px-3.5 text-sm font-medium text-ink-900 transition-colors hover:bg-surface"
                >
                  Qoralamani o‘chirish
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {applications.length === 0 ? (
        <PendingIntegration what="Arizalar ro‘yxati rasmiy hisob manbasi ulangach ko‘rsatiladi. Yuqorida faqat shu brauzerda saqlangan qoralamalar ko‘rsatiladi — ular ham hech qayerga yuborilmagan." />
      ) : (
        <ul className="space-y-3">
          {applications.map((application) => {
            const isDraft = application.status === 'draft';
            return (
              <li key={application.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">
                      {application.productTitle ?? 'Mahsulot ko‘rsatilmagan'}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">{application.reference}</p>
                  </div>
                  <Badge tone={isDraft ? 'pending' : 'neutral'}>
                    {APPLICATION_STATUS_LABELS[application.status]}
                  </Badge>
                </div>

                <dl className="mt-3">
                  <DetailRow label="Holat izohi">
                    <span className="text-xs leading-relaxed text-ink-500 sm:max-w-xs sm:text-right">
                      {isDraft
                        ? 'Bu ariza hech qayerga yuborilmagan. U faqat shu brauzerda qoralama sifatida saqlanadi.'
                        : 'Holat rasmiy manba tomonidan tasdiqlanadi.'}
                    </span>
                  </DetailRow>
                  {/*
                    Labelled "Saqlangan vaqt" for drafts rather than
                    "Yuborilgan sana": a row reading "Yuborilgan sana:
                    Yuborilmagan" is technically true but scans as a
                    contradiction, and nothing here should be ambiguous about
                    whether an application was submitted.
                  */}
                  <DetailRow label={isDraft ? 'Saqlangan vaqt' : 'Yuborilgan sana'}>
                    <span className="text-xs text-ink-500">
                      {application.createdAt
                        ? new Date(application.createdAt).toLocaleString('uz-UZ', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </span>
                  </DetailRow>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
