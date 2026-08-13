import { ProductModel } from '../models/Product';
import { privacyTokenizerMCP, IPrivacyTokenizerMCPResult } from './privacyTokenizerMCP';
import { stackSafetyMCP, IStackSafetyResult } from './stackSafetyMCP';

// ---------------------------------------------------------------------------
// Ingredient Alias Mapping (same as in stackSafetyMCP) for consistent look‑ups.
// ---------------------------------------------------------------------------
const INGREDIENT_ALIAS: Record<string, string> = {
  igd_001: 'igd_vit_c',
  igd_002: 'igd_fish_oil',
  igd_003: 'igd_magnesium',
  igd_004: 'igd_coq10',
  igd_005: 'igd_vit_c',
  igd_006: 'igd_uc2',
  igd_007: 'igd_lcarnitine',
  igd_008: 'igd_electrolytes',
  igd_009: 'igd_astaxanthin',
  igd_010: 'igd_collagen',
  igd_011: 'igd_glucosamine',
  igd_012: 'igd_egcg'
};

export interface IPersonaMatchScore {
  persona_id: string;
  persona_name_th: string;
  avatar_emoji: string;
  match_percentage: number;
  strength_points: string[];
  caution_points: string[];
  dimensions: {
    joint_bone: number;
    cardio_metabolic: number;
    sleep_stress: number;
    immunity_defense: number;
    active_recovery: number;
    skin_vitality: number;
  };
}

export class DynamicPersonaMCP {
  /**
   * Compute dynamic persona match scores for a user profile against a product or stack
   */
  public async computeDynamicMatch(params: {
    email?: string;
    raw_prompt?: string;
    product_ids: string[];
    health_issues?: string[];
    health_goals?: string[];
  }): Promise<{
    privacy_context: IPrivacyTokenizerMCPResult;
    stack_safety: IStackSafetyResult;
    personalized_matches: IPersonaMatchScore[];
  }> {
    // 1. Process Privacy & SIR Matrix via MCP 1
    const privacy = privacyTokenizerMCP.processUserInput(params.email, params.raw_prompt);

    // 2. Evaluate Stack Safety via MCP 2 (Passing health issues and goals)
    const safety = await stackSafetyMCP.analyzeStackSafety(params.product_ids, params.health_issues, params.health_goals);

    // 3. Fetch products data
    const products = await ProductModel.find({ id: { $in: params.product_ids } }).lean();
    const rawIngredientIds = products.flatMap((p) => (p.ingredient_list || []).map((i) => i.igd_id));
    const allIngredients = new Set(rawIngredientIds.map(id => INGREDIENT_ALIAS[id] || id));

    // 4. Compute 6 Persona Dimension Overlays
    let jointScore = (allIngredients.has('igd_uc2') || allIngredients.has('igd_collagen') ? 40 : 10) + (allIngredients.has('igd_vit_d3') ? 30 : 0) + 20;
    let cardioScore = (allIngredients.has('igd_fish_oil') ? 45 : 15) + (allIngredients.has('igd_lcarnitine') ? 35 : 0) + 15;
    let sleepScore = (allIngredients.has('igd_magnesium') ? 50 : 20) + (allIngredients.has('igd_theanine') ? 30 : 0) + 15;
    let immunityScore = (allIngredients.has('igd_vit_c') ? 45 : 15) + (allIngredients.has('igd_zinc') ? 35 : 0) + 15;
    let recoveryScore = (allIngredients.has('igd_electrolytes') ? 45 : 15) + (allIngredients.has('igd_bcaa') ? 35 : 0) + 15;
    let skinScore = (allIngredients.has('igd_collagen') ? 45 : 15) + (allIngredients.has('igd_astaxanthin') ? 35 : 0) + 15;

    // Apply Health Goals Biasing
    const healthGoals = params.health_goals || [];

    if (healthGoals.includes('joint') || healthGoals.includes('bone')) jointScore += 15;
    if (healthGoals.includes('heart') || healthGoals.includes('cholesterol')) cardioScore += 15;
    if (healthGoals.includes('sleep') || healthGoals.includes('stress') || healthGoals.includes('relax')) sleepScore += 15;
    if (healthGoals.includes('immune') || healthGoals.includes('allergy')) immunityScore += 15;
    if (healthGoals.includes('energy') || healthGoals.includes('muscle') || healthGoals.includes('recovery')) recoveryScore += 15;
    if (healthGoals.includes('skin') || healthGoals.includes('beauty') || healthGoals.includes('antiaging')) skinScore += 15;

    const baseDimensions = {
      joint_bone: Math.min(100, jointScore),
      cardio_metabolic: Math.min(100, cardioScore),
      sleep_stress: Math.min(100, sleepScore),
      immunity_defense: Math.min(100, immunityScore),
      active_recovery: Math.min(100, recoveryScore),
      skin_vitality: Math.min(100, skinScore)
    };

    const personasList: IPersonaMatchScore[] = [
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

export const dynamicPersonaMCP = new DynamicPersonaMCP();
