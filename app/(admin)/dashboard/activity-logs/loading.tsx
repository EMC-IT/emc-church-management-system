import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';

export default function Loading() {
  return <TablePageSkeleton hasStats={true} columns={5} rows={8} />;
}
