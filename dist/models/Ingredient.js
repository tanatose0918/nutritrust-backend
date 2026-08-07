"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientModel = void 0;
const mongoose_1 = require("mongoose");
const IngredientSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    provider_id: { type: String, required: true, ref: 'Provider' }
}, { timestamps: true, collection: 'ingredients' });
exports.IngredientModel = (0, mongoose_1.model)('Ingredient', IngredientSchema);
