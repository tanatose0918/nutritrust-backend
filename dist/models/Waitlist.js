"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistModel = void 0;
const mongoose_1 = require("mongoose");
const WaitlistSchema = new mongoose_1.Schema({
    email: { type: String, required: true, trim: true, lowercase: true },
    source: { type: String, default: 'homepage' },
    interests: [{ type: String }]
}, { timestamps: true });
exports.WaitlistModel = (0, mongoose_1.model)('Waitlist', WaitlistSchema);
