
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-6 rounded-sm" /> {/* More options icon placeholder */}
      </CardHeader>

      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full bg-muted" />
      </CardContent>

      <CardFooter className="flex flex-col items-start p-3 space-y-3">
        <div className="flex items-center space-x-4 w-full">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-6" />
        </div>

        <Skeleton className="h-4 w-20" /> {/* Likes count placeholder */}

        <div className="text-sm space-y-1.5 w-full">
          <Skeleton className="h-4 w-4/5" /> {/* Caption line 1 placeholder */}
          <Skeleton className="h-4 w-3/5" /> {/* Caption line 2 / hashtags placeholder */}
        </div>
        
        <Skeleton className="h-3 w-28" /> {/* Timestamp placeholder */}
      </CardFooter>
    </Card>
  );
}
