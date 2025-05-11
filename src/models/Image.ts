
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

const ImageModel = (models.Image as Model<IImage>) || mongoose.model<IImage>('Image', ImageSchema);

export default ImageModel;
