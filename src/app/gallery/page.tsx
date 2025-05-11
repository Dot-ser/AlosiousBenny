
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import ParticleBackground from '@/components/particle-background'; 


export default function GalleryPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedImages = await getImagesAction();
      setImages(loadedImages);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error("Failed to fetch images:", e);
      toast({ variant: "destructive", title: "Error fetching images", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImages().then(() => {
      // After images are fetched and set, check for hash and scroll
      if (typeof window !== 'undefined' && window.location.hash) {
        const imageIdFromHash = window.location.hash.replace('#image-', '');
        if (imageIdFromHash) {
          // Timeout to allow DOM to update with images
          setTimeout(() => {
            const element = document.getElementById(`image-card-${imageIdFromHash}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100); // Small delay might be needed
        }
      }
    });
  }, [fetchImages]);


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
  
    const currentUrl = new URL(window.location.href);
    const shareUrl = `${currentUrl.protocol}//${currentUrl.host}/gallery#image-${imageId}`;
  
    const shareData = {
      title: `Check out: ${imageToShare ? imageToShare.caption : "DOT007 Gallery Image"}`,
      text: `I found this cool image "${imageToShare ? imageToShare.caption : 'an image'}" in DOT007's Gallery! Check it out:`,
      url: shareUrl,
    };
  
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: 'Shared!', description: 'Link to the image shared successfully.' });
        return;
      } catch (error: any) {
        console.error('Web Share API failed:', error);
        // For AbortError (user cancelled), we just return.
        // For other errors (like Permission Denied), we fall through to clipboard.
        if (error.name === 'AbortError') {
          // toast({ title: 'Sharing Cancelled', description: 'You cancelled the share action.'});
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
        <ParticleBackground />
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
              {Array.from({ length: 3 }).map((_, index) => (
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
          {!error && images.length > 0 && (
            <ImageGrid images={images} onLikeToggle={handleLikeToggle} onShare={handleShare} />
          )}
        </main>

        <footer className="text-center p-6 text-sm text-muted-foreground border-t border-border/60 relative z-10 bg-background/90 backdrop-blur-md">
          <p>&copy; {new Date().getFullYear()} DOT007&apos;s Gallery. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </>
  );

}
