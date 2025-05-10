
'use client';

import { useState, useEffect } from 'react';
import type { ImageType, UserProfile } from '@/types';
import { ImageGrid } from '@/components/image-grid';
import { Toaster } from '@/components/ui/toaster';
import { Camera, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Example structure of an item from the API
interface ApiImageItem {
  hashtags: string;
  name: string;
  src: string;
  username: string;
  username_img: string;
  // Add any other fields that might come from the API
  id?: string | number; // Optional ID if API provides one
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
        ? item.hashtags.split(',').map(tag => tag.trim().replace(/\s+/g, '')).filter(tag => tag) 
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


export default function InstaShowPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
  }, []);


  const handleLikeToggle = (id: string) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id
          ? { ...img, liked: !img.liked, likes: img.liked ? img.likes - 1 : img.likes + 1 }
          : img
      )
    );
  };

  if (!isClient) {
    // Render nothing or a loading indicator on the server to avoid hydration mismatch
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">InstaShow</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
          <p>&copy; {new Date().getFullYear()} InstaShow. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </>
  );
}
