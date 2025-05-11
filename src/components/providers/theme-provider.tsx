
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps as NextThemesProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
  // Ensure the component is only rendered on the client
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Prevent rendering on the server to avoid hydration mismatch,
    // or return a fallback UI if preferred.
    // Passing children directly might lead to mismatch if they depend on theme.
    return null; 
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Re-export useTheme from next-themes if you were using a custom one.
// If you had a custom useTheme, you might need to adjust it or use the one from next-themes.
// For now, assuming direct usage of next-themes' context or that ThemeToggle handles it.
// If `useTheme` from `@/components/providers/theme-provider` was custom and essential,
// it needs to be reconciled with `next-themes`. The `ThemeToggle` uses `next-themes` directly or via its own context.

// The original `useTheme` context. If `ThemeToggle` relies on this specific context,
// this setup needs to be integrated with `NextThemesProvider` or `ThemeToggle` updated.
// For now, `next-themes` handles its own context.

// To use the theme from next-themes:
// import { useTheme as useNextTheme } from 'next-themes';
// const { theme, setTheme } = useNextTheme();
