'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

// next-themes injects an inline <script> to set the theme class before paint.
// React 19 dev-mode logs a false-positive error for this ("Encountered a script
// tag while rendering React component") even though the script already ran as
// part of the server-rendered HTML. Filter just this message in development.
// See https://github.com/pacocoursey/next-themes/issues/387
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const w = window as typeof window & { __themeScriptWarningPatched?: boolean };
  if (!w.__themeScriptWarningPatched) {
    w.__themeScriptWarningPatched = true;
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Encountered a script tag while rendering React component')
      ) {
        return;
      }
      originalError(...args);
    };
  }
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}