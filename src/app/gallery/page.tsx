
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ImageType } from '@/types';
import { ImageGrid } from '@/components/image-grid';
import { Toaster } from '@/components/ui/toaster';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { ThemeToggle } from '@/components/theme-toggle';
import { SkeletonCard } from '@/components/skeleton-card';
import { Logo } from '@/components/logo';
import { getImagesAction, toggleLikeAction } from '@/actions/imageActions';
import { useToast } from '@/hooks/use-toast';


const INITIAL_LOAD_LIMIT = 4;
const LOAD_MORE_LIMIT = 4;

export default function GalleryPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const { toast } = useToast();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);


  const fetchImages = useCallback(async (page: number, limit: number, append: boolean = false) => {
    if (append) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await getImagesAction(page, limit);
      setImages(prevImages => {
        if (append) {
          // Create a Set of existing image IDs for quick lookup
          const existingImageIds = new Set(prevImages.map(img => img.id));
          // Filter out new images that are already present to prevent duplicate keys
          const newUniqueImages = result.images.filter(img => !existingImageIds.has(img.id));
          return [...prevImages, ...newUniqueImages];
        } else {
          return result.images;
        }
      });
      setHasMoreImages(result.hasMore);
      setCurrentPage(page);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error("Failed to fetch images:", e);
      toast({ variant: "destructive", title: "Error fetching images", description: errorMessage });
    } finally {
      if (append) {
        setIsFetchingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    fetchImages(1, INITIAL_LOAD_LIMIT).then(() => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const imageIdFromHash = window.location.hash.replace('#image-', '');
        if (imageIdFromHash) {
          setTimeout(() => {
            const element = document.getElementById(`image-card-${imageIdFromHash}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      }
    });
  }, [fetchImages]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreImages && !isFetchingMore && !isLoading) {
      fetchImages(currentPage + 1, LOAD_MORE_LIMIT, true);
    }
  }, [hasMoreImages, isFetchingMore, isLoading, currentPage, fetchImages]);

  useEffect(() => {
    if (isLoading) return; 

    const currentObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreImages && !isFetchingMore) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 } 
    );
    observerRef.current = currentObserver;


    const currentLoaderRef = loadMoreRef.current;
    if (currentLoaderRef) {
      currentObserver.observe(currentLoaderRef);
    }

    return () => {
      if (currentObserver && currentLoaderRef) {
        currentObserver.unobserve(currentLoaderRef);
      }
    };
  }, [handleLoadMore, isLoading, hasMoreImages, isFetchingMore]);


  const handleLikeToggle = async (id: string) => {
    const originalImages = [...images];
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id
          ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 }
          : img
      )
    );

    try {
      const result = await toggleLikeAction(id);
      if (!result.success || result.data === undefined) {
        setImages(originalImages);
        toast({ variant: 'destructive', title: 'Failed to update like', description: result.error || "Could not update like status." });
      } else {
         setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === id
              ? { ...img, likes: result.data!.likes }
              : img
          )
        );
      }
    } catch (e) {
      setImages(originalImages);
      toast({ variant: 'destructive', title: 'Error', description: "An unexpected error occurred while liking." });
      console.error("Failed to toggle like:", e);
    }
  };

  const handleShare = async (imageId: string) => {
    const imageToShare = images.find(img => img.id === imageId);
    const caption = imageToShare ? imageToShare.caption : "this cool image";

    let shareUrl = `${window.location.origin}/gallery#image-${imageId}`;
     if (typeof window !== 'undefined' && window.location.host) {
       shareUrl = `https://${window.location.host}/gallery#image-${imageId}`;
    }


    const shareData = {
      title: `Check out: ${imageToShare ? imageToShare.caption : "Alosious Benny's Gallery Image"}`,
      text: `I found this cool image "${caption}" in Alosious Benny's Gallery! Check it out:`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: 'Shared!', description: 'Link to the image shared successfully.' });
        return;
      } catch (error: any) {
        console.error('Web Share API failed:', error);
        if (error.name === 'AbortError') {
           toast({ title: 'Share Canceled', description: 'Sharing was canceled by the user.' });
          return;
        }
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied!',
          description: navigator.share ?
            `Sharing via app failed, but link to "${caption}" copied to clipboard.` :
            `Link to "${caption}" copied to clipboard.`
        });
      } catch (error: any) {
        console.error('Clipboard API failed:', error);
        toast({ variant: 'destructive', title: 'Operation Failed', description: 'Could not share or copy the link. Please try copying manually.' });
      }
    } else {
      toast({ variant: 'destructive', title: 'Not Supported', description: 'Your browser does not support sharing or copying to clipboard.' });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background/80 backdrop-blur-sm flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
          {isLoading && images.length === 0 && !error && (
            <div className="space-y-8">
              {Array.from({ length: INITIAL_LOAD_LIMIT }).map((_, index) => (
                <SkeletonCard key={`gallery-skeleton-${index}`} />
              ))}
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="my-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Images</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && images.length === 0 && (
             <div className="text-center text-muted-foreground py-10">
                <p>No images found. The gallery is currently empty.</p>
             </div>
          )}

          <ImageGrid images={images} onLikeToggle={handleLikeToggle} onShare={handleShare} />
          
          <div ref={loadMoreRef} style={{ height: '10px', marginTop: '20px' }} />


          {isFetchingMore && (
            <div className="space-y-8 mt-8">
              {Array.from({ length: LOAD_MORE_LIMIT }).map((_, index) => (
                <SkeletonCard key={`gallery-skeleton-more-${index}`} />
              ))}
            </div>
          )}

          {!isLoading && !hasMoreImages && images.length > 0 && (
            <p className="text-center text-muted-foreground mt-8">You&apos;ve reached the end of the gallery.</p>
          )}
        </main>

        <footer className="text-center p-6 text-sm text-muted-foreground border-t border-border/60 relative z-10 bg-background/90 backdrop-blur-md">
          <p>&copy; {new Date().getFullYear()} Alosious Benny&apos;s Gallery. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </>
  );
}

