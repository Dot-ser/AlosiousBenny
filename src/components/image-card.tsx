
'use client';

import type { ImageType } from '@/types';
import Image from 'next/image';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageCardProps {
  image: ImageType;
  onLikeToggle: (id: string) => void;
  onShare: (id: string) => void;
}

export function ImageCard({ image, onLikeToggle, onShare }: ImageCardProps) {
  const [showLikeHeartAnimation, setShowLikeHeartAnimation] = useState(false);
  const lastClickTimeRef = useRef(0);

  const handleLikeButtonClick = () => {
    const aboutToLike = !image.liked;
    onLikeToggle(image.id);

    if (aboutToLike) {
      setShowLikeHeartAnimation(true);
      setTimeout(() => {
        setShowLikeHeartAnimation(false);
      }, 700); // Animation duration should match CSS
    }
  };

  const handleImageClickOrTap = () => {
    const currentTime = Date.now();
    if (currentTime - lastClickTimeRef.current < 300) { // Double-click/tap threshold: 300ms
      const aboutToLike = !image.liked;
      if (aboutToLike) { // Only toggle if it's not already liked
        onLikeToggle(image.id);
      }
      // Always show animation on double tap as feedback
      setShowLikeHeartAnimation(true);
      setTimeout(() => {
        setShowLikeHeartAnimation(false);
      }, 700); // Animation duration
      lastClickTimeRef.current = 0; // Reset after double tap
    } else {
      lastClickTimeRef.current = currentTime; // Record first tap
    }
  };

  const handleShareClick = () => {
    onShare(image.id);
  };

  return (
    <Card id={`image-card-${image.id}`} className="w-full max-w-xl mx-auto shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image.user.avatarUrl || '/images/logo.jpg'} alt={image.user.name} data-ai-hint="profile picture user" />
            <AvatarFallback>{image.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{image.user.name}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </CardHeader>

      <CardContent 
        className="p-0 select-none relative" 
        onClick={handleImageClickOrTap}
        style={{ cursor: 'pointer' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="aspect-square w-full relative">
           <Image
            src={image.src}
            alt={image.alt}
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            objectFit="contain"
            className="bg-muted"
            data-ai-hint="social media post"
            unoptimized={image.src.startsWith('data:') || image.src.startsWith('https://files.catbox.moe')}
            priority={image.id === '1'} 
            onDragStart={(e) => e.preventDefault()}
          />
          {showLikeHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Heart 
                className="w-24 h-24 text-white animate-like-pulse-and-fade" 
                fill="white" 
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
              />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start p-3 space-y-2">
        <div className="flex items-center space-x-4 w-full">
          <Button variant="ghost" size="icon" onClick={handleLikeButtonClick} className="p-0 h-auto">
            <Heart
              className={cn(
                "w-6 h-6 transition-all transform active:scale-90",
                image.liked ? 'text-red-500 fill-red-500' : 'text-foreground/80' // Changed to red-500 for liked state
              )}
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
