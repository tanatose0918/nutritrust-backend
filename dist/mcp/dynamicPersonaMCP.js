"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicPersonaMCP = exports.DynamicPersonaMCP = void 0;
const Product_1 = require("../models/Product");
const privacyTokenizerMCP_1 = require("./privacyTokenizerMCP");
const stackSafetyMCP_1 = require("./stackSafetyMCP");
class DynamicPersonaMCP {
    /**
     * Compute dynamic persona match scores for a user profile against a product or stack
     */
    async computeDynamicMatch(params) {
        // 1. Process Privacy & SIR Matrix via MCP 1
        const privacy = privacyTokenizerMCP_1.privacyTokenizerMCP.processUserInput(params.email, params.raw_prompt);
        // 2. Evaluate Stack Safety via MCP 2
        const safety = await stackSafetyMCP_1.stackSafetyMCP.analyzeStackSafety(params.product_ids);
        // 3. Fetch products data
        const products = await Product_1.ProductModel.find({ id: { $in: params.product_ids } }).lean();
        const allIngredients = new Set(products.flatMap((p) => (p.ingredient_list || []).map((i) => i.igd_id)));
        // 4. Compute 6 Persona Dimension Overlays
        const jointScore = (allIngredients.has('igd_uc2') || allIngredients.has('igd_collagen') ? 40 : 10) + (allIngredients.has('igd_vit_d3') ? 30 : 0) + 20;
        const cardioScore = (allIngredients.has('igd_fish_oil') || allIngredients.has('igd_omega3') ? 45 : 15) + (allIngredients.has('igd_lcarnitine') ? 35 : 0) + 15;
        const sleepScore = (allIngredients.has('igd_magnesium') ? 50 : 20) + (allIngredients.has('igd_theanine') ? 30 : 0) + 15;
        const immunityScore = (allIngredients.has('igd_vit_c') ? 45 : 15) + (allIngredients.has('igd_zinc') ? 35 : 0) + 15;
        const recoveryScore = (allIngredients.has('igd_electrolytes') ? 45 : 15) + (allIngredients.has('igd_bcaa') ? 35 : 0) + 15;
        const skinScore = (allIngredients.has('igd_collagen') ? 45 : 15) + (allIngredients.has('igd_astaxanthin') ? 35 : 0) + 15;
        const baseDimensions = {
            joint_bone: Math.min(100, jointScore),
            cardio_metabolic: Math.min(100, cardioScore),
            sleep_stress: Math.min(100, sleepScore),
            immunity_defense: Math.min(100, immunityScore),
            active_recovery: Math.min(100, recoveryScore),
            skin_vitality: Math.min(100, skinScore)
        };
        const personasList = [
            {
                persona_id: 'senior_grandparent',
                persona_name_th: 'ผู้สูงอายุ / ข้อต่อ & ความหนาแน่นกระดูก',
                avatar_emoji: '👵',
                match_percentage: Math.round((baseDimensions.joint_bone * 0.7 + baseDimensions.immunity_defense * 0.3)),
                strength_points: ['สนับสนุนความยืดหยุ่นของข้อต่อ', 'ลดการเสื่อมของกระดูกอ่อน'],
                caution_points: safety.warnings,
                dimensions: baseDimensions
            },
            {
                persona_id: 'active_athlete',
                persona_name_th: 'สายออกกำลังกาย / คาร์ดิโอ & เบิร์นไขมัน',
                avatar_emoji: '🏃',
                match_percentage: Math.round((baseDimensions.active_recovery * 0.6 + baseDimensions.cardio_metabolic * 0.4)),
                strength_points: ['ช่วยฟื้นฟูกล้ามเนื้อหลังออกกำลังกาย', 'ลดการเกิดตะคริว'],
                caution_points: safety.warnings,
                dimensions: baseDimensions
            },
            {
                persona_id: 'office_worker',
                persona_name_th: 'วัยทำงาน / คลายเครียด & ช่วยการนอนหลับ',
                avatar_emoji: '💻',
                match_percentage: Math.round((baseDimensions.sleep_stress * 0.7 + baseDimensions.immunity_defense * 0.3)),
                strength_points: ['ผ่อนคลายระบบประสาท', 'ช่วยให้หลับลึกและตื่นมาสดชื่น'],
                caution_points: safety.warnings,
                dimensions: baseDimensions
            }
        ];
        return {
            privacy_context: privacy,
            stack_safety: safety,
            personalized_matches: personasList
        };
    }
}
exports.DynamicPersonaMCP = DynamicPersonaMCP;
exports.dynamicPersonaMCP = new DynamicPersonaMCP();
