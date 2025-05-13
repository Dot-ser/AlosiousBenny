
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
import { PageLoader } from '@/components/gallery-page-loader';
import { ScrollCue } from '@/components/scroll-cue';
import { cn } from '@/lib/utils';


const INITIAL_LOAD_LIMIT = 4;
const LOAD_MORE_LIMIT = 4;

export default function GalleryPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isPageReady, setIsPageReady] = useState(false); 
  const [isFetchingInitialImages, setIsFetchingInitialImages] = useState(true);
  const [isFetchingMoreImages, setIsFetchingMoreImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const { toast } = useToast();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);

  const fetchImagesCallback = useCallback(async (page: number, limit: number, append: boolean = false) => {
    if (append) {
      setIsFetchingMoreImages(true);
    } else {
      setIsFetchingInitialImages(true);
    }
    setError(null);

    try {
      const result = await getImagesAction(page, limit);
      setImages(prevImages => {
        const currentImageIds = new Set(prevImages.map(img => img.id));
        const newUniqueImages = result.images.filter(img => !currentImageIds.has(img.id));
        return append ? [...prevImages, ...newUniqueImages] : result.images;
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
        setIsFetchingMoreImages(false);
      } else {
        setIsFetchingInitialImages(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    document.title = "Alosious Benny's Gallery";

    fetchImagesCallback(1, INITIAL_LOAD_LIMIT).finally(() => {
      setTimeout(() => {
        setIsPageReady(true);
        if (typeof window !== 'undefined' && window.location.hash) {
          const imageIdFromHash = window.location.hash.replace('#image-', '');
          if (imageIdFromHash) {
            setTimeout(() => { 
              const element = document.getElementById(`image-card-${imageIdFromHash}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          }
        }
      }, 200); 
    });
  }, [fetchImagesCallback]);

  useEffect(() => {
    if (isPageReady && images.length > 0 && hasMoreImages) {
      setShowScrollCue(true);
      const timer = setTimeout(() => {
        setShowScrollCue(false);
      }, 7000); 

      const handleScroll = () => {
        if (window.scrollY > 50) { 
          setShowScrollCue(false);
          window.removeEventListener('scroll', handleScroll);
          clearTimeout(timer);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timer);
      };
    } else {
      setShowScrollCue(false);
    }
  }, [isPageReady, images, hasMoreImages]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreImages && !isFetchingMoreImages && !isFetchingInitialImages && isPageReady) { 
      fetchImagesCallback(currentPage + 1, LOAD_MORE_LIMIT, true);
    }
  }, [hasMoreImages, isFetchingMoreImages, currentPage, fetchImagesCallback, isFetchingInitialImages, isPageReady]);

  useEffect(() => {
    if (!isPageReady || isFetchingMoreImages || isFetchingInitialImages) return; 

    const currentObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreImages && !isFetchingMoreImages) {
          handleLoadMore();
        }
      },
      { 
        rootMargin: '600px 0px', // Fetch when the loader is 600px from viewport vertical edges
        threshold: 0.01 // Trigger as soon as 1% of the loader is visible within the rootMargin
      } 
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
  }, [handleLoadMore, isPageReady, hasMoreImages, isFetchingMoreImages, isFetchingInitialImages]);


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
    
    let shareUrl = `${window.location.origin}${window.location.pathname}#image-${imageId}`;
    if (typeof window !== 'undefined' && window.location.host) {
       shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}#image-${imageId}`;
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
        console.warn('Web Share API failed or was cancelled:', error);
        if (error.name === 'AbortError') {
           toast({ title: 'Share Canceled', description: 'Sharing was canceled by the user.' });
          return;
        }
         // Fallback to clipboard if navigator.share fails for other reasons (e.g. permission denied)
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied!',
          description: `Link to "${caption}" copied to clipboard. ${!navigator.share ? 'Direct share not available on this browser.' : 'Sharing via system dialog failed or was denied.'}`
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
      <PageLoader isFinishing={isPageReady} />
      <ScrollCue isVisible={showScrollCue} />
      
      <div className={cn(
          "min-h-screen bg-background/80 backdrop-blur-sm flex flex-col",
          isPageReady ? "opacity-100" : "opacity-0",
          "transition-opacity duration-500 delay-200" 
        )}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
          {isFetchingInitialImages && images.length === 0 && !error && (
            <div className="space-y-8">
              {Array.from({ length: INITIAL_LOAD_LIMIT }).map((_, index) => (
                <SkeletonCard key={`gallery-initial-skeleton-${index}`} />
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
          {!isFetchingInitialImages && images.length === 0 && !error && (
             <div className="text-center text-muted-foreground py-10">
                <p>No images found. The gallery is currently empty.</p>
             </div>
          )}

          <ImageGrid images={images} onLikeToggle={handleLikeToggle} onShare={handleShare} />
          
          <div ref={loadMoreRef} style={{ height: '1px', marginTop: '20px' }} aria-hidden="true" />


          {isFetchingMoreImages && images.length > 0 && ( 
            <div className="space-y-8 mt-8">
              {Array.from({ length: Math.min(LOAD_MORE_LIMIT, INITIAL_LOAD_LIMIT) }).map((_, index) => (
                <SkeletonCard key={`gallery-skeleton-more-${index}`} />
              ))}
            </div>
          )}

          {isPageReady && !hasMoreImages && images.length > 0 && (
            <p className="text-center text-muted-foreground mt-8">You&apos;ve reached the end of the gallery.</p>
          )}
        </main>

        <footer className="text-center p-6 text-sm text-muted-foreground border-t border-border/60 relative z-10 bg-background/90 backdrop-blur-md">
          <p>&copy; {new Date().getFullYear()} Alosious Benny's Gallery. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </>
  );
}

