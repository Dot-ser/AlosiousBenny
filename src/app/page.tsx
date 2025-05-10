
'use client';

import { useState, useEffect } from 'react';
import type { ImageType, UserProfile } from '@/types';
import { ImageGrid } from '@/components/image-grid';
import { Toaster } from '@/components/ui/toaster';
import { Camera } from 'lucide-react';

const apiJsonResponse = [
  {
    "hashtags": "Gudd ,nice etc",
    "name": "Narvent - Fainted",
    "src": "https://files.catbox.moe/weul01.jpg",
    "username": "Narvent",
    "username_img": "https://files.catbox.moe/k23ytz.jpg"
  },
  {
    "hashtags": "nice",
    "name": "K-391 & Alan Walker - Ignite (feat. Julie Bergan & Seungri)",
    "src": "https://files.catbox.moe/k23ytz.jpg",
    "username": "Alan Walker",
    "username_img": "https://files.catbox.moe/k23ytz.jpg"
  }
];

const mapApiDataToImageType = (apiData: any[]): ImageType[] => {
  return apiData.map((item, index) => {
    const user: UserProfile = {
      name: item.username,
      avatarUrl: item.username_img,
    };
    return {
      id: `api-${index}-${Date.now()}`,
      src: item.src,
      alt: item.name || `Image by ${item.username}`,
      caption: item.name,
      hashtags: typeof item.hashtags === 'string' 
        ? item.hashtags.split(',').map(tag => tag.trim().replace(/\s+/g, '')).filter(tag => tag) 
        : [],
      likes: Math.floor(Math.random() * 500), // Random likes for demo
      commentsCount: Math.floor(Math.random() * 50), // Random comments for demo
      sharesCount: Math.floor(Math.random() * 20), // Random shares for demo
      liked: Math.random() > 0.5, // Random liked status for demo
      user: user,
      timestamp: `${Math.floor(Math.random() * 24) + 1} HOURS AGO`, // Random timestamp
    };
  });
};


export default function InstaShowPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadedImages = mapApiDataToImageType(apiJsonResponse);
    setImages(loadedImages);
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
    return null; 
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
            {/* Future: Add user profile icon or settings */}
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          {/* ImageUploadForm removed */}
          <ImageGrid images={images} onLikeToggle={handleLikeToggle} />
        </main>

        <footer className="text-center p-6 text-sm text-muted-foreground border-t">
          <p>&copy; {new Date().getFullYear()} InstaShow. All rights reserved.</p>
        </footer>
      </div>
      <Toaster />
    </>
  );
}
