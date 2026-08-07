import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IngredientModel } from '../models/Ingredient';

export default async function ingredientRoutes(fastify: FastifyInstance) {
  // GET /api/ingredients - Fetch all ingredients
  fastify.get('/api/ingredients', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const ingredients = await IngredientModel.find();
      return reply.code(200).send({
        success: true,
        collection: 'ingredients',
        count: ingredients.length,
        data: ingredients
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch ingredients'
      });
    }
  });

  // GET /api/ingredients/:id - Fetch ingredient by ID
  fastify.get(
    '/api/ingredients/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const ingredient = await IngredientModel.findOne({ $or: [{ id }, { _id: id }] });

        if (!ingredient) {
          return reply.code(404).send({
            success: false,
            message: `Ingredient '${id}' not found`
          });
        }

        return reply.code(200).send({
          success: true,
          data: ingredient
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch ingredient'
        });
      }
    }
  );
}
