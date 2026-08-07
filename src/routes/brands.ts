import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BrandModel } from '../models/Brand';

export default async function brandRoutes(fastify: FastifyInstance) {
  // GET /api/brands - Fetch all brands
  fastify.get('/api/brands', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const brands = await BrandModel.find();
      return reply.code(200).send({
        success: true,
        collection: 'brands',
        count: brands.length,
        data: brands
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch brands'
      });
    }
  });

  // GET /api/brands/:id - Fetch brand by ID
  fastify.get(
    '/api/brands/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const brand = await BrandModel.findOne({ $or: [{ id }, { _id: id }] });

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
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch brand'
        });
      }
    }
  );
}
