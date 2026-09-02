'use client';

import { SystemErrorView } from '@/components/errors';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SystemErrorView error={error} reset={reset} scope="auto" />;
}
