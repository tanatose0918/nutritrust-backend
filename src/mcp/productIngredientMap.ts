/**
 * MCP-Map-Key: Static In-Memory Product → Ingredient Lookup
 * ---------------------------------------------------------------
 * Purpose: Cache-first resolution of product_id → ingredient engine IDs.
 * Avoids a DB round-trip for every MCP stack analysis call.
 * Aligned with the 7+1 SIR Slot Compression model — short keys only.
 *
 * Key Format: p_XXX → { engine_ids: string[], name: string, category: string }
 * engine_ids use the canonical INGREDIENT_ALIAS target form (igd_vit_c, etc.)
 */

export interface IProductMapEntry {
  engine_ids: string[];  // Canonical ingredient engine IDs (post-alias)
  name: string;          // Short display name for schedule output
  category: string;      // Slim category tag
}

export const PRODUCT_MCP_MAP: Record<string, IProductMapEntry> = {
  // ─── Vitamin C ─────────────────────────────────────────────────
  p_001: { engine_ids: ['igd_vit_c'],        name: 'Blackmores Bio C 1000mg',           category: 'vitamin-c' },
  p_002: { engine_ids: ['igd_vit_c'],        name: 'Vistra Acerola Cherry 1000mg',      category: 'vitamin-c' },
  p_009: { engine_ids: ['igd_vit_c'],        name: 'Mega We Care Nat C',                category: 'vitamin-c' },
  p_010: { engine_ids: ['igd_vit_c'],        name: 'NOW Foods Vitamin C-1000',          category: 'vitamin-c' },
  p_011: { engine_ids: ['igd_vit_c'],        name: 'DHC Vitamin C 60 Days',             category: 'vitamin-c' },
  p_012: { engine_ids: ['igd_vit_c'],        name: 'Hicee Vitamin C Chewable',          category: 'vitamin-c' },
  p_013: { engine_ids: ['igd_vit_c'],        name: 'Kirkland Vitamin C 1000mg',         category: 'vitamin-c' },
  p_014: { engine_ids: ['igd_vit_c'],        name: '21st Century Vitamin C 1000mg',     category: 'vitamin-c' },
  p_015: { engine_ids: ['igd_vit_c'],        name: 'California Gold C 1000mg',          category: 'vitamin-c' },
  p_016: { engine_ids: ['igd_vit_c'],        name: 'Demosana Vitamin C Effervescent',   category: 'vitamin-c' },

  // ─── Omega-3 / Fish Oil ────────────────────────────────────────
  p_003: { engine_ids: ['igd_fish_oil'],     name: 'Mega We Care Fish Oil 1000mg',      category: 'omega-3-fish-oil' },
  p_017: { engine_ids: ['igd_fish_oil'],     name: 'Blackmores Fish Oil Odourless',     category: 'omega-3-fish-oil' },
  p_018: { engine_ids: ['igd_fish_oil'],     name: 'NOW Foods Omega-3 1000mg',          category: 'omega-3-fish-oil' },
  p_019: { engine_ids: ['igd_fish_oil'],     name: 'Vistra Salmon Fish Oil 1000mg',     category: 'omega-3-fish-oil' },
  p_020: { engine_ids: ['igd_fish_oil'],     name: 'Swisse Odourless Wild Fish Oil',    category: 'omega-3-fish-oil' },
  p_021: { engine_ids: ['igd_fish_oil'],     name: 'Kirkland Fish Oil 1000mg',          category: 'omega-3-fish-oil' },
  p_022: { engine_ids: ['igd_fish_oil'],     name: 'Nordic Naturals Ultimate Omega',    category: 'omega-3-fish-oil' },
  p_023: { engine_ids: ['igd_fish_oil'],     name: 'Carlson Labs Fish Oil',             category: 'omega-3-fish-oil' },
  p_024: { engine_ids: ['igd_fish_oil'],     name: 'DHC DHA 60 Days',                  category: 'omega-3-fish-oil' },
  p_025: { engine_ids: ['igd_fish_oil'],     name: 'GNC Triple Strength Fish Oil',      category: 'omega-3-fish-oil' },

  // ─── Magnesium ─────────────────────────────────────────────────
  p_004: { engine_ids: ['igd_magnesium'],    name: 'NOW Foods Magnesium Glycinate',     category: 'magnesium' },
  p_026: { engine_ids: ['igd_magnesium'],    name: 'Magnesium Oxide 400mg',             category: 'magnesium' },
  p_027: { engine_ids: ['igd_magnesium'],    name: 'Blackmores Magnesium Muscle',       category: 'magnesium' },
  p_028: { engine_ids: ['igd_magnesium'],    name: 'Vistra Magnesium B1B6B12',          category: 'magnesium' },
  p_029: { engine_ids: ['igd_magnesium'],    name: "Doctor's Best Magnesium",           category: 'magnesium' },
  p_030: { engine_ids: ['igd_magnesium'],    name: 'KAL Magnesium Glycinate 350mg',     category: 'magnesium' },
  p_031: { engine_ids: ['igd_magnesium'],    name: 'Life Extension Magnesium 500mg',    category: 'magnesium' },
  p_032: { engine_ids: ['igd_magnesium'],    name: "Nature's Bounty Magnesium 500mg",   category: 'magnesium' },
  p_033: { engine_ids: ['igd_magnesium'],    name: 'Swisse Ultiboost Magnesium',        category: 'magnesium' },
  p_034: { engine_ids: ['igd_magnesium'],    name: '21st Century Magnesium 250mg',      category: 'magnesium' },

  // ─── Astaxanthin & Collagen ────────────────────────────────────
  p_035: { engine_ids: ['igd_astaxanthin'],  name: 'Astaxanthin 12mg Softgels',         category: 'astaxanthin-collagen' },
  p_036: { engine_ids: ['igd_astaxanthin'],  name: 'Vistra Astaxanthin 6mg AstaReal',   category: 'astaxanthin-collagen' },
  p_037: { engine_ids: ['igd_astaxanthin'],  name: 'Mega We Care Astax 4mg',            category: 'astaxanthin-collagen' },
  p_038: { engine_ids: ['igd_astaxanthin'],  name: 'NOW Foods Astaxanthin 4mg',         category: 'astaxanthin-collagen' },
  p_039: { engine_ids: ['igd_astaxanthin'],  name: 'California Gold Astaxanthin 12mg',  category: 'astaxanthin-collagen' },
  p_040: { engine_ids: ['igd_astaxanthin'],  name: 'DHC Astaxanthin 30 Days',           category: 'astaxanthin-collagen' },
  p_041: { engine_ids: ['igd_collagen'],     name: 'Meiji Amino Collagen Powder',       category: 'astaxanthin-collagen' },
  p_042: { engine_ids: ['igd_collagen'],     name: 'Neocell Super Collagen + C',        category: 'astaxanthin-collagen' },
  p_043: { engine_ids: ['igd_collagen'],     name: 'Amado Colligi Collagen Tripeptide', category: 'astaxanthin-collagen' },
  p_044: { engine_ids: ['igd_collagen'],     name: 'Bomi Collagen Dipeptide',           category: 'astaxanthin-collagen' },

  // ─── CoQ10 & Multivitamins ─────────────────────────────────────
  p_045: { engine_ids: ['igd_coq10'],        name: "Nature's Bounty CoQ10 100mg",       category: 'coq10-multivitamins' },
  p_046: { engine_ids: ['igd_coq10'],        name: 'CoQ10 30mg Softgels',               category: 'coq10-multivitamins' },
  p_005: { engine_ids: ['igd_coq10'],        name: 'Swisse Ultiboost Multivitamin',     category: 'coq10-multivitamins' },
  p_047: { engine_ids: ['igd_coq10'],        name: 'Blackmores CoQ10 150mg',            category: 'coq10-multivitamins' },
  p_048: { engine_ids: ['igd_coq10'],        name: 'Vistra Coenzyme Q10 30mg',          category: 'coq10-multivitamins' },
  p_049: { engine_ids: ['igd_coq10'],        name: 'Mega We Care Maxcover CoQ10',       category: 'coq10-multivitamins' },
  p_050: { engine_ids: ['igd_coq10'],        name: "Doctor's Best CoQ10 100mg",         category: 'coq10-multivitamins' },
  p_051: { engine_ids: ['igd_coq10'],        name: 'Kirkland CoQ10 300mg',              category: 'coq10-multivitamins' },
  p_052: { engine_ids: ['igd_coq10'],        name: 'DHC Coenzyme Q10 Direct',           category: 'coq10-multivitamins' },
  p_053: { engine_ids: ['igd_coq10'],        name: 'Centrum Multivitamin Adults A-Z',   category: 'coq10-multivitamins' },

  // ─── Joint Protection ──────────────────────────────────────────
  p_006: { engine_ids: ['igd_uc2'],          name: 'Move Free Ultra UC-II',              category: 'joint-protection' },
  p_054: { engine_ids: ['igd_uc2'],          name: 'Blackmores Joint Plus Collagen',     category: 'joint-protection' },
  p_055: { engine_ids: ['igd_uc2'],          name: 'NOW Foods UC-II Joint Health',       category: 'joint-protection' },
  p_056: { engine_ids: ['igd_uc2'],          name: 'Vistra Calplex Calcium D3 K2',       category: 'joint-protection' },
  p_057: { engine_ids: ['igd_glucosamine'],  name: 'Mega We Care Jointsical Glucosamine',category: 'joint-protection' },
  p_058: { engine_ids: ['igd_glucosamine'],  name: "Doctor's Best Glucosamine MSM",      category: 'joint-protection' },
  p_059: { engine_ids: ['igd_glucosamine'],  name: 'Blackmores Glucosamine 1500mg',      category: 'joint-protection' },
  p_060: { engine_ids: ['igd_uc2'],          name: 'InterCare Joint Care UC-II Turmeric',category: 'joint-protection' },
  p_061: { engine_ids: ['igd_uc2'],          name: 'Life Extension NT2 Collagen UC-II',  category: 'joint-protection' },
  p_062: { engine_ids: ['igd_glucosamine'],  name: 'Swisse Joint Glucosamine MSM',       category: 'joint-protection' },

  // ─── Energy & Metabolism ───────────────────────────────────────
  p_007: { engine_ids: ['igd_lcarnitine'],   name: 'Vistra L-Carnitine 500mg',           category: 'energy-metabolism' },
  p_063: { engine_ids: ['igd_lcarnitine'],   name: 'Yanhee Ultimate L-Carnitine',        category: 'energy-metabolism' },
  p_064: { engine_ids: ['igd_egcg'],         name: 'Mega We Care Hi-GREEN EGCG',         category: 'energy-metabolism' },
  p_065: { engine_ids: ['igd_lcarnitine'],   name: 'NOW Foods L-Carnitine Carnipure®',   category: 'energy-metabolism' },
  p_066: { engine_ids: ['igd_lcarnitine'],   name: 'InterCare L-Carnitine + Arginine',   category: 'energy-metabolism' },
  p_067: { engine_ids: ['igd_lcarnitine'],   name: 'Nutrex Liquid L-Carnitine 3000',     category: 'energy-metabolism' },
  p_068: { engine_ids: ['igd_lcarnitine'],   name: 'DHC L-Carnitine 300mg',              category: 'energy-metabolism' },
  p_069: { engine_ids: ['igd_lcarnitine'],   name: 'Watsons L-Carnitine 500mg',          category: 'energy-metabolism' },
  p_070: { engine_ids: ['igd_egcg'],         name: "Nature's Bounty Green Tea EGCG",     category: 'energy-metabolism' },
  p_071: { engine_ids: ['igd_lcarnitine'],   name: 'Gold Nutrition L-Carnitine 3000',    category: 'energy-metabolism' },

  // ─── Recovery & Hydration ──────────────────────────────────────
  p_008: { engine_ids: ['igd_electrolytes'], name: 'SaltStick Electrolyte Fastchews',    category: 'recovery-hydration' },
  p_072: { engine_ids: ['igd_electrolytes'], name: 'Pocari Sweat Ion Supply Powder',     category: 'recovery-hydration' },
  p_073: { engine_ids: ['igd_electrolytes'], name: 'Active Peak Energy Gel + Electrolytes', category: 'recovery-hydration' },
  p_074: { engine_ids: ['igd_electrolytes'], name: 'Dever Energy Gel & Electrolyte',     category: 'recovery-hydration' },
  p_075: { engine_ids: ['igd_electrolytes'], name: 'AMMO Natural Energy Gel',            category: 'recovery-hydration' },
  p_076: { engine_ids: ['igd_electrolytes'], name: 'Royal-D Electrolyte Beverage',       category: 'recovery-hydration' },
  p_077: { engine_ids: ['igd_electrolytes'], name: 'GU Energy Gel + Amino Acids',        category: 'recovery-hydration' },
  p_078: { engine_ids: ['igd_electrolytes'], name: 'Ultrapro Whey Protein',              category: 'recovery-hydration' },
  p_079: { engine_ids: ['igd_electrolytes'], name: 'Plantae Complete Plant Protein',     category: 'recovery-hydration' },
  p_080: { engine_ids: ['igd_magnesium'],    name: 'NOW Foods Magnesium Citrate 200mg',  category: 'recovery-hydration' },
};

/**
 * Resolve product IDs to their MCP entries from the static map.
 * Returns only known products — unknown IDs are skipped.
 * This is the primary SIR-compressed lookup used by stackSafetyMCP.
 */
export function resolveProductsFromMap(
  productIds: string[]
): { id: string; entry: IProductMapEntry }[] {
  return productIds
    .filter((id) => !!PRODUCT_MCP_MAP[id])
    .map((id) => ({ id, entry: PRODUCT_MCP_MAP[id] }));
}
