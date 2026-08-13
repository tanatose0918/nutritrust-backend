import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { privacyTokenizerMCP } from '../mcp/privacyTokenizerMCP';
import { stackSafetyMCP } from '../mcp/stackSafetyMCP';
import { dynamicPersonaMCP } from '../mcp/dynamicPersonaMCP';
import { evidenceKBMCP } from '../mcp/evidenceKBMCP';
import { merchantPriceMCP } from '../mcp/merchantPriceMCP';

export default async function mcpRoutes(fastify: FastifyInstance) {

  // MCP 1: Privacy Scrubbing & SIR 7+1 Tokenization
  fastify.post('/api/mcp/privacy-tokenize', async (req: FastifyRequest<{ Body: { email?: string; prompt?: string; consent_secret?: string } }>, reply: FastifyReply) => {
    try {
      const { email, prompt, consent_secret } = req.body || {};
      const result = privacyTokenizerMCP.processUserInput(email, prompt, consent_secret);
      return reply.send({ success: true, mcp_service: 'MCP 1: Privacy & Tokenizer', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 2: Stack Safety & Upper Limit (UL) Guard
  fastify.post('/api/mcp/stack-safety', async (req: FastifyRequest<{ Body: { product_ids: string[] } }>, reply: FastifyReply) => {
    try {
      const { product_ids } = req.body || {};
      const result = await stackSafetyMCP.analyzeStackSafety(product_ids || []);
      return reply.send({ success: true, mcp_service: 'MCP 2: Stack Safety & Interactions', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 5: Dynamic Persona Matching Engine
  fastify.post('/api/mcp/dynamic-persona-match', async (req: FastifyRequest<{ Body: { email?: string; prompt?: string; product_ids: string[] } }>, reply: FastifyReply) => {
    try {
      const { email, prompt, product_ids } = req.body || {};
      const result = await dynamicPersonaMCP.computeDynamicMatch({ email, raw_prompt: prompt, product_ids: product_ids || [] });
      return reply.send({ success: true, mcp_service: 'MCP 5: Dynamic Persona Matching Engine', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 3: Clinical Evidence KB (Cost of Storage Optimized)
  fastify.get('/api/mcp/evidence-kb', async (req: FastifyRequest<{ Querystring: { ingredient_id?: string; condition?: string } }>, reply: FastifyReply) => {
    try {
      const { ingredient_id, condition } = req.query || {};
      const result = await evidenceKBMCP.queryEvidenceKB(ingredient_id, condition);
      return reply.send({ success: true, mcp_service: 'MCP 3: Clinical Evidence KB', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // MCP 4: Merchant Official Store Price Indexer
  fastify.get('/api/mcp/merchant-price', async (req: FastifyRequest<{ Querystring: { product_id: string } }>, reply: FastifyReply) => {
    try {
      const { product_id } = req.query || {};
      const result = await merchantPriceMCP.getOfficialStorePrices(product_id);
      return reply.send({ success: true, mcp_service: 'MCP 4: Merchant Price Indexer', data: result });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });
}
