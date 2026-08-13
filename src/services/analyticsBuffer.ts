import { WebAnalyticsModel } from '../models/WebAnalytics';
import { UserModel } from '../models/User';
import { WaitlistModel } from '../models/Waitlist';
import { SurveyModel } from '../models/Survey';

class AnalyticsBuffer {
    private currentDateStr: string = new Date().toISOString().split('T')[0];
    private dailySessions: Set<string> = new Set();
    private newUnflushedSessions: Set<string> = new Set();
    private searchCounter: number = 0;
    private intervalTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.startBatchScheduler();
    }

    private checkDateRollover() {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr !== this.currentDateStr) {
            this.currentDateStr = todayStr;
            this.dailySessions.clear();
            this.newUnflushedSessions.clear();
            this.searchCounter = 0;
        }
    }

    public trackSession(sessionId: string) {
        if (!sessionId) return;
        this.checkDateRollover();
        if (!this.dailySessions.has(sessionId)) {
            this.dailySessions.add(sessionId);
            this.newUnflushedSessions.add(sessionId);
        }
    }

    public trackSearch() {
        this.checkDateRollover();
        this.searchCounter += 1;
    }

    public getPendingSessionCount(): number {
        this.checkDateRollover();
        return this.newUnflushedSessions.size;
    }

    public getPendingSearchCount(): number {
        this.checkDateRollover();
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
            this.checkDateRollover();
            const todayStr = this.currentDateStr;
            
            const [usersCount, waitlistsCount, surveysCount] = await Promise.all([
                UserModel.countDocuments(),
                WaitlistModel.countDocuments(),
                SurveyModel.countDocuments()
            ]);

            const totalEarlyAdopters = usersCount + waitlistsCount + surveysCount;
            const uniqueSessionCount = this.newUnflushedSessions.size;
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
            this.newUnflushedSessions.clear();
            this.searchCounter = 0;
        } catch (err) {
            console.error('[Analytics Worker Error]:', err);
        }
    }
}

export const analyticsBuffer = new AnalyticsBuffer();