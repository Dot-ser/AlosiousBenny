
export interface UserProfile {
  name: string;
  avatarUrl: string; // Can be a placeholder or actual URL
}

export interface ImageType {
  id: string; // MongoDB ObjectId as string
  src: string; 
  alt: string;
  caption: string;
  hashtags: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number; // Consider if this will be implemented
  liked: boolean; // Represents client-side state, may not be persisted per user without auth
  user: UserProfile; // Uploader's profile (admin)
  timestamp: string; // MongoDB timestamp will be converted to string for display
}
