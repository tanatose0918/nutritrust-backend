import { EvidenceModel, IEvidence } from '../models/Evidence';

export interface IClinicalEvidenceQueryResult {
  query_ingredient_id?: string;
  query_condition?: string;
  total_studies_found: number;
  evidence_level_summary: 'Strong' | 'Moderate' | 'Limited' | 'Inconclusive';
  studies: Array<{
    evidence_id: string;
    publication_title: string;
    summary_th: string;
    evidence_grade: string;
    pubmed_ids: string[];
  }>;
}


export class EvidenceKBMCP {
  /**
   * Fast Local Storage Retrieval for Clinical Evidence Papers & Evidence Grades
   */
  public async queryEvidenceKB(ingredientId?: string, condition?: string): Promise<IClinicalEvidenceQueryResult> {
    const filter: any = {};
    if (ingredientId) filter.target_ingredient_id = ingredientId;
    if (condition) filter.target_condition = { $regex: condition, $options: 'i' };

    const records = await EvidenceModel.find(filter).lean();

    const formattedStudies = records.map((rec) => ({
      evidence_id: rec.evidence_id || rec.id || 'ev_000',
      publication_title: rec.benefit_title || 'Clinical Evaluation',
      summary_th: rec.summary || 'รายงานการวิเคราะห์ระดับงานวิจัย',
      evidence_grade: rec.evidence_level || 'Strong',
      pubmed_ids: rec.pubmed_ids || []
    }));

    let summaryGrade: 'Strong' | 'Moderate' | 'Limited' | 'Inconclusive' = 'Moderate';
    if (formattedStudies.some((s) => s.evidence_grade === 'Strong' || s.evidence_grade === 'strong')) {
      summaryGrade = 'Strong';
    } else if (formattedStudies.length === 0) {
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

export const evidenceKBMCP = new EvidenceKBMCP();
