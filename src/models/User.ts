import { Schema, model, Document } from 'mongoose';

export interface IUserRatings {
  traceability?: number;
  compareEngine?: number;
  scienceEvidence?: number;
  bestDeals?: number;
}

export interface IUser {
  id?: string;
  username?: string | null;
  email: string;
  password_hash?: string | null;
  role?: 'member' | 'early_adopter' | 'admin';
  health_goals?: string[];
  health_issues?: string | null;
  current_supplements?: string | null;
  ratings?: IUserRatings;
  feedback?: string | null;
  is_newsletter_subscriber?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserRatingsSchema = new Schema<IUserRatings>(
  {
    traceability: { type: Number, min: 1, max: 5 },
    compareEngine: { type: Number, min: 1, max: 5 },
    scienceEvidence: { type: Number, min: 1, max: 5 },
    bestDeals: { type: Number, min: 1, max: 5 }
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    username: { type: String, unique: true, sparse: true, trim: true, default: null },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, default: null },
    role: {
      type: String,
      enum: ['member', 'early_adopter', 'admin'],
      default: 'early_adopter'
    },
    health_goals: [{ type: String }],
    health_issues: { type: String, default: null },
    current_supplements: { type: String, default: null },
    ratings: { type: UserRatingsSchema, default: {} },
    feedback: { type: String, default: null },
    is_newsletter_subscriber: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const UserModel = model<IUserDocument>('User', UserSchema);
