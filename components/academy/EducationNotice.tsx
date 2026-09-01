/**
 * Education content safety notice.
 *
 * Academy material is general information only. This notice keeps three
 * things visibly separate, because blurring them is how an explainer turns
 * into advice:
 *
 *   1. general educational information
 *   2. personalised financial advice (never given)
 *   3. official Markab contract / process terms (come from the contract)
 *
 * It also refuses two things this prototype must never do: present an
 * independent Islamic-legal ruling, and assert a certification Markab has not
 * published.
 */
export function EducationNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Ta’lim materiallari haqida ogohlantirish"
      className={[
        'rounded-xl border border-dashed border-line-strong bg-surface-muted',
        compact ? 'px-4 py-3' : 'px-5 py-4',
      ].join(' ')}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
        Umumiy ma’lumot
      </p>
      <p
        className={[
          'mt-2 leading-relaxed text-ink-600',
          compact ? 'text-xs' : 'text-sm',
        ].join(' ')}
      >
        Bu materiallar umumiy o‘quv ma’lumoti bo‘lib, shaxsiy moliyaviy maslahat emas. Hech
        qanday natija kafolatlanmaydi va bu yerda mustaqil diniy-huquqiy xulosa berilmaydi.
        Shartnoma shartlari, to‘lov jadvali va rasmiy jarayonlar faqat Markab bilan tuzilgan
        shartnoma va rasmiy hujjatlar bilan belgilanadi.
      </p>
      {!compact ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-400">
          Academy bo‘limida sertifikat, rasmiy malaka, ta’lim litsenziyasi yoki mustaqil
          AAOIFI talqini ko‘rsatilmaydi — ular tasdiqlanmagan.
        </p>
      ) : null}
    </aside>
  );
}
