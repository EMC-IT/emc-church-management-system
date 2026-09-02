'use client';

import { SystemErrorView } from '@/components/errors';
import '@/app/globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <SystemErrorView error={error} reset={reset} scope="public" />
      </body>
    </html>
  );
}
