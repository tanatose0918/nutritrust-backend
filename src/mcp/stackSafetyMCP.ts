import { ProductModel } from '../models/Product.js';
import { IngredientModel } from '../models/Ingredient.js';

// ---------------------------------------------------------------------------
// Ingredient Alias Mapping: map seed IDs (igd_001, igd_002, ...) to engine IDs
// Used by both StackSafetyMCP and DynamicPersonaMCP for consistent look‑ups.
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
  igd_012: 'igd_egcg',
  igd_013: 'igd_vit_k2',
  igd_014: 'igd_vit_d3',
  igd_015: 'igd_zinc',
  igd_016: 'igd_calcium',
  igd_017: 'igd_iron',
  igd_018: 'igd_theanine',
  igd_019: 'igd_ginseng',
  igd_020: 'igd_curcumin'
};

export interface IUpperLimitRule {
  igd_id: string;
  name: string;
  max_daily_ul: number;
  unit: string;
  warning_th: string;
}

export interface IInteractionRule {
  pair: [string, string];
  type: 'conflict' | 'synergy';
  title_th: string;
  description_th: string;
}

export interface IHealthCautionWarning {
  condition: string;
  ingredient: string;
  severity: 'high' | 'medium';
  title_th: string;
  description_th: string;
}

// ── Clinical Upper Limit Reference ──────────────────────────────────────────
const UPPER_LIMIT_RULES: Record<string, IUpperLimitRule> = {
  igd_vit_d3:  { igd_id: 'igd_vit_d3',  name: 'Vitamin D3', max_daily_ul: 4000, unit: 'IU',  warning_th: 'ได้รับ Vitamin D3 สูงกว่า 4,000 IU/วัน อาจสะสมในร่างกาย' },
  igd_vit_c:   { igd_id: 'igd_vit_c',   name: 'Vitamin C',  max_daily_ul: 2000, unit: 'mg',  warning_th: 'ได้รับ Vitamin C สูงกว่า 2,000 mg/วัน อาจระคายเคืองทางเดินอาหาร' },
  igd_zinc:    { igd_id: 'igd_zinc',     name: 'Zinc',       max_daily_ul: 40,   unit: 'mg',  warning_th: 'ได้รับ Zinc สูงกว่า 40 mg/วัน ต่อเนื่องอาจลดการดูดซึม Copper' },
  igd_calcium: { igd_id: 'igd_calcium',  name: 'Calcium',    max_daily_ul: 2500, unit: 'mg',  warning_th: 'ได้รับ Calcium สูงกว่า 2,500 mg/วัน อาจเสี่ยงท้องผูกหรือนิ่ว' },
  igd_iron:    { igd_id: 'igd_iron',     name: 'Iron',       max_daily_ul: 45,   unit: 'mg',  warning_th: 'ได้รับ Iron สูงกว่า 45 mg/วัน อาจระคายเคืองกระเพาะอาหาร' }
};

// ── Interaction Rules (Conflicts & Synergies) ────────────────────────────────
const INTERACTION_RULES: IInteractionRule[] = [
  // Existing
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
    description_th: 'D3 ช่วยดูดซึมแคลเซียมเข้าสู่เลือด ส่วน K2 ช่วยนำแคลเซียมจากเลือดไปฝังในกระดูก ไม่ให้เกาะผนังหลอดเลือด'
  },
  {
    pair: ['igd_vit_c', 'igd_collagen'],
    type: 'synergy',
    title_th: 'Vitamin C ช่วยกระตุ้นการสร้าง Collagen',
    description_th: 'Vitamin C เป็น Co-factor สำคัญในการสังเคราะห์เส้นใยคอลลาเจนในชั้นผิวและข้อต่อ'
  },
  // Feature 1
  {
    pair: ['igd_fish_oil', 'igd_lcarnitine'],
    type: 'synergy',
    title_th: 'Fish Oil + L-Carnitine เสริมการเผาผลาญไขมัน',
    description_th: 'Omega-3 จาก Fish Oil ช่วยลดไตรกลีเซอไรด์ ขณะที่ L-Carnitine นำกรดไขมันเข้า Mitochondria เพื่อเผาผลาญเป็นพลังงาน เสริมกันในการลดไขมันและเพิ่มความทนทาน'
  },
  {
    pair: ['igd_magnesium', 'igd_glucosamine'],
    type: 'synergy',
    title_th: 'Magnesium + Glucosamine ลดการอักเสบข้อต่อ',
    description_th: 'Magnesium ลดการอักเสบกล้ามเนื้อรอบข้อ ส่วน Glucosamine บำรุงกระดูกอ่อนโดยตรง ทานร่วมกันช่วยบรรเทาอาการปวดข้อได้ครบวงจร'
  },
  {
    pair: ['igd_collagen', 'igd_astaxanthin'],
    type: 'synergy',
    title_th: 'Collagen + Astaxanthin ปกป้องผิวและข้อต่อ',
    description_th: 'Astaxanthin (Antioxidant แรงกว่า Vit C ถึง 6,000x) ปกป้อง Collagen จากอนุมูลอิสระ ทำให้ผิวและข้อต่อฟื้นตัวได้เร็วและยาวนานกว่า'
  },
  {
    pair: ['igd_vit_c', 'igd_egcg'],
    type: 'conflict',
    title_th: 'Vitamin C + EGCG ปริมาณสูง — ระวังกระเพาะ',
    description_th: 'ทั้งคู่เป็น Antioxidant ที่แรง ทาน Vitamin C > 1,000mg + EGCG > 400mg พร้อมกัน อาจระคายเคืองกระเพาะ แนะนำทานหลังอาหารและดื่มน้ำตาม'
  },
  {
    pair: ['igd_vit_c', 'igd_fish_oil'],
    type: 'conflict',
    title_th: 'Vitamin C + Fish Oil — แนะนำแยกมื้อ',
    description_th: 'Vitamin C ปริมาณสูง (> 1,000mg) อาจออกซิไดส์ EPA/DHA ใน Fish Oil ได้เล็กน้อย แนะนำทาน Fish Oil เช้าหลังอาหาร และ Vitamin C ช่วงบ่าย'
  },
  {
    pair: ['igd_electrolytes', 'igd_magnesium'],
    type: 'conflict',
    title_th: 'Electrolytes + Magnesium — ตรวจสอบปริมาณ Mg รวม',
    description_th: 'Electrolyte Products หลายชนิดมี Magnesium อยู่แล้ว เมื่อทานร่วมกับ Magnesium Supplement อาจได้รับเกิน 400mg/วัน ซึ่งทำให้ท้องเสียได้ ควรตรวจสอบ Label'
  }
];

export interface IStackSafetyResult {
  total_products: number;
  cumulative_ingredients: Record<string, { name: string; total_volume: number; unit: string }>;
  warnings: IHealthCautionWarning[];
  conflicts: IInteractionRule[];
  synergies: IInteractionRule[];
  safety_score: number;
  consumption_schedule: {
    morning_before_meal: string[];
    morning_after_meal: string[];
    bedtime: string[];
  };
}

export class StackSafetyMCP {
  /**
   * Analyze supplement stack safety using MCP-Map-Key as cache-first lookup (zero DB I/O).
   * Falls back to DB query only for unknown product IDs.
   */
  public async analyzeStackSafety(
    productIds: string[],
    healthIssues: string[] = [],
    healthGoals: string[] = []
  ): Promise<IStackSafetyResult> {
    if (!productIds || productIds.length === 0) {
      return {
        total_products: 0,
        cumulative_ingredients: {},
        warnings: [],
        conflicts: [],
        synergies: [],
        safety_score: 100,
        consumption_schedule: { morning_before_meal: [], morning_after_meal: [], bedtime: [] }
      };
    }

    // ── 0. MCP-Map-Key: Cache-first resolution ────────────────────────────────
    const { PRODUCT_MCP_MAP } = await import('./productIngredientMap.js');

    interface IResolved { id: string; name: string; engine_ids: string[] }
    const resolvedProducts: IResolved[] = [];

    const unknownIds: string[] = [];
    for (const id of productIds) {
      if (PRODUCT_MCP_MAP[id]) {
        resolvedProducts.push({ id, name: PRODUCT_MCP_MAP[id].name, engine_ids: PRODUCT_MCP_MAP[id].engine_ids });
      } else {
        unknownIds.push(id);
      }
    }

    // DB fallback only for unknowns
    if (unknownIds.length > 0) {
      const dbProds = await ProductModel.find({ id: { $in: unknownIds } }).lean();
      for (const p of dbProds) {
        resolvedProducts.push({
          id: p.id,
          name: p.name,
          engine_ids: (p.ingredient_list || []).map((i) => INGREDIENT_ALIAS[i.igd_id] || i.igd_id)
        });
      }
    }

    // ── 1. Aggregate Ingredient Sets (presence-based for MCP-Map mode) ────────
    const cumulative: Record<string, { name: string; total_volume: number; unit: string }> = {};
    for (const prod of resolvedProducts) {
      for (const eid of prod.engine_ids) {
        if (!cumulative[eid]) cumulative[eid] = { name: eid, total_volume: 0, unit: 'unit' };
        cumulative[eid].total_volume += 1;
      }
    }

    const warnings: IHealthCautionWarning[] = [];
    let safetyScore = 100;
    const presentKeys = new Set(Object.keys(cumulative));

    // ── 2. Personal Health Issue Cautions (Expanded & Structured) ────────────
    const issuesText = healthIssues.join(' ').toLowerCase();

    const hasKidney    = issuesText.includes('โรคไต') || issuesText.includes('kidney') || issuesText.includes('ไต') || issuesText.includes('renal');
    const hasLiver     = issuesText.includes('โรคตับ') || issuesText.includes('liver') || issuesText.includes('ตับ') || issuesText.includes('hepatic');
    const hasHBP       = issuesText.includes('ความดัน') || issuesText.includes('blood pressure') || issuesText.includes('hypertension');
    const hasDiabetes  = issuesText.includes('เบาหวาน') || issuesText.includes('diabetes') || issuesText.includes('น้ำตาล');
    const hasHeart     = issuesText.includes('โรคหัวใจ') || issuesText.includes('heart') || issuesText.includes('หัวใจ') || issuesText.includes('cardio');
    const hasGERD      = issuesText.includes('กรดไหลย้อน') || issuesText.includes('gerd') || issuesText.includes('กระเพาะ') || issuesText.includes('gastritis') || issuesText.includes('reflux');
    const hasBloodThin = issuesText.includes('ยาต้านการแข็งตัว') || issuesText.includes('warfarin') || issuesText.includes('aspirin') || issuesText.includes('ละลายลิ่มเลือด') || issuesText.includes('blood thinner');
    const hasGout      = issuesText.includes('เกาต์') || issuesText.includes('gout') || issuesText.includes('ยูริก') || issuesText.includes('uric');
    const hasThyroid   = issuesText.includes('ไทรอยด์') || issuesText.includes('thyroid') || issuesText.includes('คอพอก');
    const hasGallstone = issuesText.includes('นิ่วในถุงน้ำดี') || issuesText.includes('gallstone') || issuesText.includes('ถุงน้ำดี');

    // Rule: Kidney disease
    if (hasKidney && (presentKeys.has('igd_calcium') || presentKeys.has('igd_electrolytes'))) {
      warnings.push({
        condition: 'โรคไต (Kidney Disease)',
        ingredient: 'Calcium / Electrolytes',
        severity: 'high',
        title_th: 'ระวังปริมาณ Calcium และ Electrolytes ในผู้มีภาวะโรคไต',
        description_th: 'การทำงานของไตที่ลดลงอาจขับเกลือแร่และแคลเซียมส่วนเกินได้น้อย เสี่ยงต่อภาวะแคลเซียมในเลือดสูงหรือความไม่สมดุลของเกลือแร่ แนะนำปรึกษาแพทย์เฉพาะทางก่อนทาน'
      });
      safetyScore -= 20;
    }

    // Rule: Liver disease
    if (hasLiver && (presentKeys.has('igd_vit_a') || presentKeys.has('igd_iron') || presentKeys.has('igd_egcg'))) {
      warnings.push({
        condition: 'โรคตับ (Liver Condition)',
        ingredient: 'Vitamin A / Iron / EGCG',
        severity: 'high',
        title_th: 'หลีกเลี่ยง Vitamin A, Iron หรือ EGCG ปริมาณสูงที่อาจเพิ่มภาระตับ',
        description_th: 'ตับมีหน้าที่สะสมและเผาผลาญสารกลุ่มนี้ การได้รับในปริมาณสูงอาจสะสมและเพิ่มความเครียดต่อเซลล์ตับได้'
      });
      safetyScore -= 15;
    }

    // Rule: Hypertension / HBP
    if (hasHBP && (presentKeys.has('igd_electrolytes') || presentKeys.has('igd_ginseng'))) {
      warnings.push({
        condition: 'ความดันโลหิตสูง (Hypertension)',
        ingredient: 'High-Sodium Electrolytes / Ginseng',
        severity: 'medium',
        title_th: 'ควรเลือก Electrolytes สูตร Low-Sodium และระวังโสม',
        description_th: 'โซเดียมสูงในเกลือแร่บางชนิดอาจส่งผลต่อความดันโลหิต และโสมอาจมีผลกระตุ้นระบบไหลเวียนเลือด ควรตรวจวัดความดันสม่ำเสมอ'
      });
      safetyScore -= 15;
    }

    // Rule: Diabetes
    if (hasDiabetes && presentKeys.has('igd_coq10')) {
      warnings.push({
        condition: 'โรคเบาหวาน (Diabetes)',
        ingredient: 'CoQ10',
        severity: 'medium',
        title_th: 'ผู้ป่วยเบาหวานที่ทาน CoQ10 ควรติดตามระดับน้ำตาลในเลือด',
        description_th: 'CoQ10 มีส่วนช่วยในการทำงานของไมโทคอนเดรียและอาจส่งเสริมการตอบสนองต่ออินซูลิน ควรตรวจวัดระดับน้ำตาลในเลือดเพื่อปรับยาตามความเหมาะสม'
      });
      safetyScore -= 10;
    }

    // Rule: Heart Disease
    if (hasHeart && presentKeys.has('igd_lcarnitine')) {
      warnings.push({
        condition: 'โรคหัวใจ (Heart Disease)',
        ingredient: 'L-Carnitine',
        severity: 'high',
        title_th: 'ผู้ป่วยโรคหัวใจควรปรึกษาแพทย์ก่อนทาน L-Carnitine ปริมาณสูง',
        description_th: 'L-Carnitine ในปริมาณสูงต่อเนื่องอาจเปลี่ยนรูปเป็น TMAO ในลำไส้ ซึ่งมีความเชื่อมโยงกับหลอดเลือดหัวใจ ควรรับประทานภายใต้คำแนะนำของแพทย์'
      });
      safetyScore -= 15;
    }

    // Rule: GERD / Gastritis
    if (hasGERD && (presentKeys.has('igd_vit_c') || presentKeys.has('igd_egcg') || presentKeys.has('igd_zinc'))) {
      warnings.push({
        condition: 'กรดไหลย้อน / แผลในกระเพาะ (GERD / Gastritis)',
        ingredient: 'Vitamin C / EGCG / Zinc',
        severity: 'medium',
        title_th: 'ห้ามทาน Vitamin C หรือ สารสกัดชาเขียว (EGCG) ตอนท้องว่าง',
        description_th: 'Vitamin C (Ascorbic Acid) และ EGCG มีความเป็นกรดและสารฝาดที่อาจระคายเคืองเยื่อบุกระเพาะอาหาร แนะนำทานพร้อมหรือหลังอาหารมื้อหนักทันที'
      });
      safetyScore -= 10;
    }

    // Rule: Blood Thinners (Warfarin / Aspirin)
    if (hasBloodThin && (presentKeys.has('igd_vit_k2') || presentKeys.has('igd_fish_oil') || presentKeys.has('igd_astaxanthin'))) {
      warnings.push({
        condition: 'ผู้ใช้ยาต้านการแข็งตัวของเลือด (Blood Thinners)',
        ingredient: 'Vitamin K2 / Fish Oil / Astaxanthin',
        severity: 'high',
        title_th: 'ระวังปฏิกิริยากับยาต้านการแข็งตัวของเลือด (Warfarin/Aspirin)',
        description_th: 'Vitamin K2 มีผลต่อกระบวนการแข็งตัวของเลือด ส่วน Fish Oil ขนาดสูง (>2,000mg) มีฤทธิ์ต้านการเกาะกลุ่มของเกล็ดเลือด อาจส่งผลต่อค่า INR ต้องปรึกษาแพทย์ก่อนทาน'
      });
      safetyScore -= 20;
    }

    // Rule: Gout / High Uric Acid
    if (hasGout && (presentKeys.has('igd_collagen') || presentKeys.has('igd_lcarnitine'))) {
      warnings.push({
        condition: 'โรคเกาต์ / กรดยูริกสูง (Gout)',
        ingredient: 'High Protein / Collagen',
        severity: 'medium',
        title_th: 'ควรดื่มน้ำมากๆ เมื่อทาน Collagen ในผู้ป่วยโรคเกาต์',
        description_th: 'การทานโปรตีนเข้มข้นควรดื่มน้ำสะอาดวันละ 2.5-3 ลิตร เพื่อช่วยไตในการขับของเสียและควบคุมสมดุลกรดยูริก'
      });
      safetyScore -= 10;
    }

    // Rule: Gallstones
    if (hasGallstone && presentKeys.has('igd_curcumin')) {
      warnings.push({
        condition: 'นิ่วในถุงน้ำดี (Gallstones)',
        ingredient: 'Curcumin / Turmeric',
        severity: 'high',
        title_th: 'ผู้มีนิ่วในถุงน้ำดีควรหลีกเลี่ยงขมิ้นชันสกัดเข้มข้น',
        description_th: 'สารสกัด Curcumin กระตุ้นการบีบตัวของถุงน้ำดี อาจทำให้เกิดอาการปวดเกร็งรุนแรงในผู้ที่มีนิ่วในถุงน้ำดีอุดกั้น'
      });
      safetyScore -= 15;
    }

    // ── 3. Interaction Rules ──────────────────────────────────────────────────
    const conflicts: IInteractionRule[] = [];
    const synergies: IInteractionRule[] = [];

    for (const rule of INTERACTION_RULES) {
      const [k1, k2] = rule.pair;
      if (presentKeys.has(k1) && presentKeys.has(k2)) {
        if (rule.type === 'conflict') { conflicts.push(rule); safetyScore -= 10; }
        else                          { synergies.push(rule); safetyScore += 5;  }
      }
    }

    // ── 4. Consumption Schedule ───────────────────────────────────────────────
    const morning_before_meal: string[] = [];
    const morning_after_meal: string[] = [];
    const bedtime: string[] = [];

    for (const prod of resolvedProducts) {
      const ids = prod.engine_ids;
      if (ids.includes('igd_magnesium') || ids.includes('igd_theanine')) {
        bedtime.push(prod.name);
      } else if (ids.includes('igd_fish_oil') || ids.includes('igd_vit_d3') || ids.includes('igd_vit_k2') || ids.includes('igd_coq10') || ids.includes('igd_uc2') || ids.includes('igd_astaxanthin') || ids.includes('igd_curcumin')) {
        morning_after_meal.push(prod.name);
      } else {
        morning_before_meal.push(prod.name);
      }
    }

    return {
      total_products: resolvedProducts.length,
      cumulative_ingredients: cumulative,
      warnings,
      conflicts,
      synergies,
      safety_score: Math.max(0, Math.min(100, safetyScore)),
      consumption_schedule: {
        morning_before_meal,
        morning_after_meal,
        bedtime
      }
    };
  }
}

export const stackSafetyMCP = new StackSafetyMCP();
