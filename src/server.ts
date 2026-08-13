import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
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
import webAnalyticsRoutes from './routes/webAnalytics';
import tokenizerRoutes from './routes/tokenizer';
import aiAdviceRoutes from './routes/aiAdvice';
import mcpRoutes from './routes/mcpRoutes';
import authRoutes from './routes/auth';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

const startServer = async () => {
  try {
    // Register CORS to allow requests from Next.js frontend (localhost:3000)
    await fastify.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // Register MongoDB Database Plugin
    await fastify.register(dbPlugin);

    // Health check endpoint
    fastify.get('/health', async () => {
      return { status: 'ok', service: 'NutriTrust Fastify Backend', timestamp: new Date().toISOString() };
    });

    // Register API Route Modules
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(brandRoutes, { prefix: '/api/brands' });
    await fastify.register(ingredientRoutes, { prefix: '/api/ingredients' });
    await fastify.register(providerRoutes, { prefix: '/api/providers' });
    await fastify.register(productRoutes, { prefix: '/api/products' });
    await fastify.register(scienceSummaryRoutes, { prefix: '/api/science-summaries' });
    await fastify.register(searchRoutes, { prefix: '/api/search' });
    await fastify.register(compareRoutes, { prefix: '/api/compare' });
    await fastify.register(waitlistRoutes, { prefix: '/api/waitlist' });
    await fastify.register(userRoutes, { prefix: '/api/users' });
    await fastify.register(webAnalyticsRoutes, { prefix: '/api/web-analytics' });
    await fastify.register(tokenizerRoutes, { prefix: '/api/tokenizer' });
    await fastify.register(aiAdviceRoutes);
    await fastify.register(mcpRoutes, { prefix: '/api/mcp' });

    const port = Number(process.env.PORT) || 5000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 NutriTrust Fastify Server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
