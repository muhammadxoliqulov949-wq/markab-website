import { PendingValue } from '@/components/ui/StateBlock';
import { site } from '@/lib/site';

/**
 * Office information block.
 *
 * Displays only the fields that are verified in `lib/site.ts`:
 *   • Manzil   (Toshkent shahri, Kukcha Aryk, Yunusobod tumani)  — verified
 *   • Ish vaqti (Dushanba – Juma: 9:00 – 18:00)                 — verified
 *
 * Phone / email are intentionally NOT rendered here even though the Legal
 * Trust Register records conflicting values. Those conflicts must be resolved
 * by Markab before publication; see docs/LEGAL-TRUST-REGISTER.md §3, §4.
 *
 * The component is compact on purpose: a list of labelled rows rather than
 * five separate cards, to keep the contact composition calm.
 */

type Row = { label: string; value: React.ReactNode; href?: string };

export function OfficeInfo() {
  const rows: Row[] = [
    { label: 'Manzil', value: site.office.address },
    { label: 'Ish vaqti', value: site.office.hours },
    { label: 'Telefon', value: site.contacts.phone ?? <PendingValue label="rasman e’lon qilinmagan" /> },
    { label: 'Email', value: site.contacts.email ?? <PendingValue label="rasman e’lon qilinmagan" /> },
  ];

  return (
    <dl className="divide-y divide-line border-t border-line">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-4 py-3 text-sm sm:grid-cols-[7.5rem_1fr]">
          <dt className="text-xs uppercase tracking-wide text-ink-400">{row.label}</dt>
          <dd className="text-ink-700">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
