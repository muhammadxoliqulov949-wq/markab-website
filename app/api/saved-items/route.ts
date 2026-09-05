/**
 * GET    /api/saved-items           → list saved items for the authenticated user
 * POST   /api/saved-items           → add a saved item
 * DELETE /api/saved-items?kind=&ref=  → remove one
 */
import { route, readJsonBody, jsonResponse, errorResponse } from '@/lib/request/route';
import { LIMITS } from '@/lib/rates/limiter';
import { listSavedItems, addSavedItem, removeSavedItem } from '@/lib/repo/savedItems';

export const GET = route({
  method: 'GET',
  auth: true,
  handler: async (_request, ctx) => {
    const items = await listSavedItems(ctx.userId!);
    return jsonResponse(ctx, { items });
  },
});

export const POST = route({
  method: 'POST',
  csrf: true,
  auth: true,
  rate: LIMITS.savedItems,
  handler: async (request, ctx) => {
    const parsed = await readJsonBody(request, ctx);
    if (!parsed.ok) return parsed.response;
    const result = await addSavedItem(ctx.userId!, parsed.data);
    if (!result.added) {
      return errorResponse(ctx, 400, result.reason, 'Saqlash muvaffaqiyatsiz.');
    }
    ctx.logger.info('saved.added', {
      kind: result.item.kind,
      ref: result.item.ref,
      deduped: result.deduped,
    });
    return jsonResponse(ctx, { item: result.item, deduped: result.deduped }, { status: 201 });
  },
});

export const DELETE = route({
  method: 'DELETE',
  csrf: true,
  auth: true,
  rate: LIMITS.savedItems,
  handler: async (request, ctx) => {
    const url = new URL(request.url);
    const kind = url.searchParams.get('kind');
    const ref = url.searchParams.get('ref');
    if (kind !== 'car' && kind !== 'electronics') {
      return errorResponse(ctx, 400, 'invalid_kind', 'kind noto‘g‘ri.');
    }
    if (!ref || ref.length > 120) {
      return errorResponse(ctx, 400, 'invalid_ref', 'ref noto‘g‘ri.');
    }
    const r = await removeSavedItem(ctx.userId!, kind, ref);
    if (!r.removed) return errorResponse(ctx, 404, 'not_found', 'Saqlangan element topilmadi.');
    ctx.logger.info('saved.removed', { kind, ref });
    return jsonResponse(ctx, { removed: true });
  },
});
