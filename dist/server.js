"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("@fastify/cors"));
const db_1 = __importDefault(require("./plugins/db"));
const brands_1 = __importDefault(require("./routes/brands"));
const ingredients_1 = __importDefault(require("./routes/ingredients"));
const providers_1 = __importDefault(require("./routes/providers"));
const products_1 = __importDefault(require("./routes/products"));
const scienceSummaries_1 = __importDefault(require("./routes/scienceSummaries"));
const search_1 = __importDefault(require("./routes/search"));
const compare_1 = __importDefault(require("./routes/compare"));
const waitlist_1 = __importDefault(require("./routes/waitlist"));
const users_1 = __importDefault(require("./routes/users"));
const webAnalytics_1 = __importDefault(require("./routes/webAnalytics"));
const tokenizer_1 = __importDefault(require("./routes/tokenizer"));
const cacheWorker_1 = require("./services/cacheWorker");
const Brand_1 = require("./models/Brand");
const Ingredient_1 = require("./models/Ingredient");
const Provider_1 = require("./models/Provider");
const Product_1 = require("./models/Product");
const Evidence_1 = require("./models/Evidence");
const ProductAnalytics_1 = require("./models/ProductAnalytics");
const Waitlist_1 = require("./models/Waitlist");
const Survey_1 = require("./models/Survey");
const User_1 = require("./models/User");
const WebAnalytics_1 = require("./models/WebAnalytics");
dotenv_1.default.config();
const server = (0, fastify_1.default)({
    logger: true
});
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
async function start() {
    try {
        // Register CORS
        await server.register(cors_1.default, {
            origin: '*'
        });
        // Register MongoDB Connection Plugin
        await server.register(db_1.default);
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
            const [brandsCount, ingredientsCount, providersCount, productsCount, scienceSummariesCount, analyticsCount, waitlistCount, surveysCount, usersCount, webAnalyticsCount] = await Promise.all([
                Brand_1.BrandModel.countDocuments(),
                Ingredient_1.IngredientModel.countDocuments(),
                Provider_1.ProviderModel.countDocuments(),
                Product_1.ProductModel.countDocuments(),
                Evidence_1.EvidenceModel.countDocuments(),
                ProductAnalytics_1.ProductAnalyticsModel.countDocuments(),
                Waitlist_1.WaitlistModel.countDocuments(),
                Survey_1.SurveyModel.countDocuments(),
                User_1.UserModel.countDocuments(),
                WebAnalytics_1.WebAnalyticsModel.countDocuments()
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
                    users: { count: usersCount, endpoint: '/api/users' },
                    web_analytics: { count: webAnalyticsCount, endpoint: '/api/web-analytics' }
                }
            };
        });
        // Register Collection & Utility Routes
        await server.register(brands_1.default);
        await server.register(ingredients_1.default);
        await server.register(providers_1.default);
        await server.register(products_1.default);
        await server.register(scienceSummaries_1.default);
        await server.register(search_1.default);
        await server.register(compare_1.default);
        await server.register(waitlist_1.default);
        await server.register(users_1.default);
        await server.register(webAnalytics_1.default);
        await server.register(tokenizer_1.default);
        await server.listen({ port: PORT, host: HOST });
        console.log(`\n🚀 NutriTrust Fastify Backend running on http://localhost:${PORT}\n`);
        // Pre-warm product cache for sub-10ms response time
        cacheWorker_1.batchCacheWorker.precomputeProductPayloads().catch((e) => console.error(e));
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
start();
