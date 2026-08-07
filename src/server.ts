import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import dbPlugin from './plugins/db';
import brandRoutes from './routes/brands';
import ingredientRoutes from './routes/ingredients';
import providerRoutes from './routes/providers';
import productRoutes from './routes/products';
import scienceSummaryRoutes from './routes/scienceSummaries';
import searchRoutes from './routes/search';
import compareRoutes from './routes/compare';
import waitlistRoutes from './routes/waitlist';
import userRoutes from './routes/users';
import { BrandModel } from './models/Brand';
import { IngredientModel } from './models/Ingredient';
import { ProviderModel } from './models/Provider';
import { ProductModel } from './models/Product';
import { EvidenceModel } from './models/Evidence';
import { ProductAnalyticsModel } from './models/ProductAnalytics';
import { WaitlistModel } from './models/Waitlist';
import { SurveyModel } from './models/Survey';
import { UserModel } from './models/User';

dotenv.config();

const server = Fastify({
  logger: true
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    // Register CORS
    await server.register(cors, {
      origin: '*'
    });

    // Register MongoDB Connection Plugin
    await server.register(dbPlugin);

    // Health check endpoint
    server.get('/health', async () => {
      return {
        status: 'ok',
        service: 'nutritrust-backend',
        database: 'Web_application_base',
        timestamp: new Date().toISOString()
      };
    });

    // Overview endpoint for all collections
    server.get('/api/collections', async () => {
      const [
        brandsCount,
        ingredientsCount,
        providersCount,
        productsCount,
        scienceSummariesCount,
        analyticsCount,
        waitlistCount,
        surveysCount,
        usersCount
      ] = await Promise.all([
        BrandModel.countDocuments(),
        IngredientModel.countDocuments(),
        ProviderModel.countDocuments(),
        ProductModel.countDocuments(),
        EvidenceModel.countDocuments(),
        ProductAnalyticsModel.countDocuments(),
        WaitlistModel.countDocuments(),
        SurveyModel.countDocuments(),
        UserModel.countDocuments()
      ]);

      return {
        success: true,
        database: 'Web_application_base',
        collections: {
          brands: { count: brandsCount, endpoint: '/api/brands' },
          ingredients: { count: ingredientsCount, endpoint: '/api/ingredients' },
          providers: { count: providersCount, endpoint: '/api/providers' },
          products: { count: productsCount, endpoint: '/api/products' },
          science_summaries: { count: scienceSummariesCount, endpoint: '/api/science-summaries' },
          products_analytics: { count: analyticsCount, endpoint: '/api/analytics/:productId' },
          waitlists: { count: waitlistCount, endpoint: '/api/waitlist/count' },
          surveys: { count: surveysCount, endpoint: '/api/surveys' },
          users: { count: usersCount, endpoint: '/api/users' }
        }
      };
    });

    // Register Collection & Utility Routes
    await server.register(brandRoutes);
    await server.register(ingredientRoutes);
    await server.register(providerRoutes);
    await server.register(productRoutes);
    await server.register(scienceSummaryRoutes);
    await server.register(searchRoutes);
    await server.register(compareRoutes);
    await server.register(waitlistRoutes);
    await server.register(userRoutes);

    await server.listen({ port: PORT, host: HOST });
    console.log(`\n🚀 NutriTrust Fastify Backend running on http://localhost:${PORT}\n`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

