"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = productRoutes;
const Product_1 = require("../models/Product");
const Brand_1 = require("../models/Brand");
const Ingredient_1 = require("../models/Ingredient");
const Provider_1 = require("../models/Provider");
const Evidence_1 = require("../models/Evidence");
const ProductAnalytics_1 = require("../models/ProductAnalytics");
async function productRoutes(fastify) {
    // GET /api/products - List products with high performance lean query & multi-field word search
    fastify.get('/api/products', async (request, reply) => {
        try {
            const { category, brand, search } = request.query;
            const query = {};
            if (category)
                query.category_slug = category;
            if (brand)
                query.brand_id = brand;
            if (search && search.trim() !== '') {
                const regex = new RegExp(search.trim(), 'i');
                query.$or = [
                    { name: regex },
                    { category_slug: regex },
                    { sub_category: regex }
                ];
            }
            const products = await Product_1.ProductModel.find(query).lean();
            return reply.code(200).send({
                success: true,
                collection: 'products',
                count: products.length,
                data: products
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch products'
            });
        }
    });
    // GET /api/products/:id - Get a product by ID with full relation populates (Brand, Ingredients, Providers, Evidences, Analytics)
    fastify.get('/api/products/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const product = await Product_1.ProductModel.findOne({ $or: [{ id }, { _id: id }] }).lean();
            if (!product) {
                return reply.code(404).send({
                    success: false,
                    message: `Product with ID '${id}' not found`
                });
            }
            const ingredientIds = (product.ingredient_list || []).map((item) => item.igd_id);
            const [brand, ingredients, evidences, analytics] = await Promise.all([
                Brand_1.BrandModel.findOne({ id: product.brand_id }).lean(),
                Ingredient_1.IngredientModel.find({ id: { $in: ingredientIds } }).lean(),
                product.evidence_ids && product.evidence_ids.length > 0
                    ? Evidence_1.EvidenceModel.find({
                        $or: [
                            { evidence_id: { $in: product.evidence_ids } },
                            { id: { $in: product.evidence_ids } }
                        ]
                    }).lean()
                    : Promise.resolve([]),
                ProductAnalytics_1.ProductAnalyticsModel.findOne({ product_id: product.id }).lean()
            ]);
            const providerIds = [
                ...(brand?.provider_list || []),
                ...ingredients.map((ing) => ing.provider_id)
            ];
            const providers = providerIds.length > 0
                ? await Provider_1.ProviderModel.find({ id: { $in: providerIds } }).lean()
                : [];
            return reply.code(200).send({
                success: true,
                data: {
                    ...product,
                    brand,
                    ingredients,
                    providers,
                    evidences,
                    analytics
                }
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch product detail'
            });
        }
    });
    // GET /api/analytics/:productId - Fetch Merchant Score Analytics for a given product
    fastify.get('/api/analytics/:productId', async (request, reply) => {
        try {
            const { productId } = request.params;
            const analytics = await ProductAnalytics_1.ProductAnalyticsModel.findOne({ product_id: productId }).lean();
            if (!analytics) {
                return reply.code(404).send({
                    success: false,
                    message: `Analytics for product '${productId}' not found`
                });
            }
            return reply.code(200).send({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch product analytics'
            });
        }
    });
    // POST /api/products - Create a new product
    fastify.post('/api/products', async (request, reply) => {
        try {
            const newProduct = await Product_1.ProductModel.create(request.body);
            return reply.code(201).send({
                success: true,
                data: newProduct
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Failed to create product'
            });
        }
    });
}
