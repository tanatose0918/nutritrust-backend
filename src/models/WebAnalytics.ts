import { Schema, model, Document } from 'mongoose';

export interface IWebAnalytics extends Document {
    snapshot_date: string;          // รูปแบบ "YYYY-MM-DD" เช่น "2026-08-07"
    early_adopters_count: number;   // จำนวน Early Adopter (ดึงจาก countDocuments ของ UserModel)
    unique_visitors_count: number;  // จำนวนผู้เข้าชมที่ไม่ซ้ำรายวัน (Unique Sessions)
    total_product_searches: number; // จำนวนการค้นหาผลิตภัณฑ์รวม
    last_updated: Date;             // เวลาที่ทำการ Update รอบล่าสุด (อัปเดตทุก 60 นาที)
}

const webAnalyticsSchema = new Schema<IWebAnalytics>({
    snapshot_date: { type: String, required: true, unique: true, index: true },
    early_adopters_count: { type: Number, default: 0 },
    unique_visitors_count: { type: Number, default: 0 },
    total_product_searches: { type: Number, default: 0 },
    last_updated: { type: Date, default: Date.now }
});

export const WebAnalyticsModel = model<IWebAnalytics>('WebAnalytics', webAnalyticsSchema);
