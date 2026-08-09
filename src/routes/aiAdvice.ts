import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { geminiService } from '../services/geminiService';
import { UserModel } from '../models/User';

interface AIRecommendationRequestBody {
  email?: string;
  health_goals?: string[];
  health_issues?: string;
  current_supplements?: string;
}

export default async function aiAdviceRoutes(fastify: FastifyInstance) {
  // POST /api/ai/recommendation - Personalized Health AI Recommendation via Gemini REST API
  fastify.post(
    '/api/ai/recommendation',
    async (request: FastifyRequest<{ Body: AIRecommendationRequestBody }>, reply: FastifyReply) => {
      try {
        const { email, health_goals, health_issues, current_supplements } = request.body || {};

        let userProfile: any = {
          email: email || 'guest_user@nutritrust.com',
          health_goals: health_goals || [],
          health_issues: health_issues || '',
          current_supplements: current_supplements || ''
        };

        // If email provided, fetch latest health profile from MongoDB UserModel
        if (email) {
          const dbUser = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();
          if (dbUser) {
            userProfile = {
              ...dbUser,
              health_goals: health_goals || dbUser.health_goals || [],
              health_issues: health_issues || dbUser.health_issues || '',
              current_supplements: current_supplements || dbUser.current_supplements || ''
            };
          }
        }

        const result = await geminiService.generateRecommendation(userProfile);

        if (result.rate_limited) {
          return reply.code(429).send({
            success: false,
            rate_limited: true,
            message: result.message,
            zk_token: result.zk_token,
            sir_token: result.sir_token
          });
        }

        if (!result.success) {
          return reply.code(500).send({
            success: false,
            message: result.message || 'Failed to process AI recommendation'
          });
        }

        return reply.code(200).send({
          success: true,
          zk_token: result.zk_token,
          sir_token: result.sir_token,
          request_payload: result.request_payload,
          data: result.response_data
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Server error during AI recommendation'
        });
      }
    }
  );

  // GET /api/ai/buffer-status - Check Gemini REST API Rate Limiter & Buffer Queue status
  fastify.get('/api/ai/buffer-status', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = geminiService.getBufferStatus();
      return reply.code(200).send({
        success: true,
        data: status
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch buffer status'
      });
    }
  });
}
