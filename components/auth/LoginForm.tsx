'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Field, TextInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { useAuth } from '@/components/auth/AuthProvider';
import { AUTH_UNAVAILABLE_MESSAGE } from '@/lib/auth/service';

type Step = 'phone' | 'code';
type SubmitState = 'idle' | 'sending' | 'verifying';

/**
 * Login — interface complete, authentication pending.
 *
 * Production authenticates with a phone number + SMS code. This prototype has
 * no auth provider, so:
 *
 *   ✗ no OTP code is generated, displayed or accepted;
 *   ✗ no session is created;
 *   ✗ no "Kirish muvaffaqiyatli" / "Xush kelibsiz" success state exists;
 *   ✗ no demo-sign-in button, because a button that logs you in is exactly the
 *     fake authentication this flow must not perform.
 *
 * Submitting the phone number asks the service for a code and renders whatever
 * the service actually said. Today that is always `unavailable`, and the page
 * shows `Kirish tizimi rasmiy autentifikatsiya xizmati bilan integratsiya
 * qilinmoqda.` verbatim.
 */

/** Uzbek mobile numbers: 9 digits after +998, written with or without the prefix. */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '').replace(/^998/, '');
  return digits.length === 9 ? `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}` : null;
}

export function LoginForm() {
  const { requestOtp, verifyOtp, state } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  /** The service's own answer — rendered verbatim, never rewritten. */
  const [outcome, setOutcome] = useState<{ title: string; reason: string } | null>(null);

  const serviceUnavailable = state.status === 'unavailable';

  async function handlePhoneSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalised = normalisePhone(phone);
    if (!normalised) {
      setPhoneError('Telefon raqamini to‘liq kiriting: 9 xonali raqam yoki +998 bilan.');
      return;
    }
    setPhoneError(null);
    setSubmitState('sending');
    const result = await requestOtp(normalised);
    setSubmitState('idle');

    if (result.status === 'sent') {
      setStep('code');
      setOutcome(null);
      return;
    }
    // Everything else is shown as-is. `unavailable` is the only outcome the
    // current service can produce, and it must read as pending, not as failure.
    setOutcome({
      title:
        result.status === 'unavailable'
          ? 'Tasdiqlash kodi yuborilmadi'
          : result.status === 'invalid_phone'
            ? 'Telefon raqami noto‘g‘ri'
            : 'Kod yuborishda xatolik',
      reason: result.reason,
    });
  }

  async function handleCodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitState('verifying');
    const result = await verifyOtp(phone, code);
    setSubmitState('idle');
    if (result.status === 'authenticated') return; // handled by the provider
    setOutcome({
      title: result.status === 'invalid_code' ? 'Kod noto‘g‘ri' : 'Kirish yakunlanmadi',
      reason: result.reason,
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="text-xl font-semibold text-ink-900">Kirish</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Telefon raqamingizni kiriting — tasdiqlash kodi SMS orqali yuboriladi.
      </p>

      <ol className="mt-6 flex items-center gap-2" aria-label="Kirish bosqichlari">
        {[
          { id: 'phone', label: 'Telefon' },
          { id: 'code', label: 'Tasdiqlash' },
        ].map((item, index) => {
          const active = step === item.id;
          const done = step === 'code' && index === 0;
          return (
            <li key={item.id} className="flex flex-1 items-center gap-2">
              <span
                className={[
                  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  active || done ? 'bg-brand-700 text-white' : 'bg-surface-sunken text-ink-400',
                ].join(' ')}
              >
                {index + 1}
              </span>
              <span className={`text-xs ${active ? 'text-ink-800' : 'text-ink-400'}`}>
                {item.label}
              </span>
              <span
                className={['h-px flex-1 transition-colors', done ? 'bg-brand-600' : 'bg-line'].join(' ')}
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>

      {step === 'phone' ? (
        <form className="mt-6 flex flex-col gap-4" onSubmit={handlePhoneSubmit} noValidate>
          <Field
            label="Telefon raqami"
            htmlFor="login-phone"
            required
            hint="Masalan: 90 123 45 67"
            error={phoneError ?? undefined}
          >
            <TextInput
              id="login-phone"
              required
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+998 __ ___ __ __"
              aria-invalid={phoneError ? true : undefined}
              aria-describedby={phoneError ? 'login-phone-error' : 'login-phone-hint'}
            />
          </Field>

          <label className="flex items-start gap-3 text-xs leading-relaxed text-ink-500">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line-strong text-brand-700 focus:ring-brand-500"
            />
            <span>
              Davom etish orqali siz{' '}
              <Link href="/terms" className="text-brand-700 underline underline-offset-2">
                Foydalanish shartlari
              </Link>{' '}
              va{' '}
              <Link href="/privacy" className="text-brand-700 underline underline-offset-2">
                Maxfiylik siyosati
              </Link>{' '}
              ga rozilik bildirasiz.
            </span>
          </label>

          <Button type="submit" size="lg" disabled={!consent || submitState === 'sending'}>
            {submitState === 'sending' ? 'Tekshirilmoqda…' : 'Kodni olish'}
          </Button>

          {outcome ? (
            <StateBlock
              compact
              variant={serviceUnavailable ? 'unavailable' : 'error'}
              title={outcome.title}
              description={outcome.reason}
            />
          ) : null}

          {serviceUnavailable ? (
            <div className="rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-3">
              <p className="text-sm font-medium text-ink-700">{AUTH_UNAVAILABLE_MESSAGE}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
                Shu sababli bu sahifada hech qanday tasdiqlash kodi ko‘rsatilmaydi va hisob
                ochilmaydi. Real xizmat ulanganda aynan shu oqim ishlaydi — faqat kod haqiqiy
                bo‘ladi.
              </p>
            </div>
          ) : null}

          <p className="text-xs leading-relaxed text-ink-400">
            Eslatma: asl saytda ushbu rozilik matni yuklanmaydigan hujjatga olib borardi. Prototipda
            ikkala hujjat ham ochiladi.
          </p>
        </form>
      ) : (
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleCodeSubmit} noValidate>
          <Field label="Tasdiqlash kodi" htmlFor="login-code" required hint="6 xonali SMS kod">
            <TextInput
              id="login-code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="______"
              className="tracking-[0.4em]"
            />
          </Field>

          <Button type="submit" size="lg" disabled={submitState === 'verifying' || code.length < 4}>
            {submitState === 'verifying' ? 'Tekshirilmoqda…' : 'Tasdiqlash'}
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={() => { setStep('phone'); setOutcome(null); }}>
            Raqamni o‘zgartirish
          </Button>
        </form>
      )}
    </div>
  );
}
