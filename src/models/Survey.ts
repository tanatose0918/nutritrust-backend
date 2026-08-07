import { Schema, model, Document } from 'mongoose';

export interface ISurvey {
  email?: string;
  usefulness_rating?: number;
  feedback?: string;
  target_supplements?: string[];
  source?: string;
  createdAt?: Date;
}

export interface ISurveyDocument extends ISurvey, Document {}

const SurveySchema = new Schema<ISurveyDocument>(
  {
    email: { type: String, trim: true, lowercase: true },
    usefulness_rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    target_supplements: [{ type: String }],
    source: { type: String, default: 'web_survey' }
  },
  { timestamps: true }
);

export const SurveyModel = model<ISurveyDocument>('Survey', SurveySchema);
