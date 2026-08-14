import { Schema, model, Document } from 'mongoose';

export interface IWebAnalytics extends Document {
    snapshot_date: string;          // "YYYY-MM-DD" — วันที่บันทึก (daily) หรือ วันที่ aggregate (weekly)
    record_type: 'daily' | 'weekly'; // ระบุประเภท Document
    week_start_date?: string;       // เฉพาะ weekly: วันจันทร์ต้นสัปดาห์ "YYYY-MM-DD"
    early_adopters_count: number;   // จำนวน Early Adopter (snapshot ล่าสุด)
    unique_visitors_count: number;  // จำนวนผู้เข้าชมที่ไม่ซ้ำ (SUM สำหรับ weekly)
    total_product_searches: number; // จำนวนการค้นหาผลิตภัณฑ์รวม (SUM สำหรับ weekly)
    last_updated: Date;             // เวลาที่ทำการ Update รอบล่าสุด
}

const webAnalyticsSchema = new Schema<IWebAnalytics>({
    snapshot_date: { type: String, required: true, index: true },
    record_type: { type: String, enum: ['daily', 'weekly'], default: 'daily', index: true },
    week_start_date: { type: String, default: null },
    early_adopters_count: { type: Number, default: 0 },
    unique_visitors_count: { type: Number, default: 0 },
    total_product_searches: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now }
});

// Compound unique index: daily + weekly records can share the same date
webAnalyticsSchema.index({ snapshot_date: 1, record_type: 1 }, { unique: true });

export const WebAnalyticsModel = model<IWebAnalytics>('WebAnalytics', webAnalyticsSchema);
