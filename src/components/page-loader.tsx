
'use client';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  isFinishing: boolean;
}

export function PageLoader({ isFinishing }: PageLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isFinishing) {
      setProgress(0); // Reset progress if loader becomes active again
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          // Simulate loading progress
          // Speed up towards the end if needed, or keep it simple
          if (oldProgress < 70) return oldProgress + 10;
          if (oldProgress < 90) return oldProgress + 5;
          return oldProgress + 2;

        });
      }, 100); // Adjust interval for speed

      return () => {
        clearInterval(timer);
      };
    } else {
      // Ensure progress is 100% when finishing starts, for a smooth transition
      setProgress(100); 
    }
  }, [isFinishing]);


  return (
    <div
      className={cn(
        "fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]",
        "transition-all duration-700 ease-out", 
        isFinishing ? "opacity-0 scale-150 pointer-events-none" : "opacity-100 scale-100"
      )}
    >
      <div className="text-center space-y-4 p-4">
        <h1 className="text-2xl font-semibold text-foreground animate-pulse">
          Connecting to DOT-007 Gallery
        </h1>
        <div className="w-64"> {/* Container for progress bar */}
          <Progress value={progress} className="h-2 [&>div]:bg-primary" />
        </div>
      </div>
    </div>
  );
}

