import { Schema, model, Document } from 'mongoose';

export interface IIngredientItem {
  igd_id: string;
  volume: string;
}

export interface ISafetyProfile {
  warnings: string[];
  contraindications: string[];
  optimal_intake: string;
  pros: string[];
  considerations: string[];
}

export interface IProduct {
  id: string;
  brand_id: string;
  name: string;
  category_slug: string;
  sub_category?: string | null;
  ingredient_list: IIngredientItem[];
  serving_package: string;
  min_price: number;
  max_price?: number | null;
  safety_profile?: ISafetyProfile;
  evidence_ids: string[];
  health_goals?: string[];
  health_issues?: string[];
}

export interface IProductDocument extends IProduct, Document {}

const SafetyProfileSchema = new Schema<ISafetyProfile>(
  {
    warnings: [{ type: String }],
    contraindications: [{ type: String }],
    optimal_intake: { type: String, required: true },
    pros: [{ type: String }],
    considerations: [{ type: String }]
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    id: { type: String, required: true, unique: true },
    brand_id: { type: String, required: true, ref: 'Brand' },
    name: { type: String, required: true },
    category_slug: { type: String, required: true },
    sub_category: { type: String, default: null },
    ingredient_list: [
      {
        igd_id: { type: String, required: true, ref: 'Ingredient' },
        volume: { type: String, required: true }
      }
    ],
    serving_package: { type: String, required: true },
    min_price: { type: Number, required: true },
    max_price: { type: Number, default: null },
    safety_profile: { type: SafetyProfileSchema },
    evidence_ids: [{ type: String, ref: 'Evidence' }],
    health_goals: [{ type: String }],
    health_issues: [{ type: String }]
  },
  { timestamps: true }
);

export const ProductModel = model<IProductDocument>('Product', ProductSchema);
