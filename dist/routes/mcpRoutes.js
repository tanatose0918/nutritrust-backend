"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mcpRoutes;
const privacyTokenizerMCP_1 = require("../mcp/privacyTokenizerMCP");
const stackSafetyMCP_1 = require("../mcp/stackSafetyMCP");
const dynamicPersonaMCP_1 = require("../mcp/dynamicPersonaMCP");
const evidenceKBMCP_1 = require("../mcp/evidenceKBMCP");
const merchantPriceMCP_1 = require("../mcp/merchantPriceMCP");
async function mcpRoutes(fastify) {
    // MCP 1: Privacy Scrubbing & SIR 7+1 Tokenization
    fastify.post('/api/mcp/privacy-tokenize', async (req, reply) => {
        try {
            const { email, prompt, consent_secret } = req.body || {};
            const result = privacyTokenizerMCP_1.privacyTokenizerMCP.processUserInput(email, prompt, consent_secret);
            return reply.send({ success: true, mcp_service: 'MCP 1: Privacy & Tokenizer', data: result });
        }
        catch (err) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    });
    // MCP 2: Stack Safety & Upper Limit (UL) Guard
    fastify.post('/api/mcp/stack-safety', async (req, reply) => {
        try {
            const { product_ids } = req.body || {};
            const result = await stackSafetyMCP_1.stackSafetyMCP.analyzeStackSafety(product_ids || []);
            return reply.send({ success: true, mcp_service: 'MCP 2: Stack Safety & Interactions', data: result });
        }
        catch (err) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    });
    // MCP 5: Dynamic Persona Matching Engine
    fastify.post('/api/mcp/dynamic-persona-match', async (req, reply) => {
        try {
            const { email, prompt, product_ids } = req.body || {};
            const result = await dynamicPersonaMCP_1.dynamicPersonaMCP.computeDynamicMatch({ email, raw_prompt: prompt, product_ids: product_ids || [] });
            return reply.send({ success: true, mcp_service: 'MCP 5: Dynamic Persona Matching Engine', data: result });
        }
        catch (err) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    });
    // MCP 3: Clinical Evidence KB (Cost of Storage Optimized)
    fastify.get('/api/mcp/evidence-kb', async (req, reply) => {
        try {
            const { ingredient_id, condition } = req.query || {};
            const result = await evidenceKBMCP_1.evidenceKBMCP.queryEvidenceKB(ingredient_id, condition);
            return reply.send({ success: true, mcp_service: 'MCP 3: Clinical Evidence KB', data: result });
        }
        catch (err) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    });
    // MCP 4: Merchant Official Store Price Indexer
    fastify.get('/api/mcp/merchant-price', async (req, reply) => {
        try {
            const { product_id } = req.query || {};
            const result = await merchantPriceMCP_1.merchantPriceMCP.getOfficialStorePrices(product_id);
            return reply.send({ success: true, mcp_service: 'MCP 4: Merchant Price Indexer', data: result });
        }
        catch (err) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    });
}
