"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsBuffer = void 0;
const WebAnalytics_1 = require("../models/WebAnalytics");
const User_1 = require("../models/User");
class AnalyticsBuffer {
    activeSessions = new Set();
    searchCounter = 0;
    intervalTimer = null;
    constructor() {
        this.startBatchScheduler();
    }
    trackSession(sessionId) {
        if (sessionId)
            this.activeSessions.add(sessionId);
    }
    trackSearch() {
        this.searchCounter += 1;
    }
    getPendingSessionCount() {
        return this.activeSessions.size;
    }
    getPendingSearchCount() {
        return this.searchCounter;
    }
    startBatchScheduler() {
        const SIXTY_MINUTES = 60 * 60 * 1000;
        this.intervalTimer = setInterval(async () => {
            await this.flushToMongoDB();
        }, SIXTY_MINUTES);
    }
    async flushToMongoDB() {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
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
            console.log(`[Analytics Worker] 🔄 Synced to MongoDB at ${new Date().toISOString()}`);
            this.activeSessions.clear();
            this.searchCounter = 0;
        }
        catch (err) {
            console.error('[Analytics Worker Error]:', err);
        }
    }
}
exports.analyticsBuffer = new AnalyticsBuffer();
