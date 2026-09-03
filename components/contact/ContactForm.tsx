'use client';

import { useId, useMemo, useState } from 'react';
import { Field, Select, Textarea, TextInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';

type FormValues = {
  name: string;
  phone: string;
  topic: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type Status = 'idle' | 'submitting' | 'invalid' | 'demo-blocked';

/**
 * Normalise the phone value so the +998 prefix is always present visually and
 * only digits are kept for validation. Accepts local formats (90 123 45 67),
 * +998 prefix, and 998 prefix.
 */
function normalisePhone(input: string): { digits: string; display: string } {
  // Strip everything except digits.
  const digits = input.replace(/[^\d]/g, '');

  // If the user typed a leading 998 (full country code), treat it as the code.
  // If they typed a leading 12-digit number that starts with 998, same.
  // If they typed 9 digits (local), treat as Uzbek subscriber number.
  // Otherwise preserve whatever they typed so they don't lose their place.
  if (digits.startsWith('998') && digits.length >= 12) {
    const sub = digits.slice(3, 12);
    return { digits: `998${sub}`, display: `+998 ${sub.slice(0, 2)} ${sub.slice(2, 5)} ${sub.slice(5, 7)} ${sub.slice(7, 9)}`.trim() };
  }
  if (digits.length <= 9) {
    const sub = digits.slice(0, 9);
    return {
      digits: sub.length === 9 ? `998${sub}` : sub,
      display: sub ? `+998 ${sub.slice(0, 2)} ${sub.slice(2, 5)} ${sub.slice(5, 7)} ${sub.slice(7, 9)}`.trim() : '+998 ',
    };
  }
  return { digits, display: input };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const name = values.name.trim();
  if (name.length < 2) {
    errors.name = 'Ism kamida 2 ta harfdan iborat bo‘lishi kerak.';
  } else if (name.length > 80) {
    errors.name = 'Ism juda uzun.';
  }

  const { digits } = normalisePhone(values.phone);
  // Valid Uzbekistan mobile: 12 digits starting with 998, subscriber portion
  // starting with 9 (90/91/93/94/95/97/98/99/88 etc. are all common; we do not
  // over-validate specific prefixes).
  if (!/^998\d{9}$/.test(digits)) {
    errors.phone = 'Telefon raqami +998 bilan boshlanib, 9 ta raqamdan iborat bo‘lishi kerak.';
  }

  const message = values.message.trim();
  if (message.length < 10) {
    errors.message = 'Xabar kamida 10 ta belgidan iborat bo‘lsin.';
  } else if (message.length > 2000) {
    errors.message = 'Xabar juda uzun (2000 belgidan kam bo‘lsin).';
  }

  return errors;
}

const TOPIC_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Mavzuni tanlang' },
  { value: 'avtomobil', label: 'Avtomobil haqida' },
  { value: 'elektronika', label: 'Elektronika haqida' },
  { value: 'moliyalashtirish', label: 'Muddatli to‘lov / moliyalashtirish' },
  { value: 'sarmoya', label: 'Sarmoya dasturi' },
  { value: 'umumiy', label: 'Boshqa savol' },
];

/**
 * Contact form — UI complete, backend pending.
 *
 * There is NO verified contact-submission endpoint at this time. Submitting the
 * form therefore renders an explicit "backend ulanmagan" state and NEVER
 * pretends the message was delivered. All validation is local so the user can
 * complete fields confidently; values are preserved on validation failure.
 *
 * Phone input uses a visible +998 prefix and inputMode="tel" so mobile
 * keyboards are numeric. We format as the user types but do not aggressively
 * mask — invalid numbers produce a clear field-level error instead.
 */
export function ContactForm({
  initialMessage = '',
  initialTopic = '',
}: {
  initialMessage?: string;
  initialTopic?: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: initialTopic ? '' : '',
    topic: initialTopic && TOPIC_OPTIONS.some((o) => o.value === initialTopic) ? initialTopic : '',
    message: initialMessage,
  });
  const [phoneDisplay, setPhoneDisplay] = useState<string>(
    initialMessage ? '' : '+998 ',
  );

  const nameId = useId();
  const phoneId = useId();
  const topicId = useId();
  const messageId = useId();

  const describedBy = useMemo(() => {
    return (field: keyof FormValues, baseId: string): string | undefined => {
      const ids: string[] = [];
      if (errors[field]) ids.push(`${baseId}-error`);
      return ids.length ? ids.join(' ') : undefined;
    };
  }, [errors]);

  function setPhone(raw: string) {
    // Allow the user to backspace past the prefix by detecting when the
    // content has been erased and resetting to the empty prefix state.
    const justDigits = raw.replace(/[^\d]/g, '');
    const { display } = normalisePhone(justDigits);
    setPhoneDisplay(display);
    setValues((v) => ({ ...v, phone: display }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate({ ...values, phone: normalisePhone(values.phone).digits });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('invalid');
      // Move focus to the first invalid field for keyboard/AT users.
      const first = Object.keys(nextErrors)[0] as keyof FormValues | undefined;
      if (first) {
        const id = { name: nameId, phone: phoneId, topic: topicId, message: messageId }[first];
        const el = document.getElementById(id);
        el?.focus();
      }
      return;
    }

    setStatus('submitting');
    // There is no backend endpoint. Simulate the round-trip briefly so the
    // button press is acknowledged, then render the honest pending state.
    window.setTimeout(() => setStatus('demo-blocked'), 600);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={status === 'invalid' ? 'contact-form-errors' : undefined}
    >
      <Field label="Ismingiz" htmlFor={nameId} required error={errors.name}>
        <TextInput
          id={nameId}
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name', nameId)}
          value={values.name}
          onChange={(event) => {
            setValues({ ...values, name: event.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          placeholder="Ism va familiya"
          maxLength={80}
        />
      </Field>

      <Field
        label="Telefon raqamingiz"
        htmlFor={phoneId}
        required
        hint="Masalan: 90 123 45 67"
        error={errors.phone}
      >
        {/* The +998 prefix is visible but non-editable in the same control
            (prepended text inside the field). This keeps the keyboard in tel
            mode on mobile and avoids an extra non-focusable element. */}
        <div className="flex items-stretch gap-0">
          <span
            aria-hidden="true"
            className="inline-flex select-none items-center rounded-l-lg border border-r-0 border-line-strong bg-surface-sunken px-3 text-sm text-ink-500"
          >
            +998
          </span>
          <TextInput
            id={phoneId}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy('phone', phoneId)}
            className="rounded-l-none"
            value={phoneDisplay.replace(/^\+998\s?/, '')}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="90 123 45 67"
          />
        </div>
      </Field>

      <Field label="Mavzu" htmlFor={topicId}>
        <Select
          id={topicId}
          name="topic"
          value={values.topic}
          onChange={(event) => setValues({ ...values, topic: event.target.value })}
        >
          {TOPIC_OPTIONS.map((opt) => (
            <option key={opt.value || 'empty'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Xabaringiz" htmlFor={messageId} required error={errors.message}>
        <Textarea
          id={messageId}
          name="message"
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message', messageId)}
          value={values.message}
          onChange={(event) => {
            setValues({ ...values, message: event.target.value });
            if (errors.message) setErrors({ ...errors, message: undefined });
          }}
          placeholder="Savolingizni qisqacha yozing"
          maxLength={2000}
        />
      </Field>

      {status === 'demo-blocked' ? (
        <StateBlock
          compact
          variant="unavailable"
          title="So‘rov yuborilmadi — rasmiy aloqa kanali ulanmagan"
          description="Hozircha formani to‘g‘ridan-to‘g‘ri yuboradigan backend ulanmagan. Telefon va email rasman tasdiqlangach, shu interfeys orqali to‘g‘ridan-to‘g‘ri yuborish imkoniyati qo‘shiladi. Ma’lumotlaringiz brauzeringizdan tashqariga jo‘natilmadi."
        />
      ) : null}

      <Button type="submit" size="lg" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Yuborilmoqda…' : 'Yuborish'}
      </Button>

      <p className="text-xs leading-relaxed text-ink-400">
        Ma’lumotlaringiz xavfsiz va maxfiy saqlanadi. Yuborish orqali{' '}
        <a href="/privacy" className="text-brand-700 underline underline-offset-2">
          maxfiylik siyosati
        </a>{' '}
        bilan tanishganingizni tasdiqlaysiz.
      </p>
    </form>
  );
}
