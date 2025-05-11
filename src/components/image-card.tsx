import type { ImageType } from '@/types';
import Image from 'next/image';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ImageCardProps {
  image: ImageType;
  onLikeToggle: (id: string) => void;
  onShare: (src: string) => void;
}

export function ImageCard({ image, onLikeToggle, onShare }: ImageCardProps) {
  const handleLikeClick = () => {
    onLikeToggle(image.id);
  };

  const handleShareClick = () => {
    onShare(image.src);
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image.user.avatarUrl} alt={image.user.name} data-ai-hint="profile picture user" />
            <AvatarFallback>{image.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{image.user.name}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0 select-none pointer-events-none" onContextMenu={(e) => e.preventDefault()}>
        <div className="aspect-square w-full relative">
           <Image
            src={image.src}
            alt={image.alt}
            fill // Changed from layout="fill"
            objectFit="cover" // Retained objectFit, works with fill
            className="bg-muted object-cover" // Added object-cover here as well for clarity
            data-ai-hint="social media post"
            unoptimized={image.src.startsWith('data:') || image.src.startsWith('https://files.catbox.moe')}
            priority={image.id === '1'} 
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start p-3 space-y-2">
        <div className="flex items-center space-x-4 w-full">
          <Button variant="ghost" size="icon" onClick={handleLikeClick} className="p-0 h-auto">
            <Heart
              className={`w-6 h-6 transition-all transform active:scale-90 ${
                image.liked ? 'text-primary fill-primary' : 'text-foreground/80'
              }`}
            />
            <span className="sr-only">Like</span>
          </Button>
          <Button variant="ghost" size="icon" className="p-0 h-auto">
            <MessageCircle className="w-6 h-6 text-foreground/80" />
            <span className="sr-only">Comment</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShareClick} className="p-0 h-auto">
            <Send className="w-6 h-6 text-foreground/80" />
            <span className="sr-only">Share</span>
          </Button>
        </div>

        {image.likes > 0 && (
          <p className="font-semibold text-sm">{image.likes.toLocaleString()} like{image.likes !== 1 ? 's' : ''}</p>
        )}

        <div className="text-sm space-y-1 w-full">
          <p>
            <span className="font-semibold">{image.user.name}</span>{' '}
            {image.caption}
          </p>
          {image.hashtags && image.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {image.hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-primary cursor-pointer hover:underline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {image.commentsCount > 0 && (
            <p className="text-xs text-muted-foreground cursor-pointer hover:underline">
                View all {image.commentsCount} comments
            </p>
        )}

        <p className="text-xs text-muted-foreground uppercase">{image.timestamp}</p>
      </CardFooter>
    </Card>
  );
}