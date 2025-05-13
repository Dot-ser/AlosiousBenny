
'use server';

import dbConnect from '@/lib/mongodb';
import VisitorCountModel from '@/models/VisitorCount';

const COUNT_IDENTIFIER = 'global_site_visits';

interface VisitorCountResult {
  success: boolean;
  count?: number;
  error?: string;
}

export async function incrementAndGetVisitorCount(): Promise<VisitorCountResult> {
  try {
    await dbConnect();

    // Atomically find and update (or create if not exists) the visitor count document
    const updatedCountDoc = await VisitorCountModel.findOneAndUpdate(
      { identifier: COUNT_IDENTIFIER },
      { $inc: { count: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true } // upsert: true creates if not found
    ).lean();

    if (!updatedCountDoc) {
      // This case should ideally be handled by upsert, but as a fallback
      return { success: false, error: 'Failed to update or create visitor count.' };
    }

    return { success: true, count: updatedCountDoc.count };
  } catch (error: any) {
    console.error('Error incrementing visitor count:', error);
    return { success: false, error: error.message || 'Failed to increment visitor count.' };
  }
}

export async function getVisitorCount(): Promise<VisitorCountResult> {
  try {
    await dbConnect();
    const countDoc = await VisitorCountModel.findOne({ identifier: COUNT_IDENTIFIER }).lean();
    if (!countDoc) {
      // If no document exists, it means no visits have been recorded yet.
      return { success: true, count: 0 };
    }
    return { success: true, count: countDoc.count };
  } catch (error: any) {
    console.error('Error fetching visitor count:', error);
    return { success: false, error: error.message || 'Failed to fetch visitor count.' };
  }
}
