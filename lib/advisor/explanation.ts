import type { AdvisorMatch, AdvisorPreferences } from './types';

/**
 * Explanation provider seam.
 *
 * Today every explanation is produced by the deterministic engine from fields
 * it actually verified. This module exists so a real language model can be
 * added later WITHOUT the UI changing and WITHOUT the prototype ever claiming
 * to have one:
 *
 *   Advisor UI → advisor service → recommendation engine → explanation provider
 *
 * `unavailableAiProvider` returns null on purpose. A missing provider must
 * degrade to rule-based reasons, never to a fabricated "AI says…" paragraph.
 */

export interface ExplanationProvider {
  readonly id: string;
  readonly kind: 'deterministic' | 'ai';
  /**
   * A sentence explaining the match, or null when no provider can honestly
   * produce one. Null means the UI shows the engine's rule-based reasons only.
   */
  explain(match: AdvisorMatch, prefs: AdvisorPreferences): Promise<string | null>;
}

/**
 * Joins verified clauses into one Uzbek sentence.
 *
 *   ['Byudjetingizga mos', 'Avtomat uzatma', 'Benzin']
 *   → "Byudjetingizga mos, Avtomat uzatma va Benzin."
 *
 * Used by the deterministic provider and by the UI, so the sentence a visitor
 * reads is always the same text the provider would return.
 */
export function joinReasons(reasons: string[]): string | null {
  if (reasons.length === 0) return null;
  if (reasons.length === 1) return `${reasons[0]}.`;
  return `${reasons.slice(0, -1).join(', ')} va ${reasons[reasons.length - 1]}.`;
}

/** Joins the requirements a nearest alternative failed. */
export function joinUnmet(unmet: string[]): string | null {
  if (unmet.length === 0) return null;
  if (unmet.length === 1) return `${unmet[0]} talabiga mos kelmadi`;
  return `${unmet.slice(0, -1).join(', ')} va ${unmet[unmet.length - 1]} talablariga mos kelmadi`;
}

/** Joins verified clauses into one Uzbek sentence. */
export const deterministicProvider: ExplanationProvider = {
  id: 'deterministic',
  kind: 'deterministic',
  async explain(match) {
    return joinReasons(match.reasons);
  },
};

/**
 * Placeholder for a future verified AI provider.
 *
 * It answers null for everything. It does not simulate a remote model, does
 * not generate text and does not stream — returning nothing is the honest
 * behaviour when nothing is connected.
 */
export const unavailableAiProvider: ExplanationProvider = {
  id: 'ai-unavailable',
  kind: 'ai',
  async explain() {
    return null;
  },
};

/**
 * Provider selection is environment-driven, exactly like the data adapter.
 * `MARKAB_ADVISOR_EXPLAINER=ai` would pick the AI path; until a verified
 * provider exists it resolves to `unavailableAiProvider`, which yields nothing
 * rather than inventing something.
 */
export function getExplanationProvider(): ExplanationProvider {
  const configured = process.env.MARKAB_ADVISOR_EXPLAINER;
  return configured === 'ai' ? unavailableAiProvider : deterministicProvider;
}

/** True when no language model is connected — drives the honest disclosure. */
export function isRuleBasedOnly(): boolean {
  return getExplanationProvider().kind !== 'ai';
}

export const ADVISOR_DISCLOSURE =
  'Hozirgi prototip mavjud katalog ma’lumotlari va qoidalar asosida tavsiya beradi. AI modeli integratsiyasi keyingi bosqichda ulanishi mumkin.';
