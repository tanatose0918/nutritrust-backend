"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandModel = void 0;
const mongoose_1 = require("mongoose");
const BrandSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    provide_at: { type: String, required: true },
    provider_list: [{ type: String, ref: 'Provider' }]
}, { timestamps: true, collection: 'brands' });
exports.BrandModel = (0, mongoose_1.model)('Brand', BrandSchema);
