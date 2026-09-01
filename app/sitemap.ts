import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { repository } from '@/lib/data';

/**
 * Sitemap.
 *
 * Generated through the repository, so it follows the same architecture as
 * every page:  sitemap → repository → DataAdapter → provider.
 *
 * It previously imported the vehicle / product / lesson fixtures directly,
 * which meant the sitemap could list records the active data source did not
 * actually serve. Now:
 *
 *   • a record appears only if the provider returns it
 *   • if the provider is unavailable or errors, the dynamic sections are
 *     omitted and the static routes still publish — it fails safe rather
 *     than fabricating URLs
 *   • quarantined records never appear, because they are excluded at the
 *     fixture level and never enter the provider's result set
 *   • account (/profile, /cart, /login), search and filter/query URLs are
 *     deliberately absent: they are disallowed in robots.ts and must not be
 *     indexed
 *
 * `lastModified` carries no invented publish dates — the data source has
 * none, so every entry reports generation time.
 */

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

  const [vehicles, products, lessons] = await Promise.all([
    repository.listVehicles({ pageSize: ENUMERATION_PAGE_SIZE }),
    repository.listProducts({ pageSize: ENUMERATION_PAGE_SIZE }),
    repository.listLessons(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const vehicleEntries: MetadataRoute.Sitemap =
    vehicles.status === 'success'
      ? vehicles.data.items.map((vehicle) => ({
          url: `${site.url}/cars/${vehicle.slug}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8,
        }))
      : [];

  const productEntries: MetadataRoute.Sitemap =
    products.status === 'success'
      ? products.data.items.map((product) => ({
          url: `${site.url}/electronics/${product.id}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8,
        }))
      : [];

  const lessonEntries: MetadataRoute.Sitemap =
    lessons.status === 'success'
      ? lessons.data.map((lesson) => ({
          url: `${site.url}/academy/${lesson.slug}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.5,
        }))
      : [];

  return [...staticEntries, ...vehicleEntries, ...productEntries, ...lessonEntries];
}
