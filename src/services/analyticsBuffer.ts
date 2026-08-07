import { WebAnalyticsModel } from '../models/WebAnalytics';
import { UserModel } from '../models/User';

// In-Memory Buffer เพื่อรับ Traffic สดๆ ไม่ให้ MongoDB ร้อน
class AnalyticsBuffer {
    private activeSessions: Set<string> = new Set(); // เก็บ Session ID ที่เข้าชมแล้ว
    private searchCounter: number = 0;
    private intervalTimer: NodeJS.Timeout | null = null;

    constructor() {
        // รันครั้งแรกเมื่อหมวด Fastify ทำงาน
        this.startBatchScheduler();
    }

    // 1. รับ Event เข้าชมเว็บ (Unique Session)
    public trackSession(sessionId: string) {
        if (sessionId) {
            this.activeSessions.add(sessionId);
        }
    }

    // 2. รับ Event การค้นหา
    public trackSearch() {
        this.searchCounter += 1;
    }

    // 3. เริ่ม Thread Worker (อัปเดตลง MongoDB ทุกๆ 60 นาที = 3,600,000 ms)
    private startBatchScheduler() {
        const SIXTY_MINUTES = 60 * 60 * 1000;

        this.intervalTimer = setInterval(async () => {
            await this.flushToMongoDB();
        }, SIXTY_MINUTES);
    }

    // เพิ่ม getters ดึงยอด Buffer ปัจจุบัน
    public getPendingSessionCount() {
        return this.activeSessions.size;
    }
    public getPendingSearchCount() {
        return this.searchCounter;
    }
    public getPendingStats() {
        return {
            pendingVisitors: this.activeSessions.size,
            pendingSearches: this.searchCounter
        };
    }

    // 4. บันทึกลง MongoDB
    public async flushToMongoDB() {
        try {
            const todayStr = new Date().toISOString().split('T')[0]; // "2026-08-07"

            // ดึงจำนวน Early Adopter ล่าสุดจาก DB จริง
            const totalEarlyAdopters = await UserModel.countDocuments();

            const uniqueSessionCount = this.activeSessions.size;
            const searchesCount = this.searchCounter;

            await WebAnalyticsModel.findOneAndUpdate(
                { snapshot_date: todayStr },
                {
                    $inc: {
                        unique_visitors_count: uniqueSessionCount,
                        total_product_searches: searchesCount
                    },
                    $set: {
                        early_adopters_count: totalEarlyAdopters,
                        last_updated: new Date()
                    }
                },
                { upsert: true, new: true }
            );

            console.log(`[Analytics Worker] 🔄 Synced analytics to MongoDB at ${new Date().toISOString()}`);

            // รีเซ็ต Memory Buffer หลัง Sync เสร็จ
            this.activeSessions.clear();
            this.searchCounter = 0;
        } catch (err) {
            console.error('[Analytics Worker Error]:', err);
        }
    }
}

export const analyticsBuffer = new AnalyticsBuffer();