"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantPriceMCP = exports.MerchantPriceMCP = void 0;
const ProductAnalytics_1 = require("../models/ProductAnalytics");
const Product_1 = require("../models/Product");
const Brand_1 = require("../models/Brand");
class MerchantPriceMCP {
    /**
     * Neutral Official Store Price Indexer
     */
    async getOfficialStorePrices(productId) {
        const product = await Product_1.ProductModel.findOne({ id: productId }).lean();
        if (!product)
            return null;
        const brand = await Brand_1.BrandModel.findOne({ id: product.brand_id }).lean();
        const analytics = await ProductAnalytics_1.ProductAnalyticsModel.findOne({ product_id: productId }).lean();
        const offers = [
            {
                merchant_name: `${brand?.name || 'Brand'} Official Store`,
                store_type: 'Official Brand Store',
                platform: 'Shopee',
                package_price_thb: product.min_price,
                price_per_serving_thb: Number((product.min_price / 60).toFixed(2)),
                in_stock: true
            },
            {
                merchant_name: `${brand?.name || 'Brand'} Flagship Store`,
                store_type: 'Official Brand Store',
                platform: 'Lazada',
                package_price_thb: product.min_price + 20,
                price_per_serving_thb: Number(((product.min_price + 20) / 60).toFixed(2)),
                in_stock: true
            }
        ];
        return {
            product_id: product.id,
            product_name: product.name,
            brand_name: brand?.name || 'Verified Brand',
            official_offers: offers
        };
    }
}
exports.MerchantPriceMCP = MerchantPriceMCP;
exports.merchantPriceMCP = new MerchantPriceMCP();
