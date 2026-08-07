import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WaitlistModel } from '../models/Waitlist';
import { SurveyModel } from '../models/Survey';

interface WaitlistBody {
  email: string;
  source?: string;
  interests?: string[];
}

interface SurveyBody {
  email?: string;
  usefulness_rating?: number;
  feedback?: string;
  target_supplements?: string[];
  source?: string;
}

export default async function waitlistRoutes(fastify: FastifyInstance) {
  // POST /api/waitlist - Submit early access waitlist form
  fastify.post(
    '/api/waitlist',
    async (request: FastifyRequest<{ Body: WaitlistBody }>, reply: FastifyReply) => {
      try {
        const { email, source, interests } = request.body || {};

        if (!email || !email.trim()) {
          return reply.code(400).send({
            success: false,
            message: 'Email address is required'
          });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Upsert waitlist entry
        const entry = await WaitlistModel.findOneAndUpdate(
          { email: cleanEmail },
          {
            email: cleanEmail,
            source: source || 'homepage',
            interests: interests || []
          },
          { upsert: true, new: true }
        );

        const totalCount = await WaitlistModel.countDocuments();

        return reply.code(201).send({
          success: true,
          message: 'Successfully joined NutriTrust early access waitlist!',
          data: entry,
          total_subscribers: totalCount
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to submit waitlist form'
        });
      }
    }
  );

  // GET /api/waitlist/count - Get total subscriber count
  fastify.get('/api/waitlist/count', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const count = await WaitlistModel.countDocuments();
      return reply.code(200).send({
        success: true,
        count
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch waitlist count'
      });
    }
  });

  // POST /api/survey - Submit user survey/feedback response
  fastify.post(
    '/api/survey',
    async (request: FastifyRequest<{ Body: SurveyBody }>, reply: FastifyReply) => {
      try {
        const { email, usefulness_rating, feedback, target_supplements, source } = request.body || {};

        const newSurvey = await SurveyModel.create({
          email: email?.trim().toLowerCase() || undefined,
          usefulness_rating,
          feedback,
          target_supplements: target_supplements || [],
          source: source || 'web_survey'
        });

        return reply.code(201).send({
          success: true,
          message: 'Thank you for your feedback! Your submission helps us improve NutriTrust.',
          data: newSurvey
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to submit survey'
        });
      }
    }
  );

  // GET /api/surveys - List recent survey feedback
  fastify.get('/api/surveys', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const surveys = await SurveyModel.find().sort({ createdAt: -1 }).limit(100).lean();
      return reply.code(200).send({
        success: true,
        count: surveys.length,
        data: surveys
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch surveys'
      });
    }
  });
}
