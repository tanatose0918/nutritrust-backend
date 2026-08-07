"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const Brand_1 = require("../models/Brand");
const Ingredient_1 = require("../models/Ingredient");
const Provider_1 = require("../models/Provider");
const Product_1 = require("../models/Product");
const Evidence_1 = require("../models/Evidence");
const ProductAnalytics_1 = require("../models/ProductAnalytics");
// Fix Windows DNS SRV query issue for MongoDB Atlas
try {
    node_dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
    node_dns_1.default.setDefaultResultOrder('ipv4first');
}
catch (e) {
    // Ignore DNS set errors
}
dotenv_1.default.config();
async function seedDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is missing in .env');
        }
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose_1.default.connect(mongoUri, {
            dbName: 'Web_application_base',
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected to Database: Web_application_base');
        const mockupDir = node_path_1.default.resolve(__dirname, '../../../nutritrust-web-app/mockup');
        const brandsData = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(mockupDir, 'brands_mockup.json'), 'utf-8'));
        const ingredientsData = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(mockupDir, 'ingredients_mockup.json'), 'utf-8'));
        const providersData = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(mockupDir, 'providers_mockup.json'), 'utf-8'));
        const productsData = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(mockupDir, 'products_mockup.json'), 'utf-8'));
        const scienceSummariesData = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(mockupDir, 'science_summaries_mockup.json'), 'utf-8'));
        const analyticsData = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(mockupDir, 'products_analytics_mockup.json'), 'utf-8'));
        console.log('\n🧹 Clearing existing 6 collections...');
        await Promise.all([
            Brand_1.BrandModel.deleteMany({}),
            Ingredient_1.IngredientModel.deleteMany({}),
            Provider_1.ProviderModel.deleteMany({}),
            Product_1.ProductModel.deleteMany({}),
            Evidence_1.EvidenceModel.deleteMany({}),
            ProductAnalytics_1.ProductAnalyticsModel.deleteMany({})
        ]);
        console.log('📦 Seeding data into Collections...');
        const [brands, ingredients, providers, products, evidences, analytics] = await Promise.all([
            Brand_1.BrandModel.insertMany(brandsData),
            Ingredient_1.IngredientModel.insertMany(ingredientsData),
            Provider_1.ProviderModel.insertMany(providersData),
            Product_1.ProductModel.insertMany(productsData),
            Evidence_1.EvidenceModel.insertMany(scienceSummariesData),
            ProductAnalytics_1.ProductAnalyticsModel.insertMany(analyticsData)
        ]);
        console.log('\n🎉 Seed Successful!');
        console.log(`- Brands inserted: ${brands.length}`);
        console.log(`- Ingredients inserted: ${ingredients.length}`);
        console.log(`- Providers inserted: ${providers.length}`);
        console.log(`- Products inserted: ${products.length}`);
        console.log(`- Science Summaries inserted: ${evidences.length}`);
        console.log(`- Products Analytics inserted: ${analytics.length}`);
        await mongoose_1.default.disconnect();
        console.log('\n👋 Disconnected from MongoDB.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seed Failed:', error);
        process.exit(1);
    }
}
seedDatabase();
