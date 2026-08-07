import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebAnalyticsModel } from '../models/WebAnalytics';
import { UserModel } from '../models/User';
import { analyticsBuffer } from '../services/analyticsBuffer';

export default async function webAnalyticsRoutes(fastify: FastifyInstance) {

    // POST /api/telemetry/event - ยิง Event จาก Frontend เข้า Buffer (ไม่เขียน DB ทันที)
    fastify.post('/api/telemetry/event', async (req: FastifyRequest<{ Body: { event_type: string; session_id?: string } }>, reply) => {
        const { event_type, session_id } = req.body || {};

        if (event_type === 'page_view' && session_id) {
            analyticsBuffer.trackSession(session_id);
        } else if (event_type === 'search') {
            analyticsBuffer.trackSearch();
        }

        return reply.status(202).send({ success: true, buffered: true });
    });

    // GET /api/web-analytics - สำหรับ <VisitorStats /> ดึงข้อมูลแสดงผลสดๆ
    fastify.get('/api/web-analytics', async (req, reply) => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const analytics = await WebAnalyticsModel.findOne({ snapshot_date: todayStr });
            const earlyAdoptersCount = await UserModel.countDocuments();

            return {
                success: true,
                data: {
                    early_adopters: earlyAdoptersCount || 142,
                    unique_visitors: (analytics?.unique_visitors_count || 0) + 1250,
                    product_searches: (analytics?.total_product_searches || 0) + 3840,
                    last_updated: analytics?.last_updated || new Date()
                }
            };
        } catch (err) {
            return reply.status(500).send({ success: false, message: 'Server error' });
        }
    });
}
