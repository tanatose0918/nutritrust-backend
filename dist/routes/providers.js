"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = providerRoutes;
const Provider_1 = require("../models/Provider");
async function providerRoutes(fastify) {
    // GET /api/providers - Fetch all providers
    fastify.get('/api/providers', async (_request, reply) => {
        try {
            const providers = await Provider_1.ProviderModel.find();
            return reply.code(200).send({
                success: true,
                collection: 'providers',
                count: providers.length,
                data: providers
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch providers'
            });
        }
    });
    // GET /api/providers/:id - Fetch provider by ID
    fastify.get('/api/providers/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const provider = await Provider_1.ProviderModel.findOne({ $or: [{ id }, { _id: id }] });
            if (!provider) {
                return reply.code(404).send({
                    success: false,
                    message: `Provider '${id}' not found`
                });
            }
            return reply.code(200).send({
                success: true,
                data: provider
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch provider'
            });
        }
    });
}
