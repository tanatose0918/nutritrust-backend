"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackSafetyMCP = exports.StackSafetyMCP = void 0;
const Product_1 = require("../models/Product");
// Clinical Reference Tables
const UPPER_LIMIT_RULES = {
    igd_vit_d3: { igd_id: 'igd_vit_d3', name: 'Vitamin D3', max_daily_ul: 4000, unit: 'IU', warning_th: 'ได้รับ Vitamin D3 สูงกว่า 4,000 IU/วัน อาจสะสมในร่างกาย' },
    igd_vit_c: { igd_id: 'igd_vit_c', name: 'Vitamin C', max_daily_ul: 2000, unit: 'mg', warning_th: 'ได้รับ Vitamin C สูงกว่า 2,000 mg/วัน อาจระคายเคืองทางเดินอาหาร' },
    igd_zinc: { igd_id: 'igd_zinc', name: 'Zinc', max_daily_ul: 40, unit: 'mg', warning_th: 'ได้รับ Zinc สูงกว่า 40 mg/วัน ต่อเนื่องอาจลดการดูดซึม Copper' },
    igd_calcium: { igd_id: 'igd_calcium', name: 'Calcium', max_daily_ul: 2500, unit: 'mg', warning_th: 'ได้รับ Calcium สูงกว่า 2,500 mg/วัน อาจเสี่ยงท้องผูกหรือนิ่ว' },
    igd_iron: { igd_id: 'igd_iron', name: 'Iron', max_daily_ul: 45, unit: 'mg', warning_th: 'ได้รับ Iron สูงกว่า 45 mg/วัน อาจระคายเคืองกระเพาะอาหาร' }
};
const INTERACTION_RULES = [
    {
        pair: ['igd_calcium', 'igd_iron'],
        type: 'conflict',
        title_th: 'แคลเซียมขัดขวางการดูดซึมเหล็ก',
        description_th: 'Calcium และ Iron แย่งเกลือแร่ตัวนำส่งเดียวกัน แนะนำแยกมื้อรับประทานอย่างน้อย 2 ชั่วโมง'
    },
    {
        pair: ['igd_vit_d3', 'igd_vit_k2'],
        type: 'synergy',
        title_th: 'Vitamin D3 + K2 เสริมการดูดซึมแคลเซียมเข้ากระดูก',
        description_th: 'D3 ช่วยดูดซึมแคลเซียมเข้าสู่เลือด ส่วน K2 ช่วยนำแคลเซียมจากเลือดไปฝังในแคลเซียมกระดูก ไม่ให้เกาะผนังหลอดเลือด'
    },
    {
        pair: ['igd_vit_c', 'igd_collagen'],
        type: 'synergy',
        title_th: 'Vitamin C ช่วยกระตุ้นการสร้าง Collagen',
        description_th: 'Vitamin C เป็น Co-factor สำคัญในการสังเคราะห์เส้นใยคอลลาเจนในชั้นผิวและข้อต่อ'
    }
];
class StackSafetyMCP {
    /**
     * Analyze supplement stack safety, overdose upper limits, conflicts, and synergies
     */
    async analyzeStackSafety(productIds) {
        if (!productIds || productIds.length === 0) {
            return {
                total_products: 0,
                cumulative_ingredients: {},
                warnings: [],
                conflicts: [],
                synergies: [],
                safety_score: 100
            };
        }
        const products = await Product_1.ProductModel.find({ id: { $in: productIds } }).lean();
        const cumulative = {};
        // 1. Aggregate cumulative doses across all products in stack
        for (const prod of products) {
            for (const item of prod.ingredient_list || []) {
                const key = item.igd_id;
                const volMatch = item.volume.match(/([\d.]+)\s*([a-zA-Z%]+)/);
                const numericVol = volMatch ? parseFloat(volMatch[1]) : 0;
                const unit = volMatch ? volMatch[2] : '';
                if (!cumulative[key]) {
                    cumulative[key] = { name: item.igd_id, total_volume: 0, unit };
                }
                cumulative[key].total_volume += numericVol;
            }
        }
        const warnings = [];
        let safetyScore = 100;
        // 2. Evaluate Overdose Upper Limits (UL)
        Object.keys(cumulative).forEach((key) => {
            const rule = UPPER_LIMIT_RULES[key];
            if (rule && cumulative[key].total_volume > rule.max_daily_ul) {
                warnings.push(`[Overdose Warning]: ${rule.warning_th} (ปริมาณรวมใน Stack: ${cumulative[key].total_volume} ${rule.unit})`);
                safetyScore -= 15;
            }
        });
        // 3. Evaluate Interactions (Conflicts & Synergies)
        const presentKeys = new Set(Object.keys(cumulative));
        const conflicts = [];
        const synergies = [];
        for (const rule of INTERACTION_RULES) {
            const [k1, k2] = rule.pair;
            if (presentKeys.has(k1) && presentKeys.has(k2)) {
                if (rule.type === 'conflict') {
                    conflicts.push(rule);
                    safetyScore -= 10;
                }
                else if (rule.type === 'synergy') {
                    synergies.push(rule);
                    safetyScore += 5;
                }
            }
        }
        return {
            total_products: products.length,
            cumulative_ingredients: cumulative,
            warnings,
            conflicts,
            synergies,
            safety_score: Math.max(0, Math.min(100, safetyScore))
        };
    }
}
exports.StackSafetyMCP = StackSafetyMCP;
exports.stackSafetyMCP = new StackSafetyMCP();
