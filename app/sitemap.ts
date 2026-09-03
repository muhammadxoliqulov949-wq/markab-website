import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { repository } from '@/lib/data';
import { serverEnv } from '@/lib/env/server';

/**
 * Sitemap.
 *
 * RENDERING STRATEGY
 *
 * The sitemap is rendered DYNAMICALLY (`force-dynamic`):
 *
 *   • When MARKAB_DATA_SOURCE=http, the catalogue can change at any time
 *     (prices, stock, new listings, delisted vehicles). A build-time snapshot
 *     would freeze inventory at deploy time and publish URLs the API no
 *     longer serves.
 *   • When MARKAB_DATA_SOURCE=mock, dynamic rendering is still cheap — the
 *     data is in-memory and takes negligible time to enumerate — and keeps
 *     build-time and request-time behaviour identical across environments.
 *   • A static sitemap could be generated at build when credentials are
 *     present, but that reintroduces the exact build/runtime divergence
 *     we are closing (provider, credentials and even DNS reachability can
 *     differ between build host and production runtime). `force-dynamic`
 *     removes that footgun.
 *
 * FAIL-SAFE SEMANTICS (preserved from earlier implementation):
 *
 *   • a record appears only if the provider returns it (repository contract)
 *   • if the provider is unavailable or errors, the dynamic catalogue
 *     sections are OMITTED and the static routes still publish — it fails
 *     safe rather than fabricating URLs
 *   • quarantined records never appear (excluded at the mapper/fixture layer)
 *   • account (/profile, /cart, /login), search and filter/query URLs are
 *     deliberately absent: they are disallowed in robots.ts and must not be
 *     indexed
 *
 * `lastModified` carries no invented publish dates — the data source has
 * none, so every entry reports generation time.
 */

// Per-request; never frozen at build. This is intentional: catalogue
// inventory changes and a stale sitemap advertises URLs to delisted items.
export const dynamic = 'force-dynamic';

/** Public, indexable pages. Account and search surfaces are excluded on purpose. */
const staticRoutes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/cars', priority: 0.9, changeFrequency: 'daily' },
  { path: '/electronics', priority: 0.9, changeFrequency: 'daily' },
  { path: '/financing', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/financing/calculator', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/financing/apply', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/invest', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/advisor', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/academy', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/loyalty', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/sell', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
];

/** Generous enough to hold the published catalogue without paging logic here. */
const ENUMERATION_PAGE_SIZE = 500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const env = serverEnv();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // In HTTP mode without credentials, or with an unreachable API, the
  // repository returns `unavailable`. We drop dynamic entries and still
  // publish static routes — a half-sitemap is safer than guessed URLs.
  let vehicleEntries: MetadataRoute.Sitemap = [];
  let productEntries: MetadataRoute.Sitemap = [];
  let lessonEntries: MetadataRoute.Sitemap = [];

  // In mock mode we always enumerate. In HTTP mode we also enumerate the
  // repository (which will reflect the live API, or return unavailable if
  // it cannot answer). A deliberately tight page size caps the cost on the
  // upstream while still covering the ~20 / ~42 catalogues observed today.
  const [vehicles, products, lessons] = await Promise.all([
    repository.listVehicles({ pageSize: ENUMERATION_PAGE_SIZE }),
    repository.listProducts({ pageSize: ENUMERATION_PAGE_SIZE }),
    repository.listLessons(),
  ]);

  if (vehicles.status === 'success') {
    vehicleEntries = vehicles.data.items.map((vehicle) => ({
      url: `${site.url}/cars/${vehicle.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } else if (env.dataSource === 'mock') {
    // Defensive: mock provider should always return success; if it does not,
    // log and skip rather than failing the whole sitemap.
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'sitemap.mock_vehicles_unavailable',
        status: vehicles.status,
      }),
    );
  }

  if (products.status === 'success') {
    productEntries = products.data.items.map((product) => ({
      url: `${site.url}/electronics/${product.id}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } else if (env.dataSource === 'mock') {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'sitemap.mock_products_unavailable',
        status: products.status,
      }),
    );
  }

  if (lessons.status === 'success') {
    lessonEntries = lessons.data.map((lesson) => ({
      url: `${site.url}/academy/${lesson.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  }

  return [...staticEntries, ...vehicleEntries, ...productEntries, ...lessonEntries];
}
