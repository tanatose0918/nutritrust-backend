"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
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
const aiAdvice_1 = __importDefault(require("./routes/aiAdvice"));
const mcpRoutes_1 = __importDefault(require("./routes/mcpRoutes"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({
    logger: true,
});
const startServer = async () => {
    try {
        // Register CORS to allow requests from Next.js frontend (localhost:3000)
        await fastify.register(cors_1.default, {
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
        });
        // Register MongoDB Database Plugin
        await fastify.register(db_1.default);
        // Health check endpoint
        fastify.get('/health', async () => {
            return { status: 'ok', service: 'NutriTrust Fastify Backend', timestamp: new Date().toISOString() };
        });
        // Register API Route Modules
        await fastify.register(auth_1.default, { prefix: '/api/auth' });
        await fastify.register(brands_1.default, { prefix: '/api/brands' });
        await fastify.register(ingredients_1.default, { prefix: '/api/ingredients' });
        await fastify.register(providers_1.default, { prefix: '/api/providers' });
        await fastify.register(products_1.default, { prefix: '/api/products' });
        await fastify.register(scienceSummaries_1.default, { prefix: '/api/science-summaries' });
        await fastify.register(search_1.default, { prefix: '/api/search' });
        await fastify.register(compare_1.default, { prefix: '/api/compare' });
        await fastify.register(waitlist_1.default, { prefix: '/api/waitlist' });
        await fastify.register(users_1.default, { prefix: '/api/users' });
        await fastify.register(webAnalytics_1.default, { prefix: '/api/web-analytics' });
        await fastify.register(tokenizer_1.default, { prefix: '/api/tokenizer' });
        await fastify.register(aiAdvice_1.default);
        await fastify.register(mcpRoutes_1.default, { prefix: '/api/mcp' });
        const port = Number(process.env.PORT) || 5000;
        const host = process.env.HOST || '0.0.0.0';
        await fastify.listen({ port, host });
        console.log(`🚀 NutriTrust Fastify Server running at http://${host}:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
startServer();
