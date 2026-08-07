"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderModel = void 0;
const mongoose_1 = require("mongoose");
const ProviderSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    traceability_process: { type: String, required: true }
}, { timestamps: true, collection: 'providers' });
exports.ProviderModel = (0, mongoose_1.model)('Provider', ProviderSchema);
