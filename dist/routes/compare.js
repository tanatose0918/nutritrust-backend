"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compareRoutes;
const Product_1 = require("../models/Product");
const Brand_1 = require("../models/Brand");
const Ingredient_1 = require("../models/Ingredient");
const Provider_1 = require("../models/Provider");
const Evidence_1 = require("../models/Evidence");
const ProductAnalytics_1 = require("../models/ProductAnalytics");
async function compareRoutes(fastify) {
    // GET /api/products/compare - Side-by-side comparison for 2-3 products
    fastify.get('/api/products/compare', async (request, reply) => {
        try {
            const rawIds = request.query.ids || request.query.products || '';
            if (!rawIds.trim()) {
                return reply.code(400).send({
                    success: false,
                    message: "Missing 'ids' or 'products' query parameter. Example: ?ids=p_001,p_002"
                });
            }
            // Parse comma-separated IDs, deduplicate and cap at 3
            const targetIds = Array.from(new Set(rawIds
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean))).slice(0, 3);
            if (targetIds.length === 0) {
                return reply.code(400).send({
                    success: false,
                    message: 'No valid product IDs provided for comparison'
                });
            }
            // Fetch products matching target IDs
            const products = await Product_1.ProductModel.find({ id: { $in: targetIds } }).lean();
            if (products.length === 0) {
                return reply.code(404).send({
                    success: false,
                    message: 'None of the requested products were found'
                });
            }
            // Collect relation IDs
            const brandIds = Array.from(new Set(products.map((p) => p.brand_id)));
            const allIngredientItems = products.flatMap((p) => p.ingredient_list || []);
            const ingredientIds = Array.from(new Set(allIngredientItems.map((item) => item.igd_id)));
            const allEvidenceIds = Array.from(new Set(products.flatMap((p) => p.evidence_ids || [])));
            // Parallel fetch relations
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
                ProductAnalytics_1.ProductAnalyticsModel.find({ product_id: { $in: targetIds } }).lean()
            ]);
            // Map lookup objects
            const brandMap = new Map(brands.map((b) => [b.id, b]));
            const ingredientMap = new Map(ingredients.map((ing) => [ing.id, ing]));
            const analyticsMap = new Map(analyticsList.map((a) => [a.product_id, a]));
            // Fetch providers
            const providerIds = Array.from(new Set([
                ...brands.flatMap((b) => b.provider_list || []),
                ...ingredients.map((ing) => ing.provider_id)
            ]));
            const providers = providerIds.length > 0
                ? await Provider_1.ProviderModel.find({ id: { $in: providerIds } }).lean()
                : [];
            const providerMap = new Map(providers.map((pr) => [pr.id, pr]));
            // Build enriched product objects
            const enrichedProducts = products.map((product) => {
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
                    (product.evidence_ids.includes(ev.evidence_id) ||
                        (ev.id ? product.evidence_ids.includes(ev.id) : false)));
                // Parse serving count for unit price calculation (e.g. "tablet-150" -> 150)
                let servings = 1;
                if (product.serving_package) {
                    const match = product.serving_package.match(/(\d+)/);
                    if (match && match[1]) {
                        servings = parseInt(match[1], 10);
                    }
                }
                const pricePerServing = servings > 0 ? Number((product.min_price / servings).toFixed(2)) : product.min_price;
                return {
                    ...product,
                    brand,
                    ingredients: prodIngredients,
                    analytics,
                    evidences: prodEvidences,
                    servings,
                    price_per_serving: pricePerServing
                };
            });
            // Build side-by-side Ingredient Matrix
            const ingredientMatrix = ingredients.map((ing) => {
                const amounts = {};
                enrichedProducts.forEach((p) => {
                    const found = (p.ingredient_list || []).find((item) => item.igd_id === ing.id);
                    amounts[p.id] = found ? found.volume : '-';
                });
                return {
                    ingredient_id: ing.id,
                    ingredient_name: ing.name,
                    provider_id: ing.provider_id,
                    provider_name: providerMap.get(ing.provider_id)?.name || null,
                    amounts
                };
            });
            // Summary calculations
            let lowestPriceProductId = enrichedProducts[0]?.id || null;
            let lowestUnitPriceProductId = enrichedProducts[0]?.id || null;
            let minPrice = enrichedProducts[0]?.min_price || Infinity;
            let minUnitPrice = enrichedProducts[0]?.price_per_serving || Infinity;
            enrichedProducts.forEach((p) => {
                if (p.min_price < minPrice) {
                    minPrice = p.min_price;
                    lowestPriceProductId = p.id;
                }
                if (p.price_per_serving < minUnitPrice) {
                    minUnitPrice = p.price_per_serving;
                    lowestUnitPriceProductId = p.id;
                }
            });
            return reply.code(200).send({
                success: true,
                compared_count: enrichedProducts.length,
                products: enrichedProducts,
                ingredient_matrix: ingredientMatrix,
                summary: {
                    lowest_package_price_product_id: lowestPriceProductId,
                    best_value_unit_price_product_id: lowestUnitPriceProductId
                }
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to generate comparison data'
            });
        }
    });
}
