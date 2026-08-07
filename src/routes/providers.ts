import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProviderModel } from '../models/Provider';

export default async function providerRoutes(fastify: FastifyInstance) {
  // GET /api/providers - Fetch all providers
  fastify.get('/api/providers', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const providers = await ProviderModel.find();
      return reply.code(200).send({
        success: true,
        collection: 'providers',
        count: providers.length,
        data: providers
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch providers'
      });
    }
  });

  // GET /api/providers/:id - Fetch provider by ID
  fastify.get(
    '/api/providers/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const provider = await ProviderModel.findOne({ $or: [{ id }, { _id: id }] });

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
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch provider'
        });
      }
    }
  );
}
