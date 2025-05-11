
import type { ImageType } from '@/types';
import { ImageCard } from './image-card';

interface ImageGridProps {
  images: ImageType[];
  onLikeToggle: (id: string) => void;
  onShare: (id: string) => void; 
}

const INITIAL_PRIORITY_COUNT = 4; // Number of initial images to prioritize

export function ImageGrid({ images, onLikeToggle, onShare }: ImageGridProps) {
  if (images.length === 0) {
    // This case might be handled by the parent component (GalleryPage)
    // but kept here for robustness if ImageGrid is used elsewhere.
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>No images to show yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {images.map((image, index) => (
        <ImageCard 
          key={image.id} 
          image={image} 
          onLikeToggle={onLikeToggle} 
          onShare={onShare} 
          priority={index < INITIAL_PRIORITY_COUNT} // Prioritize the first few images
        />
      ))}
    </div>
  );
}
