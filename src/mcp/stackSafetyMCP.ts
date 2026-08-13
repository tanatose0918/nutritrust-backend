import { ProductModel } from '../models/Product';
import { IngredientModel } from '../models/Ingredient';

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
  igd_012: 'igd_egcg'
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
  // New Rules — Feature 1
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
  warnings: string[];
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

    const warnings: string[] = [];
    let safetyScore = 100;
    const presentKeys = new Set(Object.keys(cumulative));

    // ── 2. Personal Health Issue Warnings ─────────────────────────────────────
    const issuesText = healthIssues.join(' ').toLowerCase();
    const hasKidney   = issuesText.includes('โรคไต')   || issuesText.includes('kidney')      || issuesText.includes('ไต');
    const hasLiver    = issuesText.includes('โรคตับ')  || issuesText.includes('liver')        || issuesText.includes('ตับ');
    const hasHBP      = issuesText.includes('ความดัน') || issuesText.includes('blood pressure')|| issuesText.includes('hypertension');
    const hasDiabetes = issuesText.includes('เบาหวาน') || issuesText.includes('diabetes')     || issuesText.includes('น้ำตาล');
    const hasHeart    = issuesText.includes('โรคหัวใจ')|| issuesText.includes('heart disease') || issuesText.includes('หัวใจ');

    if (hasKidney   && (presentKeys.has('igd_calcium') || presentKeys.has('igd_electrolytes')))
      { warnings.push('[Personal Health Warning]: ท่านมีภาวะโรคไต ควรระวัง Calcium / Electrolytes ปริมาณสูง แนะนำปรึกษาแพทย์ก่อนทาน'); safetyScore -= 20; }
    if (hasLiver    && (presentKeys.has('igd_vit_a') || presentKeys.has('igd_iron')))
      { warnings.push('[Personal Health Warning]: ท่านมีภาวะโรคตับ ควรระวัง Vitamin A / Iron ที่อาจเพิ่มภาระตับ'); safetyScore -= 15; }
    if (hasHBP      && (presentKeys.has('igd_electrolytes') || presentKeys.has('igd_ginseng')))
      { warnings.push('[Personal Health Warning]: ท่านมีภาวะความดันโลหิต ควรเลือก Electrolytes สูตร Low-Sodium'); safetyScore -= 15; }
    if (hasDiabetes && presentKeys.has('igd_coq10'))
      { warnings.push('[Personal Health Warning]: ผู้ป่วยเบาหวานที่ทาน CoQ10 ควรติดตามระดับน้ำตาลในเลือดอย่างใกล้ชิด'); safetyScore -= 10; }
    if (hasHeart    && presentKeys.has('igd_lcarnitine'))
      { warnings.push('[Personal Health Warning]: ผู้ป่วยโรคหัวใจควรปรึกษาแพทย์ก่อนทาน L-Carnitine ในปริมาณสูง'); safetyScore -= 10; }

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
      } else if (ids.includes('igd_fish_oil') || ids.includes('igd_vit_d3') || ids.includes('igd_vit_k2') || ids.includes('igd_coq10') || ids.includes('igd_uc2')) {
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
