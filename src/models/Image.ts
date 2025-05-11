
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import type { IUser } from './User'; // Assuming User model will be created

export interface IComment extends Document {
  user: Types.ObjectId | IUser; // Simplified: storing user name directly or ObjectId
  username: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema({
  username: { type: String, required: true },
  userAvatar: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


export interface IImage extends Document {
  src: string;
  alt: string;
  caption: string;
  hashtags: string[];
  likes: number;
  order: number; // New field for image ordering
  // likedBy: Types.ObjectId[]; // To track specific users who liked, requires User auth for gallery
  comments: IComment[];
  user: { // Information about the uploader (admin)
    name: string;
    avatarUrl?: string;
  };
  timestamp: Date; // Changed to Date type
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema: Schema<IImage> = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    caption: { type: String, required: true },
    hashtags: [{ type: String }],
    likes: { type: Number, default: 0 },
    order: { type: Number, default: 0, index: true }, // Added order field with index
    // likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    user: { // Embedded uploader info
      name: { type: String, required: true },
      avatarUrl: { type: String },
    },
    timestamp: { type: Date, default: Date.now }, // Keep timestamp for consistency with ImageType
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Pre-save hook to set initial order for new images
ImageSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await ImageModel.countDocuments();
    this.order = count; // Assigns a 0-indexed order
  }
  next();
});


const ImageModel = (models.Image as Model<IImage>) || mongoose.model<IImage>('Image', ImageSchema);

export default ImageModel;
