import { Schema, model, Document } from 'mongoose';

export interface IWaitlist {
  email: string;
  source?: string;
  interests?: string[];
  createdAt?: Date;
}

export interface IWaitlistDocument extends IWaitlist, Document {}

const WaitlistSchema = new Schema<IWaitlistDocument>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    source: { type: String, default: 'homepage' },
    interests: [{ type: String }]
  },
  { timestamps: true }
);

export const WaitlistModel = model<IWaitlistDocument>('Waitlist', WaitlistSchema);
