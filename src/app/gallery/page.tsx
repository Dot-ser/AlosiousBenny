
'use client';

import { useState, useEffect } from 'react';
import type { ImageType, UserProfile } from '@/types';
import { ImageGrid } from '@/components/image-grid';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { ThemeToggle } from '@/components/theme-toggle';
import { SkeletonCard } from '@/components/skeleton-card';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Gallery - Alosious Benny",
  description: "Explore the visual gallery of Alosious Benny.",
};

// Example structure of an item from the API
interface ApiImageItem {
  hashtags: string;
  name: string;
  src: string;
  username: string;
  username_img: string;
  id?: string | number;
  likes?: number;
  commentsCount?: number;
  sharesCount?: number;
  liked?: boolean;
  timestamp?: string;
}

const mapApiDataToImageType = (apiData: ApiImageItem[]): ImageType[] => {
  return apiData.map((item, index) => {
    const user: UserProfile = {
      name: item.username,
      avatarUrl: item.username_img,
    };
    return {
      id: item.id?.toString() || `api-${index}-${Date.now()}`,
      src: item.src,
      alt: item.name || `Image by ${item.username}`,
      caption: item.name,
      hashtags: typeof item.hashtags === 'string'
        ? item.hashtags.split(',').map(tag => tag.trim().replace(/\s+/g, '').replace(/^#/, '')).filter(tag => tag)
        : [],
      likes: item.likes ?? Math.floor(Math.random() * 500),
      commentsCount: item.commentsCount ?? Math.floor(Math.random() * 50),
      sharesCount: item.sharesCount ?? Math.floor(Math.random() * 20),
      liked: item.liked ?? Math.random() > 0.5,
      user: user,
      timestamp: item.timestamp ?? `${Math.floor(Math.random() * 24) + 1} HOURS AGO`,
    };
  });
};


function SplashScreen({ onFinished }: { onFinished: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 2500); // Adjust splash screen duration as needed
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out">
      <div className="w-full max-w-xl p-4">
        <SkeletonCard /> 
        <div className="mt-8">
         <SkeletonCard />
        </div>
      </div>
       <div className="absolute bottom-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2 mx-auto" />
        <p className="text-lg font-semibold text-foreground">Loading Gallery...</p>
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </div>
    </div>
  );
}


export default function GalleryPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    setIsClient(true); // Mount only on client
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run fetch if client-side

    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://songapi-qzdn.onrender.com/posts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiImageItem[] = await response.json();
        const loadedImages = mapApiDataToImageType(data);
        setImages(loadedImages);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error("Failed to fetch images:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [isClient]);


  const handleLikeToggle = (id: string) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id
          ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 }
          : img
      )
    );
  };

  if (!isClient || isSplashVisible) {
    return <SplashScreen onFinished={() => setIsSplashVisible(false)} />;
  }
  
  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          {isLoading && !error && (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonCard key={`client-skeleton-${index}`} />
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
          {!isLoading && !error && (
            <ImageGrid images={images} onLikeToggle={handleLikeToggle} />
          )}
        </main>

        <footer className="text-center p-6 text-sm text-muted-foreground border-t">
          <p>&copy; {new Date().getFullYear()} Alosious Benny's Gallery. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </>
  );
}
