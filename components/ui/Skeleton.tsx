export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6, columns = 'sm:grid-cols-2 lg:grid-cols-3' }: { count?: number; columns?: string }) {
  return (
    <div
      className={`grid gap-5 ${columns}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Yuklanmoqda…</span>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <header className="mb-8 max-w-2xl md:mb-10" aria-hidden="true">
      <Skeleton className="mb-3 h-3 w-24 rounded-pill" />
      <Skeleton className="h-8 w-2/3 rounded" />
      <Skeleton className="mt-3 h-4 w-full rounded" />
      <Skeleton className="mt-2 h-4 w-5/6 rounded" />
    </header>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 rounded-panel border border-line bg-surface p-5 shadow-card sm:p-7" aria-hidden="true">
      <Skeleton className="h-4 w-1/3 rounded" />
      <Skeleton className="h-11 w-full rounded-btn" />
      <Skeleton className="h-4 w-1/4 rounded" />
      <Skeleton className="h-11 w-full rounded-btn" />
      <Skeleton className="h-4 w-1/3 rounded" />
      <Skeleton className="h-28 w-full rounded-btn" />
      <Skeleton className="h-12 w-40 rounded-btn" />
    </div>
  );
}
