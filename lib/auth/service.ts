/**
 * Authentication service contract.
 *
 * Markab's production flow is phone + SMS code (OTP). The interface is
 * deliberately narrow: `getSession`, `requestOtp`, `verifyOtp`, `signOut`.
 * The UI consumes this contract exclusively — adding a real provider (Twilio,
 * Eskiz, Play Mobile, etc.) requires a new implementation, no component
 * changes.
 *
 * Two implementations exist today:
 *   • `unavailableAuthService` — honest no-op (used in SSR / when the backend
 *     returns sms_unavailable / for tests).
 *   • `httpAuthService` (in ./http-service.ts) — talks to /api/auth/*.
 */

export type AuthSession = {
  /** Stable user id. Opaque string (uuid). */
  id: string;
  /** E.164-ish display form, e.g. "+998 90 123 45 67". */
  phone: string;
  /** Null until the backend supplies a name. Never guessed. */
  displayName: string | null;
  /** Optional bookkeeping the client may hydrate alongside auth. */
  saved?: unknown[];
  drafts?: unknown[];
  applications?: unknown[];
};

export type OtpRequestResult =
  | { status: 'sent'; phone?: string; devCode?: string }
  | { status: 'unavailable'; reason: string }
  | { status: 'invalid_phone'; reason: string }
  | { status: 'rate_limited'; reason: string; retryAfterSec?: number }
  | { status: 'error'; reason: string };

export type OtpVerifyResult =
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'invalid_code'; reason: string }
  | { status: 'expired'; reason: string }
  | { status: 'unavailable'; reason: string }
  | { status: 'rate_limited'; reason: string; retryAfterSec?: number }
  | { status: 'error'; reason: string };

export interface AuthService {
  readonly name: string;
  getSession(): Promise<AuthSession | null>;
  requestOtp(phone: string): Promise<OtpRequestResult>;
  verifyOtp(phone: string, code: string): Promise<OtpVerifyResult>;
  signOut(): Promise<void>;
}

/** Honest no-op used during SSR/first paint and when auth is disabled. */
export const AUTH_UNAVAILABLE_MESSAGE =
  'Kirish tizimi rasmiy autentifikatsiya xizmati bilan integratsiya qilinmoqda.';

export const unavailableAuthService: AuthService = {
  name: 'unavailable',
  async getSession() {
    return null;
  },
  async requestOtp() {
    return {
      status: 'unavailable',
      reason:
        'SMS provayderi ulanmagan. Real tizim integratsiya qilingach, tasdiqlash kodi shu raqamga yuboriladi.',
    };
  },
  async verifyOtp() {
    return { status: 'unavailable', reason: AUTH_UNAVAILABLE_MESSAGE };
  },
  async signOut() {
    /* no-op */
  },
};
