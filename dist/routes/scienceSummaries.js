"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = scienceSummaryRoutes;
const Evidence_1 = require("../models/Evidence");
async function scienceSummaryRoutes(fastify) {
    // GET /api/science-summaries (or /api/evidences) - Fetch all science summaries
    const getSummariesHandler = async (_request, reply) => {
        try {
            const summaries = await Evidence_1.EvidenceModel.find();
            return reply.code(200).send({
                success: true,
                collection: 'science_summaries',
                count: summaries.length,
                data: summaries
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch science summaries'
            });
        }
    };
    fastify.get('/api/science-summaries', getSummariesHandler);
    fastify.get('/api/evidences', getSummariesHandler);
    // GET /api/science-summaries/:id - Fetch summary by ID
    fastify.get('/api/science-summaries/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const summary = await Evidence_1.EvidenceModel.findOne({ $or: [{ evidence_id: id }, { id }, { _id: id }] });
            if (!summary) {
                return reply.code(404).send({
                    success: false,
                    message: `Science summary '${id}' not found`
                });
            }
            return reply.code(200).send({
                success: true,
                data: summary
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch science summary'
            });
        }
    });
}
