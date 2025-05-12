
'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollCueProps {
  isVisible: boolean;
}

export function ScrollCue({ isVisible }: ScrollCueProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]",
        "flex flex-col items-center justify-center p-3",
        "bg-primary/80 text-primary-foreground backdrop-blur-sm rounded-full shadow-xl",
        "animate-bounce", // Uses Tailwind's default bounce animation
        "transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-hidden="true"
    >
      <ChevronDown className="h-6 w-6" />
      {/* Optional: Add text like "Scroll" below the icon if desired */}
      {/* <span className="text-xs mt-1">Scroll</span> */}
    </div>
  );
}
