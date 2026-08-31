import { unavailable } from './types';
import type { DataAdapter } from './adapter';

/**
 * HTTP provider — REAL MARKAB API (not enabled).
 *
 * The production API (https://api.markab.uz/api/v1/) is a Django REST Framework
 * service that requires a Bearer token:
 *
 *   GET /api/v1/vehicles/  →  401 {"error": "Authentication credentials were not provided."}
 *
 * This prototype therefore:
 *   ✗ does NOT attempt to bypass authentication
 *   ✗ does NOT bundle, request or guess credentials
 *   ✗ does NOT scrape or probe the protected API
 *
 * Every method resolves to `unavailable`, which the UI renders as an explicit
 * "pending integration" state. To enable, supply the token through the
 * platform secret store and implement the endpoints below — the UI needs no change.
 */
export const httpProvider: DataAdapter = {
  name: 'http',

  async listVehicles() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/vehicles/   → map to Vehicle[]
    return unavailable();
  },
  async getVehicleBySlug() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/vehicles/{slug}/
    return unavailable();
  },
  async getVehicleFacets() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/vehicles/facets/  → brand/year/…
    // Until a facets endpoint exists the marketplace hides the values it
    // cannot count, rather than offering filters that return nothing.
    return unavailable();
  },
  async listProducts() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/products/
    return unavailable();
  },
  async getProductById() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/products/{id}/
    return unavailable();
  },
  async getFeatured() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/featured/
    return unavailable();
  },
  async listLessons() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/lessons/
    return unavailable();
  },
  async getLessonBySlug() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/lessons/{slug}/
    return unavailable();
  },
  async listFaq() {
    // TODO(api): GET  {MARKAB_API_BASE_URL}/faq/
    return unavailable();
  },
};
