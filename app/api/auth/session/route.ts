/**
 * GET  /api/auth/session  → return current authenticated user (or 401)
 */
import { route, jsonResponse, errorResponse } from '@/lib/request/route';
import { loadSession } from '@/lib/services/session';
import { formatPhoneE164 } from '@/lib/format/phone';
import { ensureCsrfCookie } from '@/lib/services/csrf';
import { listSavedItems } from '@/lib/repo/savedItems';
import { listDrafts } from '@/lib/repo/drafts';
import { listUserApplications } from '@/lib/repo/financing';

export const GET = route({
  method: 'GET',
  handler: async (_request, ctx) => {
    // Always make sure a CSRF cookie is set so subsequent POSTs can be
    // validated even on cold visits to a page that calls /auth/session.
    await ensureCsrfCookie();
    const s = await loadSession();
    if (!s) return errorResponse(ctx, 401, 'unauthenticated', 'Kirilmagan.');
    ctx.userId = s.user.id;
    // Hydrate the session response with the user's saved items and drafts so
    // the client doesn't need three round-trips to render the dashboard.
    const [saved, myDrafts, applications] = await Promise.all([
      listSavedItems(s.user.id),
      listDrafts(s.user.id),
      listUserApplications(s.user.id),
    ]);
    return jsonResponse(ctx, {
      status: 'authenticated',
      user: {
        id: s.user.id,
        phone: formatPhoneE164(s.user.phoneE164),
        displayName: s.user.displayName,
      },
      saved,
      drafts: myDrafts,
      applications: applications.map((a) => ({
        id: a.id,
        productTitle: a.productTitle,
        productHref: a.productHref,
        productKind: a.productKind,
        status: a.status,
        createdAt: a.createdAt,
      })),
    });
  },
});
