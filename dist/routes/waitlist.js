"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = waitlistRoutes;
const Waitlist_1 = require("../models/Waitlist");
const Survey_1 = require("../models/Survey");
async function waitlistRoutes(fastify) {
    // POST /api/waitlist - Submit early access waitlist form
    fastify.post('/api/waitlist', async (request, reply) => {
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
            const entry = await Waitlist_1.WaitlistModel.findOneAndUpdate({ email: cleanEmail }, {
                email: cleanEmail,
                source: source || 'homepage',
                interests: interests || []
            }, { upsert: true, new: true });
            const totalCount = await Waitlist_1.WaitlistModel.countDocuments();
            return reply.code(201).send({
                success: true,
                message: 'Successfully joined NutriTrust early access waitlist!',
                data: entry,
                total_subscribers: totalCount
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to submit waitlist form'
            });
        }
    });
    // GET /api/waitlist/count - Get total subscriber count
    fastify.get('/api/waitlist/count', async (request, reply) => {
        try {
            const count = await Waitlist_1.WaitlistModel.countDocuments();
            return reply.code(200).send({
                success: true,
                count
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch waitlist count'
            });
        }
    });
    // POST /api/survey - Submit user survey/feedback response
    fastify.post('/api/survey', async (request, reply) => {
        try {
            const { email, usefulness_rating, feedback, target_supplements, source } = request.body || {};
            const newSurvey = await Survey_1.SurveyModel.create({
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
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to submit survey'
            });
        }
    });
    // GET /api/surveys - List recent survey feedback
    fastify.get('/api/surveys', async (request, reply) => {
        try {
            const surveys = await Survey_1.SurveyModel.find().sort({ createdAt: -1 }).limit(100).lean();
            return reply.code(200).send({
                success: true,
                count: surveys.length,
                data: surveys
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch surveys'
            });
        }
    });
}
