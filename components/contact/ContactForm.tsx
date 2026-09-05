'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Field, TextInput, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { normalisePhone } from '@/lib/format/phoneFormat';
import { apiPost, ApiError } from '@/lib/client/api';

/**
 * Local validation — mirrors the server-side zod schema so field errors appear
 * instantly without a round-trip. Server validation is the source of truth;
 * we use server error messages when they come back.
 */
type FormValues = {
  name: string;
  phone: string;
  topic: string;
  message: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;
type Status =
  | 'idle'
  | 'submitting'
  | 'invalid'
  | 'submitted'
  | 'submit-error'
  | 'rate_limited';

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const name = values.name.trim();
  if (name.length < 2) {
    errors.name = 'Ism kamida 2 ta harfdan iborat bo‘lishi kerak.';
  } else if (name.length > 80) {
    errors.name = 'Ism juda uzun.';
  }

  const { digits } = normalisePhone(values.phone);
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

const TOPIC_OPTIONS: { value: string; apiValue: 'general' | 'sales' | 'financing' | 'service' | 'partnership'; label: string }[] = [
  { value: '', apiValue: 'general', label: 'Mavzuni tanlang' },
  { value: 'avtomobil', apiValue: 'sales', label: 'Avtomobil haqida' },
  { value: 'elektronika', apiValue: 'sales', label: 'Elektronika haqida' },
  { value: 'moliyalashtirish', apiValue: 'financing', label: 'Muddatli to‘lov / moliyalashtirish' },
  { value: 'sarmoya', apiValue: 'partnership', label: 'Sarmoya dasturi' },
  { value: 'umumiy', apiValue: 'general', label: 'Boshqa savol' },
];

export function ContactForm({
  initialMessage = '',
  initialTopic = '',
}: {
  initialMessage?: string;
  initialTopic?: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    topic: initialTopic && TOPIC_OPTIONS.some((o) => o.value === initialTopic) ? initialTopic : '',
    message: initialMessage,
  });
  const [phoneDisplay, setPhoneDisplay] = useState<string>(
    initialTopic ? '' : '',
  );

  function setPhone(raw: string) {
    const justDigits = raw.replace(/[^\d]/g, '');
    const { display } = normalisePhone(justDigits);
    setPhoneDisplay(display);
    setValues((v) => ({ ...v, phone: display }));
  }

  const nameId = 'cf-name';
  const phoneId = 'cf-phone';
  const topicId = 'cf-topic';
  const messageId = 'cf-message';

  function describedBy(field: keyof FormValues, id: string): string | undefined {
    return errors[field] ? `${id}-error` : undefined;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerMessage(null);
    const digits = normalisePhone(values.phone).digits;
    const nextErrors = validate({ ...values, phone: digits });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('invalid');
      const first = Object.keys(nextErrors)[0] as keyof FormValues | undefined;
      if (first) {
        const id = { name: nameId, phone: phoneId, topic: topicId, message: messageId }[first];
        const el = document.getElementById(id);
        el?.focus();
      }
      return;
    }

    const topicOption = TOPIC_OPTIONS.find((o) => o.value === values.topic);
    const payload = {
      name: values.name.trim(),
      phone: digits,
      topic: topicOption?.apiValue ?? 'general',
      message: values.message.trim(),
    };

    setStatus('submitting');
    try {
      await apiPost('/api/contact', payload);
      setStatus('submitted');
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 429) {
        setStatus('rate_limited');
        setServerMessage('Juda ko‘p so‘rov — bir necha daqiqadan keyin qayta urinib ko‘ring.');
      } else if (e.status === 400 && e.fields) {
        setStatus('invalid');
        setErrors(e.fields as FormErrors);
      } else {
        setStatus('submit-error');
        setServerMessage(e.message ?? 'Serverga ulanib bo‘lmadi. Keyinroq urinib ko‘ring.');
      }
    }
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
        <div className="flex items-stretch gap-0">
          <span
            aria-hidden="true"
            className="inline-flex select-none items-center rounded-l-btn border border-r-0 border-line bg-surface-sunken px-3 text-sm text-ink-500"
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
          {TOPIC_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
          className="min-h-[120px]"
        />
      </Field>

      {status === 'submitted' ? (
        <StateBlock
          compact
          variant="success"
          title="So‘rovingiz qabul qilindi"
          description="Menejerlarimiz ish vaqtida siz bilan bog‘lanishadi. Odatda javob 15 daqiqa ichida keladi."
        />
      ) : null}

      {status === 'submit-error' && serverMessage ? (
        <StateBlock compact variant="unavailable" title="Yuborib bo‘lmadi" description={serverMessage} />
      ) : null}

      {status === 'rate_limited' && serverMessage ? (
        <StateBlock compact variant="unavailable" title="Biroz kuting" description={serverMessage} />
      ) : null}

      <Button type="submit" size="lg" disabled={status === 'submitting' || status === 'submitted'}>
        {status === 'submitting' ? 'Yuborilmoqda…' : status === 'submitted' ? 'Yuborildi ✓' : 'Yuborish'}
      </Button>

      <p className="text-xs leading-relaxed text-ink-400">
        Ma’lumotlaringiz xavfsiz va maxfiy saqlanadi. Yuborish orqali{' '}
        <Link href="/privacy" className="text-brand-700 underline underline-offset-2">
          maxfiylik siyosati
        </Link>{' '}
        bilan tanishganingizni tasdiqlaysiz.
      </p>
    </form>
  );
}
