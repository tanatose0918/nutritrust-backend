import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { analyticsBuffer } from '../services/analyticsBuffer.js';
import { weeklyAggregator } from '../services/weeklyAggregator.js';

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

    // GET / - สำหรับ <VisitorStats /> ดึงข้อมูลจาก Cache (ไม่ query DB per request)
    // Backend query MongoDB เพียงครั้งเดียวตอนเที่ยงคืน แล้ว Cache ไว้
    // Frontend poll ทุก 5 นาที — ถ้า Cache ยังไม่พร้อมจะได้ loading: true
    fastify.get('/', async (req, reply) => {
        try {
            const snapshot = analyticsBuffer.getCachedSnapshot();

            if (!snapshot) {
                // Cache ยังไม่พร้อม (server เพิ่ง start / DB ยังไม่ connect)
                return {
                    success: true,
                    loading: true,
                    data: {
                        early_adopters: 0,
                        unique_visitors: 0,
                        product_searches: 0,
                        last_updated: new Date()
                    }
                };
            }

            return {
                success: true,
                loading: false,
                data: snapshot
            };
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ success: false, message: 'Server error' });
        }
    });

    // POST /flush - Dev/Debug: manual flush buffer to DB
    fastify.post('/flush', async (req, reply) => {
        try {
            await analyticsBuffer.manualFlush();
            await analyticsBuffer.manualRefreshSnapshot();
            return { success: true, message: 'Flushed & snapshot refreshed' };
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ success: false, message: 'Flush failed' });
        }
    });

    // POST /aggregate-weekly - Dev/Debug: manual trigger weekly aggregation
    fastify.post('/aggregate-weekly', async (req, reply) => {
        try {
            await weeklyAggregator.manualAggregate();
            return { success: true, message: 'Weekly aggregation completed' };
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ success: false, message: 'Weekly aggregation failed' });
        }
    });
}

