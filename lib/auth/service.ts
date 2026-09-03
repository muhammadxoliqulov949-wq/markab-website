/**
 * Authentication service contract.
 *
 * Markab's production flow is phone + SMS code (OTP). This prototype has no
 * auth backend, no SMS gateway and no credentials, so the only implementation
 * is `unavailableAuthService`, which refuses every operation honestly.
 *
 * WHAT IS DELIBERATELY ABSENT:
 *  • no generated or hardcoded OTP code — a fabricated code is a fabricated
 *    authentication, and the UI must never be able to show one;
 *  • no fake session, no fake "signed in as", no demo user identity;
 *  • no bypass: nothing here can turn `unavailable` into `authenticated`.
 *
 * When a real provider is added, implement this interface and pass it to
 * `AuthProvider`. The UI depends only on the four methods below, so no
 * component needs to change.
 */

export type AuthSession = {
  /** E.164-ish display form, e.g. "+998 90 123 45 67". */
  phone: string;
  /** Null until the backend supplies a name. Never guessed. */
  displayName: string | null;
};

export type OtpRequestResult =
  /** A real provider sent a code to the given number. */
  | { status: 'sent'; phone: string }
  /** No provider is configured — the honest answer in this prototype. */
  | { status: 'unavailable'; reason: string }
  | { status: 'invalid_phone'; reason: string }
  | { status: 'error'; reason: string };

export type OtpVerifyResult =
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'invalid_code'; reason: string }
  | { status: 'unavailable'; reason: string }
  | { status: 'error'; reason: string };

export interface AuthService {
  readonly name: string;
  /** Current session, or null when there is none. */
  getSession(): Promise<AuthSession | null>;
  /** Step 1 — ask for a code to be sent. Must never invent a code. */
  requestOtp(phone: string): Promise<OtpRequestResult>;
  /** Step 2 — exchange the code for a session. */
  verifyOtp(phone: string, code: string): Promise<OtpVerifyResult>;
  signOut(): Promise<void>;
}

/**
 * The only implementation that exists today.
 *
 * `requestOtp` reports `unavailable` rather than pretending a code was sent,
 * and `verifyOtp` can never succeed — there is no code and no session to hand
 * back. The UI surfaces the message below verbatim.
 */
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
    // Nothing to sign out of.
  },
};
