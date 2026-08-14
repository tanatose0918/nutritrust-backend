import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { privacyTokenizerMCP } from '../mcp/privacyTokenizerMCP.js';
import { stackSafetyMCP } from '../mcp/stackSafetyMCP.js';
import { dynamicPersonaMCP } from '../mcp/dynamicPersonaMCP.js';
import { evidenceKBMCP } from '../mcp/evidenceKBMCP.js';
import { merchantPriceMCP } from '../mcp/merchantPriceMCP.js';
import { geminiService } from '../services/geminiService.js';

export default async function mcpRoutes(fastify: FastifyInstance) {

  // MCP 1: Privacy Scrubbing & SIR 7+1 Tokenization
  fastify.post('/privacy-tokenize', async (req: FastifyRequest<{ Body: { email?: string; prompt?: string; consent_secret?: string } }>, reply: FastifyReply) => {
    try {
      const { email, prompt, consent_secret } = req.body || {};
      const result = privacyTokenizerMCP.processUserInput(email, prompt, consent_secret);
      return reply.send({ success: true, mcp_service: 'MCP 1: Privacy & Tokenizer', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 2: Stack Safety & Upper Limit (UL) Guard
  fastify.post('/stack-safety', async (req: FastifyRequest<{ Body: { product_ids: string[]; health_issues?: string[]; health_goals?: string[] } }>, reply: FastifyReply) => {
    try {
      const { product_ids, health_issues, health_goals } = req.body || {};
      const result = await stackSafetyMCP.analyzeStackSafety(product_ids || [], health_issues, health_goals);
      return reply.send({ success: true, mcp_service: 'MCP 2: Stack Safety & Interactions', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 5: Dynamic Persona Matching Engine
  fastify.post('/dynamic-persona-match', async (req: FastifyRequest<{ Body: { email?: string; prompt?: string; product_ids: string[]; health_issues?: string[]; health_goals?: string[] } }>, reply: FastifyReply) => {
    try {
      const { email, prompt, product_ids, health_issues, health_goals } = req.body || {};
      const result = await dynamicPersonaMCP.computeDynamicMatch({ email, raw_prompt: prompt, product_ids: product_ids || [], health_issues, health_goals });
      return reply.send({ success: true, mcp_service: 'MCP 5: Dynamic Persona Matching Engine', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 3: Clinical Evidence KB (Cost of Storage Optimized)
  fastify.get('/evidence-kb', async (req: FastifyRequest<{ Querystring: { ingredient_id?: string; condition?: string } }>, reply: FastifyReply) => {
    try {
      const { ingredient_id, condition } = req.query || {};
      const result = await evidenceKBMCP.queryEvidenceKB(ingredient_id, condition);
      return reply.send({ success: true, mcp_service: 'MCP 3: Clinical Evidence KB', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 4: Merchant Official Store Price Indexer (Single)
  fastify.get('/merchant-price', async (req: FastifyRequest<{ Querystring: { product_id: string } }>, reply: FastifyReply) => {
    try {
      const { product_id } = req.query || {};
      const result = await merchantPriceMCP.getOfficialStorePrices(product_id);
      return reply.send({ success: true, mcp_service: 'MCP 4: Merchant Price Indexer', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 4: Merchant Official Store Price Indexer (Batch / Multiple)
  fastify.post('/merchant-prices', async (req: FastifyRequest<{ Body: { product_ids: string[] } }>, reply: FastifyReply) => {
    try {
      const { product_ids } = req.body || {};
      const firstId = (product_ids && product_ids.length > 0) ? product_ids[0] : 'p_001';
      const result = await merchantPriceMCP.getOfficialStorePrices(firstId);
      return reply.send({ success: true, mcp_service: 'MCP 4: Merchant Price Indexer', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 6: AI Pharmacist Clinical Summary (Google AI Studio Gemini API)
  fastify.post('/ai-summary', async (req: FastifyRequest<{
    Body: {
      email?: string;
      product_names?: string[];
      conflicts?: any[];
      synergies?: any[];
      warnings?: any[];
      health_issues?: string[];
      health_goals?: string[];
      safety_score?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const body = req.body || {};
      const result = await geminiService.generateStackPharmacistSummary({
        email: body.email,
        product_names: body.product_names || [],
        conflicts: body.conflicts || [],
        synergies: body.synergies || [],
        warnings: body.warnings || [],
        health_issues: body.health_issues || [],
        health_goals: body.health_goals || [],
        safety_score: body.safety_score
      });
      return reply.send({ success: true, mcp_service: 'MCP 6: AI Pharmacist Synthesis (Gemini)', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });
}
