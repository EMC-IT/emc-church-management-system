'use client';

import { useEffect } from 'react';
import { SystemErrorView } from '@/components/errors';

export default function MemberPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Member portal error caught:', error);
  }, [error]);

  return (
    <SystemErrorView
      scope="member"
      error={error}
      reset={reset}
      title="Unable to Load Member Information"
      description="We encountered a momentary issue retrieving your member records. Please try again or return to your main dashboard."
    />
  );
}
