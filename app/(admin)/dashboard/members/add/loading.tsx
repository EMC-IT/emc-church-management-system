import { FormPageSkeleton } from '@/components/ui/skeleton-loaders';

export default function Loading() {
  return <FormPageSkeleton cardCount={3} fieldsPerCard={6} />;
}
