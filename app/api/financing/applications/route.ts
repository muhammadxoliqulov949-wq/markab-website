/**
 * POST /api/financing/applications — submit a financing application.
 * GET  /api/financing/applications — list the authenticated user's applications.
 */
import {
  route,
  readJsonBody,
  jsonResponse,
  errorResponse,
  requireAuth,
} from '@/lib/request/route';
import { LIMITS } from '@/lib/rates/limiter';
import { submitApplication, listUserApplications } from '@/lib/repo/financing';
import { ensureCsrfCookie } from '@/lib/services/csrf';
import { loadSession } from '@/lib/services/session';

export const POST = route({
  method: 'POST',
  csrf: true,
  rate: LIMITS.financingApply,
  handler: async (request, ctx) => {
    await ensureCsrfCookie();
    const session = await loadSession();
    ctx.userId = session?.user.id ?? null;

    const parsed = await readJsonBody(request, ctx);
    if (!parsed.ok) return parsed.response;

    const result = await submitApplication(parsed.data as never, {
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      userId: ctx.userId,
    });

    if (!result.ok) {
      if (result.error === 'invalid_phone') {
        return errorResponse(ctx, 400, 'invalid_phone', result.message);
      }
      if (result.error === 'consent_required') {
        return errorResponse(ctx, 400, 'consent_required', result.message);
      }
      return errorResponse(ctx, 400, 'validation', result.message, {
        fields: 'fields' in result ? result.fields : undefined,
      });
    }

    ctx.logger.info('financing.app_submitted', { id: result.submission.id });
    return jsonResponse(ctx, {
      status: 'received',
      id: result.submission.id,
    });
  },
});

export const GET = route({
  method: 'GET',
  auth: true,
  handler: async (_request, ctx) => {
    const authErr = await requireAuth(ctx);
    if (authErr) return authErr;
    const items = await listUserApplications(ctx.userId!);
    return jsonResponse(ctx, { items });
  },
});
