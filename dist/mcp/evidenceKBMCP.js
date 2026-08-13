"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceKBMCP = exports.EvidenceKBMCP = void 0;
const Evidence_1 = require("../models/Evidence");
class EvidenceKBMCP {
    /**
     * Fast Local Storage Retrieval for Clinical Evidence Papers & Evidence Grades
     */
    async queryEvidenceKB(ingredientId, condition) {
        const filter = {};
        if (ingredientId)
            filter.target_ingredient_id = ingredientId;
        if (condition)
            filter.target_condition = { $regex: condition, $options: 'i' };
        const records = await Evidence_1.EvidenceModel.find(filter).lean();
        const formattedStudies = records.map((rec) => ({
            evidence_id: rec.evidence_id || rec.id || 'ev_000',
            publication_title: rec.benefit_title || 'Clinical Evaluation',
            summary_th: rec.summary || 'รายงานการวิเคราะห์ระดับงานวิจัย',
            evidence_grade: rec.evidence_level || 'Strong',
            pubmed_ids: rec.pubmed_ids || []
        }));
        let summaryGrade = 'Moderate';
        if (formattedStudies.some((s) => s.evidence_grade === 'Strong' || s.evidence_grade === 'strong')) {
            summaryGrade = 'Strong';
        }
        else if (formattedStudies.length === 0) {
            summaryGrade = 'Inconclusive';
        }
        return {
            query_ingredient_id: ingredientId,
            query_condition: condition,
            total_studies_found: formattedStudies.length,
            evidence_level_summary: summaryGrade,
            studies: formattedStudies
        };
    }
}
exports.EvidenceKBMCP = EvidenceKBMCP;
exports.evidenceKBMCP = new EvidenceKBMCP();
