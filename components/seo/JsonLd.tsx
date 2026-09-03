import { jsonLd } from '@/lib/seo';

/**
 * Renders one JSON-LD block.
 *
 * A server component with no client cost — the payload is already in the HTML,
 * so nothing here hydrates. Accepted values are objects built by the helpers in
 * lib/seo.ts, which only emit fields the data source actually supports.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from repository data; jsonLd() escapes "<" so no value
      // can terminate the script element early.
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
