import { Schema, model, Document } from 'mongoose';

export interface IEvidence {
  evidence_id: string;
  id?: string;
  benefit_title: string;
  summary: string;
  evidence_level: string;
  pubmed_ids?: string[];
}

export interface IEvidenceDocument extends IEvidence, Document {}

const EvidenceSchema = new Schema<IEvidenceDocument>(
  {
    evidence_id: { type: String, required: true, unique: true },
    id: { type: String },
    benefit_title: { type: String, required: true },
    summary: { type: String, required: true },
    evidence_level: { type: String, required: true },
    pubmed_ids: [{ type: String }]
  },
  { timestamps: true, collection: 'science_summaries' }
);

export const EvidenceModel = model<IEvidenceDocument>('Evidence', EvidenceSchema);
