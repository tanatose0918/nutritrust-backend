import { Schema, model, Document } from 'mongoose';

export interface IProvider {
  id: string;
  name: string;
  traceability_process: string;
}

export interface IProviderDocument extends IProvider, Document {}

const ProviderSchema = new Schema<IProviderDocument>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    traceability_process: { type: String, required: true }
  },
  { timestamps: true, collection: 'providers' }
);

export const ProviderModel = model<IProviderDocument>('Provider', ProviderSchema);
