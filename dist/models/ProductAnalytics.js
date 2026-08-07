"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductAnalyticsModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PlatformStoreSchema = new mongoose_1.Schema({
    rating: { type: Number, required: true },
    review_count: { type: Number, required: true },
    sold_count: { type: String, required: true },
    store_type: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });
const ProductAnalyticsSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    collection: 'products_analytics'
});
exports.ProductAnalyticsModel = mongoose_1.default.model('ProductAnalytics', ProductAnalyticsSchema);
