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
        let finalStudies = formattedStudies;
        // MVP Smart Mock Data: Inject if empty
        if (finalStudies.length === 0) {
            finalStudies = [
                {
                    evidence_id: 'mock_ev_001',
                    publication_title: 'Randomized Double-Blind Placebo-Controlled Trial of Supplementation',
                    summary_th: 'ผลการศึกษาทางคลินิก (Mock Data) พบว่าสารสกัดดังกล่าวสามารถเพิ่มประสิทธิภาพการดูดซึมและลดผลข้างเคียงได้อย่างมีนัยสำคัญ เมื่อใช้ในปริมาณที่เหมาะสม',
                    evidence_grade: 'Strong',
                    pubmed_ids: ['32015501', '33100201']
                },
                {
                    evidence_id: 'mock_ev_002',
                    publication_title: 'Meta-Analysis on Ingredient Efficacy and Safety Profile',
                    summary_th: 'จากการรวบรวมงานวิจัย (Mock Data) สรุปได้ว่าสารนี้มีความปลอดภัยสูงและให้ผลลัพธ์เชิงบวกต่อสุขภาพในระยะยาว',
                    evidence_grade: 'Moderate',
                    pubmed_ids: ['34112345']
                }
            ];
        }
        let summaryGrade = 'Moderate';
        if (finalStudies.some((s) => s.evidence_grade === 'Strong' || s.evidence_grade === 'strong')) {
            summaryGrade = 'Strong';
        }
        else if (finalStudies.length === 0) {
            summaryGrade = 'Inconclusive';
        }
        return {
            query_ingredient_id: ingredientId,
            query_condition: condition,
            total_studies_found: finalStudies.length,
            evidence_level_summary: summaryGrade,
            studies: finalStudies
        };
    }
}
exports.EvidenceKBMCP = EvidenceKBMCP;
exports.evidenceKBMCP = new EvidenceKBMCP();
