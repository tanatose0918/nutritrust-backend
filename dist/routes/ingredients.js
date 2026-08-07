"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ingredientRoutes;
const Ingredient_1 = require("../models/Ingredient");
async function ingredientRoutes(fastify) {
    // GET /api/ingredients - Fetch all ingredients
    fastify.get('/api/ingredients', async (_request, reply) => {
        try {
            const ingredients = await Ingredient_1.IngredientModel.find();
            return reply.code(200).send({
                success: true,
                collection: 'ingredients',
                count: ingredients.length,
                data: ingredients
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch ingredients'
            });
        }
    });
    // GET /api/ingredients/:id - Fetch ingredient by ID
    fastify.get('/api/ingredients/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const ingredient = await Ingredient_1.IngredientModel.findOne({ $or: [{ id }, { _id: id }] });
            if (!ingredient) {
                return reply.code(404).send({
                    success: false,
                    message: `Ingredient '${id}' not found`
                });
            }
            return reply.code(200).send({
                success: true,
                data: ingredient
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Failed to fetch ingredient'
            });
        }
    });
}
