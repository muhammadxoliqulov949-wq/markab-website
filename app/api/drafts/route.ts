/**
 * GET    /api/drafts           → list user's financing drafts
 * POST   /api/drafts           → upsert a draft
 * DELETE /api/drafts?id=       → delete a draft
 */
import { route, readJsonBody, jsonResponse, errorResponse } from '@/lib/request/route';
import { LIMITS } from '@/lib/rates/limiter';
import { listDrafts, upsertDraft, deleteDraft } from '@/lib/repo/drafts';

export const GET = route({
  method: 'GET',
  auth: true,
  handler: async (_request, ctx) => {
    const items = await listDrafts(ctx.userId!);
    return jsonResponse(ctx, { items });
  },
});

export const POST = route({
  method: 'POST',
  csrf: true,
  auth: true,
  rate: LIMITS.draft,
  handler: async (request, ctx) => {
    const parsed = await readJsonBody(request, ctx);
    if (!parsed.ok) return parsed.response;
    const data = parsed.data as Record<string, unknown>;
    const productTitle = typeof data.productTitle === 'string' ? data.productTitle : null;
    const productHref = typeof data.productHref === 'string' ? data.productHref : null;
    const kind = data.kind === 'car' || data.kind === 'electronics' ? data.kind : null;
    const row = await upsertDraft(ctx.userId!, { productTitle, productHref, kind });
    if (!row) return errorResponse(ctx, 400, 'invalid', 'Qoralama yaroqsiz.');
    return jsonResponse(ctx, { item: row }, { status: 201 });
  },
});

export const DELETE = route({
  method: 'DELETE',
  csrf: true,
  auth: true,
  rate: LIMITS.draft,
  handler: async (request, ctx) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id || id.length > 64) {
      return errorResponse(ctx, 400, 'invalid_id', 'id noto‘g‘ri.');
    }
    const r = await deleteDraft(ctx.userId!, id);
    if (!r.removed) return errorResponse(ctx, 404, 'not_found', 'Qoralama topilmadi.');
    return jsonResponse(ctx, { removed: true });
  },
});
