import { WebAnalyticsModel } from '../models/WebAnalytics.js';
import { UserModel } from '../models/User.js';
import { WaitlistModel } from '../models/Waitlist.js';
import { SurveyModel } from '../models/Survey.js';
import mongoose from 'mongoose';

/**
 * AnalyticsBuffer — In-memory buffer for web analytics events
 * ─────────────────────────────────────────────────────────────
 * Accumulates page_view & search events in memory and flushes
 * to MongoDB on a 60-minute interval.
 *
 * Key Design Decisions:
 *  - Guard Clause: skip flush when buffer is empty (no 0-value upserts)
 *  - DB Ready Check: skip flush when Mongoose isn't connected yet
 *  - Lazy Init: scheduler does NOT start in constructor — call init()
 *    after DB connect is confirmed in server.ts
 *
 * Midnight Snapshot Cache:
 *  - At midnight ICT (UTC+7) the buffer queries MongoDB once and
 *    caches the result. All subsequent GET requests during the day
 *    are served from this cache — zero DB reads per request.
 */

export interface ICachedAnalytics {
    early_adopters: number;
    unique_visitors: number;
    product_searches: number;
    last_updated: Date;
}

class AnalyticsBuffer {
    private currentDateStr: string = new Date().toISOString().split('T')[0];
    private dailySessions: Set<string> = new Set();
    private newUnflushedSessions: Set<string> = new Set();
    private searchCounter: number = 0;
    private flushTimer: NodeJS.Timeout | null = null;
    private midnightTimer: NodeJS.Timeout | null = null;

    /** Cached snapshot — populated once at midnight, served all day */
    private cachedSnapshot: ICachedAnalytics | null = null;

    // ── Public API ─────────────────────────────────────────────

    /**
     * Call this AFTER DB connection is established.
     * Starts the 60-min flush scheduler + midnight snapshot scheduler.
     */
    public init() {
        console.log('[AnalyticsBuffer] 🟢 Initialized — flush every 60 min, snapshot at midnight ICT');
        this.startFlushScheduler();
        this.startMidnightSnapshotScheduler();
        // Immediately build the first snapshot so GET works right away
        this.refreshSnapshotCache().catch(() => {});
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

    /**
     * Returns cached analytics snapshot for the GET route.
     * If cache isn't ready yet (server just started), returns null
     * so the route can show a loading state.
     */
    public getCachedSnapshot(): ICachedAnalytics | null {
        // Merge cached DB data + live in-memory buffer
        if (!this.cachedSnapshot) return null;
        return {
            early_adopters: this.cachedSnapshot.early_adopters,
            unique_visitors: this.cachedSnapshot.unique_visitors + this.getPendingSessionCount(),
            product_searches: this.cachedSnapshot.product_searches + this.getPendingSearchCount(),
            last_updated: this.cachedSnapshot.last_updated
        };
    }

    /** Manually trigger flush (for dev/debug endpoint) */
    public async manualFlush() {
        await this.flushToMongoDB();
    }

    /** Manually trigger snapshot refresh (for dev/debug endpoint) */
    public async manualRefreshSnapshot() {
        await this.refreshSnapshotCache();
    }

    // ── Internals ──────────────────────────────────────────────

    private checkDateRollover() {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr !== this.currentDateStr) {
            this.currentDateStr = todayStr;
            this.dailySessions.clear();
            this.newUnflushedSessions.clear();
            this.searchCounter = 0;
        }
    }

    private startFlushScheduler() {
        const SIXTY_MINUTES = 60 * 60 * 1000;
        this.flushTimer = setInterval(async () => {
            await this.flushToMongoDB();
        }, SIXTY_MINUTES);
    }

    /**
     * Schedule the snapshot to refresh at midnight ICT (UTC+7) each day.
     * We calculate ms until next midnight ICT and then setInterval 24h.
     */
    private startMidnightSnapshotScheduler() {
        const msUntilMidnightICT = this.getMsUntilNextICTHour(0); // 00:00 ICT
        console.log(`[AnalyticsBuffer] ⏰ Next midnight snapshot in ${Math.round(msUntilMidnightICT / 60000)} minutes`);

        // First trigger at the next midnight
        this.midnightTimer = setTimeout(async () => {
            await this.flushToMongoDB();  // flush pending data first
            await this.refreshSnapshotCache();
            // Then repeat every 24 hours
            this.midnightTimer = setInterval(async () => {
                await this.flushToMongoDB();
                await this.refreshSnapshotCache();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnightICT);
    }

    /** Calculate milliseconds until the next occurrence of a given hour in ICT (UTC+7) */
    private getMsUntilNextICTHour(targetHour: number): number {
        const now = new Date();
        // Current time in ICT
        const ictOffset = 7 * 60; // minutes
        const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
        const ictMinutes = utcMinutes + ictOffset;

        const targetMinutes = targetHour * 60;
        let diffMinutes = targetMinutes - (ictMinutes % (24 * 60));
        if (diffMinutes <= 0) diffMinutes += 24 * 60; // next day

        return diffMinutes * 60 * 1000 - (now.getUTCSeconds() * 1000 + now.getUTCMilliseconds());
    }

    /**
     * Flush in-memory buffer to MongoDB.
     * Guarded: skips if buffer is empty or DB isn't connected.
     */
    private async flushToMongoDB() {
        try {
            // Guard 1: DB ready check
            if (mongoose.connection.readyState !== 1) {
                console.warn('[AnalyticsBuffer] ⚠️ DB not ready, skipping flush');
                return;
            }

            // Guard 2: Skip if nothing to flush
            const uniqueSessionCount = this.newUnflushedSessions.size;
            const searchesCount = this.searchCounter;
            if (uniqueSessionCount === 0 && searchesCount === 0) {
                return; // Nothing to write — silent skip
            }

            this.checkDateRollover();
            const todayStr = this.currentDateStr;

            const [usersCount, waitlistsCount, surveysCount] = await Promise.all([
                UserModel.countDocuments(),
                WaitlistModel.countDocuments(),
                SurveyModel.countDocuments()
            ]);

            const totalEarlyAdopters = usersCount + waitlistsCount + surveysCount;

            await WebAnalyticsModel.findOneAndUpdate(
                { snapshot_date: todayStr, record_type: 'daily' },
                {
                    $inc: {
                        unique_visitors_count: uniqueSessionCount,
                        total_product_searches: searchesCount
                    },
                    $set: {
                        early_adopters_count: totalEarlyAdopters,
                        record_type: 'daily',
                        last_updated: new Date()
                    }
                },
                { upsert: true, new: true }
            );

            console.log(`[AnalyticsBuffer] 🔄 Flushed to MongoDB: +${uniqueSessionCount} sessions, +${searchesCount} searches (${todayStr})`);
            this.newUnflushedSessions.clear();
            this.searchCounter = 0;
        } catch (err) {
            console.error('[AnalyticsBuffer] ❌ Flush error:', err);
        }
    }

    /**
     * Build the cached snapshot from MongoDB (called once at midnight).
     * This is the ONLY time we query the DB for the GET endpoint.
     */
    private async refreshSnapshotCache() {
        try {
            if (mongoose.connection.readyState !== 1) {
                console.warn('[AnalyticsBuffer] ⚠️ DB not ready, snapshot cache not refreshed');
                return;
            }

            const [aggregateResult, usersCount, waitlistsCount, surveysCount] = await Promise.all([
                WebAnalyticsModel.aggregate([
                    { $match: { record_type: { $in: ['daily', null] } } },
                    {
                        $group: {
                            _id: null,
                            totalVisitors: { $sum: '$unique_visitors_count' },
                            totalSearches: { $sum: '$total_product_searches' }
                        }
                    }
                ]),
                UserModel.countDocuments(),
                WaitlistModel.countDocuments(),
                SurveyModel.countDocuments()
            ]);

            const totalEarlyAdopters = usersCount + waitlistsCount + surveysCount;

            this.cachedSnapshot = {
                early_adopters: totalEarlyAdopters,
                unique_visitors: aggregateResult[0]?.totalVisitors || 0,
                product_searches: aggregateResult[0]?.totalSearches || 0,
                last_updated: new Date()
            };

            console.log(`[AnalyticsBuffer] 📸 Snapshot cached: ${JSON.stringify(this.cachedSnapshot)}`);
        } catch (err) {
            console.error('[AnalyticsBuffer] ❌ Snapshot cache error:', err);
        }
    }
}

export const analyticsBuffer = new AnalyticsBuffer();