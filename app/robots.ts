import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/**
 * Crawl directives.
 *
 * Query-state URLs (`?q=`, `?brand=`, `?sort=`, `?holat=`) are deliberately NOT
 * listed here. A `Disallow` stops the crawler fetching the URL, which means it
 * never sees the `noindex` or the canonical — the page can then still be
 * indexed by URL alone if anything links to it. Those views are handled with
 * `noindex, follow` plus a canonical back to the clean route, which is the
 * directive Google actually honours.
 *
 * Everything disallowed below is an account or prototype surface with no public
 * content, and each also carries `noindex` of its own.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Account surfaces — personal to a visitor, never public content.
        '/profile',
        '/cart',
        '/login',
        // Internal search: results are generated from the query, so there is
        // nothing stable to index and infinite permutations to crawl.
        '/search',
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
