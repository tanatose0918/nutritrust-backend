import { Schema, model, Document } from 'mongoose';

export interface IBrand {
  id: string;
  name: string;
  provide_at: string;
  provider_list: string[];
}

export interface IBrandDocument extends IBrand, Document {}

const BrandSchema = new Schema<IBrandDocument>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    provide_at: { type: String, required: true },
    provider_list: [{ type: String, ref: 'Provider' }]
  },
  { timestamps: true, collection: 'brands' }
);

export const BrandModel = model<IBrandDocument>('Brand', BrandSchema);
