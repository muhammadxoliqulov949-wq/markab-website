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
