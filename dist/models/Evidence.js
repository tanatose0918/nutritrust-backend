"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceModel = void 0;
const mongoose_1 = require("mongoose");
const EvidenceSchema = new mongoose_1.Schema({
    evidence_id: { type: String, required: true, unique: true },
    id: { type: String },
    benefit_title: { type: String, required: true },
    summary: { type: String, required: true },
    evidence_level: { type: String, required: true },
    pubmed_ids: [{ type: String }]
}, { timestamps: true, collection: 'science_summaries' });
exports.EvidenceModel = (0, mongoose_1.model)('Evidence', EvidenceSchema);
