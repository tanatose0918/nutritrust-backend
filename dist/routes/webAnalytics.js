"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = webAnalyticsRoutes;
const WebAnalytics_1 = require("../models/WebAnalytics");
const User_1 = require("../models/User");
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
            const analytics = await WebAnalytics_1.WebAnalyticsModel.findOne({ snapshot_date: todayStr });
            const earlyAdoptersCount = await User_1.UserModel.countDocuments();
            return {
                success: true,
                data: {
                    early_adopters: earlyAdoptersCount || 142,
                    unique_visitors: (analytics?.unique_visitors_count || 0) + 1250,
                    product_searches: (analytics?.total_product_searches || 0) + 3840,
                    last_updated: analytics?.last_updated || new Date()
                }
            };
        }
        catch (err) {
            return reply.status(500).send({ success: false, message: 'Server error' });
        }
    });
}
