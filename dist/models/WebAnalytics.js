"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAnalyticsModel = void 0;
const mongoose_1 = require("mongoose");
const webAnalyticsSchema = new mongoose_1.Schema({
    snapshot_date: { type: String, required: true, unique: true, index: true },
    early_adopters_count: { type: Number, default: 0 },
    unique_visitors_count: { type: Number, default: 0 },
    total_product_searches: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now }
});
exports.WebAnalyticsModel = (0, mongoose_1.model)('WebAnalytics', webAnalyticsSchema);
