
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IVisitorCount extends Document {
  identifier: string; // To ensure we always update the same document, e.g., 'global_site_visits'
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorCountSchema: Schema<IVisitorCount> = new Schema(
  {
    identifier: { type: String, required: true, unique: true, default: 'global_site_visits' },
    count: { type: Number, default: 0 },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

const VisitorCountModel = (models.VisitorCount as Model<IVisitorCount>) || mongoose.model<IVisitorCount>('VisitorCount', VisitorCountSchema);

export default VisitorCountModel;
