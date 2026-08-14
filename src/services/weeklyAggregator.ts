import mongoose from 'mongoose';
import { WebAnalyticsModel } from '../models/WebAnalytics.js';

/**
 * WeeklyAggregator — Weekly Analytics Summarization Service
 * ──────────────────────────────────────────────────────────
 * Runs a 24-hour check interval. On Monday at 04:00 ICT (UTC+7),
 * it aggregates the previous 7 daily records (Mon–Sun) into a
 * single weekly summary document.
 *
 * Weekly Document Format:
 * {
 *   snapshot_date:    "2026-08-11"   ← วันที่ทำ aggregate (วันจันทร์ปัจจุบัน)
 *   record_type:      "weekly"
 *   week_start_date:  "2026-08-04"  ← วันจันทร์ต้นสัปดาห์ที่ aggregate
 *   unique_visitors_count:  SUM of 7 daily docs
 *   total_product_searches: SUM of 7 daily docs
 *   early_adopters_count:   latest value (Sunday's snapshot)
 * }
 */

class WeeklyAggregator {
    private timer: NodeJS.Timeout | null = null;

    /**
     * Call this AFTER DB connection is established.
     * Calculates ms until next Monday 04:00 ICT, then fires weekly.
     */
    public init() {
        const msUntilNextMonday4AM = this.getMsUntilNextMonday4AM_ICT();
        const hoursUntil = Math.round(msUntilNextMonday4AM / (60 * 60 * 1000));
        console.log(`[WeeklyAggregator] 🟢 Initialized — next aggregation in ~${hoursUntil}h (Monday 04:00 ICT)`);

        // First trigger at next Monday 04:00 ICT
        this.timer = setTimeout(async () => {
            await this.runWeeklyAggregation();
            // Then repeat every 7 days (168 hours)
            this.timer = setInterval(async () => {
                await this.runWeeklyAggregation();
            }, 7 * 24 * 60 * 60 * 1000);
        }, msUntilNextMonday4AM);
    }

    /**
     * Public method for dev/debug: manually trigger aggregation
     */
    public async manualAggregate() {
        await this.runWeeklyAggregation();
    }

    // ── Internals ──────────────────────────────────────────────

    /**
     * Calculate ms until next Monday 04:00 ICT (UTC+7)
     */
    private getMsUntilNextMonday4AM_ICT(): number {
        const now = new Date();
        // Get current day/time in ICT
        const ictOffset = 7 * 60 * 60 * 1000; // 7 hours in ms
        const nowICT = new Date(now.getTime() + ictOffset);
        
        // Find next Monday
        const dayOfWeek = nowICT.getUTCDay(); // 0=Sun, 1=Mon, ...
        let daysUntilMonday = (1 - dayOfWeek + 7) % 7;
        if (daysUntilMonday === 0) {
            // It's Monday — check if we're past 04:00 ICT
            const ictHour = nowICT.getUTCHours();
            const ictMinute = nowICT.getUTCMinutes();
            if (ictHour > 4 || (ictHour === 4 && ictMinute > 0)) {
                daysUntilMonday = 7; // Already past 04:00 today, wait till next Monday
            }
        }

        // Build target: next Monday 04:00 ICT = Monday 21:00 UTC (previous day)
        // Actually: 04:00 ICT = 04:00 - 7 = 21:00 UTC (Sunday night)
        const targetICT = new Date(nowICT);
        targetICT.setUTCDate(targetICT.getUTCDate() + daysUntilMonday);
        targetICT.setUTCHours(4, 0, 0, 0);

        // Convert back to UTC
        const targetUTC = new Date(targetICT.getTime() - ictOffset);
        const diff = targetUTC.getTime() - now.getTime();
        return Math.max(diff, 1000); // at least 1 second
    }

    /**
     * Core aggregation logic:
     * 1. Find the Monday–Sunday range of the PREVIOUS week
     * 2. Query all daily records in that range
     * 3. SUM visitors + searches, take latest early_adopters
     * 4. Upsert the weekly summary document
     */
    private async runWeeklyAggregation() {
        try {
            if (mongoose.connection.readyState !== 1) {
                console.warn('[WeeklyAggregator] ⚠️ DB not ready, skipping aggregation');
                return;
            }

            // Calculate previous week's Monday–Sunday range
            const now = new Date();
            const ictOffset = 7 * 60 * 60 * 1000;
            const nowICT = new Date(now.getTime() + ictOffset);
            
            // This Monday (today or the most recent Monday)
            const thisMondayICT = new Date(nowICT);
            const dayOfWeek = thisMondayICT.getUTCDay();
            const daysFromMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
            thisMondayICT.setUTCDate(thisMondayICT.getUTCDate() - daysFromMonday);
            thisMondayICT.setUTCHours(0, 0, 0, 0);

            // Previous week: Monday to Sunday
            const prevMondayICT = new Date(thisMondayICT);
            prevMondayICT.setUTCDate(prevMondayICT.getUTCDate() - 7);
            const prevSundayICT = new Date(thisMondayICT);
            prevSundayICT.setUTCDate(prevSundayICT.getUTCDate() - 1);

            const weekStartDate = prevMondayICT.toISOString().split('T')[0]; // "YYYY-MM-DD"
            const weekEndDate = prevSundayICT.toISOString().split('T')[0];
            const snapshotDate = thisMondayICT.toISOString().split('T')[0]; // Today (Monday)

            console.log(`[WeeklyAggregator] 📊 Aggregating week: ${weekStartDate} → ${weekEndDate}`);

            // Query daily records for the previous week
            const dailyDocs = await WebAnalyticsModel.find({
                record_type: { $in: ['daily', null] }, // backward compat with old docs
                snapshot_date: { $gte: weekStartDate, $lte: weekEndDate }
            }).sort({ snapshot_date: 1 });

            if (dailyDocs.length === 0) {
                console.log('[WeeklyAggregator] ℹ️ No daily records found for the previous week, skipping');
                return;
            }

            // Aggregate values
            let totalVisitors = 0;
            let totalSearches = 0;
            let latestEarlyAdopters = 0;

            for (const doc of dailyDocs) {
                totalVisitors += doc.unique_visitors_count || 0;
                totalSearches += doc.total_product_searches || 0;
                latestEarlyAdopters = doc.early_adopters_count || latestEarlyAdopters;
            }

            // Upsert the weekly summary
            await WebAnalyticsModel.findOneAndUpdate(
                { snapshot_date: snapshotDate, record_type: 'weekly' },
                {
                    $set: {
                        record_type: 'weekly',
                        week_start_date: weekStartDate,
                        unique_visitors_count: totalVisitors,
                        total_product_searches: totalSearches,
                        early_adopters_count: latestEarlyAdopters,
                        last_updated: new Date()
                    }
                },
                { upsert: true, new: true }
            );

            console.log(`[WeeklyAggregator] ✅ Weekly summary created: ${weekStartDate}→${weekEndDate} | Visitors: ${totalVisitors}, Searches: ${totalSearches}, Adopters: ${latestEarlyAdopters}`);
        } catch (err) {
            console.error('[WeeklyAggregator] ❌ Aggregation error:', err);
        }
    }
}

export const weeklyAggregator = new WeeklyAggregator();
