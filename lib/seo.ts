import type { Metadata } from 'next';
import { site } from './site';

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
    title: fullTitle ?? `${title} — Markab`,
    description,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      title: fullTitle ?? `${title} — Markab`,
      description,
      locale: 'uz_UZ',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle ?? `${title} — Markab`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
