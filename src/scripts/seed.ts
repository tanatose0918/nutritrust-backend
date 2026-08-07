import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns';
import path from 'node:path';
import fs from 'node:fs';

import { BrandModel } from '../models/Brand';
import { IngredientModel } from '../models/Ingredient';
import { ProviderModel } from '../models/Provider';
import { ProductModel } from '../models/Product';
import { EvidenceModel } from '../models/Evidence';
import { ProductAnalyticsModel } from '../models/ProductAnalytics';

// Fix Windows DNS SRV query issue for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore DNS set errors
}

dotenv.config();

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing in .env');
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      dbName: 'Web_application_base',
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Connected to Database: Web_application_base');

    const mockupDir = path.resolve(__dirname, '../../../nutritrust-web-app/mockup');

    const brandsData = JSON.parse(fs.readFileSync(path.join(mockupDir, 'brands_mockup.json'), 'utf-8'));
    const ingredientsData = JSON.parse(fs.readFileSync(path.join(mockupDir, 'ingredients_mockup.json'), 'utf-8'));
    const providersData = JSON.parse(fs.readFileSync(path.join(mockupDir, 'providers_mockup.json'), 'utf-8'));
    const productsData = JSON.parse(fs.readFileSync(path.join(mockupDir, 'products_mockup.json'), 'utf-8'));
    const scienceSummariesData = JSON.parse(
      fs.readFileSync(path.join(mockupDir, 'science_summaries_mockup.json'), 'utf-8')
    );
    const analyticsData = JSON.parse(
      fs.readFileSync(path.join(mockupDir, 'products_analytics_mockup.json'), 'utf-8')
    );

    console.log('\n🧹 Clearing existing 6 collections...');
    await Promise.all([
      BrandModel.deleteMany({}),
      IngredientModel.deleteMany({}),
      ProviderModel.deleteMany({}),
      ProductModel.deleteMany({}),
      EvidenceModel.deleteMany({}),
      ProductAnalyticsModel.deleteMany({})
    ]);

    console.log('📦 Seeding data into Collections...');

    const [brands, ingredients, providers, products, evidences, analytics] = await Promise.all([
      BrandModel.insertMany(brandsData),
      IngredientModel.insertMany(ingredientsData),
      ProviderModel.insertMany(providersData),
      ProductModel.insertMany(productsData),
      EvidenceModel.insertMany(scienceSummariesData),
      ProductAnalyticsModel.insertMany(analyticsData)
    ]);

    console.log('\n🎉 Seed Successful!');
    console.log(`- Brands inserted: ${brands.length}`);
    console.log(`- Ingredients inserted: ${ingredients.length}`);
    console.log(`- Providers inserted: ${providers.length}`);
    console.log(`- Products inserted: ${products.length}`);
    console.log(`- Science Summaries inserted: ${evidences.length}`);
    console.log(`- Products Analytics inserted: ${analytics.length}`);

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Failed:', error);
    process.exit(1);
  }
}

seedDatabase();
