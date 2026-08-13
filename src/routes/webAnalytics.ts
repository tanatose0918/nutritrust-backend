import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebAnalyticsModel } from '../models/WebAnalytics';
import { UserModel } from '../models/User';
import { WaitlistModel } from '../models/Waitlist';
import { SurveyModel } from '../models/Survey';
import { analyticsBuffer } from '../services/analyticsBuffer';

export default async function webAnalyticsRoutes(fastify: FastifyInstance) {

    // POST /event - ยิง Event จาก Frontend เข้า Buffer (ไม่เขียน DB ทันที)
    fastify.post('/event', async (req: FastifyRequest<{ Body: { event_type: string; session_id?: string } }>, reply) => {
        const { event_type, session_id } = req.body || {};

        if (event_type === 'page_view' && session_id) {
            analyticsBuffer.trackSession(session_id);
        } else if (event_type === 'search') {
            analyticsBuffer.trackSearch();
        }

        return reply.status(202).send({ success: true, buffered: true });
    });

    // GET / - สำหรับ <VisitorStats /> ดึงข้อมูลแสดงผลสดๆ
    fastify.get('/', async (req, reply) => {
        try {
            const [aggregateResult, usersCount, waitlistsCount, surveysCount, latestDoc] = await Promise.all([
                WebAnalyticsModel.aggregate([
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
                SurveyModel.countDocuments(),
                WebAnalyticsModel.findOne().sort({ snapshot_date: -1 })
            ]);

            const historicalVisitors = aggregateResult[0]?.totalVisitors || 0;
            const historicalSearches = aggregateResult[0]?.totalSearches || 0;

            const totalEarlyAdopters = usersCount + waitlistsCount + surveysCount;

            // รวมยอดสะสมทั้งหมดใน DB + ยอดสดที่เพิ่งยิงมาพักใน Buffer
            const realTimeVisitors = historicalVisitors + analyticsBuffer.getPendingSessionCount();
            const realTimeSearches = historicalSearches + analyticsBuffer.getPendingSearchCount();

            return {
                success: true,
                data: {
                    early_adopters: totalEarlyAdopters || 0,
                    unique_visitors: realTimeVisitors,
                    product_searches: realTimeSearches,
                    last_updated: latestDoc?.last_updated || new Date()
                }
            };
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ success: false, message: 'Server error' });
        }
    });
}

