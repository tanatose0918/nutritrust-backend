"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const User_1 = require("../models/User");
async function userRoutes(fastify) {
    // POST / - Create or update user profile & survey answers
    fastify.post('/', async (request, reply) => {
        try {
            const { username, email, role, subject_type, intake_routine, health_goals, health_issues, current_supplements, ratings, feedback, is_newsletter_subscriber } = request.body || {};
            if (!email || !email.trim()) {
                return reply.code(400).send({
                    success: false,
                    message: 'Email address is required'
                });
            }
            const cleanEmail = email.trim().toLowerCase();
            const updateData = {
                email: cleanEmail,
                role: role || 'early_adopter'
            };
            if (username !== undefined)
                updateData.username = username ? username.trim() : null;
            if (subject_type !== undefined)
                updateData.subject_type = subject_type;
            if (intake_routine !== undefined)
                updateData.intake_routine = intake_routine;
            if (health_goals !== undefined)
                updateData.health_goals = health_goals;
            if (health_issues !== undefined)
                updateData.health_issues = health_issues;
            if (current_supplements !== undefined)
                updateData.current_supplements = current_supplements;
            if (ratings !== undefined)
                updateData.ratings = ratings;
            if (feedback !== undefined)
                updateData.feedback = feedback;
            if (is_newsletter_subscriber !== undefined)
                updateData.is_newsletter_subscriber = is_newsletter_subscriber;
            // Upsert user profile
            const user = await User_1.UserModel.findOneAndUpdate({ email: cleanEmail }, { $set: updateData }, { upsert: true, new: true, runValidators: true });
            const totalUsers = await User_1.UserModel.countDocuments();
            return reply.code(200).send({
                success: true,
                message: 'User profile saved successfully!',
                data: user,
                total_users: totalUsers
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to save user profile'
            });
        }
    });
    // GET / - List users
    fastify.get('/', async (request, reply) => {
        try {
            const users = await User_1.UserModel.find().sort({ createdAt: -1 }).limit(100).lean();
            return reply.code(200).send({
                success: true,
                count: users.length,
                data: users
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch users'
            });
        }
    });
    // GET /id/:id - Fetch user profile by MongoDB _id
    fastify.get('/id/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const user = await User_1.UserModel.findById(id).lean();
            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: `User with ID '${id}' not found`
                });
            }
            return reply.code(200).send({
                success: true,
                data: user
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch user by ID'
            });
        }
    });
    // PUT /id/:id - Update user profile by MongoDB _id
    fastify.put('/id/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const updatePayload = request.body || {};
            const user = await User_1.UserModel.findByIdAndUpdate(id, { $set: updatePayload }, { new: true, runValidators: true }).lean();
            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: `User with ID '${id}' not found`
                });
            }
            return reply.code(200).send({
                success: true,
                message: 'User profile updated successfully!',
                data: user
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to update user profile'
            });
        }
    });
    // GET /:email - Get single user profile by email
    fastify.get('/:email', async (request, reply) => {
        try {
            const { email } = request.params;
            const cleanEmail = email.trim().toLowerCase();
            const user = await User_1.UserModel.findOne({ email: cleanEmail }).lean();
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
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch user profile'
            });
        }
    });
}
