'use client';
/**
 * Browser-side AuthService implementation that talks to /api/auth/*.
 *
 * Uses the same CSRF + apiPost/apiFetch helpers as contact/financing forms.
 * Replaces the placeholder `unavailableAuthService` when a real backend is
 * running. When the SMS provider is unconfigured, the backend returns
 * {error:{code:'sms_unavailable'}} and apiFetch throws an ApiError — the UI
 * surfaces the message verbatim; we never fake delivery.
 */
import { apiFetch, apiPost, ApiError } from '@/lib/client/api';
import type { AuthService, AuthSession, OtpRequestResult, OtpVerifyResult } from './service';

export const httpAuthService: AuthService = {
  name: 'http',

  async getSession(): Promise<AuthSession | null> {
    try {
      const j = (await apiFetch('/api/auth/session')) as any;
      if (j && j.status === 'authenticated' && j.user) {
        return {
          id: j.user.id,
          phone: j.user.phone,
          displayName: j.user.displayName ?? null,
          saved: Array.isArray(j.saved) ? j.saved : [],
          drafts: Array.isArray(j.drafts) ? j.drafts : [],
          applications: Array.isArray(j.applications) ? j.applications : [],
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async requestOtp(phone: string): Promise<OtpRequestResult> {
    try {
      const body = (await apiPost('/api/auth/request-code', { phone })) as any;
      if (body.status === 'sent' || body.status === 'dev-logged') {
        return { status: 'sent' };
      }
      return { status: 'error', reason: 'Kutilmagan javob.' };
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'rate_limited':
            return { status: 'rate_limited', reason: err.message, retryAfterSec: 60 };
          case 'invalid_phone':
            return { status: 'invalid_phone', reason: err.message };
          case 'sms_unavailable':
            return { status: 'unavailable', reason: err.message };
          default:
            return { status: 'error', reason: err.message };
        }
      }
      return { status: 'error', reason: 'Tarmoq xatosi.' };
    }
  },

  async verifyOtp(phone: string, code: string): Promise<OtpVerifyResult> {
    try {
      const body = (await apiPost('/api/auth/verify-code', { phone, code })) as any;
      if (body.status === 'authenticated' && body.user) {
        return {
          status: 'authenticated',
          session: {
            id: body.user.id,
            phone: body.user.phone,
            displayName: body.user.displayName ?? null,
            saved: [],
            drafts: [],
            applications: [],
          },
        };
      }
      return { status: 'error', reason: 'Javob noto‘g‘ri.' };
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'invalid_code':
            return { status: 'invalid_code', reason: err.message };
          case 'expired':
            return { status: 'expired', reason: err.message };
          case 'rate_limited':
            return { status: 'rate_limited', reason: err.message, retryAfterSec: 60 };
          default:
            return { status: 'error', reason: err.message };
        }
      }
      return { status: 'error', reason: 'Tarmoq xatosi.' };
    }
  },

  async signOut(): Promise<void> {
    try {
      await apiPost('/api/auth/logout', {});
    } catch {
      // Best-effort; the cookie will age out.
    }
  },
};
