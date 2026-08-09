import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sirTokenizer } from '../services/sirTokenizer';
import { edgeAnonymizer } from '../services/anonymizer';

interface TokenizerRequestBody {
  prompt: string;
  consent_secret?: string;
  anonymize?: boolean;
}

export default async function tokenizerRoutes(fastify: FastifyInstance) {
  // POST /api/tokenizer/compress - Thai Prompt Tokenizer & SIR Compression API
  fastify.post(
    '/api/tokenizer/compress',
    async (request: FastifyRequest<{ Body: TokenizerRequestBody }>, reply: FastifyReply) => {
      try {
        const { prompt, consent_secret, anonymize } = request.body || {};

        if (!prompt || !prompt.trim()) {
          return reply.code(400).send({
            success: false,
            message: 'Prompt text is required'
          });
        }

        const rawText = prompt.trim();
        const safeText = anonymize !== false ? edgeAnonymizer.scrubPII(rawText) : rawText;
        const compressedResult = sirTokenizer.compressSIR(safeText, consent_secret);

        return reply.code(200).send({
          success: true,
          pipeline: 'Compress-SIR-Tokenizer-v1',
          data: {
            original_prompt: safeText,
            sir_token: compressedResult.sir_token,
            matrix_7_plus_1: compressedResult.matrix,
            metrics: {
              compression_ratio: compressedResult.compression_ratio,
              original_len: compressedResult.original_length,
              compressed_len: compressedResult.compressed_length
            }
          }
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to tokenize prompt'
        });
      }
    }
  );
}
