
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  avatarUrl?: string; // For admin user profile in ImageCard
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String },
});

// Prevent model overwrite in Next.js hot reloading
const User = (models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default User;
