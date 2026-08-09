"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchCacheWorker = void 0;
const Product_1 = require("../models/Product");
const Brand_1 = require("../models/Brand");
const Ingredient_1 = require("../models/Ingredient");
const Provider_1 = require("../models/Provider");
const Evidence_1 = require("../models/Evidence");
const ProductAnalytics_1 = require("../models/ProductAnalytics");
class BatchCacheWorker {
    productCache = new Map();
    lastPrecomputeTime = null;
    /**
     * Pre-compute compound populate JSON payloads for all products
     * Achieves sub-10ms API response time
     */
    async precomputeProductPayloads() {
        try {
            console.log('⚡ [BatchCacheWorker] Pre-computing product populate payloads...');
            const products = await Product_1.ProductModel.find().lean();
            if (products.length === 0)
                return 0;
            const brandIds = Array.from(new Set(products.map((p) => p.brand_id)));
            const allIngredientItems = products.flatMap((p) => p.ingredient_list || []);
            const ingredientIds = Array.from(new Set(allIngredientItems.map((item) => item.igd_id)));
            const allEvidenceIds = Array.from(new Set(products.flatMap((p) => p.evidence_ids || [])));
            const [brands, ingredients, evidences, analyticsList] = await Promise.all([
                Brand_1.BrandModel.find({ id: { $in: brandIds } }).lean(),
                Ingredient_1.IngredientModel.find({ id: { $in: ingredientIds } }).lean(),
                allEvidenceIds.length > 0
                    ? Evidence_1.EvidenceModel.find({
                        $or: [
                            { evidence_id: { $in: allEvidenceIds } },
                            { id: { $in: allEvidenceIds } }
                        ]
                    }).lean()
                    : Promise.resolve([]),
                ProductAnalytics_1.ProductAnalyticsModel.find().lean()
            ]);
            const brandMap = new Map(brands.map((b) => [b.id, b]));
            const ingredientMap = new Map(ingredients.map((ing) => [ing.id, ing]));
            const analyticsMap = new Map(analyticsList.map((a) => [a.product_id, a]));
            const providerIds = Array.from(new Set([
                ...brands.flatMap((b) => b.provider_list || []),
                ...ingredients.map((ing) => ing.provider_id)
            ]));
            const providers = providerIds.length > 0
                ? await Provider_1.ProviderModel.find({ id: { $in: providerIds } }).lean()
                : [];
            const providerMap = new Map(providers.map((pr) => [pr.id, pr]));
            this.productCache.clear();
            products.forEach((product) => {
                const brand = brandMap.get(product.brand_id) || null;
                const prodIngredients = (product.ingredient_list || []).map((item) => {
                    const ing = ingredientMap.get(item.igd_id);
                    return {
                        igd_id: item.igd_id,
                        volume: item.volume,
                        name: ing?.name || item.igd_id,
                        provider: ing?.provider_id ? providerMap.get(ing.provider_id) || null : null
                    };
                });
                const analytics = analyticsMap.get(product.id) || null;
                const prodEvidences = evidences.filter((ev) => product.evidence_ids &&
                    (product.evidence_ids.includes(ev.evidence_id) || (ev.id ? product.evidence_ids.includes(ev.id) : false)));
                const cachedPayload = {
                    ...product,
                    brand,
                    ingredients: prodIngredients,
                    providers,
                    evidences: prodEvidences,
                    analytics
                };
                this.productCache.set(product.id, cachedPayload);
                if (product._id) {
                    this.productCache.set(String(product._id), cachedPayload);
                }
            });
            this.lastPrecomputeTime = new Date();
            console.log(`✅ [BatchCacheWorker] Cached ${products.length} product payloads at ${this.lastPrecomputeTime.toISOString()}`);
            return products.length;
        }
        catch (err) {
            console.error('❌ [BatchCacheWorker Error]:', err);
            return 0;
        }
    }
    getCachedProduct(id) {
        return this.productCache.get(id) || null;
    }
    isCacheWarm() {
        return this.productCache.size > 0;
    }
}
exports.batchCacheWorker = new BatchCacheWorker();
