import fs from 'node:fs';
import path from 'node:path';

const mockupDir = path.resolve(__dirname, '../../../nutritrust-web-app/mockup');

// 1. Expanded Brands Master List (37 Brands)
const expandedBrands = [
  { id: "br_001", name: "Blackmores", provide_at: "Australia", provider_list: ["prv_001", "prv_002"] },
  { id: "br_002", name: "Vistra", provide_at: "Thailand", provider_list: ["prv_003", "prv_004"] },
  { id: "br_003", name: "NOW Foods", provide_at: "USA", provider_list: ["prv_001", "prv_005"] },
  { id: "br_004", name: "Mega We Care", provide_at: "Thailand", provider_list: ["prv_002", "prv_003"] },
  { id: "br_005", name: "Swisse", provide_at: "Australia", provider_list: ["prv_001", "prv_004"] },
  { id: "br_006", name: "Move Free (Schiff)", provide_at: "USA", provider_list: ["prv_006", "prv_007"] },
  { id: "br_007", name: "SaltStick", provide_at: "USA", provider_list: ["prv_005"] },
  { id: "br_008", name: "DHC", provide_at: "Japan", provider_list: ["prv_001", "prv_003"] },
  { id: "br_009", name: "Hicee", provide_at: "Japan", provider_list: ["prv_002"] },
  { id: "br_010", name: "Kirkland Signature", provide_at: "USA", provider_list: ["prv_001", "prv_005"] },
  { id: "br_011", name: "21st Century", provide_at: "USA", provider_list: ["prv_005"] },
  { id: "br_012", name: "California Gold Nutrition", provide_at: "USA", provider_list: ["prv_001", "prv_003"] },
  { id: "br_013", name: "Demosana", provide_at: "Germany", provider_list: ["prv_004"] },
  { id: "br_014", name: "Nordic Naturals", provide_at: "Norway", provider_list: ["prv_002"] },
  { id: "br_015", name: "Carlson Labs", provide_at: "Norway", provider_list: ["prv_002"] },
  { id: "br_016", name: "GNC", provide_at: "USA", provider_list: ["prv_001", "prv_005"] },
  { id: "br_017", name: "Doctor's Best", provide_at: "USA", provider_list: ["prv_001", "prv_006"] },
  { id: "br_018", name: "KAL", provide_at: "USA", provider_list: ["prv_005"] },
  { id: "br_019", name: "Life Extension", provide_at: "USA", provider_list: ["prv_001", "prv_006"] },
  { id: "br_020", name: "Nature's Bounty", provide_at: "USA", provider_list: ["prv_005"] },
  { id: "br_021", name: "Meiji", provide_at: "Japan", provider_list: ["prv_003"] },
  { id: "br_022", name: "Neocell", provide_at: "USA", provider_list: ["prv_003"] },
  { id: "br_023", name: "Amado Colligi", provide_at: "Thailand", provider_list: ["prv_003"] },
  { id: "br_024", name: "Bomi", provide_at: "Thailand", provider_list: ["prv_003"] },
  { id: "br_025", name: "Centrum", provide_at: "USA", provider_list: ["prv_001"] },
  { id: "br_026", name: "InterCare", provide_at: "Thailand", provider_list: ["prv_003", "prv_006"] },
  { id: "br_027", name: "Yanhee", provide_at: "Thailand", provider_list: ["prv_003"] },
  { id: "br_028", name: "Nutrex Research", provide_at: "USA", provider_list: ["prv_005"] },
  { id: "br_029", name: "Watsons", provide_at: "Hong Kong", provider_list: ["prv_004"] },
  { id: "br_030", name: "Gold Nutrition", provide_at: "Portugal", provider_list: ["prv_005"] },
  { id: "br_031", name: "Pocari Sweat", provide_at: "Japan", provider_list: ["prv_004"] },
  { id: "br_032", name: "Active Peak", provide_at: "Thailand", provider_list: ["prv_005"] },
  { id: "br_033", name: "Dever", provide_at: "Thailand", provider_list: ["prv_005"] },
  { id: "br_034", name: "AMMO", provide_at: "Thailand", provider_list: ["prv_005"] },
  { id: "br_035", name: "Royal-D", provide_at: "Thailand", provider_list: ["prv_004"] },
  { id: "br_036", name: "GU Energy", provide_at: "USA", provider_list: ["prv_005"] },
  { id: "br_037", name: "Plantae", provide_at: "Thailand", provider_list: ["prv_003"] },
  { id: "br_000", name: "General Brand", provide_at: "Global", provider_list: ["prv_001"] }
];

// 2. Master Ingredients List
const expandedIngredients = [
  { id: "igd_001", name: "Vitamin C (Ascorbic Acid)", provider_id: "prv_001" },
  { id: "igd_002", name: "Omega-3 (EPA/DHA Fish Oil)", provider_id: "prv_002" },
  { id: "igd_003", name: "Magnesium Glycinate / Oxide", provider_id: "prv_005" },
  { id: "igd_004", name: "Coenzyme Q10 (CoQ10)", provider_id: "prv_001" },
  { id: "igd_005", name: "Acerola Cherry Extract", provider_id: "prv_003" },
  { id: "igd_006", name: "Undenatured Collagen Type II (UC-II)", provider_id: "prv_006" },
  { id: "igd_007", name: "L-Carnitine L-Tartrate (Carnipure®)", provider_id: "prv_005" },
  { id: "igd_008", name: "Electrolytes (Sodium, Potassium, Magnesium)", provider_id: "prv_004" },
  { id: "igd_009", name: "Astaxanthin (Natural Microalgae)", provider_id: "prv_003" },
  { id: "igd_010", name: "Hydrolyzed Fish Collagen Tripeptide", provider_id: "prv_003" },
  { id: "igd_011", name: "Glucosamine Sulfate & Chondroitin", provider_id: "prv_006" },
  { id: "igd_012", name: "Green Tea Extract (EGCG)", provider_id: "prv_003" }
];

// 3. Master 80 Products Definition
const raw80Products = [
  // --- Category 1: Vitamin C ---
  { id: "p_001", brand_id: "br_001", name: "Blackmores Bio C 1000 mg", category_slug: "vitamin-c", sub_category: "immunity-skin", igd: "igd_001", vol: "1000mg", pkg: "tablet-150", min_price: 1090, max_price: 1390, ev: "ev_vitaminc_001" },
  { id: "p_002", brand_id: "br_002", name: "Vistra Acerola Cherry 1000 mg", category_slug: "vitamin-c", sub_category: "skin-collagen", igd: "igd_005", vol: "1000mg", pkg: "tablet-45", min_price: 329, max_price: 499, ev: "ev_vitaminc_001" },
  { id: "p_009", brand_id: "br_004", name: "Mega We Care Nat C", category_slug: "vitamin-c", sub_category: "immunity-stomach", igd: "igd_001", vol: "1000mg", pkg: "tablet-60", min_price: 480, max_price: 650, ev: "ev_vitaminc_001" },
  { id: "p_010", brand_id: "br_003", name: "NOW Foods Vitamin C-1000", category_slug: "vitamin-c", sub_category: "high-potency", igd: "igd_001", vol: "1000mg", pkg: "capsule-100", min_price: 520, max_price: 750, ev: "ev_vitaminc_001" },
  { id: "p_011", brand_id: "br_008", name: "DHC Vitamin C 60 Days", category_slug: "vitamin-c", sub_category: "daily-maintenance", igd: "igd_001", vol: "1000mg", pkg: "capsule-120", min_price: 180, max_price: 250, ev: "ev_vitaminc_001" },
  { id: "p_012", brand_id: "br_009", name: "Hicee Vitamin C Chewable", category_slug: "vitamin-c", sub_category: "chewable-daily", igd: "igd_001", vol: "500mg", pkg: "tablet-50", min_price: 120, max_price: 160, ev: "ev_vitaminc_001" },
  { id: "p_013", brand_id: "br_010", name: "Kirkland Signature Vitamin C 1000mg", category_slug: "vitamin-c", sub_category: "family-value", igd: "igd_001", vol: "1000mg", pkg: "tablet-500", min_price: 890, max_price: 1190, ev: "ev_vitaminc_001" },
  { id: "p_014", brand_id: "br_011", name: "21st Century Vitamin C 1000 mg", category_slug: "vitamin-c", sub_category: "budget-immune", igd: "igd_001", vol: "1000mg", pkg: "tablet-110", min_price: 290, max_price: 390, ev: "ev_vitaminc_001" },
  { id: "p_015", brand_id: "br_012", name: "California Gold Nutrition Gold C 1000mg", category_slug: "vitamin-c", sub_category: "usp-grade", igd: "igd_001", vol: "1000mg", pkg: "capsule-60", min_price: 220, max_price: 320, ev: "ev_vitaminc_001" },
  { id: "p_016", brand_id: "br_013", name: "Demosana Vitamin C Effervescent", category_slug: "vitamin-c", sub_category: "effervescent", igd: "igd_001", vol: "1000mg", pkg: "tablet-20", min_price: 115, max_price: 150, ev: "ev_vitaminc_001" },

  // --- Category 2: Omega-3 & Fish Oil ---
  { id: "p_003", brand_id: "br_004", name: "Mega We Care Fish Oil 1000 mg", category_slug: "omega-3-fish-oil", sub_category: "brain-heart", igd: "igd_002", vol: "1000mg", pkg: "softgel-100", min_price: 450, max_price: 590, ev: "ev_fishoil_001" },
  { id: "p_017", brand_id: "br_001", name: "Blackmores Fish Oil 1000 mg Odourless", category_slug: "omega-3-fish-oil", sub_category: "odourless-brain", igd: "igd_002", vol: "1000mg", pkg: "softgel-200", min_price: 790, max_price: 1050, ev: "ev_fishoil_001" },
  { id: "p_018", brand_id: "br_003", name: "NOW Foods Omega-3 1000 mg", category_slug: "omega-3-fish-oil", sub_category: "molecular-distilled", igd: "igd_002", vol: "1000mg", pkg: "softgel-200", min_price: 650, max_price: 890, ev: "ev_fishoil_001" },
  { id: "p_019", brand_id: "br_002", name: "Vistra Salmon Fish Oil 1000 mg", category_slug: "omega-3-fish-oil", sub_category: "salmon-omega", igd: "igd_002", vol: "1000mg", pkg: "softgel-100", min_price: 350, max_price: 480, ev: "ev_fishoil_001" },
  { id: "p_020", brand_id: "br_005", name: "Swisse Ultiboost Odourless Wild Fish Oil", category_slug: "omega-3-fish-oil", sub_category: "wild-ocean", igd: "igd_002", vol: "1000mg", pkg: "softgel-400", min_price: 1190, max_price: 1490, ev: "ev_fishoil_001" },
  { id: "p_021", brand_id: "br_010", name: "Kirkland Signature Fish Oil 1000 mg", category_slug: "omega-3-fish-oil", sub_category: "concentrated-value", igd: "igd_002", vol: "1000mg", pkg: "softgel-400", min_price: 950, max_price: 1250, ev: "ev_fishoil_001" },
  { id: "p_022", brand_id: "br_014", name: "Nordic Naturals Ultimate Omega", category_slug: "omega-3-fish-oil", sub_category: "triglyceride-premium", igd: "igd_002", vol: "1280mg", pkg: "softgel-120", min_price: 1890, max_price: 2350, ev: "ev_fishoil_001" },
  { id: "p_023", brand_id: "br_015", name: "Carlson Labs The Very Finest Fish Oil", category_slug: "omega-3-fish-oil", sub_category: "norwegian-deepsea", igd: "igd_002", vol: "1600mg", pkg: "softgel-120", min_price: 1450, max_price: 1850, ev: "ev_fishoil_001" },
  { id: "p_024", brand_id: "br_008", name: "DHC DHA 60 Days", category_slug: "omega-3-fish-oil", sub_category: "dha-memory", igd: "igd_002", vol: "510mg", pkg: "softgel-240", min_price: 490, max_price: 650, ev: "ev_fishoil_001" },
  { id: "p_025", brand_id: "br_016", name: "GNC Triple Strength Fish Oil", category_slug: "omega-3-fish-oil", sub_category: "high-epa-cardio", igd: "igd_002", vol: "1407mg", pkg: "softgel-120", min_price: 1690, max_price: 2100, ev: "ev_fishoil_001" },

  // --- Category 3: Magnesium ---
  { id: "p_004", brand_id: "br_003", name: "NOW Foods Magnesium Glycinate 200 mg", category_slug: "magnesium", sub_category: "sleep-relaxation", igd: "igd_003", vol: "200mg", pkg: "tablet-180", min_price: 750, max_price: 990, ev: "ev_magnesium_001" },
  { id: "p_026", brand_id: "br_000", name: "Magnesium Oxide 400 mg (General)", category_slug: "magnesium", sub_category: "basic-oxide", igd: "igd_003", vol: "400mg", pkg: "tablet-100", min_price: 190, max_price: 280, ev: "ev_magnesium_001" },
  { id: "p_027", brand_id: "br_001", name: "Blackmores Magnesium Muscle Relax", category_slug: "magnesium", sub_category: "muscle-cramps", igd: "igd_003", vol: "300mg", pkg: "tablet-60", min_price: 490, max_price: 680, ev: "ev_magnesium_001" },
  { id: "p_028", brand_id: "br_002", name: "Vistra Magnesium Complex Plus B1 B6 B12", category_slug: "magnesium", sub_category: "nerve-stress", igd: "igd_003", vol: "200mg", pkg: "capsule-30", min_price: 210, max_price: 320, ev: "ev_magnesium_001" },
  { id: "p_029", brand_id: "br_017", name: "Doctor's Best High Absorption Magnesium", category_slug: "magnesium", sub_category: "traacs-chelated", igd: "igd_003", vol: "200mg", pkg: "tablet-240", min_price: 890, max_price: 1190, ev: "ev_magnesium_001" },
  { id: "p_030", brand_id: "br_018", name: "KAL Magnesium Glycinate 350 mg", category_slug: "magnesium", sub_category: "gentle-bisglycinate", igd: "igd_003", vol: "350mg", pkg: "tablet-160", min_price: 820, max_price: 1050, ev: "ev_magnesium_001" },
  { id: "p_031", brand_id: "br_019", name: "Life Extension Magnesium Caps 500 mg", category_slug: "magnesium", sub_category: "triple-magnesium", igd: "igd_003", vol: "500mg", pkg: "capsule-100", min_price: 490, max_price: 680, ev: "ev_magnesium_001" },
  { id: "p_032", brand_id: "br_020", name: "Nature's Bounty Magnesium 500 mg", category_slug: "magnesium", sub_category: "bone-muscle", igd: "igd_003", vol: "500mg", pkg: "tablet-100", min_price: 380, max_price: 520, ev: "ev_magnesium_001" },
  { id: "p_033", brand_id: "br_005", name: "Swisse Ultiboost Magnesium", category_slug: "magnesium", sub_category: "energy-cramps", igd: "igd_003", vol: "200mg", pkg: "tablet-120", min_price: 690, max_price: 890, ev: "ev_magnesium_001" },
  { id: "p_034", brand_id: "br_011", name: "21st Century Magnesium 250 mg", category_slug: "magnesium", sub_category: "budget-muscle", igd: "igd_003", vol: "250mg", pkg: "tablet-110", min_price: 240, max_price: 340, ev: "ev_magnesium_001" },

  // --- Category 4: Astaxanthin & Collagen ---
  { id: "p_035", brand_id: "br_000", name: "Astaxanthin 12 mg Softgels", category_slug: "astaxanthin-collagen", sub_category: "high-antioxidant", igd: "igd_009", vol: "12mg", pkg: "softgel-60", min_price: 850, max_price: 1150, ev: "ev_astax_001" },
  { id: "p_036", brand_id: "br_002", name: "Vistra Astaxanthin 6 mg AstaReal", category_slug: "astaxanthin-collagen", sub_category: "astareal-skin", igd: "igd_009", vol: "6mg", pkg: "softgel-30", min_price: 490, max_price: 680, ev: "ev_astax_001" },
  { id: "p_037", brand_id: "br_004", name: "Mega We Care Astax 4 mg", category_slug: "astaxanthin-collagen", sub_category: "natural-red-algae", igd: "igd_009", vol: "4mg", pkg: "softgel-30", min_price: 390, max_price: 520, ev: "ev_astax_001" },
  { id: "p_038", brand_id: "br_003", name: "NOW Foods Astaxanthin 4 mg", category_slug: "astaxanthin-collagen", sub_category: "zanthin-bioactive", igd: "igd_009", vol: "4mg", pkg: "softgel-60", min_price: 680, max_price: 890, ev: "ev_astax_001" },
  { id: "p_039", brand_id: "br_012", name: "California Gold Nutrition Astaxanthin 12mg", category_slug: "astaxanthin-collagen", sub_category: "astapure-algae", igd: "igd_009", vol: "12mg", pkg: "softgel-120", min_price: 990, max_price: 1350, ev: "ev_astax_001" },
  { id: "p_040", brand_id: "br_008", name: "DHC Astaxanthin 30 Days", category_slug: "astaxanthin-collagen", sub_category: "japanese-aging-care", igd: "igd_009", vol: "9mg", pkg: "softgel-30", min_price: 420, max_price: 580, ev: "ev_astax_001" },
  { id: "p_041", brand_id: "br_021", name: "Meiji Amino Collagen Powder", category_slug: "astaxanthin-collagen", sub_category: "fish-peptide-powder", igd: "igd_010", vol: "5000mg", pkg: "powder-200g", min_price: 890, max_price: 1190, ev: "ev_astax_001" },
  { id: "p_042", brand_id: "br_022", name: "Neocell Super Collagen + Vitamin C", category_slug: "astaxanthin-collagen", sub_category: "type1-type3-skin", igd: "igd_010", vol: "6000mg", pkg: "tablet-250", min_price: 950, max_price: 1290, ev: "ev_astax_001" },
  { id: "p_043", brand_id: "br_023", name: "Amado Colligi Collagen Tripeptide", category_slug: "astaxanthin-collagen", sub_category: "tripeptide-skin-joint", igd: "igd_010", vol: "5000mg", pkg: "can-110g", min_price: 490, max_price: 690, ev: "ev_astax_001" },
  { id: "p_044", brand_id: "br_024", name: "Bomi Collagen Dipeptide 100,000mg", category_slug: "astaxanthin-collagen", sub_category: "dipeptide-fast-absorb", igd: "igd_010", vol: "3000mg", pkg: "sachet-14", min_price: 390, max_price: 550, ev: "ev_astax_001" },

  // --- Category 5: CoQ10 & Multivitamins ---
  { id: "p_045", brand_id: "br_020", name: "Nature's Bounty Co Q-10 100 mg", category_slug: "coq10-multivitamins", sub_category: "cellular-heart-energy", igd: "igd_004", vol: "100mg", pkg: "softgel-60", min_price: 690, max_price: 890, ev: "ev_coq10_001" },
  { id: "p_046", brand_id: "br_000", name: "CoQ10 30 mg Softgels (General)", category_slug: "coq10-multivitamins", sub_category: "basic-coq10", igd: "igd_004", vol: "30mg", pkg: "softgel-30", min_price: 250, max_price: 350, ev: "ev_coq10_001" },
  { id: "p_005", brand_id: "br_005", name: "Swisse Ultiboost Multivitamin", category_slug: "coq10-multivitamins", sub_category: "active-multivitamin", igd: "igd_004", vol: "50mg", pkg: "tablet-60", min_price: 890, max_price: 1190, ev: "ev_coq10_001" },
  { id: "p_047", brand_id: "br_001", name: "Blackmores CoQ10 150 mg", category_slug: "coq10-multivitamins", sub_category: "vascular-heart-care", igd: "igd_004", vol: "150mg", pkg: "capsule-30", min_price: 790, max_price: 990, ev: "ev_coq10_001" },
  { id: "p_048", brand_id: "br_002", name: "Vistra Coenzyme Q10 30 mg", category_slug: "coq10-multivitamins", sub_category: "daily-heart-vitality", igd: "igd_004", vol: "30mg", pkg: "capsule-45", min_price: 330, max_price: 450, ev: "ev_coq10_001" },
  { id: "p_049", brand_id: "br_004", name: "Mega We Care Maxcover CoQ10 30 mg", category_slug: "coq10-multivitamins", sub_category: "ubiquinone-energy", igd: "igd_004", vol: "30mg", pkg: "softgel-30", min_price: 310, max_price: 420, ev: "ev_coq10_001" },
  { id: "p_050", brand_id: "br_017", name: "Doctor's Best High Absorption CoQ10", category_slug: "coq10-multivitamins", sub_category: "bioperine-enhanced", igd: "igd_004", vol: "100mg", pkg: "softgel-120", min_price: 950, max_price: 1290, ev: "ev_coq10_001" },
  { id: "p_051", brand_id: "br_010", name: "Kirkland Signature CoQ10 300 mg", category_slug: "coq10-multivitamins", sub_category: "statin-user-support", igd: "igd_004", vol: "300mg", pkg: "softgel-100", min_price: 1150, max_price: 1490, ev: "ev_coq10_001" },
  { id: "p_052", brand_id: "br_008", name: "DHC Coenzyme Q10 Direct 30 Days", category_slug: "coq10-multivitamins", sub_category: "vitality-capsules", igd: "igd_004", vol: "90mg", pkg: "capsule-60", min_price: 380, max_price: 520, ev: "ev_coq10_001" },
  { id: "p_053", brand_id: "br_025", name: "Centrum Multivitamin Adults A-Z", category_slug: "coq10-multivitamins", sub_category: "complete-micronutrients", igd: "igd_004", vol: "40mg", pkg: "tablet-100", min_price: 590, max_price: 790, ev: "ev_coq10_001" },

  // --- Category 6: Joint Protection & Cartilage ---
  { id: "p_006", brand_id: "br_006", name: "Move Free Ultra Triple Action UC-II", category_slug: "joint-protection", sub_category: "active-joint-mobility", igd: "igd_006", vol: "40mg", pkg: "tablet-75", min_price: 990, max_price: 1290, ev: "ev_uc2_001" },
  { id: "p_054", brand_id: "br_001", name: "Blackmores Joint Plus Collagen UC-II", category_slug: "joint-protection", sub_category: "cartilage-bone-d3", igd: "igd_006", vol: "40mg", pkg: "tablet-30", min_price: 890, max_price: 1150, ev: "ev_uc2_001" },
  { id: "p_055", brand_id: "br_003", name: "NOW Foods UC-II Joint Health 40 mg", category_slug: "joint-protection", sub_category: "standardized-chicken-cartilage", igd: "igd_006", vol: "40mg", pkg: "capsule-60", min_price: 850, max_price: 1100, ev: "ev_uc2_001" },
  { id: "p_056", brand_id: "br_002", name: "Vistra Calplex Calcium 600 mg Plus D3 K2", category_slug: "joint-protection", sub_category: "calcium-d3-k2", igd: "igd_006", vol: "600mg", pkg: "tablet-90", min_price: 320, max_price: 450, ev: "ev_uc2_001" },
  { id: "p_057", brand_id: "br_004", name: "Mega We Care Jointsical Glucosamine Complex", category_slug: "joint-protection", sub_category: "glucosamine-chondroitin", igd: "igd_011", vol: "1500mg", pkg: "sachet-30", min_price: 650, max_price: 890, ev: "ev_uc2_001" },
  { id: "p_058", brand_id: "br_017", name: "Doctor's Best Glucosamine Chondroitin MSM", category_slug: "joint-protection", sub_category: "optimsm-joint-matrix", igd: "igd_011", vol: "1500mg", pkg: "capsule-240", min_price: 1250, max_price: 1650, ev: "ev_uc2_001" },
  { id: "p_059", brand_id: "br_001", name: "Blackmores Glucosamine 1500 mg", category_slug: "joint-protection", sub_category: "single-daily-dose", igd: "igd_011", vol: "1500mg", pkg: "tablet-180", min_price: 1090, max_price: 1450, ev: "ev_uc2_001" },
  { id: "p_060", brand_id: "br_026", name: "InterCare Joint Care UC-II Plus Turmeric", category_slug: "joint-protection", sub_category: "uc2-turmeric-antiinflammatory", igd: "igd_006", vol: "40mg", pkg: "capsule-30", min_price: 590, max_price: 790, ev: "ev_uc2_001" },
  { id: "p_061", brand_id: "br_019", name: "Life Extension NT2 Collagen UC-II", category_slug: "joint-protection", sub_category: "undenaured-type2", igd: "igd_006", vol: "40mg", pkg: "capsule-60", min_price: 990, max_price: 1290, ev: "ev_uc2_001" },
  { id: "p_062", brand_id: "br_005", name: "Swisse Ultiboost Joint Repair Glucosamine", category_slug: "joint-protection", sub_category: "glucosamine-msm-relief", igd: "igd_011", vol: "1500mg", pkg: "tablet-90", min_price: 890, max_price: 1190, ev: "ev_uc2_001" },

  // --- Category 7: Energy & Metabolism / Fat Burn ---
  { id: "p_007", brand_id: "br_002", name: "Vistra L-Carnitine 500 mg Plus 3L", category_slug: "energy-metabolism", sub_category: "fat-burn-cardio", igd: "igd_007", vol: "500mg", pkg: "tablet-30", min_price: 290, max_price: 420, ev: "ev_lcarnitine_001" },
  { id: "p_063", brand_id: "br_027", name: "Yanhee Ultimate L-Carnitine", category_slug: "energy-metabolism", sub_category: "medical-grade-burn", igd: "igd_007", vol: "500mg", pkg: "capsule-30", min_price: 390, max_price: 550, ev: "ev_lcarnitine_001" },
  { id: "p_064", brand_id: "br_004", name: "Mega We Care Hi-GREEN EGCG Concentrated", category_slug: "energy-metabolism", sub_category: "green-tea-egcg-burn", igd: "igd_012", vol: "375mg", pkg: "capsule-30", min_price: 320, max_price: 450, ev: "ev_lcarnitine_001" },
  { id: "p_065", brand_id: "br_003", name: "NOW Foods L-Carnitine 1000 mg Carnipure®", category_slug: "energy-metabolism", sub_category: "carnipure-pure-tartrate", igd: "igd_007", vol: "1000mg", pkg: "tablet-100", min_price: 890, max_price: 1190, ev: "ev_lcarnitine_001" },
  { id: "p_066", brand_id: "br_026", name: "InterCare L-Carnitine 500+ Arginine", category_slug: "energy-metabolism", sub_category: "lcarnitine-arginine", igd: "igd_007", vol: "500mg", pkg: "capsule-30", min_price: 350, max_price: 480, ev: "ev_lcarnitine_001" },
  { id: "p_067", brand_id: "br_028", name: "Nutrex Research Liquid L-Carnitine 3000", category_slug: "energy-metabolism", sub_category: "fast-liquid-shot", igd: "igd_007", vol: "3000mg", pkg: "liquid-473ml", min_price: 990, max_price: 1290, ev: "ev_lcarnitine_001" },
  { id: "p_068", brand_id: "br_008", name: "DHC L-Carnitine 300 mg 30 Days", category_slug: "energy-metabolism", sub_category: "japanese-weight-care", igd: "igd_007", vol: "300mg", pkg: "tablet-150", min_price: 450, max_price: 620, ev: "ev_lcarnitine_001" },
  { id: "p_069", brand_id: "br_029", name: "Watsons L-Carnitine 500 mg", category_slug: "energy-metabolism", sub_category: "daily-fitness-burn", igd: "igd_007", vol: "500mg", pkg: "capsule-30", min_price: 250, max_price: 350, ev: "ev_lcarnitine_001" },
  { id: "p_070", brand_id: "br_020", name: "Nature's Bounty Green Tea Extract 315 mg", category_slug: "energy-metabolism", sub_category: "standardized-egcg", igd: "igd_012", vol: "315mg", pkg: "capsule-100", min_price: 490, max_price: 680, ev: "ev_lcarnitine_001" },
  { id: "p_071", brand_id: "br_030", name: "Gold Nutrition L-Carnitine 3000 Liquid", category_slug: "energy-metabolism", sub_category: "preworkout-ampoule", igd: "igd_007", vol: "3000mg", pkg: "ampoule-20", min_price: 1150, max_price: 1490, ev: "ev_lcarnitine_001" },

  // --- Category 8: Recovery & Hydration ---
  { id: "p_008", brand_id: "br_007", name: "SaltStick Electrolyte Fastchews", category_slug: "recovery-hydration", sub_category: "cramp-prevention", igd: "igd_008", vol: "100mg", pkg: "chewable-60", min_price: 550, max_price: 750, ev: "ev_electrolytes_001" },
  { id: "p_072", brand_id: "br_031", name: "Pocari Sweat Ion Supply Powder Drink", category_slug: "recovery-hydration", sub_category: "balanced-ion-powder", igd: "igd_008", vol: "13g", pkg: "sachet-5", min_price: 110, max_price: 150, ev: "ev_electrolytes_001" },
  { id: "p_073", brand_id: "br_032", name: "Active Peak Energy Gel + Electrolytes", category_slug: "recovery-hydration", sub_category: "gel-bcaa-1400mg", igd: "igd_008", vol: "40g", pkg: "sachet-1", min_price: 65, max_price: 85, ev: "ev_electrolytes_001" },
  { id: "p_074", brand_id: "br_033", name: "Dever Energy Gel & Electrolyte Drink", category_slug: "recovery-hydration", sub_category: "cardio-marathon-fuel", igd: "igd_008", vol: "40ml", pkg: "sachet-1", min_price: 45, max_price: 60, ev: "ev_electrolytes_001" },
  { id: "p_075", brand_id: "br_034", name: "AMMO Natural Energy Gel", category_slug: "recovery-hydration", sub_category: "natural-fruit-fuel", igd: "igd_008", vol: "45g", pkg: "sachet-1", min_price: 75, max_price: 95, ev: "ev_electrolytes_001" },
  { id: "p_076", brand_id: "br_035", name: "Royal-D Energy Gel & Electrolyte Beverage", category_slug: "recovery-hydration", sub_category: "osmolality-hydrator", igd: "igd_008", vol: "25g", pkg: "sachet-10", min_price: 85, max_price: 120, ev: "ev_electrolytes_001" },
  { id: "p_077", brand_id: "br_036", name: "GU Energy Gel + Amino Acids Tri-Berry", category_slug: "recovery-hydration", sub_category: "triberry-endurance", igd: "igd_008", vol: "32g", pkg: "sachet-1", min_price: 85, max_price: 110, ev: "ev_electrolytes_001" },
  { id: "p_078", brand_id: "br_004", name: "Ultrapro Whey Protein Isolate Mega We Care", category_slug: "recovery-hydration", sub_category: "muscle-recovery-whey", igd: "igd_008", vol: "25g-protein", pkg: "can-750g", min_price: 1290, max_price: 1690, ev: "ev_electrolytes_001" },
  { id: "p_079", brand_id: "br_037", name: "Plantae Complete Plant Protein", category_slug: "recovery-hydration", sub_category: "5-plant-vegan-protein", igd: "igd_008", vol: "30g-protein", pkg: "can-800g", min_price: 1490, max_price: 1890, ev: "ev_electrolytes_001" },
  { id: "p_080", brand_id: "br_003", name: "NOW Foods Magnesium Citrate 200 mg", category_slug: "recovery-hydration", sub_category: "postworkout-cramp-relief", igd: "igd_003", vol: "200mg", pkg: "tablet-100", min_price: 490, max_price: 680, ev: "ev_magnesium_001" }
];

// Helper to generate full Thai safety profile per product
function generateSafetyProfile(p: typeof raw80Products[0]) {
  return {
    warnings: [
      `ควรรับประทาน ${p.name} ตามขนาดที่แนะนำบนฉลาก`,
      "เด็ก สตรีมีครรภ์ และผู้มีโรคประจำตัวร้ายแรงควรปรึกษาแพทย์ก่อนทาน"
    ],
    contraindications: [
      "ผู้ที่มีประวัติแพ้ส่วนผสมในผลิตภัณฑ์นี้ควรหลีกเลี่ยง",
      "ห้ามใช้ทดแทนการรักษาโรคหรือการรับประทานอาหารหลักให้ครบ 5 หมู่"
    ],
    optimal_intake: "รับประทานพร้อมหรือหลังอาหาร เพื่อการดูดซึมที่ดีที่สุด",
    pros: [
      `สูตรเฉพาะบำรุง ${p.sub_category} อย่างมีประสิทธิภาพ`,
      "ส่วนประกอบผ่านการทดสอบมาตรฐานความปลอดภัยระดับสากล"
    ],
    considerations: [
      "ควรเก็บในที่แห้ง พ้นจากแสงแดดและความร้อน"
    ]
  };
}

// Map 80 Products into full schema format
const productsMockupData = raw80Products.map((p) => ({
  id: p.id,
  brand_id: p.brand_id,
  name: p.name,
  category_slug: p.category_slug,
  sub_category: p.sub_category,
  ingredient_list: [
    {
      igd_id: p.igd,
      volume: p.vol
    }
  ],
  serving_package: p.pkg,
  min_price: p.min_price,
  max_price: p.max_price,
  safety_profile: generateSafetyProfile(p),
  evidence_ids: [p.ev]
}));

// Map 80 Products Analytics matching IProductAnalytics schema
const analyticsMockupData = raw80Products.map((p, idx) => ({
  product_id: p.id,
  merchant_score: Number((4.5 + (idx % 5) * 0.1).toFixed(1)),
  ratings_breakdown: {
    rating_score: Number((4.6 + (idx % 4) * 0.1).toFixed(1)),
    total_reviews: 250 + (idx * 15),
    satisfaction_rate: 96 + (idx % 4)
  },
  merchant_chart_metrics: {
    authenticity: Number((95 + (idx % 5)).toFixed(1)),
    delivery_speed: Number((92 + (idx % 6)).toFixed(1)),
    packaging_quality: Number((94 + (idx % 4)).toFixed(1)),
    customer_service: Number((93 + (idx % 5)).toFixed(1)),
    repurchase_rate: Number((78 + (idx % 15)).toFixed(1))
  },
  platform_breakdown: {
    shopee: {
      rating: 4.8,
      review_count: 120 + idx * 5,
      sold_count: `${1 + (idx % 10)}k+`,
      store_type: "Official Store",
      url: "https://shopee.co.th"
    },
    lazada: {
      rating: 4.7,
      review_count: 85 + idx * 3,
      sold_count: `${500 + idx * 20}`,
      store_type: "LazMall",
      url: "https://lazada.co.th"
    }
  },
  reference_sources: ["Shopee Official", "LazMall", "TikTok Shop"]
}));

// Write back to mockup JSON files
fs.writeFileSync(path.join(mockupDir, 'brands_mockup.json'), JSON.stringify(expandedBrands, null, 2), 'utf-8');
fs.writeFileSync(path.join(mockupDir, 'ingredients_mockup.json'), JSON.stringify(expandedIngredients, null, 2), 'utf-8');
fs.writeFileSync(path.join(mockupDir, 'products_mockup.json'), JSON.stringify(productsMockupData, null, 2), 'utf-8');
fs.writeFileSync(path.join(mockupDir, 'products_analytics_mockup.json'), JSON.stringify(analyticsMockupData, null, 2), 'utf-8');

console.log('✨ [generate80Products] Generated all 80 products, 37 brands, 12 ingredients, and analytics successfully!');
