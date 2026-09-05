import { Container } from '@/components/ui/Section';
import { ListSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton';

/**
 * PageLoading — the standard loading shell used by route-level loading.tsx
 * files. Next.js will stream this in place of the page while the server
 * component tree is rendering, which means visitors never stare at a blank
 * white screen waiting for a slow data fetch.
 *
 * Deliberately minimal: a page-shaped skeleton, not decorative spinners.
 */
export function CataloguePageLoading() {
  return (
    <Container className="section-y-sm">
      <PageHeaderSkeleton />
      <div className="mb-6 flex flex-wrap gap-2" aria-hidden="true">
        <div className="h-9 w-20 rounded-pill bg-surface-sunken skeleton" />
        <div className="h-9 w-24 rounded-pill bg-surface-sunken skeleton" />
        <div className="h-9 w-16 rounded-pill bg-surface-sunken skeleton" />
      </div>
      <ListSkeleton count={6} />
    </Container>
  );
}

export function GenericPageLoading({ showForm = false }: { showForm?: boolean }) {
  return (
    <Container className="section-y-sm">
      <PageHeaderSkeleton />
      {showForm ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="space-y-5">
            <div className="h-[300px] rounded-panel bg-surface-sunken skeleton" aria-hidden="true" />
            <div className="h-24 rounded-panel bg-surface-sunken skeleton" aria-hidden="true" />
          </div>
          <div className="h-[400px] rounded-panel bg-surface-sunken skeleton" aria-hidden="true" />
        </div>
      ) : (
        <ListSkeleton count={6} />
      )}
    </Container>
  );
}

export function DetailPageLoading() {
  return (
    <Container className="section-y-sm">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-panel bg-surface-sunken skeleton" aria-hidden="true" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-card bg-surface-sunken skeleton" aria-hidden="true" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-1/3 rounded bg-surface-sunken skeleton" aria-hidden="true" />
          <div className="h-8 w-3/4 rounded bg-surface-sunken skeleton" aria-hidden="true" />
          <div className="h-8 w-1/2 rounded bg-surface-sunken skeleton" aria-hidden="true" />
          <div className="h-px w-full bg-line" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-1/3 rounded bg-surface-sunken skeleton" aria-hidden="true" />
                <div className="h-4 w-1/4 rounded bg-surface-sunken skeleton" aria-hidden="true" />
              </div>
            ))}
          </div>
          <div className="h-12 w-full rounded-btn bg-surface-sunken skeleton mt-6" aria-hidden="true" />
        </div>
      </div>
    </Container>
  );
}
