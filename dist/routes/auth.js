"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const User_1 = require("../models/User");
async function authRoutes(fastify) {
    // Login route
    fastify.post('/login', async (request, reply) => {
        try {
            const { identifier, password } = request.body;
            if (!identifier) {
                return reply.status(400).send({
                    success: false,
                    message: 'Username or Email is required.',
                });
            }
            const query = identifier.includes('@')
                ? { email: identifier.toLowerCase().trim() }
                : { username: identifier.trim() };
            const user = await User_1.UserModel.findOne(query);
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User account not found. Please register for Early Access.',
                });
            }
            // If user has a password set, check it (fallback to direct match for MVP)
            if (password && user.password && user.password !== password) {
                return reply.status(401).send({
                    success: false,
                    message: 'Invalid password. Please try again.',
                });
            }
            return reply.send({
                success: true,
                message: 'Login successful',
                data: {
                    _id: user._id.toString(),
                    email: user.email,
                    username: user.username || user.email.split('@')[0],
                    role: user.role || 'early_adopter',
                    health_goals: user.health_goals || [],
                    health_issues: user.health_issues || '',
                    current_supplements: user.current_supplements || '',
                    subject_type: user.subject_type || 'Human Adult',
                    intake_routine: user.intake_routine || 'Daily Morning Routine',
                },
            });
        }
        catch (error) {
            fastify.log.error('Login error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Internal server error during login',
                error: error.message,
            });
        }
    });
}
