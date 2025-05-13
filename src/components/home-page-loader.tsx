
'use client';

import { Loader2 } from 'lucide-react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

interface HomePageLoaderProps {
  isLoading: boolean;
}

export function HomePageLoader({ isLoading }: HomePageLoaderProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]",
        "transition-opacity duration-500 ease-out",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="text-center space-y-6 p-4">
        <div className="animate-pulse">
          <Logo />
        </div>
        <div className="flex items-center justify-center space-x-2 text-lg text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Profile...</span>
        </div>
      </div>
    </div>
  );
}
