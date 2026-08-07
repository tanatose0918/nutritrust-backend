import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserModel, IUser } from '../models/User';

interface UserRequestBody {
  username?: string | null;
  email: string;
  password?: string;
  role?: 'member' | 'early_adopter' | 'admin';
  health_goals?: string[];
  health_issues?: string | null;
  current_supplements?: string | null;
  ratings?: {
    traceability?: number;
    compareEngine?: number;
    scienceEvidence?: number;
    bestDeals?: number;
  };
  feedback?: string | null;
  is_newsletter_subscriber?: boolean;
}

export default async function userRoutes(fastify: FastifyInstance) {
  // POST /api/users - Create or update user profile & survey answers
  fastify.post(
    '/api/users',
    async (request: FastifyRequest<{ Body: UserRequestBody }>, reply: FastifyReply) => {
      try {
        const {
          username,
          email,
          role,
          health_goals,
          health_issues,
          current_supplements,
          ratings,
          feedback,
          is_newsletter_subscriber
        } = request.body || {};

        if (!email || !email.trim()) {
          return reply.code(400).send({
            success: false,
            message: 'Email address is required'
          });
        }

        const cleanEmail = email.trim().toLowerCase();

        const updateData: Partial<IUser> = {
          email: cleanEmail,
          role: role || 'early_adopter'
        };

        if (username !== undefined) updateData.username = username ? username.trim() : null;
        if (health_goals !== undefined) updateData.health_goals = health_goals;
        if (health_issues !== undefined) updateData.health_issues = health_issues;
        if (current_supplements !== undefined) updateData.current_supplements = current_supplements;
        if (ratings !== undefined) updateData.ratings = ratings;
        if (feedback !== undefined) updateData.feedback = feedback;
        if (is_newsletter_subscriber !== undefined) updateData.is_newsletter_subscriber = is_newsletter_subscriber;

        // Upsert user profile
        const user = await UserModel.findOneAndUpdate(
          { email: cleanEmail },
          { $set: updateData },
          { upsert: true, new: true, runValidators: true }
        );

        const totalUsers = await UserModel.countDocuments();

        return reply.code(200).send({
          success: true,
          message: 'User profile saved successfully!',
          data: user,
          total_users: totalUsers
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to save user profile'
        });
      }
    }
  );

  // GET /api/users - List users
  fastify.get('/api/users', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await UserModel.find().sort({ createdAt: -1 }).limit(100).lean();
      return reply.code(200).send({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to fetch users'
      });
    }
  });

  // GET /api/users/:email - Get single user profile by email
  fastify.get(
    '/api/users/:email',
    async (request: FastifyRequest<{ Params: { email: string } }>, reply: FastifyReply) => {
      try {
        const { email } = request.params;
        const cleanEmail = email.trim().toLowerCase();
        const user = await UserModel.findOne({ email: cleanEmail }).lean();

        if (!user) {
          return reply.code(404).send({
            success: false,
            message: `User with email '${cleanEmail}' not found`
          });
        }

        return reply.code(200).send({
          success: true,
          data: user
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to fetch user profile'
        });
      }
    }
  );
}
