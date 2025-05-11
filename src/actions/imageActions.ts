
'use server';

import dbConnect from '@/lib/mongodb';
import ImageModel, { type IImage } from '@/models/Image';
import { isAuthenticated, getAdminUser } from './authActions';
import type { ImageType } from '@/types';

interface AddImageInput {
  src: string;
  caption: string;
  alt: string;
  hashtags?: string[];
}

interface ActionResult<T = null> {
  success: boolean;
  error?: string;
  data?: T;
}

interface PaginatedImagesResult {
  images: ImageType[];
  hasMore: boolean;
  totalImages: number;
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
    sharesCount: 0, 
    liked: false, 
    user: {
      name: mongoImage.user.name,
      avatarUrl: mongoImage.user.avatarUrl || `/images/logo.jpg`,
    },
    timestamp: new Date(mongoImage.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toLocaleUpperCase(), 
    order: mongoImage.order,
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
    const currentImageCount = await ImageModel.countDocuments();

    const newImage = new ImageModel({
      ...input,
      alt: input.alt || input.caption, 
      user: { 
        name: adminUser.name,
        avatarUrl: adminUser.avatarUrl,
      },
      timestamp: new Date(),
      order: currentImageCount, // Set initial order
    });

    const savedImage = await newImage.save();
    return { success: true, data: mapMongoImageToImageType(savedImage) };
  } catch (error: any) {
    console.error('Detailed error adding image:', error);
    return { success: false, error: error.message || 'Failed to add image to database. Check server logs for details.' };
  }
}

export async function getImagesAction(page: number = 1, limit: number = 4): Promise<PaginatedImagesResult> {
  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    const totalImages = await ImageModel.countDocuments();
    const imagesQuery = ImageModel.find()
      .sort({ order: 1 }) // Sort by order
      .skip(skip)
      .limit(limit)
      .lean();
    
    const images = await imagesQuery;
    
    const mappedImages = images.map(imageDoc => mapMongoImageToImageType(imageDoc as IImage));
    
    return {
      images: mappedImages,
      hasMore: page * limit < totalImages,
      totalImages,
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    return { images: [], hasMore: false, totalImages: 0 };
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
    // Sort by 'order' ascending for admin view, so it matches gallery and is intuitive for reordering
    const images = await ImageModel.find().sort({ order: 1 }).lean(); 
    return images.map(imageDoc => mapMongoImageToImageType(imageDoc as IImage));
  } catch (error) {
    console.error('Error fetching images for admin:', error);
    return [];
  }
}

export async function deleteImageAction(imageId: string): Promise<ActionResult> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: 'Unauthorized. Please log in.' };
  }

  if (!imageId) {
    return { success: false, error: 'Image ID is required.' };
  }

  try {
    await dbConnect();
    const imageToDelete = await ImageModel.findById(imageId);
    if (!imageToDelete) {
      return { success: false, error: 'Image not found or already deleted.' };
    }
    
    const deletedOrder = imageToDelete.order;
    const result = await ImageModel.findByIdAndDelete(imageId);
    if (!result) {
        // This case should ideally not be hit if findById found it, but good for safety
      return { success: false, error: 'Image not found or already deleted during deletion attempt.' };
    }

    // After deleting, update the order of subsequent images
    await ImageModel.updateMany(
      { order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message || 'Failed to delete image.' };
  }
}


export async function toggleLikeAction(imageId: string): Promise<ActionResult<{ likes: number }>> {
  try {
    await dbConnect();
    const image = await ImageModel.findById(imageId);
    if (!image) {
      return { success: false, error: 'Image not found.' };
    }
    
    image.likes = (image.likes || 0) + 1; 
        
    await image.save();
    return { success: true, data: { likes: image.likes } };
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return { success: false, error: error.message || 'Failed to update like status.' };
  }
}

export async function updateImageOrderAction(orderedImageIds: string[]): Promise<ActionResult> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: 'Unauthorized. Please log in.' };
  }

  if (!Array.isArray(orderedImageIds) || orderedImageIds.some(id => typeof id !== 'string')) {
    return { success: false, error: 'Invalid image order data.' };
  }

  try {
    await dbConnect();
    const bulkOps = orderedImageIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await ImageModel.bulkWrite(bulkOps);
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error updating image order:', error);
    return { success: false, error: error.message || 'Failed to update image order.' };
  }
}


export async function seedDatabase() {
  if (process.env.MONGODB_URI) {
    await dbConnect();
    const imageCount = await ImageModel.countDocuments();
    if (imageCount === 0) {
      console.log('No images found, seeding database...');
      const admin = await getAdminUser();

      const seedImages = [
        {
          src: "https://files.catbox.moe/weul01.jpg",
          alt: "Narvent - Fainted album art",
          caption: "Narvent - Fainted",
          hashtags: ["Gudd", "nice", "music"],
          user: { name: admin.name, avatarUrl: admin.avatarUrl },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          order: 0,
        },
        {
          src: "https://files.catbox.moe/k23ytz.jpg",
          alt: "K-391 & Alan Walker - Ignite album art",
          caption: "K-391 & Alan Walker - Ignite (feat. Julie Bergan & Seungri)",
          hashtags: ["nice", "edm", "walker"],
          user: { name: admin.name, avatarUrl: admin.avatarUrl },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
          order: 1,
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
  } else {
    console.log('MONGODB_URI not defined, skipping seed.');
  }
}
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL && process.env.SEED_DB_ON_START === 'true') {
   seedDatabase().catch(console.error); 
}
