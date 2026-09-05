import { Container } from '@/components/ui/Section';
import { PageHeaderSkeleton, Skeleton } from '@/components/ui/Skeleton';
export default function Loading() {
  return (
    <Container className="section-y-sm">
      <PageHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-80 w-full rounded-card" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    </Container>
  );
}
