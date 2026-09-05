import { Container } from '@/components/ui/Section';
import { PageHeaderSkeleton, Skeleton } from '@/components/ui/Skeleton';
export default function Loading() {
  return (
    <Container className="section-y-sm">
      <PageHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({length:6}).map((_,i)=>(
          <Skeleton key={i} className="h-16 w-full rounded-card" />
        ))}
      </div>
    </Container>
  );
}
