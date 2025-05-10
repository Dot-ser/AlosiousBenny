export interface UserProfile {
  name: string;
  avatarUrl: string;
}

export interface ImageType {
  id: string;
  src: string; // data URI or URL
  alt: string;
  caption: string;
  hashtags: string[];
  likes: number;
  commentsCount: number; // Renamed for clarity
  sharesCount: number;   // Renamed for clarity
  liked: boolean;
  user: UserProfile;
  timestamp: string;
}
