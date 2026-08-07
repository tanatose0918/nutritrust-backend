import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProductModel } from '../models/Product';
import { BrandModel } from '../models/Brand';
import { IngredientModel } from '../models/Ingredient';
import { ProviderModel } from '../models/Provider';
import { EvidenceModel } from '../models/Evidence';
import { ProductAnalyticsModel } from '../models/ProductAnalytics';

interface GetProductsQuery {
  category?: string;
  brand?: string;
  search?: string;
}

interface GetProductParams {
  id: string;
}

export default async function productRoutes(fastify: FastifyInstance) {
  // GET /api/products - List products with high performance lean query & multi-field word search
  fastify.get(
    '/api/products',
    async (request: FastifyRequest<{ Querystring: GetProductsQuery }>, reply: FastifyReply) => {
      try {
        const { category, brand, search } = request.query;
        const query: Record<string, any> = {};

        if (category) query.category_slug = category;
        if (brand) query.brand_id = brand;

        if (search && search.trim() !== '') {
          const regex = new RegExp(search.trim(), 'i');
          query.$or = [
            { name: regex },
            { category_slug: regex },
            { sub_category: regex }
          ];
        }

        const products = await ProductModel.find(query).lean();

        return reply.code(200).send({
          success: true,
          collection: 'products',
          count: products.length,
          data: products
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch products'
        });
      }
    }
  );

  // GET /api/products/:id - Get a product by ID with full relation populates (Brand, Ingredients, Providers, Evidences, Analytics)
  fastify.get(
    '/api/products/:id',
    async (request: FastifyRequest<{ Params: GetProductParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const product = await ProductModel.findOne({ $or: [{ id }, { _id: id }] }).lean();

        if (!product) {
          return reply.code(404).send({
            success: false,
            message: `Product with ID '${id}' not found`
          });
        }

        const ingredientIds = (product.ingredient_list || []).map((item) => item.igd_id);

        const [brand, ingredients, evidences, analytics] = await Promise.all([
          BrandModel.findOne({ id: product.brand_id }).lean(),
          IngredientModel.find({ id: { $in: ingredientIds } }).lean(),
          product.evidence_ids && product.evidence_ids.length > 0
            ? EvidenceModel.find({
                $or: [
                  { evidence_id: { $in: product.evidence_ids } },
                  { id: { $in: product.evidence_ids } }
                ]
              }).lean()
            : Promise.resolve([]),
          ProductAnalyticsModel.findOne({ product_id: product.id }).lean()
        ]);

        const providerIds = [
          ...(brand?.provider_list || []),
          ...ingredients.map((ing) => ing.provider_id)
        ];

        const providers = providerIds.length > 0
          ? await ProviderModel.find({ id: { $in: providerIds } }).lean()
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
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch product detail'
        });
      }
    }
  );

  // GET /api/analytics/:productId - Fetch Merchant Score Analytics for a given product
  fastify.get(
    '/api/analytics/:productId',
    async (request: FastifyRequest<{ Params: { productId: string } }>, reply: FastifyReply) => {
      try {
        const { productId } = request.params;
        const analytics = await ProductAnalyticsModel.findOne({ product_id: productId }).lean();

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
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch product analytics'
        });
      }
    }
  );

  // POST /api/products - Create a new product
  fastify.post(
    '/api/products',
    async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      try {
        const newProduct = await ProductModel.create(request.body as any);
        return reply.code(201).send({
          success: true,
          data: newProduct
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(400).send({
          success: false,
          message: error.message || 'Failed to create product'
        });
      }
    }
  );
}
