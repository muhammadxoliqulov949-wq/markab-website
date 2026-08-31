'use client';

import { useMemo, useState } from 'react';
import { Field, Select, TextInput, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';

export type ApplicationContext = {
  /** 'car' | 'electronics' — which catalogue the application is about. */
  type: string | null;
  /** Slug (car) or id (electronics) of the chosen item, when known. */
  ref: string | null;
  /** Catalogue title, pre-filled into the form. */
  title: string | null;
  price: number | null;
};

const steps = [
  { id: 1, title: 'Mahsulot' },
  { id: 2, title: 'Shartlar' },
  { id: 3, title: 'Ma’lumotlar' },
  { id: 4, title: 'Tasdiqlash' },
] as const;

/**
 * Installment application — UI complete, backend pending.
 *
 * The audit found that the primary business action ("apply for installment")
 * cannot be completed on the web at all (P1). This prototype adds the missing
 * step as a tracked, intent-specific form with visible progress, a document
 * checklist shown up-front, and a real end state.
 *
 * Because no backend is connected, submitting does not claim success: it renders
 * an explicit "integration pending" state. Nothing here computes an approval,
 * a monthly payment or a decision.
 */
export function ApplicationForm({ context }: { context: ApplicationContext }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({
    product: context.title ?? '',
    initialPayment: '',
    termMonths: '',
    name: '',
    phone: '',
    extraPhone: '',
    comment: '',
    consent: false,
  });

  const typeLabel = useMemo(
    () => (context.type === 'electronics' ? 'Elektronika' : 'Avtomobil'),
    [context.type],
  );

  if (submitted) {
    return (
      <StateBlock
        variant="unavailable"
        title="Ariza yuborilmadi — prototip holati"
        description="Real backend ulanmagani uchun ariza tizimga tushmadi. Tizim ulangandan so‘ng ariza shu interfeys orqali qabul qilinadi, holati esa shaxsiy kabinetda kuzatiladi."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(false);
                setStep(1);
              }}
            >
              Qaytadan to‘ldirish
            </Button>
            <a
              href="/contact"
              className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-white px-3.5 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-muted"
            >
              Menejer bilan bog‘lanish
            </a>
          </>
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="Ariza bosqichlari">
        {steps.map((item) => {
          const state = step === item.id ? 'current' : step > item.id ? 'done' : 'todo';
          return (
            <li key={item.id} className="flex items-center gap-2">
              <span
                className={[
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  state === 'done'
                    ? 'bg-brand-700 text-white'
                    : state === 'current'
                      ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-500/30'
                      : 'bg-surface-sunken text-ink-400',
                ].join(' ')}
              >
                {state === 'done' ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  item.id
                )}
              </span>
              <span className={`text-xs sm:text-sm ${state === 'todo' ? 'text-ink-400' : 'text-ink-800'}`}>
                {item.title}
              </span>
              {item.id < steps.length ? (
                <span className={`hidden h-px w-6 sm:block ${step > item.id ? 'bg-brand-600' : 'bg-line'}`} aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < steps.length) {
            setStep((current) => current + 1);
            return;
          }
          setSubmitted(true);
        }}
      >
        {step === 1 ? (
          <>
            <Field label="Mahsulot turi" htmlFor="apply-type">
              <Select
                id="apply-type"
                value={context.type === 'electronics' ? 'electronics' : 'car'}
                disabled
              >
                <option value="car">Avtomobil</option>
                <option value="electronics">Elektronika</option>
              </Select>
            </Field>
            <Field
              label="Mahsulot"
              htmlFor="apply-product"
              required
              hint={context.title ? 'Tanlangan e’lon asosida to‘ldirildi' : 'Nomi va modelini yozing'}
            >
              <TextInput
                id="apply-product"
                required
                value={values.product}
                onChange={(event) => setValues({ ...values, product: event.target.value })}
                placeholder="Masalan: Chevrolet Cobalt 2023"
              />
            </Field>
            <p className="text-xs text-ink-400">
              {context.ref
                ? 'Ariza tanlangan e’longa bog‘lanadi — kabinetda shu mahsulot bilan ko‘rsatiladi.'
                : 'Mahsulotni katalogdan tanlab kelsangiz, ariza avtomatik bog‘lanadi.'}
            </p>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Boshlang‘ich to‘lov (so‘m)" htmlFor="apply-initial" required>
                <TextInput
                  id="apply-initial"
                  required
                  inputMode="numeric"
                  value={values.initialPayment}
                  onChange={(event) => setValues({ ...values, initialPayment: event.target.value })}
                  placeholder="50 000 000"
                />
              </Field>
              <Field label="Muddat" htmlFor="apply-term" required hint="2 oydan 36 oygacha">
                <Select
                  id="apply-term"
                  required
                  value={values.termMonths}
                  onChange={(event) => setValues({ ...values, termMonths: event.target.value })}
                >
                  <option value="">Tanlang</option>
                  {[12, 18, 24, 30, 36].map((months) => (
                    <option key={months} value={String(months)}>
                      {months} oy
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="rounded-lg border border-line bg-surface-muted p-4 text-xs leading-relaxed text-ink-500">
              Bu yerda hech qanday oylik to‘lov hisoblanmaydi: hisob-kitob formulasi rasmiy manba
              tomonidan taqdim etilgach kalkulyatorga ulanadi. Hozircha shartlar menejer bilan
              tasdiqlanadi.
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ism va familiya" htmlFor="apply-name" required>
              <TextInput
                id="apply-name"
                required
                value={values.name}
                onChange={(event) => setValues({ ...values, name: event.target.value })}
                placeholder="Ism Familiya"
              />
            </Field>
            <Field label="Telefon" htmlFor="apply-phone" required hint="Masalan: 90 123 45 67">
              <TextInput
                id="apply-phone"
                required
                inputMode="tel"
                value={values.phone}
                onChange={(event) => setValues({ ...values, phone: event.target.value })}
                placeholder="+998 __ ___ __ __"
              />
            </Field>
            <Field label="Qo‘shimcha telefon" htmlFor="apply-extra" hint="Majburiy emas">
              <TextInput
                id="apply-extra"
                inputMode="tel"
                value={values.extraPhone}
                onChange={(event) => setValues({ ...values, extraPhone: event.target.value })}
                placeholder="+998 __ ___ __ __"
              />
            </Field>
            <Field label="Izoh" htmlFor="apply-comment">
              <Textarea
                id="apply-comment"
                className="min-h-[96px]"
                value={values.comment}
                onChange={(event) => setValues({ ...values, comment: event.target.value })}
                placeholder="Qo‘shimcha ma’lumot"
              />
            </Field>
          </div>
        ) : null}

        {step === 4 ? (
          <>
            <div className="rounded-xl border border-line bg-surface-muted p-5">
              <h3 className="text-sm font-semibold text-ink-900">Ariza ma’lumotlari</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Mahsulot</dt>
                  <dd className="max-w-[60%] text-right text-ink-800">{values.product || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Turi</dt>
                  <dd className="text-ink-800">{typeLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Boshlang‘ich to‘lov</dt>
                  <dd className="text-ink-800">{values.initialPayment || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Muddat</dt>
                  <dd className="text-ink-800">{values.termMonths ? `${values.termMonths} oy` : '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-500">Telefon</dt>
                  <dd className="text-ink-800">{values.phone || '—'}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-ink-400">
                Oylik to‘lov va yakuniy summa shu yerda ko‘rsatilmaydi — ular rasmiy hisob-kitob
                asosida shartnomada belgilanadi.
              </p>
            </div>

            <label className="flex items-start gap-3 text-xs leading-relaxed text-ink-500">
              <input
                type="checkbox"
                required
                checked={values.consent}
                onChange={(event) => setValues({ ...values, consent: event.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand-700 focus:ring-brand-500"
              />
              <span>
                Ma’lumotlarimni qayta ishlashga roziman va{' '}
                <a href="/privacy" className="text-brand-700 underline underline-offset-2">
                  Maxfiylik siyosati
                </a>{' '}
                hamda{' '}
                <a href="/terms" className="text-brand-700 underline underline-offset-2">
                  Foydalanish shartlari
                </a>{' '}
                bilan tanishdim.
              </span>
            </label>
          </>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1}
          >
            Orqaga
          </Button>
          <Button type="submit" disabled={step === 4 && !values.consent}>
            {step < steps.length ? 'Keyingi' : 'Arizani yuborish'}
          </Button>
        </div>
      </form>
    </div>
  );
}
