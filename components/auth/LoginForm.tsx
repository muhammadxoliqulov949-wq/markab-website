'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, TextInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { useAuth } from '@/components/auth/AuthProvider';

type Step = 'phone' | 'code';

/**
 * Login — UI complete, backend pending.
 *
 * Production authenticates with a phone number + SMS code. This prototype has no
 * backend, so the OTP step explicitly says the code is not sent, and offers a
 * clearly-labelled demo sign-in. No fake "code sent" success state.
 */
export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false);

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

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (step === 'phone') setStep('code');
        }}
      >
        {step === 'phone' ? (
          <>
            <Field label="Telefon raqami" htmlFor="login-phone" required hint="Masalan: 90 123 45 67">
              <TextInput
                id="login-phone"
                required
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+998 __ ___ __ __"
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
                <a href="/terms" className="text-brand-700 underline underline-offset-2">
                  Foydalanish shartlari
                </a>{' '}
                va{' '}
                <a href="/privacy" className="text-brand-700 underline underline-offset-2">
                  Maxfiylik siyosati
                </a>{' '}
                ga rozilik bildirasiz.
              </span>
            </label>

            <Button type="submit" size="lg" disabled={!consent || phone.trim().length < 5}>
              Kodni olish
            </Button>
            <p className="text-xs text-ink-400">
              Eslatma: asl saytda ushbu rozilik matni yuklanmaydigan hujjatga olib borardi.
              Prototipda ikkala hujjat ham ochiladi.
            </p>
          </>
        ) : (
          <>
            <Field label="Tasdiqlash kodi" htmlFor="login-code" required hint="6 xonali SMS kod">
              <TextInput
                id="login-code"
                required
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="______"
                className="tracking-[0.4em]"
              />
            </Field>

            <StateBlock
              compact
              variant="unavailable"
              title="SMS kod yuborilmadi"
              description="Prototipda SMS provayderi ulanmagan. Real tizim ulanganda kod shu raqamga yuboriladi."
            />

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  signIn(phone || '+998 90 000 00 00');
                  router.push('/profile');
                }}
              >
                Demo rejimida kirish
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep('phone')}>
                Raqamni o‘zgartirish
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
