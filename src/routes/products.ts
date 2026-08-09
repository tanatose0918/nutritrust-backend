import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProductModel } from '../models/Product';
import { BrandModel } from '../models/Brand';
import { IngredientModel } from '../models/Ingredient';
import { ProviderModel } from '../models/Provider';
import { EvidenceModel } from '../models/Evidence';
import { ProductAnalyticsModel } from '../models/ProductAnalytics';
import { batchCacheWorker } from '../services/cacheWorker';

interface GetProductsQuery {
  category?: string;
  sub_category?: string;
  health_goal?: string;
  brand?: string;
  search?: string;
  sort?: string;
}

interface GetProductParams {
  id: string;
}

export default async function productRoutes(fastify: FastifyInstance) {
  // GET /api/products - List products with high performance lean query, multi-field search & unit price sorting
  fastify.get(
    '/api/products',
    async (request: FastifyRequest<{ Querystring: GetProductsQuery }>, reply: FastifyReply) => {
      try {
        const { category, sub_category, health_goal, brand, search, sort } = request.query;
        const query: Record<string, any> = {};

        if (category) query.category_slug = category;
        if (sub_category) query.sub_category = sub_category;
        if (brand) query.brand_id = brand;

        if (health_goal) {
          const goalRegex = new RegExp(health_goal.trim(), 'i');
          query.$or = [
            { category_slug: goalRegex },
            { sub_category: goalRegex }
          ];
        }

        if (search && search.trim() !== '') {
          const regex = new RegExp(search.trim(), 'i');
          const searchConditions = [
            { name: regex },
            { category_slug: regex },
            { sub_category: regex }
          ];

          if (query.$or) {
            query.$and = [{ $or: query.$or }, { $or: searchConditions }];
            delete query.$or;
          } else {
            query.$or = searchConditions;
          }
        }

        let products = await ProductModel.find(query).lean();

        // Calculate price_per_serving for sorting
        const enrichedProducts = products.map((p) => {
          let servings = 1;
          if (p.serving_package) {
            const match = p.serving_package.match(/(\d+)/);
            if (match && match[1]) {
              servings = parseInt(match[1], 10);
            }
          }
          const pricePerServing = servings > 0 ? Number((p.min_price / servings).toFixed(2)) : p.min_price;
          return {
            ...p,
            servings,
            price_per_serving: pricePerServing
          };
        });

        // Sorting options
        if (sort === 'lowest_unit_price' || sort === 'unit_price') {
          enrichedProducts.sort((a, b) => a.price_per_serving - b.price_per_serving);
        } else if (sort === 'min_price_asc') {
          enrichedProducts.sort((a, b) => a.min_price - b.min_price);
        } else if (sort === 'min_price_desc') {
          enrichedProducts.sort((a, b) => b.min_price - a.min_price);
        }

        return reply.code(200).send({
          success: true,
          collection: 'products',
          count: enrichedProducts.length,
          data: enrichedProducts
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

  // GET /api/products/:id - Fast pre-computed cache lookup (<10ms response time) with DB fallback
  fastify.get(
    '/api/products/:id',
    async (request: FastifyRequest<{ Params: GetProductParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;

        // Check Batch Cache Worker first for ultra-fast response (<10ms)
        const cachedProduct = batchCacheWorker.getCachedProduct(id);
        if (cachedProduct) {
          return reply.code(200).send({
            success: true,
            cached: true,
            data: cachedProduct
          });
        }

        // Cache-miss fallback to live DB lookup
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
          cached: false,
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
        // Refresh cache after product creation
        await batchCacheWorker.precomputeProductPayloads();

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
