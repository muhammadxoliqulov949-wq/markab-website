'use client';

import { useState } from 'react';
import { Field, Select, TextInput, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';

/**
 * Brand list is passed in, not imported.
 *
 * The wizard is a client component; `@/lib/data` is server-only (it selects a
 * data provider and, in production, would read API credentials). Importing it
 * here pulled the whole provider graph — adapters, providers, every fixture —
 * into the browser bundle for this route. The server page already has the
 * brands, so it hands them over as a plain string array.
 */

const steps = [
  { id: 1, title: 'Avtomobil ma’lumotlari' },
  { id: 2, title: 'Rasmlar' },
  { id: 3, title: 'Aloqa' },
  { id: 4, title: 'Narx va tasdiqlash' },
] as const;

/**
 * Sell-your-car wizard — UI only.
 *
 * The live site's wizard collects ~12 fields in one step with no progress
 * indicator and no autosave (audit P2). This version splits it into 4 steps with
 * visible progress. Submission has no backend, so it ends in an explicit
 * "integration pending" state rather than a fake success.
 */
export function SellWizard({ brands }: { brands: string[] }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <StateBlock
        variant="unavailable"
        title="So‘rov yuborilmadi — prototip holati"
        description="Real backend ulanmagani uchun e’lon yaratilmadi. Tizim ulangandan so‘ng shu interfeys orqali so‘rov qabul qilinadi va holati kabinetda kuzatiladi."
        actions={
          <Button variant="secondary" onClick={() => { setSubmitted(false); setStep(1); }}>
            Qaytadan boshlash
          </Button>
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="Bosqichlar">
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
              <span
                className={`text-xs sm:text-sm ${state === 'todo' ? 'text-ink-400' : 'text-ink-800'}`}
              >
                {item.title}
              </span>
              {item.id < steps.length ? (
                <span
                  className={`hidden h-px w-6 sm:block ${step > item.id ? 'bg-brand-600' : 'bg-line'}`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-col gap-4">
        {step === 1 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brend" htmlFor="sell-brand" required>
                <Select id="sell-brand" required defaultValue="">
                  <option value="" disabled>
                    Tanlang
                  </option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                  <option value="other">Boshqa</option>
                </Select>
              </Field>
              <Field label="Model" htmlFor="sell-model" required>
                <TextInput id="sell-model" required placeholder="Masalan: Cobalt" />
              </Field>
              <Field label="Yil" htmlFor="sell-year" required>
                <TextInput id="sell-year" required inputMode="numeric" placeholder="2021" />
              </Field>
              <Field label="Yurgan masofasi (km)" htmlFor="sell-km" required>
                <TextInput id="sell-km" required inputMode="numeric" placeholder="45 000" />
              </Field>
              <Field label="Yoqilg‘i turi" htmlFor="sell-fuel">
                <Select id="sell-fuel" defaultValue="">
                  <option value="">Tanlang</option>
                  <option value="petrol">Benzin</option>
                  <option value="diesel">Dizel</option>
                  <option value="hybrid">Gibrid</option>
                  <option value="electric">Elektro</option>
                  <option value="gas">Gaz</option>
                </Select>
              </Field>
              <Field label="Uzatma" htmlFor="sell-transmission">
                <Select id="sell-transmission" defaultValue="">
                  <option value="">Tanlang</option>
                  <option value="automatic">Avtomat</option>
                  <option value="manual">Mexanika</option>
                </Select>
              </Field>
            </div>
            <Field label="Qo‘shimcha ma’lumot" htmlFor="sell-notes">
              <Textarea id="sell-notes" placeholder="Holati, qo‘shimcha jihozlar" />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <div className="rounded-xl border border-dashed border-line-strong bg-surface-muted/60 p-6">
            <h3 className="text-sm font-semibold text-ink-900">Rasmlar</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Kamida 5 ta rasm: old, orqa, yon, salon va mexanika qismi. Yuklash maydoni real
              tizim ulanganda ishga tushadi.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex aspect-square items-center justify-center rounded-lg border border-line bg-surface text-xs text-ink-300"
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ismingiz" htmlFor="sell-name" required>
              <TextInput id="sell-name" required placeholder="Ism va familiya" />
            </Field>
            <Field label="Telefon" htmlFor="sell-phone" required hint="Masalan: 90 123 45 67">
              <TextInput id="sell-phone" required inputMode="tel" placeholder="+998 __ ___ __ __" />
            </Field>
          </div>
        ) : null}

        {step === 4 ? (
          <>
            <Field label="Kutilayotgan narx" htmlFor="sell-price" required hint="Baholash menejer tomonidan tasdiqlanadi">
              <TextInput id="sell-price" required inputMode="numeric" placeholder="120 000 000" />
            </Field>
            <label className="flex items-start gap-3 text-xs leading-relaxed text-ink-500">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand-700 focus:ring-brand-500"
              />
              <span>
                Ma’lumotlar to‘g‘riligini tasdiqlayman va menejer bilan bog‘lanishga roziman.
              </span>
            </label>
            <div className="rounded-lg border border-line bg-surface-muted p-4 text-xs leading-relaxed text-ink-500">
              Komissiya, baholash mezonlari va javob muddati rasmiy tasdiqlangach shu yerda
              ko‘rsatiladi — hozircha ular e’lon qilinmagan.
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1}
        >
          Orqaga
        </Button>

        {step < steps.length ? (
          <Button onClick={() => setStep((current) => Math.min(steps.length, current + 1))}>
            Keyingi
          </Button>
        ) : (
          <Button onClick={() => setSubmitted(true)}>So‘rovni yuborish</Button>
        )}
      </div>
    </div>
  );
}
