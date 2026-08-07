import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix Windows DNS SRV query issue for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Fallback if DNS server set fails
}

async function dbPlugin(fastify: FastifyInstance) {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is missing in .env');
    }

    await mongoose.connect(mongoUri, {
      dbName: 'Web_application_base',
      serverSelectionTimeoutMS: 5000,
    });
    fastify.log.info('MongoDB connected successfully via Mongoose');

    fastify.addHook('onClose', async () => {
      await mongoose.disconnect();
      fastify.log.info('MongoDB disconnected');
    });
  } catch (error) {
    fastify.log.error(error as Error, 'MongoDB connection warning: DB connection could not be established immediately');
  }
}

export default fp(dbPlugin);

