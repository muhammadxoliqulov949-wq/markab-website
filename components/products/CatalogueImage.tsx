'use client';

/**
 * Catalogue image — thin wrapper around RemoteImage.
 *
 * All catalogue photography now goes through RemoteImage, which shows a
 * neutral sunken fallback when the remote image fails to load (CSP,
 * egress/TLS reset in sandboxes like Arena, 404 upstream). CatalogueImage
 * exists only so call sites keep the "catalogue" semantic name and the
 * existing default fallback label ("Rasm yuklanmadi") — the underlying
 * behavior has been unified into RemoteImage to avoid two divergent
 * implementations of the same broken-image handling.
 */

import { RemoteImage } from '@/components/ui/RemoteImage';

export function CatalogueImage({
  src,
  alt,
  sizes,
  priority = false,
  className = 'object-cover',
  fallbackLabel = 'Rasm yuklanmadi',
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallbackLabel?: string;
}) {
  return (
    <RemoteImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      fallbackLabel={fallbackLabel}
    />
  );
}
