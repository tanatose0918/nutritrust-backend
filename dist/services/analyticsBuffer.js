"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsBuffer = void 0;
const WebAnalytics_1 = require("../models/WebAnalytics");
const User_1 = require("../models/User");
const Waitlist_1 = require("../models/Waitlist");
const Survey_1 = require("../models/Survey");
class AnalyticsBuffer {
    currentDateStr = new Date().toISOString().split('T')[0];
    dailySessions = new Set();
    newUnflushedSessions = new Set();
    searchCounter = 0;
    intervalTimer = null;
    constructor() {
        this.startBatchScheduler();
    }
    checkDateRollover() {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr !== this.currentDateStr) {
            this.currentDateStr = todayStr;
            this.dailySessions.clear();
            this.newUnflushedSessions.clear();
            this.searchCounter = 0;
        }
    }
    trackSession(sessionId) {
        if (!sessionId)
            return;
        this.checkDateRollover();
        if (!this.dailySessions.has(sessionId)) {
            this.dailySessions.add(sessionId);
            this.newUnflushedSessions.add(sessionId);
        }
    }
    trackSearch() {
        this.checkDateRollover();
        this.searchCounter += 1;
    }
    getPendingSessionCount() {
        this.checkDateRollover();
        return this.newUnflushedSessions.size;
    }
    getPendingSearchCount() {
        this.checkDateRollover();
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
            this.checkDateRollover();
            const todayStr = this.currentDateStr;
            const [usersCount, waitlistsCount, surveysCount] = await Promise.all([
                User_1.UserModel.countDocuments(),
                Waitlist_1.WaitlistModel.countDocuments(),
                Survey_1.SurveyModel.countDocuments()
            ]);
            const totalEarlyAdopters = usersCount + waitlistsCount + surveysCount;
            const uniqueSessionCount = this.newUnflushedSessions.size;
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
            this.newUnflushedSessions.clear();
            this.searchCounter = 0;
        }
        catch (err) {
            console.error('[Analytics Worker Error]:', err);
        }
    }
}
exports.analyticsBuffer = new AnalyticsBuffer();
