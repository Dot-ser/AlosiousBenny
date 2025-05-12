'use client';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  isFinishing: boolean;
}

export function PageLoader({ isFinishing }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-background flex items-center justify-center z-[200]",
        "transition-all duration-700 ease-out", // Base transition for opacity and transform
        isFinishing ? "opacity-0 scale-150 pointer-events-none" : "opacity-100 scale-100"
      )}
    >
      <div className="animate-pulse">
        <Logo />
      </div>
    </div>
  );
}
