import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EvidenceModel } from '../models/Evidence';

export default async function scienceSummaryRoutes(fastify: FastifyInstance) {
  // GET /api/science-summaries (or /api/evidences) - Fetch all science summaries
  const getSummariesHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const summaries = await EvidenceModel.find();
      return reply.code(200).send({
        success: true,
        collection: 'science_summaries',
        count: summaries.length,
        data: summaries
      });
    } catch (error: any) {
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
  fastify.get(
    '/api/science-summaries/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const summary = await EvidenceModel.findOne({ $or: [{ evidence_id: id }, { id }, { _id: id }] });

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
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch science summary'
        });
      }
    }
  );
}
