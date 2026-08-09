"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = webAnalyticsRoutes;
const WebAnalytics_1 = require("../models/WebAnalytics");
const User_1 = require("../models/User");
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
            const todayStr = new Date().toISOString().split('T')[0];
            const [analytics, usersCount, surveysCount] = await Promise.all([
                WebAnalytics_1.WebAnalyticsModel.findOne({ snapshot_date: todayStr }),
                User_1.UserModel.countDocuments(),
                Survey_1.SurveyModel.countDocuments()
            ]);
            const totalEarlyAdopters = Math.max(usersCount + surveysCount, usersCount, surveysCount);
            // รวมยอดที่บันทึกแล้วใน DB + ยอดสดที่เพิ่งยิงมาพักใน Buffer ช่วง 60 นาทีนี้
            const realTimeVisitors = (analytics?.unique_visitors_count || 0) + analyticsBuffer_1.analyticsBuffer.getPendingSessionCount();
            const realTimeSearches = (analytics?.total_product_searches || 0) + analyticsBuffer_1.analyticsBuffer.getPendingSearchCount();
            return {
                success: true,
                data: {
                    early_adopters: totalEarlyAdopters || 0,
                    unique_visitors: realTimeVisitors,
                    product_searches: realTimeSearches,
                    last_updated: analytics?.last_updated || new Date()
                }
            };
        }
        catch (err) {
            return reply.status(500).send({ success: false, message: 'Server error' });
        }
    });
}
