"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserRatingsSchema = new mongoose_1.Schema({
    traceability: { type: Number, min: 1, max: 5 },
    compareEngine: { type: Number, min: 1, max: 5 },
    scienceEvidence: { type: Number, min: 1, max: 5 },
    bestDeals: { type: Number, min: 1, max: 5 }
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, sparse: true, trim: true, default: null },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, default: null },
    password_hash: { type: String, default: null },
    role: {
        type: String,
        enum: ['member', 'early_adopter', 'admin'],
        default: 'early_adopter'
    },
    subject_type: { type: String, default: 'general_user' },
    intake_routine: { type: String, default: 'morning' },
    health_goals: [{ type: String }],
    health_issues: { type: String, default: null },
    current_supplements: { type: String, default: null },
    ratings: { type: UserRatingsSchema, default: {} },
    feedback: { type: String, default: null },
    is_newsletter_subscriber: { type: Boolean, default: true }
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
