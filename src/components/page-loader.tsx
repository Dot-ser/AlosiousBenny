
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
      let currentProgress = 0;
      const timer = setInterval(() => {
        currentProgress += Math.random() * 10 + 5; // More varied progress
        if (currentProgress >= 95 && !isFinishing) { // Hold at 95% if not finishing
           currentProgress = 95;
        }
        if (currentProgress >= 100) {
           currentProgress = 100;
           clearInterval(timer);
        }
        setProgress(currentProgress);
      }, 150); // Adjusted interval for smoother feel

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
        <div className="w-80"> {/* Increased width from w-64 */}
          <Progress value={progress} className="h-2 [&>div]:bg-primary" />
        </div>
      </div>
    </div>
  );
}

