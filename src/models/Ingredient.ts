import { Schema, model, Document } from 'mongoose';

export interface IIngredient {
  id: string;
  name: string;
  provider_id: string;
}

export interface IIngredientDocument extends IIngredient, Document {}

const IngredientSchema = new Schema<IIngredientDocument>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    provider_id: { type: String, required: true, ref: 'Provider' }
  },
  { timestamps: true, collection: 'ingredients' }
);

export const IngredientModel = model<IIngredientDocument>('Ingredient', IngredientSchema);
