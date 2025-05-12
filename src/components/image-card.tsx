
'use client';

import type { ImageType } from '@/types';
import Image from 'next/image';
import { Heart, MessageCircle, Send, MoreHorizontal, Loader2 } from 'lucide-react';
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
  priority?: boolean;
}

export function ImageCard({ image, onLikeToggle, onShare, priority = false }: ImageCardProps) {
  const [showLikeHeartAnimation, setShowLikeHeartAnimation] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const lastClickTimeRef = useRef(0);

  const handleLikeButtonClick = () => {
    const aboutToLike = !image.liked;
    onLikeToggle(image.id);

    if (aboutToLike) {
      setShowLikeHeartAnimation(true);
      setTimeout(() => {
        setShowLikeHeartAnimation(false);
      }, 700);
    }
  };

  const handleImageClickOrTap = () => {
    const currentTime = Date.now();
    if (currentTime - lastClickTimeRef.current < 300) {
      const aboutToLike = !image.liked;
      if (aboutToLike) {
        onLikeToggle(image.id);
      }
      setShowLikeHeartAnimation(true);
      setTimeout(() => {
        setShowLikeHeartAnimation(false);
      }, 700);
      lastClickTimeRef.current = 0;
    } else {
      lastClickTimeRef.current = currentTime;
    }
  };


  const handleShareClick = () => {
    onShare(image.id);
  };

  return (
    <Card id={`image-card-${image.id}`} className="w-full max-w-xl mx-auto shadow-lg rounded-xl overflow-hidden bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image.user.avatarUrl || '/images/logo.jpg'} alt={image.user.name} data-ai-hint="profile picture user" />
            <AvatarFallback>{image.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm text-card-foreground">{image.user.name}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-card-foreground">
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
        <div className="aspect-square w-full relative bg-muted/30">
           <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 576px) 100vw, 576px"
            style={{ objectFit: 'contain' }}
            className="bg-transparent"
            data-ai-hint="social media post"
            unoptimized={image.src.startsWith('data:') || image.src.startsWith('https://files.catbox.moe')}
            priority={priority}
            onDragStart={(e) => e.preventDefault()}
            onLoadingComplete={() => {
              setIsImageLoading(false);
            }}
            onError={() => {
              setIsImageLoading(false); // Also stop loading on error
            }}
          />
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-card/50 backdrop-blur-sm z-[5]">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          )}
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

      <CardFooter className="flex flex-col items-start p-3 space-y-2 border-t border-border">
        <div className="flex items-center space-x-4 w-full">
          <Button variant="ghost" size="icon" onClick={handleLikeButtonClick} className="p-0 h-auto">
            <Heart
              className={cn(
                "w-6 h-6 transition-all transform active:scale-90",
                image.liked ? 'text-red-500 fill-red-500' : 'text-card-foreground/80 hover:text-card-foreground'
              )}
            />
            <span className="sr-only">Like</span>
          </Button>
          <Button variant="ghost" size="icon" className="p-0 h-auto text-card-foreground/80 hover:text-card-foreground">
            <MessageCircle className="w-6 h-6" />
            <span className="sr-only">Comment</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShareClick} className="p-0 h-auto text-card-foreground/80 hover:text-card-foreground">
            <Send className="w-6 h-6" />
            <span className="sr-only">Share</span>
          </Button>
        </div>

        {image.likes > 0 && (
          <p className="font-semibold text-sm text-card-foreground">{image.likes.toLocaleString()} like{image.likes !== 1 ? 's' : ''}</p>
        )}

        <div className="text-sm space-y-1 w-full text-card-foreground">
          <p>
            <span className="font-semibold">{image.user.name}</span>{' '}
            {image.caption}
          </p>
          {image.hashtags && image.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {image.hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-primary cursor-pointer hover:underline bg-muted text-muted-foreground hover:bg-muted/80">
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
