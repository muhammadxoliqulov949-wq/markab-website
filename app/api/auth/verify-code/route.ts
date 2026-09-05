/**
 * POST /api/auth/verify-code
 *
 * Submit phone + OTP; establishes a session on success.
 */
import { z } from 'zod';
import { route, readJsonBody, jsonResponse, errorResponse } from '@/lib/request/route';
import { LIMITS } from '@/lib/rates/limiter';
import { verifyCode } from '@/lib/services/auth';
import { formatPhoneE164 } from '@/lib/format/phone';

const schema = z.object({
  phone: z.string().min(5).max(30),
  code: z.string().length(6, 'Kod 6 xonali bo‘lishi kerak.'),
});

export const POST = route({
  method: 'POST',
  csrf: true,
  rate: LIMITS.otpVerify,
  handler: async (request, ctx) => {
    const parsed = await readJsonBody(request, ctx);
    if (!parsed.ok) return parsed.response;
    const v = schema.safeParse(parsed.data);
    if (!v.success) {
      const fields: Record<string, string> = {};
      for (const issue of v.error.issues) {
        const k = issue.path[0];
        if (typeof k === 'string') fields[k] = issue.message;
      }
      return errorResponse(ctx, 400, 'validation', 'Kiritilgan ma’lumotlar noto‘g‘ri.', { fields });
    }
    const result = await verifyCode(v.data.phone, v.data.code, {
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    switch (result.status) {
      case 'authenticated':
        ctx.userId = result.user.id;
        ctx.logger.info('auth.login_success', { phone: result.user.phoneE164.slice(-4) });
        return jsonResponse(ctx, {
          status: 'authenticated',
          user: {
            id: result.user.id,
            phone: formatPhoneE164(result.user.phoneE164),
            displayName: result.user.displayName,
          },
        });
      case 'invalid_code':
        return errorResponse(ctx, 400, 'invalid_code', result.reason);
      case 'expired':
        return errorResponse(ctx, 400, 'expired', result.reason);
      case 'rate_limited':
        return errorResponse(ctx, 429, 'rate_limited', 'Juda ko‘p urinish — keyinroq qayting.');
      case 'invalid_phone':
        return errorResponse(ctx, 400, 'invalid_phone', result.reason);
      default:
        return errorResponse(ctx, 500, 'internal_error', 'Xatolik yuz berdi.');
    }
  },
});
