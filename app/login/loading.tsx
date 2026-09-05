import { Container } from '@/components/ui/Section';
import { FormSkeleton, Skeleton } from '@/components/ui/Skeleton';
export default function Loading() {
  return (
    <Container className="section-y-sm">
      <div className="mx-auto max-w-md">
        <Skeleton className="mb-3 h-3 w-20 rounded-pill mx-auto" />
        <Skeleton className="h-8 w-3/4 rounded mx-auto" />
        <FormSkeleton />
      </div>
    </Container>
  );
}
