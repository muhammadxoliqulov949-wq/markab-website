/**
 * POST /api/auth/logout — revoke the current session and clear cookies.
 */
import { route, jsonResponse } from '@/lib/request/route';
import { logout } from '@/lib/services/session';
import { clearCsrfCookie } from '@/lib/services/csrf';

export const POST = route({
  method: 'POST',
  csrf: true,
  auth: false,
  handler: async (_request, ctx) => {
    await logout();
    await clearCsrfCookie();
    ctx.logger.info('auth.logout');
    return jsonResponse(ctx, { status: 'logged_out' });
  },
});
