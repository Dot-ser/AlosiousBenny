import type { ImageType } from '@/types';
import { ImageCard } from './image-card';

interface ImageGridProps {
  images: ImageType[];
  onLikeToggle: (id: string) => void;
}

export function ImageGrid({ images, onLikeToggle }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>No images to show yet. Upload some!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} onLikeToggle={onLikeToggle} />
      ))}
    </div>
  );
}
