import type { Metadata } from 'next';
import { site } from './site';

/** One brand suffix for every page: "Page title | Markab". */
export const TITLE_SUFFIX = 'Markab';

export function pageTitle(title: string): string {
  return `${title} | ${TITLE_SUFFIX}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Overrides the "| Markab" suffix when a specific brand title is needed. */
  fullTitle?: string;
  noindex?: boolean;
  ogImage?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  fullTitle,
  noindex = false,
  ogImage,
}: PageMetaInput): Metadata {
  const url = `${site.url}${path}`;
  return {
    // `absolute` opts out of the root layout's title template. buildMetadata
    // already applies the "| Markab" suffix, so inheriting the template would
    // produce "Page | Markab | Markab".
    title: { absolute: fullTitle ?? `${title} | Markab` },
    description,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      title: fullTitle ?? `${title} | Markab`,
      description,
      locale: 'uz_UZ',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle ?? `${title} | Markab`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Structured data
 *
 * Only fields the data source actually supports are emitted. There are no
 * ratings, review counts, price histories or author records anywhere in the
 * data layer, so `aggregateRating`, `review`, `author` and `datePublished`
 * are never present — omitting them is correct, inventing them would be
 * rich-result spam. Where a value is genuinely unknown (availability of an
 * unconfirmed listing) the whole property is dropped rather than guessed.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Serialise for a <script type="application/ld+json"> block.
 *
 * `<` is escaped so a value can never break out of the script element — this
 * matters once the data comes from the HTTP provider rather than fixtures.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        description: site.description,
        // Published office address. Phone and email are deliberately absent:
        // they are not published on markab.uz, only in store listings, and
        // contact details must not be invented (see LEGAL-TRUST-REGISTER).
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.office.address,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: 'uz',
        publisher: { '@id': `${site.url}/#organization` },
      },
    ],
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}

/**
 * Product mark-up for a catalogue item.
 *
 * `availability` is omitted when the source never confirmed stock, and
 * `description` is omitted when the listing has none — a partial Product node
 * is valid and honest; a filled-in one built from guesses is not.
 */
export function productJsonLd(input: {
  name: string;
  path: string;
  brand: string;
  sku: string;
  priceUzs: number;
  images: string[];
  description?: string | null;
  availability?: 'in_stock' | 'out_of_stock' | 'unknown';
}) {
  const availability =
    input.availability === 'in_stock'
      ? 'https://schema.org/InStock'
      : input.availability === 'out_of_stock'
        ? 'https://schema.org/OutOfStock'
        : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    ...(input.images.length ? { image: input.images } : {}),
    brand: { '@type': 'Brand', name: input.brand },
    sku: input.sku,
    offers: {
      '@type': 'Offer',
      url: `${site.url}${input.path}`,
      priceCurrency: 'UZS',
      price: input.priceUzs,
      ...(availability ? { availability } : {}),
    },
  };
}
