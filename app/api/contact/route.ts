/**
 * POST /api/contact — submit a contact request.
 *
 * No authentication required. CSRF is enforced, rate limited.
 */
import { route, readJsonBody, jsonResponse, errorResponse } from '@/lib/request/route';
import { LIMITS } from '@/lib/rates/limiter';
import { submitContact } from '@/lib/repo/contact';
import { loadSession } from '@/lib/services/session';
import { ensureCsrfCookie } from '@/lib/services/csrf';

export const POST = route({
  method: 'POST',
  csrf: true,
  rate: LIMITS.contact,
  handler: async (request, ctx) => {
    await ensureCsrfCookie();
    const session = await loadSession();
    ctx.userId = session?.user.id ?? null;

    const parsed = await readJsonBody(request, ctx);
    if (!parsed.ok) return parsed.response;

    const result = await submitContact(
      parsed.data as Record<string, unknown> as never,
      { ip: ctx.ip, userAgent: ctx.userAgent, userId: ctx.userId },
    );

    if (!result.ok) {
      if (result.error === 'invalid_phone') {
        return errorResponse(ctx, 400, 'invalid_phone', result.message);
      }
      return errorResponse(ctx, 400, 'validation', result.message, {
        fields: 'fields' in result ? result.fields : undefined,
      });
    }

    ctx.logger.info('contact.submitted', { id: result.submission.id });
    return jsonResponse(ctx, {
      status: 'received',
      id: result.submission.id,
    });
  },
});

// GET just provisions a CSRF cookie so the page can submit after a cold load.
export async function GET() {
  const token = await ensureCsrfCookie();
  return new Response(null, {
    status: 204,
    headers: { 'x-csrf-token': token, 'cache-control': 'private, no-store' },
  });
}
