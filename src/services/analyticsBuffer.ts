import { WebAnalyticsModel } from '../models/WebAnalytics';
import { UserModel } from '../models/User';

class AnalyticsBuffer {
    private activeSessions: Set<string> = new Set();
    private searchCounter: number = 0;
    private intervalTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.startBatchScheduler();
    }

    public trackSession(sessionId: string) {
        if (sessionId) this.activeSessions.add(sessionId);
    }

    public trackSearch() {
        this.searchCounter += 1;
    }

    public getPendingSessionCount() {
        return this.activeSessions.size;
    }

    public getPendingSearchCount() {
        return this.searchCounter;
    }

    private startBatchScheduler() {
        const SIXTY_MINUTES = 60 * 60 * 1000;
        this.intervalTimer = setInterval(async () => {
            await this.flushToMongoDB();
        }, SIXTY_MINUTES);
    }

    public async flushToMongoDB() {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
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

            console.log(`[Analytics Worker] 🔄 Synced to MongoDB at ${new Date().toISOString()}`);
            this.activeSessions.clear();
            this.searchCounter = 0;
        } catch (err) {
            console.error('[Analytics Worker Error]:', err);
        }
    }
}

export const analyticsBuffer = new AnalyticsBuffer();