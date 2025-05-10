'use client';

import { useState, useEffect } from 'react';
import type { ImageType, UserProfile } from '@/types';
import { ImageUploadForm } from '@/components/image-upload-form';
import { ImageGrid } from '@/components/image-grid';
import { Toaster } from '@/components/ui/toaster';
import { Camera } from 'lucide-react';

const initialImagesData: Omit<ImageType, 'id'>[] = [
  {
    src: 'https://picsum.photos/seed/instashow1/600/600',
    alt: 'Abstract colorful patterns',
    caption: 'Loving these vibrant colors! What do you see? 🎨',
    hashtags: ['abstractart', 'colorful', 'patterns', 'digitalart'],
    likes: 152,
    commentsCount: 12,
    sharesCount: 5,
    liked: false,
    user: { name: 'ArtExplorer', avatarUrl: 'https://picsum.photos/seed/avatar1/40/40' },
    timestamp: '3 HOURS AGO',
  },
  {
    src: 'https://picsum.photos/seed/instashow2/600/600',
    alt: 'Serene mountain landscape at sunset',
    caption: 'Golden hour magic in the mountains. ✨ Unforgettable views.',
    hashtags: ['mountains', 'sunset', 'landscape', 'naturelover', 'goldenhour'],
    likes: 278,
    commentsCount: 25,
    sharesCount: 11,
    liked: true,
    user: { name: 'MountainPeak', avatarUrl: 'https://picsum.photos/seed/avatar2/40/40' },
    timestamp: 'YESTERDAY',
  },
  {
    src: 'https://picsum.photos/seed/instashow3/600/600',
    alt: 'Delicious homemade pizza',
    caption: 'Pizza night! 🍕 So cheesy and yummy.',
    hashtags: ['pizza', 'foodie', 'homemade', 'comfortfood', 'pizzalover'],
    likes: 195,
    commentsCount: 33,
    sharesCount: 8,
    liked: false,
    user: { name: 'FoodFanatic', avatarUrl: 'https://picsum.photos/seed/avatar3/40/40' },
    timestamp: '2 DAYS AGO',
  },
];


export default function InstaShowPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize with unique IDs
    const processedInitialImages = initialImagesData.map((img, index) => ({
      ...img,
      id: `initial-${index}-${Date.now()}` 
    }));
    setImages(processedInitialImages);
  }, []);


  const handleImageAdd = (newImageData: Omit<ImageType, 'id' | 'likes' | 'commentsCount' | 'sharesCount' | 'liked'> & { user: UserProfile, timestamp: string }) => {
    const newImage: ImageType = {
      ...newImageData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      liked: false,
    };
    setImages((prevImages) => [newImage, ...prevImages]);
  };

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
          <ImageUploadForm onImageAdd={handleImageAdd} />
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
