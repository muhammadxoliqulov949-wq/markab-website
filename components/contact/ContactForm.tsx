'use client';

import { useState } from 'react';
import { Field, Select, Textarea, TextInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';

type Status = 'idle' | 'submitting' | 'demo-blocked';

/**
 * Contact form — UI complete, backend pending.
 *
 * There is no endpoint in the prototype, so submitting does NOT fake a success
 * message: it renders an explicit "backend ulanmagan" state. This mirrors the
 * requirement that every data-driven area has a real state for every outcome.
 */
export function ContactForm({
  initialMessage = '',
  initialTopic = '',
}: {
  /** Pre-filled when the visitor arrives from a product's availability action. */
  initialMessage?: string;
  initialTopic?: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [values, setValues] = useState({
    name: '',
    phone: '',
    topic: initialTopic,
    message: initialMessage,
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setStatus('submitting');
        window.setTimeout(() => setStatus('demo-blocked'), 600);
      }}
    >
      <Field label="Ismingiz" htmlFor="contact-name" required>
        <TextInput
          id="contact-name"
          required
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          placeholder="Ism va familiya"
        />
      </Field>

      <Field label="Telefon raqamingiz" htmlFor="contact-phone" required hint="Masalan: 90 123 45 67">
        <TextInput
          id="contact-phone"
          required
          inputMode="tel"
          value={values.phone}
          onChange={(event) => setValues({ ...values, phone: event.target.value })}
          placeholder="+998 __ ___ __ __"
        />
      </Field>

      <Field label="Mahsulot turi" htmlFor="contact-topic">
        <Select
          id="contact-topic"
          value={values.topic}
          onChange={(event) => setValues({ ...values, topic: event.target.value })}
        >
          <option value="">Mahsulot turini tanlang</option>
          <option value="avtomobil">Avtomobil</option>
          <option value="elektronika">Elektronika</option>
          <option value="umumiy">Umumiy savol</option>
          <option value="sarmoya">Sarmoya</option>
        </Select>
      </Field>

      <Field label="Xabaringiz" htmlFor="contact-message" required>
        <Textarea
          id="contact-message"
          required
          value={values.message}
          onChange={(event) => setValues({ ...values, message: event.target.value })}
          placeholder="Qisqacha yozing"
        />
      </Field>

      {status === 'demo-blocked' ? (
        <StateBlock
          compact
          variant="unavailable"
          title="So‘rov yuborilmadi — prototip holati"
          description="Real backend ulanmagani uchun forma ma’lumotlari yuborilmadi. Server ulangandan so‘ng shu interfeys orqali so‘rovlar qabul qilinadi."
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
