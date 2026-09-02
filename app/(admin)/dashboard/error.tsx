'use client';

import { useEffect } from 'react';
import { SystemErrorView } from '@/components/errors';

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin dashboard error caught:', error);
  }, [error]);

  return (
    <SystemErrorView
      scope="admin"
      error={error}
      reset={reset}
      title="Admin Dashboard Error"
      description="An issue occurred while loading this administrative view or dataset. You can retry the operation or return to the main dashboard."
    />
  );
}
