"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyModel = void 0;
const mongoose_1 = require("mongoose");
const SurveySchema = new mongoose_1.Schema({
    email: { type: String, trim: true, lowercase: true },
    usefulness_rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    target_supplements: [{ type: String }],
    source: { type: String, default: 'web_survey' }
}, { timestamps: true });
exports.SurveyModel = (0, mongoose_1.model)('Survey', SurveySchema);
