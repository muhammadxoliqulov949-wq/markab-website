/**
 * POST /api/auth/request-code
 *
 * Request a one-time SMS code for the supplied phone number.
 *
 * Always returns honest results: if the SMS provider is disabled, returns
 * `unavailable` rather than a fake success.
 */
import { z } from 'zod';
import { route, readJsonBody, jsonResponse, errorResponse } from '@/lib/request/route';
import { LIMITS } from '@/lib/rates/limiter';
import { requestCode, countRecentOtpRequests } from '@/lib/services/auth';
import { ensureCsrfCookie } from '@/lib/services/csrf';

const schema = z.object({
  phone: z.string().min(5).max(30),
});

export const POST = route({
  method: 'POST',
  csrf: true,
  rate: LIMITS.otpRequest,
  handler: async (request, ctx) => {
    const parsed = await readJsonBody(request, ctx);
    if (!parsed.ok) return parsed.response;
    const v = schema.safeParse(parsed.data);
    if (!v.success) {
      return errorResponse(ctx, 400, 'invalid_phone', 'Telefon raqami noto‘g‘ri.', {
        fields: { phone: 'Telefon raqamini kiriting.' },
      });
    }
    const result = await requestCode(
      v.data.phone,
      { ip: ctx.ip, userAgent: ctx.userAgent },
      { countRecentRequests: countRecentOtpRequests },
    );

    // CSRF cookie may not exist on the first anonymous request to an auth
    // endpoint — ensure it now so the subsequent /verify-code call has a
    // token to echo back.
    await ensureCsrfCookie();

    switch (result.status) {
      case 'sent':
        ctx.logger.info('auth.otp_sent', { phone: result.phoneE164.slice(-4) });
        return jsonResponse(ctx, { status: 'sent' });
      case 'dev-logged':
        ctx.logger.warn('auth.otp_dev_sent', { phone: result.phoneE164.slice(-4) });
        return jsonResponse(ctx, { status: 'sent', devCode: result.devCode });
      case 'rate_limited':
        return errorResponse(
          ctx,
          429,
          'rate_limited',
          'Juda ko‘p kod so‘raldi — keyinroq urinib ko‘ring.',
          { retryAfterSec: result.retryAfterSec },
        );
      case 'invalid_phone':
        return errorResponse(ctx, 400, 'invalid_phone', result.reason);
      case 'unavailable':
        return errorResponse(ctx, 503, 'sms_unavailable', result.reason);
      default:
        return errorResponse(ctx, 500, 'internal_error', 'Xatolik yuz berdi.');
    }
  },
});

// GET simply ensures a CSRF cookie exists so a visiting login page can submit.
export async function GET() {
  const token = await ensureCsrfCookie();
  return new Response(null, {
    status: 204,
    headers: { 'x-csrf-token': token, 'cache-control': 'private, no-store' },
  });
}
