"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = searchRoutes;
const Product_1 = require("../models/Product");
const Brand_1 = require("../models/Brand");
const Ingredient_1 = require("../models/Ingredient");
async function searchRoutes(fastify) {
    // GET /api/search?q=... - Multi-collection high-speed search for HeroSection and global search
    fastify.get('/api/search', async (request, reply) => {
        try {
            const { q } = request.query;
            if (!q || q.trim() === '') {
                return reply.code(200).send({
                    success: true,
                    query: '',
                    data: {
                        products: [],
                        brands: [],
                        ingredients: []
                    }
                });
            }
            const searchTerm = q.trim();
            const regex = new RegExp(searchTerm, 'i');
            const [products, brands, ingredients] = await Promise.all([
                Product_1.ProductModel.find({
                    $or: [{ name: regex }, { category_slug: regex }, { sub_category: regex }]
                })
                    .limit(6)
                    .lean(),
                Brand_1.BrandModel.find({
                    $or: [{ name: regex }, { provide_at: regex }]
                })
                    .limit(4)
                    .lean(),
                Ingredient_1.IngredientModel.find({
                    name: regex
                })
                    .limit(4)
                    .lean()
            ]);
            return reply.code(200).send({
                success: true,
                query: searchTerm,
                data: {
                    products,
                    brands,
                    ingredients
                }
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Search failed'
            });
        }
    });
}
