import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformStore {
  rating: number;
  review_count: number;
  sold_count: string;
  store_type: string;
  url: string;
}

export interface IProductAnalytics extends Document {
  product_id: string;
  merchant_score: number;
  ratings_breakdown: {
    rating_score: number;
    total_reviews: number;
    satisfaction_rate: number;
  };
  merchant_chart_metrics: {
    authenticity: number;
    delivery_speed: number;
    packaging_quality: number;
    customer_service: number;
    repurchase_rate: number;
  };
  platform_breakdown: {
    shopee?: IPlatformStore;
    lazada?: IPlatformStore;
    tiktok?: IPlatformStore;
  };
  reference_sources: string[];
}

const PlatformStoreSchema = new Schema(
  {
    rating: { type: Number, required: true },
    review_count: { type: Number, required: true },
    sold_count: { type: String, required: true },
    store_type: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const ProductAnalyticsSchema: Schema = new Schema(
  {
    product_id: { type: String, required: true, unique: true, index: true },
    merchant_score: { type: Number, required: true },
    ratings_breakdown: {
      rating_score: { type: Number, required: true },
      total_reviews: { type: Number, required: true },
      satisfaction_rate: { type: Number, required: true }
    },
    merchant_chart_metrics: {
      authenticity: { type: Number, required: true },
      delivery_speed: { type: Number, required: true },
      packaging_quality: { type: Number, required: true },
      customer_service: { type: Number, required: true },
      repurchase_rate: { type: Number, required: true }
    },
    platform_breakdown: {
      shopee: { type: PlatformStoreSchema, required: false },
      lazada: { type: PlatformStoreSchema, required: false },
      tiktok: { type: PlatformStoreSchema, required: false }
    },
    reference_sources: [{ type: String }]
  },
  {
    timestamps: true,
    collection: 'products_analytics'
  }
);

export const ProductAnalyticsModel = mongoose.model<IProductAnalytics>(
  'ProductAnalytics',
  ProductAnalyticsSchema
);
