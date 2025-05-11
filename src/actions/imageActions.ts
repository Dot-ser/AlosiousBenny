
'use server';

import dbConnect from '@/lib/mongodb';
import ImageModel, { type IImage } from '@/models/Image';
import { isAuthenticated, getAdminUser } from './authActions';
import type { ImageType } from '@/types'; // Assuming ImageType definition

interface AddImageInput {
  src: string;
  caption: string;
  alt: string;
  hashtags?: string[];
}

interface ActionResult<T = null> {
  success: boolean;
  error?: string;
  image?: T; // For addImageAction
}

// Helper to map MongoDB document to ImageType
function mapMongoImageToImageType(mongoImage: IImage): ImageType {
  return {
    id: mongoImage._id.toString(),
    src: mongoImage.src,
    alt: mongoImage.alt,
    caption: mongoImage.caption,
    hashtags: mongoImage.hashtags || [],
    likes: mongoImage.likes || 0,
    commentsCount: mongoImage.comments?.length || 0,
    sharesCount: 0, // Assuming sharesCount is not stored in MongoDB yet
    liked: false, // This would typically be user-specific, default to false for gallery view
    user: {
      name: mongoImage.user.name,
      avatarUrl: mongoImage.user.avatarUrl || `https://i.pravatar.cc/150?u=${mongoImage.user.name}`,
    },
    timestamp: new Date(mongoImage.timestamp).toLocaleUpperCase(), // Format as needed
  };
}


export async function addImageAction(input: AddImageInput): Promise<ActionResult<ImageType>> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: 'Unauthorized. Please log in.' };
  }

  try {
    await dbConnect();
    const adminUser = await getAdminUser(); // Get current admin user details

    const newImage = new ImageModel({
      ...input,
      alt: input.alt || input.caption, // Default alt text to caption if not provided
      user: { // Embed admin user info
        name: adminUser.name,
        avatarUrl: adminUser.avatarUrl,
      },
      timestamp: new Date(),
    });

    const savedImage = await newImage.save();
    return { success: true, image: mapMongoImageToImageType(savedImage) };
  } catch (error: any) {
    console.error('Error adding image:', error);
    return { success: false, error: error.message || 'Failed to add image to database.' };
  }
}

export async function getImagesAction(): Promise<ImageType[]> {
  try {
    await dbConnect();
    const images = await ImageModel.find().sort({ timestamp: -1 }).lean();
    return images.map(imageDoc => mapMongoImageToImageType(imageDoc as IImage));
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

export async function getImagesAdminAction(): Promise<ImageType[]> {
   const authenticated = await isAuthenticated();
   if (!authenticated) {
    // Or throw an error, or return empty array with status
    console.warn('Unauthorized attempt to fetch admin images');
    return []; 
  }
  try {
    await dbConnect();
    const images = await ImageModel.find().sort({ createdAt: -1 }).lean(); // Sort by creation time
    return images.map(imageDoc => mapMongoImageToImageType(imageDoc as IImage));
  } catch (error) {
    console.error('Error fetching images for admin:', error);
    return [];
  }
}


export async function toggleLikeAction(imageId: string): Promise<ActionResult<{ likes: number }>> {
  // Note: User-specific 'liked' status is not handled here without gallery user auth.
  // This action just increments/decrements the global like count.
  try {
    await dbConnect();
    const image = await ImageModel.findById(imageId);
    if (!image) {
      return { success: false, error: 'Image not found.' };
    }

    // For simplicity, let's assume we are just toggling a global like count.
    // A real "like" system would check if a *specific user* has already liked it.
    // Here, we'll just increment. If you want to allow unliking, you'd need more logic.
    // Let's simulate a toggle: if a 'liked' field was on the image for the current interaction.
    // Since we don't have that, this will always increment.
    // To make it a real toggle for a public page, you'd need client-side state and potentially local storage
    // or pass a parameter like `isLikedCurrentlyByClient`.
    // For now, let's just increment likes.
    
    // A more realistic scenario if we could track if the "current anonymous session" liked it:
    // This is a simplified example. A real app would need user accounts for gallery viewers.
    // We'll just increment the like count.
    image.likes = (image.likes || 0) + 1; // Simple increment
    
    // If you wanted to truly toggle and had some way to know if this "user" previously liked:
    // const currentlyLikedByClient = ???; // This is the missing piece without user auth
    // if (currentlyLikedByClient) {
    //   image.likes = Math.max(0, (image.likes || 0) - 1);
    // } else {
    //   image.likes = (image.likes || 0) + 1;
    // }
    
    await image.save();
    return { success: true, image: { likes: image.likes } };
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return { success: false, error: error.message || 'Failed to update like status.' };
  }
}
