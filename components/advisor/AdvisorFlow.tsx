'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { AdvisorResultCard } from './AdvisorResultCard';
import { CompareTray } from './CompareTray';
import { advise } from '@/lib/advisor/engine';
import { joinUnmet } from '@/lib/advisor/explanation';
import { buildCarQuestions, buildElectronicsQuestions, type AdvisorQuestion } from '@/lib/advisor/questions';
import {
  EMPTY_CAR_PREFERENCES,
  EMPTY_ELECTRONICS_PREFERENCES,
  type AdvisorCategory,
  type AdvisorPreferences,
  type CarPreferences,
  type ElectronicsPreferences,
} from '@/lib/advisor/types';
import { formatUzs } from '@/lib/format';
import type { Product, ProductFacets, Vehicle, VehicleFacets } from '@/lib/data/types';

export type CategoryState = {
  status: 'success' | 'empty' | 'unavailable' | 'error';
  message?: string;
};

const COMPARE_LIMIT = 3;

const STEP_LABELS = ['Toifa', 'Savollar', 'Natijalar'] as const;

/**
 * Guided product advisor.
 *
 * Structured questions, not a chat window: the flow is category → a short
 * list of real questions → explained results. There is no typing indicator,
 * no avatar and no simulated delay, because there is no model behind it.
 */
export function AdvisorFlow({
  vehicles,
  products,
  carFacets,
  productFacets,
  carState,
  productState,
}: {
  vehicles: Vehicle[];
  products: Product[];
  carFacets: VehicleFacets | null;
  productFacets: ProductFacets | null;
  carState: CategoryState;
  productState: CategoryState;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [category, setCategory] = useState<AdvisorCategory | null>(null);
  const [carPrefs, setCarPrefs] = useState<CarPreferences>(EMPTY_CAR_PREFERENCES);
  const [electronicsPrefs, setElectronicsPrefs] = useState<ElectronicsPreferences>(
    EMPTY_ELECTRONICS_PREFERENCES,
  );
  const [compare, setCompare] = useState<string[]>([]);

  const questions: AdvisorQuestion[] = useMemo(
    () => (category === 'car' ? buildCarQuestions(carFacets) : buildElectronicsQuestions(productFacets)),
    [category, carFacets, productFacets],
  );

  const prefs: AdvisorPreferences | null = useMemo(() => {
    if (!category) return null;
    return category === 'car'
      ? { category: 'car', car: carPrefs }
      : { category: 'electronics', electronics: electronicsPrefs };
  }, [category, carPrefs, electronicsPrefs]);

  const result = useMemo(
    () => (prefs ? advise(prefs, { vehicles, products }) : null),
    [prefs, vehicles, products],
  );

  const compareMatches = useMemo(() => {
    if (!result) return [];
    const all = [...result.exact, ...result.nearest];
    return compare
      .map((id) => all.find((match) => match.id === id))
      .filter((match): match is NonNullable<typeof match> => Boolean(match));
  }, [compare, result]);

  function restart() {
    setStep(0);
    setCategory(null);
    setCarPrefs(EMPTY_CAR_PREFERENCES);
    setElectronicsPrefs(EMPTY_ELECTRONICS_PREFERENCES);
    setCompare([]);
  }

  function toggleCompare(id: string) {
    setCompare((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= COMPARE_LIMIT) return current;
      return [...current, id];
    });
  }

  function setCarValue(id: string, value: string | number | boolean | null) {
    setCarPrefs((current) => ({ ...current, [id]: value }) as CarPreferences);
  }

  function setElectronicsValue(id: string, value: string | number | boolean | null) {
    setElectronicsPrefs((current) => ({ ...current, [id]: value }) as ElectronicsPreferences);
  }

  function valueFor(id: string): string | number | boolean | null {
    const source: object = category === 'car' ? carPrefs : electronicsPrefs;
    const value = (source as Record<string, string | number | boolean | null>)[id];
    return value ?? null;
  }

  function setValue(id: string, value: string | number | boolean | null) {
    if (category === 'car') setCarValue(id, value);
    else setElectronicsValue(id, value);
  }

  const stateFor = (target: AdvisorCategory) => (target === 'car' ? carState : productState);

  return (
    <div className="space-y-6">
      {/* Progress. The honest-labelling disclosure is rendered by the page so
          it stays visible in every state, including "catalogue unavailable". */}
      <nav aria-label="Yordamchi bosqichlari">
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          {STEP_LABELS.map((label, index) => {
            const active = step === index;
            const done = step > index;
            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  aria-current={active ? 'step' : undefined}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium',
                    active
                      ? 'border-brand-200 bg-brand-50 text-brand-800'
                      : done
                        ? 'border-line bg-surface text-ink-700'
                        : 'border-line bg-surface text-ink-400',
                  ].join(' ')}
                >
                  <span aria-hidden="true">{index + 1}</span>
                  {label}
                </span>
                {index < STEP_LABELS.length - 1 ? (
                  // ink-500 not ink-300: the arrow is aria-hidden but still read
                  // as a step separator, and ink-300 failed 4.5:1 on white.
                  <span aria-hidden="true" className="text-ink-500">
                    →
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ---------- step 1: category ---------- */}
      {step === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(['car', 'electronics'] as AdvisorCategory[]).map((target) => {
            const state = stateFor(target);
            const disabled = state.status !== 'success';
            const count = target === 'car' ? vehicles.length : products.length;
            return (
              <button
                key={target}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setCategory(target);
                  setStep(1);
                }}
                aria-pressed={category === target}
                className={[
                  'rounded-xl border bg-surface p-5 text-left transition-all',
                  disabled
                    ? 'cursor-not-allowed border-line opacity-60'
                    : 'border-line-strong hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-ink-900">
                    {target === 'car' ? 'Avtomobil' : 'Elektronika'}
                  </h2>
                  {state.status === 'success' ? (
                    <Badge tone="neutral">{count} ta e’lon</Badge>
                  ) : (
                    <Badge tone="pending">
                      {state.status === 'unavailable' ? 'Ulanish kutilmoqda' : 'Ma’lumot yo‘q'}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {target === 'car'
                    ? 'Byudjet, brend, yoqilg‘i turi, uzatma va yil bo‘yicha saralash.'
                    : 'Byudjet, toifa, xotira, batareya holati va mavjudlik bo‘yicha saralash.'}
                </p>
                {state.message ? (
                  <p className="mt-2 text-xs leading-relaxed text-ink-400">{state.message}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* ---------- step 2: questions ---------- */}
      {step === 1 && category ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold text-ink-900">
              {category === 'car' ? 'Avtomobil tanlovi' : 'Elektronika tanlovi'}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              Har bir javob qat’iy talab sifatida qo‘llaniladi: mos kelmagan e’lon yashirincha
              qo‘shilmaydi. Javob bermasangiz, u mezon hisobga olinmaydi.
            </p>

            <div className="mt-5 space-y-6">
              {questions.map((question) => (
                <QuestionControl
                  key={question.id}
                  question={question}
                  value={valueFor(question.id)}
                  onChange={(next) => setValue(question.id, next)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setStep(2)}>Natijalarni ko‘rish</Button>
            <Button variant="secondary" onClick={() => setStep(0)}>
              Toifani o‘zgartirish
            </Button>
            <Button variant="ghost" onClick={restart}>
              Boshidan boshlash
            </Button>
          </div>
        </div>
      ) : null}

      {/* ---------- step 3: results ---------- */}
      {step === 2 && category && result ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink-900">
                  {result.exact.length > 0
                    ? `${result.exact.length} ta mos e’lon`
                    : 'Aniq mos variant topilmadi'}
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  {result.totalConsidered} ta e’lon tekshirildi
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                  Tanlovni o‘zgartirish
                </Button>
                <Button variant="ghost" size="sm" onClick={restart}>
                  Boshidan boshlash
                </Button>
              </div>
            </div>

            <AnsweredSummary
              questions={questions}
              valueFor={valueFor}
              onClear={(id) => setValue(id, null)}
            />
          </div>

          {result.status !== 'success' ? (
            <StateBlock
              variant="unavailable"
              title="Katalog ma’lumotlari mavjud emas"
              description="Tanlov yordamchisi katalog bo‘yicha ishlaydi. Katalog ulanmagani uchun hozir javob bera olmaydi."
            />
          ) : result.exact.length === 0 ? (
            <NoMatchBlock result={result} onRefine={() => setStep(1)} />
          ) : (
            <>
              {result.note ? (
                <p className="text-xs leading-relaxed text-ink-400">{result.note}</p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.exact.map((match) => (
                  <AdvisorResultCard
                    key={match.id}
                    match={match}
                    compareSelected={compare.includes(match.id)}
                    compareDisabled={compare.length >= COMPARE_LIMIT}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            </>
          )}

          {result.exact.length === 0 && result.nearest.length > 0 ? (
            <>
              <h2 className="text-base font-semibold text-ink-900">Eng yaqin variantlar</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.nearest.map((match) => (
                  <AdvisorResultCard
                    key={match.id}
                    match={match}
                    compareSelected={compare.includes(match.id)}
                    compareDisabled={compare.length >= COMPARE_LIMIT}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            </>
          ) : null}

          <CompareTray
            matches={compareMatches}
            onRemove={(id) => setCompare((current) => current.filter((value) => value !== id))}
            onClear={() => setCompare([])}
          />

          {/* Financial safety: link to the official calculator, never a claim. */}
          <div className="rounded-xl border border-line bg-surface-muted px-4 py-4">
            <h2 className="text-sm font-semibold text-ink-900">Moliyalashtirish</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
              Yordamchi moliyalashtirish bo‘yicha hisob-kitob qilmaydi, imkoniyat baholamaydi va
              tasdiqlash va’da bermaydi. Rasmiy hisoblash formulasi va shartlar kalkulyatorda
              ko‘rsatiladi.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href="/financing/calculator" variant="secondary" size="sm">
                To‘lov kalkulyatori
              </ButtonLink>
              <ButtonLink href="/financing" variant="ghost" size="sm">
                Moliyalashtirish shartlari
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Question controls                                                   */
/* ------------------------------------------------------------------ */

function QuestionControl({
  question,
  value,
  onChange,
}: {
  question: AdvisorQuestion;
  value: string | number | boolean | null;
  onChange: (next: string | number | boolean | null) => void;
}) {
  const raw = value === null || value === undefined || value === false ? '' : String(value);

  if (question.kind === 'budget') {
    const digits = raw.replace(/\D/g, '');
    const amount = digits ? Number(digits) : null;
    return (
      <div>
        <label htmlFor={`q-${question.id}`} className="text-sm font-medium text-ink-700">
          {question.label}
        </label>
        <input
          id={`q-${question.id}`}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Masalan: 150000000"
          value={digits}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, '');
            onChange(next === '' ? null : Number(next));
          }}
          className="mt-2 w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {question.hint ? (
          <p className="mt-1.5 text-xs text-ink-400">{question.hint}</p>
        ) : null}
        {amount !== null ? (
          <p className="mt-1 text-xs font-medium text-ink-600">
            {formatUzs(amount)} gacha ko‘rsatiladi
          </p>
        ) : (
          <p className="mt-1 text-xs text-ink-400">Javob bermasangiz, byudjet cheklanmaydi.</p>
        )}
      </div>
    );
  }

  if (question.kind === 'toggle') {
    const on = value === true;
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-700">{question.label}</p>
          {question.hint ? <p className="mt-1 text-xs text-ink-400">{question.hint}</p> : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onChange(!on)}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
            on ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-surface-sunken',
          ].join(' ')}
        >
          <span className="sr-only">{question.label}</span>
          <span
            aria-hidden="true"
            className={[
              'inline-block h-4 w-4 rounded-full bg-white transition-transform',
              on ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
      </div>
    );
  }

  if (question.kind === 'select') {
    return (
      <div>
        <label htmlFor={`q-${question.id}`} className="text-sm font-medium text-ink-700">
          {question.label}
        </label>
        <select
          id={`q-${question.id}`}
          value={raw}
          onChange={(event) => onChange(event.target.value === '' ? null : event.target.value)}
          className="mt-2 w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Farqi yo‘q</option>
          {question.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>
        {question.hint ? <p className="mt-1.5 text-xs text-ink-400">{question.hint}</p> : null}
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-700">{question.label}</legend>
      {question.hint ? <p className="mt-1 text-xs text-ink-400">{question.hint}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <Chip selected={raw === ''} onClick={() => onChange(null)} count={null}>
          Farqi yo‘q
        </Chip>
        {question.options.map((option) => (
          <Chip
            key={option.value}
            selected={raw === option.value}
            onClick={() => onChange(option.value)}
            count={option.count}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

function Chip({
  children,
  selected,
  onClick,
  count,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  count: number | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
        selected
          ? 'border-brand-600 bg-brand-50 text-brand-800'
          : 'border-line bg-surface text-ink-700 hover:border-line-strong hover:bg-surface-muted',
      ].join(' ')}
    >
      {children}
      {count !== null ? (
        <span className="text-xs font-normal text-ink-400">{count}</span>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Results helpers                                                     */
/* ------------------------------------------------------------------ */

function AnsweredSummary({
  questions,
  valueFor,
  onClear,
}: {
  questions: AdvisorQuestion[];
  valueFor: (id: string) => string | number | boolean | null;
  onClear: (id: string) => void;
}) {
  const answered = questions.filter((question) => {
    const value = valueFor(question.id);
    return value !== null && value !== undefined && value !== false && value !== '';
  });

  if (answered.length === 0) {
    return (
      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Hech qanday talab tanlanmadi — e’lonlar katalog tartibida ko‘rsatiladi.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-ink-500">Talablar:</span>
      {answered.map((question) => {
        const value = valueFor(question.id);
        const option = question.options.find((o) => o.value === String(value));
        const label =
          question.kind === 'budget'
            ? `${formatUzs(Number(value))} gacha`
            : question.kind === 'toggle'
              ? question.label
              : (option?.label ?? String(value));
        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onClear(question.id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-muted px-2.5 py-1 text-xs text-ink-700 transition-colors hover:border-line-strong hover:bg-surface"
          >
            {label}
            <span aria-hidden="true" className="text-ink-400">
              ×
            </span>
            <span className="sr-only">Talabni olib tashlash</span>
          </button>
        );
      })}
    </div>
  );
}

function NoMatchBlock({
  result,
  onRefine,
}: {
  result: { blockers: { label: string; count: number }[] };
  onRefine: () => void;
}) {
  return (
    <StateBlock
      variant="empty"
      title="Aniq mos variant topilmadi."
      description="Talablaringizning barchasiga bir vaqtda mos keladigan e’lon katalogda yo‘q. Talablar yashirincha yumshatilmadi — quyida qaysi talab to‘sqinlik qilgani ko‘rsatilgan."
      actions={
        <Button variant="secondary" size="sm" onClick={onRefine}>
          Tanlovni o‘zgartirish
        </Button>
      }
    >
      {result.blockers.length > 0 ? (
        <ul className="mt-4 w-full max-w-md space-y-1.5 text-left text-xs text-ink-600">
          {result.blockers.slice(0, 4).map((blocker) => (
            <li key={blocker.label} className="flex items-center justify-between gap-3">
              <span>{joinUnmet([blocker.label])}</span>
              <span className="text-ink-400">{blocker.count} ta e’lon</span>
            </li>
          ))}
        </ul>
      ) : null}
    </StateBlock>
  );
}
