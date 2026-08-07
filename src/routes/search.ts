import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProductModel } from '../models/Product';
import { BrandModel } from '../models/Brand';
import { IngredientModel } from '../models/Ingredient';

interface SearchQuery {
  q?: string;
}

export default async function searchRoutes(fastify: FastifyInstance) {
  // GET /api/search?q=... - Multi-collection high-speed search for HeroSection and global search
  fastify.get(
    '/api/search',
    async (request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) => {
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
          ProductModel.find({
            $or: [{ name: regex }, { category_slug: regex }, { sub_category: regex }]
          })
            .limit(6)
            .lean(),
          BrandModel.find({
            $or: [{ name: regex }, { provide_at: regex }]
          })
            .limit(4)
            .lean(),
          IngredientModel.find({
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
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Search failed'
        });
      }
    }
  );
}
