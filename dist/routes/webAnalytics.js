"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = webAnalyticsRoutes;
const WebAnalytics_1 = require("../models/WebAnalytics");
const User_1 = require("../models/User");
const Waitlist_1 = require("../models/Waitlist");
const Survey_1 = require("../models/Survey");
const analyticsBuffer_1 = require("../services/analyticsBuffer");
async function webAnalyticsRoutes(fastify) {
    // POST /api/telemetry/event - ยิง Event จาก Frontend เข้า Buffer (ไม่เขียน DB ทันที)
    fastify.post('/api/telemetry/event', async (req, reply) => {
        const { event_type, session_id } = req.body || {};
        if (event_type === 'page_view' && session_id) {
            analyticsBuffer_1.analyticsBuffer.trackSession(session_id);
        }
        else if (event_type === 'search') {
            analyticsBuffer_1.analyticsBuffer.trackSearch();
        }
        return reply.status(202).send({ success: true, buffered: true });
    });
    // GET /api/web-analytics - สำหรับ <VisitorStats /> ดึงข้อมูลแสดงผลสดๆ
    fastify.get('/api/web-analytics', async (req, reply) => {
        try {
            const [aggregateResult, usersCount, waitlistsCount, surveysCount, latestDoc] = await Promise.all([
                WebAnalytics_1.WebAnalyticsModel.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalVisitors: { $sum: '$unique_visitors_count' },
                            totalSearches: { $sum: '$total_product_searches' }
                        }
                    }
                ]),
                User_1.UserModel.countDocuments(),
                Waitlist_1.WaitlistModel.countDocuments(),
                Survey_1.SurveyModel.countDocuments(),
                WebAnalytics_1.WebAnalyticsModel.findOne().sort({ snapshot_date: -1 })
            ]);
            const historicalVisitors = aggregateResult[0]?.totalVisitors || 0;
            const historicalSearches = aggregateResult[0]?.totalSearches || 0;
            const totalEarlyAdopters = usersCount + waitlistsCount + surveysCount;
            // รวมยอดสะสมทั้งหมดใน DB + ยอดสดที่เพิ่งยิงมาพักใน Buffer
            const realTimeVisitors = historicalVisitors + analyticsBuffer_1.analyticsBuffer.getPendingSessionCount();
            const realTimeSearches = historicalSearches + analyticsBuffer_1.analyticsBuffer.getPendingSearchCount();
            return {
                success: true,
                data: {
                    early_adopters: totalEarlyAdopters || 0,
                    unique_visitors: realTimeVisitors,
                    product_searches: realTimeSearches,
                    last_updated: latestDoc?.last_updated || new Date()
                }
            };
        }
        catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ success: false, message: 'Server error' });
        }
    });
}
