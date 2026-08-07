"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
// Fix Windows DNS SRV query issue for MongoDB Atlas
try {
    node_dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
    node_dns_1.default.setDefaultResultOrder('ipv4first');
}
catch (e) {
    // Fallback if DNS server set fails
}
async function dbPlugin(fastify) {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is missing in .env');
        }
        await mongoose_1.default.connect(mongoUri, {
            dbName: 'Web_application_base',
            serverSelectionTimeoutMS: 5000,
        });
        fastify.log.info('MongoDB connected successfully via Mongoose');
        fastify.addHook('onClose', async () => {
            await mongoose_1.default.disconnect();
            fastify.log.info('MongoDB disconnected');
        });
    }
    catch (error) {
        fastify.log.error(error, 'MongoDB connection warning: DB connection could not be established immediately');
    }
}
exports.default = (0, fastify_plugin_1.default)(dbPlugin);
