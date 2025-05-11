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
    // Kept original timestamp formatting, can be changed if needed e.g. toISOString()
    timestamp: new Date(mongoImage.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toLocaleUpperCase(), 
  };
}


export async function addImageAction(input: AddImageInput): Promise<ActionResult<ImageType>> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: 'Unauthorized. Please log in.' };
  }

  try {
    await dbConnect();
    const adminUser = await getAdminUser(); 

    const newImage = new ImageModel({
      ...input,
      alt: input.alt || input.caption, 
      user: { 
        name: adminUser.name,
        avatarUrl: adminUser.avatarUrl,
      },
      timestamp: new Date(),
    });

    const savedImage = await newImage.save();
    return { success: true, image: mapMongoImageToImageType(savedImage) };
  } catch (error: any) {
    console.error('Detailed error adding image:', error); // Log the full error object
    return { success: false, error: error.message || 'Failed to add image to database. Check server logs for details.' };
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
    console.warn('Unauthorized attempt to fetch admin images');
    return []; 
  }
  try {
    await dbConnect();
    const images = await ImageModel.find().sort({ createdAt: -1 }).lean(); 
    return images.map(imageDoc => mapMongoImageToImageType(imageDoc as IImage));
  } catch (error) {
    console.error('Error fetching images for admin:', error);
    return [];
  }
}


export async function toggleLikeAction(imageId: string): Promise<ActionResult<{ likes: number }>> {
  try {
    await dbConnect();
    const image = await ImageModel.findById(imageId);
    if (!image) {
      return { success: false, error: 'Image not found.' };
    }
    
    // This is a simplified like toggle for anonymous users, effectively just incrementing.
    // A real system would track user-specific likes.
    image.likes = (image.likes || 0) + 1; 
        
    await image.save();
    return { success: true, image: { likes: image.likes } };
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return { success: false, error: error.message || 'Failed to update like status.' };
  }
}

// Basic function to seed database if empty (for testing/initial setup)
// Not automatically run, needs to be called manually if desired (e.g. via a protected API route or script)
export async function seedDatabase() {
  await dbConnect();
  const imageCount = await ImageModel.countDocuments();
  if (imageCount === 0) {
    console.log('No images found, seeding database...');
    const admin = await getAdminUser(); // Use the admin user from .env for seeding

    const seedImages = [
      {
        src: "https://files.catbox.moe/weul01.jpg",
        alt: "Narvent - Fainted album art",
        caption: "Narvent - Fainted",
        hashtags: ["Gudd", "nice", "music"],
        user: { name: admin.name, avatarUrl: admin.avatarUrl },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        src: "https://files.catbox.moe/k23ytz.jpg",
        alt: "K-391 & Alan Walker - Ignite album art",
        caption: "K-391 & Alan Walker - Ignite (feat. Julie Bergan & Seungri)",
        hashtags: ["nice", "edm", "walker"],
        user: { name: admin.name, avatarUrl: admin.avatarUrl },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      }
    ];

    for (const imgData of seedImages) {
        const image = new ImageModel(imgData);
        await image.save();
    }
    console.log('Database seeded with initial images.');
  } else {
    console.log('Database already contains images, skipping seed.');
  }
}

// Example of how you might call seed (e.g. in a dev script or one-off admin action)
// if (process.env.NODE_ENV === 'development') {
//   seedDatabase().catch(console.error);
// }