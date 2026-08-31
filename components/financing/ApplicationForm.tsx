'use client';

import { useId, useMemo, useState } from 'react';
import { saveDraft } from '@/lib/account/draft';
import Link from 'next/link';
import { Field, Select, TextInput, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';
import type { FinancingSubject } from '@/lib/financing/handoff';
import { subjectKindLabel } from '@/lib/financing/handoff';

/**
 * Installment application — UI complete, backend pending.
 *
 * FIELD POLICY: only what a first contact actually needs. No passport, no
 * JSHSHIR/PINFL, no card or bank details, no selfie, no income proof. Those may
 * become necessary in a real, legally-grounded process — but nothing here may
 * request them before that exists.
 *
 * SUBMISSION POLICY: there is no backend, so submitting does NOT say
 * "yuborildi". It renders an explicit integration-pending state, keeps
 * everything the visitor typed, and offers a copy-to-clipboard summary so the
 * information is still useful.
 *
 * Nothing here computes an approval, a monthly payment or a decision.
 */

const CONTACT_METHODS = ['Telefon qo‘ng‘irog‘i', 'Telegram / WhatsApp', 'Email'];

type Values = {
  product: string;
  initialPayment: string;
  term: string;
  name: string;
  phone: string;
  contactMethod: string;
  message: string;
  consent: boolean;
};

type Errors = Partial<Record<'name' | 'phone' | 'consent', string>>;

/**
 * Deliberately permissive: accepts a local 9-digit number or an international
 * one starting with 998. It exists to catch typos, not to verify a line.
 */
function normalisePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 9) return digits;
  if (digits.length === 12 && digits.startsWith('998')) return digits.slice(3);
  return null;
}

export function ApplicationForm({
  subject,
  invalidRef = false,
}: {
  /** Item handed over from a catalogue, already resolved by the repository. */
  subject: FinancingSubject | null;
  /** A handoff was attempted but the referenced item does not exist. */
  invalidRef?: boolean;
}) {
  const uid = useId();
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'blocked'>('idle');
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<Values>({
    product: subject?.title ?? '',
    initialPayment: '',
    term: '',
    name: '',
    phone: '',
    contactMethod: CONTACT_METHODS[0],
    message: '',
    consent: false,
  });

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const errors = useMemo<Errors>(() => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = 'Ism va familiyani kiriting.';
    if (!normalisePhone(values.phone)) {
      next.phone = 'Telefon raqamini to‘liq kiriting (masalan: 90 123 45 67).';
    }
    if (!values.consent) next.consent = 'Davom etish uchun rozilik kerak.';
    return next;
  }, [values.name, values.phone, values.consent]);

  const phone = normalisePhone(values.phone);

  const summary = useMemo(
    () =>
      [
        `Mahsulot: ${values.product || '—'}`,
        `Turi: ${subject ? subjectKindLabel(subject.kind) : '—'}`,
        `Narx: ${subject ? formatUzs(subject.priceUzs) : '—'}`,
        `Boshlang‘ich to‘lov (xohish): ${values.initialPayment || '—'}`,
        `Muddat (xohish): ${values.term ? `${values.term} oy` : '—'}`,
        `Ism: ${values.name || '—'}`,
        `Telefon: ${phone ? `+998 ${phone}` : '—'}`,
        `Aloqa usuli: ${values.contactMethod}`,
        values.message ? `Izoh: ${values.message}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    [values, subject, phone],
  );

  if (status === 'blocked') {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <StateBlock
          variant="unavailable"
          title="Ariza yuborilmadi — tizim integratsiya qilinmagan"
          description="Ariza yuborish tizimi hali rasmiy backend bilan integratsiya qilinmagan. Ma’lumotlaringiz hech qayerga yuborilmadi va saqlanmadi. Quyida kiritgan ma’lumotlaringiz nusxasi turibdi — xohlasangiz uni ko‘chirib, menejerga yuborishingiz mumkin."
        />

        <div className="mt-6 rounded-xl border border-line bg-surface-muted p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink-900">Kiritilgan ma’lumotlar</h3>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(summary).then(
                  () => setCopied(true),
                  () => setCopied(false),
                );
              }}
              className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-white px-3.5 text-sm font-medium text-ink-900 transition-colors hover:bg-surface"
            >
              {copied ? 'Nusxa olindi' : 'Nusxa olish'}
            </button>
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-ink-700">
            {summary}
          </pre>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setStatus('idle')}>
            Arizani tahrirlash
          </Button>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center rounded-lg border border-line-strong px-5 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-muted"
          >
            Menejer bilan bog‘lanish
          </Link>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          Hech qanday oylik to‘lov yoki tasdiqlash natijasi hisoblanmadi — ular rasmiy jarayon va
          shartnoma asosida belgilanadi.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-400">
          Shu brauzerda ariza qoralama sifatida belgilandi: u “Mening Markabim” bo‘limida{' '}
          <strong className="font-semibold text-ink-600">Qoralama / yuborilmagan</strong> holatida
          ko‘rsatiladi. Qoralamada faqat mahsulot nomi saqlanadi — ism, telefon va izoh
          saqlanmaydi.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (Object.keys(errors).length > 0) return;

        // Record that an application was STARTED — not that one was submitted.
        // Only the product context is stored; no name, phone or message is ever
        // written to browser storage (see lib/account/draft.ts).
        saveDraft({
          productTitle: subject?.title ?? (values.product || null),
          productHref: subject?.href ?? null,
          kind: subject?.kind ?? null,
        });
        setStatus('blocked');
      }}
    >
      <h2 className="text-base font-semibold text-ink-900">Ariza ma’lumotlari</h2>
      <p className="mt-1 text-sm text-ink-500">
        Faqat birinchi bog‘lanish uchun kerakli maydonlar. Pasport, JSHSHIR, bank karta ma’lumotlari
        yoki biometrik ma’lumot so‘ralmaydi.
      </p>

      {invalidRef ? (
        <div className="mt-5">
          <StateBlock
            compact
            variant="not-found"
            title="Ko‘rsatilgan mahsulot topilmadi"
            description="Havoladagi mahsulot katalogda mavjud emas. Arizani mahsulot nomini o‘zingiz yozib davom ettirishingiz mumkin."
          />
        </div>
      ) : null}

      {subject ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              {subjectKindLabel(subject.kind)}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">{subject.title}</p>
            <p className="text-sm text-ink-600">{formatUzs(subject.priceUzs)}</p>
          </div>
          <Link href={subject.href} className="text-xs font-medium text-brand-700 underline underline-offset-4">
            E’lonni ochish
          </Link>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        <Field
          label="Mahsulot"
          htmlFor={`${uid}-product`}
          required
          hint={subject ? 'Tanlangan e’lon asosida to‘ldirildi' : 'Nomi va modelini yozing'}
        >
          <TextInput
            id={`${uid}-product`}
            required
            value={values.product}
            onChange={(event) => set('product', event.target.value)}
            placeholder="Masalan: Chevrolet Cobalt 2023"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Boshlang‘ich to‘lov (xohish)"
            htmlFor={`${uid}-initial`}
            hint="Majburiy emas — bu faqat sizning xohishingiz"
          >
            <TextInput
              id={`${uid}-initial`}
              inputMode="numeric"
              value={values.initialPayment}
              onChange={(event) => set('initialPayment', event.target.value)}
              placeholder="50 000 000"
            />
          </Field>

          <Field
            label="So‘ralayotgan muddat (oy)"
            htmlFor={`${uid}-term`}
            hint="Majburiy emas. Mavjud muddatlar rasmiy tasdiqlanadi"
          >
            <TextInput
              id={`${uid}-term`}
              inputMode="numeric"
              value={values.term}
              onChange={(event) => set('term', event.target.value)}
              placeholder="24"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Ism va familiya"
            htmlFor={`${uid}-name`}
            required
            error={touched ? errors.name : undefined}
          >
            <TextInput
              id={`${uid}-name`}
              required
              value={values.name}
              onChange={(event) => set('name', event.target.value)}
              placeholder="Ism Familiya"
              aria-invalid={touched && Boolean(errors.name)}
              aria-describedby={touched && errors.name ? `${uid}-name-error` : undefined}
            />
          </Field>

          <Field
            label="Telefon"
            htmlFor={`${uid}-phone`}
            required
            hint="Masalan: 90 123 45 67"
            error={touched ? errors.phone : undefined}
          >
            <TextInput
              id={`${uid}-phone`}
              required
              inputMode="tel"
              value={values.phone}
              onChange={(event) => set('phone', event.target.value)}
              placeholder="+998 __ ___ __ __"
              aria-invalid={touched && Boolean(errors.phone)}
              aria-describedby={touched && errors.phone ? `${uid}-phone-error` : undefined}
            />
          </Field>
        </div>

        <Field label="Qulay aloqa usuli" htmlFor={`${uid}-method`} hint="Bu sizning xohishingiz">
          <Select
            id={`${uid}-method`}
            value={values.contactMethod}
            onChange={(event) => set('contactMethod', event.target.value)}
          >
            {CONTACT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Izoh" htmlFor={`${uid}-message`} hint="Majburiy emas">
          <Textarea
            id={`${uid}-message`}
            className="min-h-[96px]"
            value={values.message}
            onChange={(event) => set('message', event.target.value)}
            placeholder="Qo‘shimcha ma’lumot"
          />
        </Field>

        <div className="rounded-xl border border-line bg-surface-muted p-4 text-xs leading-relaxed text-ink-500">
          Bu yerda hech qanday oylik to‘lov hisoblanmaydi: hisob-kitob formulasi rasmiy manba
          tomonidan taqdim etilgach kalkulyatorga ulanadi. Shartlar menejer bilan tasdiqlanadi.
        </div>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-ink-500">
          <input
            type="checkbox"
            checked={values.consent}
            onChange={(event) => set('consent', event.target.checked)}
            aria-invalid={touched && Boolean(errors.consent)}
            aria-describedby={touched && errors.consent ? `${uid}-consent-error` : undefined}
            className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand-700 focus:ring-brand-500"
          />
          <span>
            Ma’lumotlarimni qayta ishlashga roziman va{' '}
            <Link href="/privacy" className="text-brand-700 underline underline-offset-2">
              Maxfiylik siyosati
            </Link>{' '}
            hamda{' '}
            <Link href="/terms" className="text-brand-700 underline underline-offset-2">
              Foydalanish shartlari
            </Link>{' '}
            bilan tanishdim.
          </span>
        </label>

        {touched && errors.consent ? (
          <p id={`${uid}-consent-error`} className="text-xs text-rose-700">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-400">
          Yuborish tugmasi arizani serverga jo‘natmaydi — tizim integratsiya qilinmagan.
        </p>
        <Button type="submit" size="lg">
          Arizani yuborish
        </Button>
      </div>
    </form>
  );
}
