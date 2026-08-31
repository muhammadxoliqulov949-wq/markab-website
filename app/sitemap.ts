import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { products } from '@/lib/data/fixtures/products';
import { vehicles } from '@/lib/data/fixtures/vehicles';
import { lessons } from '@/lib/data/fixtures/academy';

/**
 * Sitemap — static routes plus dynamic product / vehicle / lesson URLs.
 * Generated from the active data adapter, so fixtures and the real API both work.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/cars',
    '/electronics',
    '/financing',
    '/financing/calculator',
    '/financing/apply',
    '/invest',
    '/academy',
    '/about',
    '/contact',
    '/faq',
    '/loyalty',
    '/sell',
    '/advisor',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((vehicle) => ({
    url: `${site.url}/cars/${vehicle.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${site.url}/electronics/${product.id}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = lessons.map((lesson) => ({
    url: `${site.url}/academy/${lesson.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...vehicleRoutes, ...productRoutes, ...lessonRoutes];
}
