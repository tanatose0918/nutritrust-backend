"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = brandRoutes;
const Brand_1 = require("../models/Brand");
async function brandRoutes(fastify) {
    // GET /api/brands - Fetch all brands
    fastify.get('/api/brands', async (_request, reply) => {
        try {
            const brands = await Brand_1.BrandModel.find();
            return reply.code(200).send({
                success: true,
                collection: 'brands',
                count: brands.length,
                data: brands
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch brands'
            });
        }
    });
    // GET /api/brands/:id - Fetch brand by ID
    fastify.get('/api/brands/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const brand = await Brand_1.BrandModel.findOne({ $or: [{ id }, { _id: id }] });
            if (!brand) {
                return reply.code(404).send({
                    success: false,
                    message: `Brand '${id}' not found`
                });
            }
            return reply.code(200).send({
                success: true,
                data: brand
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch brand'
            });
        }
    });
}
