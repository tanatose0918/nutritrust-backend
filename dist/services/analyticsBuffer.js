"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsBuffer = void 0;
const WebAnalytics_1 = require("../models/WebAnalytics");
const User_1 = require("../models/User");
// In-Memory Buffer เพื่อรับ Traffic สดๆ ไม่ให้ MongoDB ร้อน
class AnalyticsBuffer {
    activeSessions = new Set(); // เก็บ Session ID ที่เข้าชมแล้ว
    searchCounter = 0;
    intervalTimer = null;
    constructor() {
        // รันครั้งแรกเมื่อหมวด Fastify ทำงาน
        this.startBatchScheduler();
    }
    // 1. รับ Event เข้าชมเว็บ (Unique Session)
    trackSession(sessionId) {
        if (sessionId) {
            this.activeSessions.add(sessionId);
        }
    }
    // 2. รับ Event การค้นหา
    trackSearch() {
        this.searchCounter += 1;
    }
    // 2.5 ดึงข้อมูลที่รอการ Flush ใน Memory มารวมกับ DB ใน Real-time
    getPendingStats() {
        return {
            pendingVisitors: this.activeSessions.size,
            pendingSearches: this.searchCounter
        };
    }
    // 3. เริ่ม Thread Worker (อัปเดตลง MongoDB ทุกๆ 60 นาที = 3,600,000 ms)
    startBatchScheduler() {
        const SIXTY_MINUTES = 60 * 60 * 1000;
        this.intervalTimer = setInterval(async () => {
            await this.flushToMongoDB();
        }, SIXTY_MINUTES);
    }
    // 4. บันทึกลง MongoDB
    async flushToMongoDB() {
        try {
            const todayStr = new Date().toISOString().split('T')[0]; // "2026-08-07"
            // ดึงจำนวน Early Adopter ล่าสุดจาก DB จริง
            const totalEarlyAdopters = await User_1.UserModel.countDocuments();
            const uniqueSessionCount = this.activeSessions.size;
            const searchesCount = this.searchCounter;
            await WebAnalytics_1.WebAnalyticsModel.findOneAndUpdate({ snapshot_date: todayStr }, {
                $inc: {
                    unique_visitors_count: uniqueSessionCount,
                    total_product_searches: searchesCount
                },
                $set: {
                    early_adopters_count: totalEarlyAdopters,
                    last_updated: new Date()
                }
            }, { upsert: true, new: true });
            console.log(`[Analytics Worker] 🔄 Synced analytics to MongoDB at ${new Date().toISOString()}`);
            // รีเซ็ต Memory Buffer หลัง Sync เสร็จ
            this.activeSessions.clear();
            this.searchCounter = 0;
        }
        catch (err) {
            console.error('[Analytics Worker Error]:', err);
        }
    }
}
exports.analyticsBuffer = new AnalyticsBuffer();
