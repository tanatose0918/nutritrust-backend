"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
const Brand_1 = require("../models/Brand");
const Ingredient_1 = require("../models/Ingredient");
const Provider_1 = require("../models/Provider");
const Product_1 = require("../models/Product");
const Evidence_1 = require("../models/Evidence");
const ProductAnalytics_1 = require("../models/ProductAnalytics");
// Fix Windows DNS SRV query issue
try {
    node_dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
    node_dns_1.default.setDefaultResultOrder('ipv4first');
}
catch (e) {
    // Ignore DNS set errors
}
dotenv_1.default.config();
const bufferDir = node_path_1.default.resolve(__dirname, '../../buffer');
if (!node_fs_1.default.existsSync(bufferDir)) {
    node_fs_1.default.mkdirSync(bufferDir, { recursive: true });
}
// 1. Providers Buffer (7 Upstream Raw Material Suppliers)
const providersBuffer = [
    {
        id: "prv_001",
        name: "DSM Nutritional Products",
        provide_at: "Switzerland / Netherlands",
        traceability_process: "ISO 9001/FSSC 22000 certified high-purity USP grade vitamin & CoQ10 synthesis with 100% batch traceability."
    },
    {
        id: "prv_002",
        name: "Aker BioMarine & VivoMega",
        provide_at: "Norway",
        traceability_process: "MSC-certified sustainable deep-sea cold-water fish oil extraction using eco-harvesting and molecular distillation."
    },
    {
        id: "prv_003",
        name: "Fuji Chemical & AstaReal",
        provide_at: "Japan",
        traceability_process: "Closed-photobioreactor cultivation of Haematococcus pluvialis microalgae for 100% pure natural Astaxanthin & low-molecular fish collagen tripeptide."
    },
    {
        id: "prv_004",
        name: "BASF & Beneo Human Nutrition",
        provide_at: "Germany",
        traceability_process: "High-solubility pharmaceutical grade Acerola fruit extraction and precision electrolyte mineral chelation."
    },
    {
        id: "prv_005",
        name: "Lonza Group (Carnipure®) & Albion",
        provide_at: "Switzerland / USA",
        traceability_process: "Patented L-Carnitine L-Tartrate (Carnipure®) crystallization and TRAACS® chelated Magnesium bisglycinate synthesis."
    },
    {
        id: "prv_006",
        name: "Lonza Consumer Health (InterHealth)",
        provide_at: "USA",
        traceability_process: "Patented low-temperature non-enzymatic extraction preserving native 3D triple-helix structure of Undenatured Type II Collagen (UC-II®)."
    },
    {
        id: "prv_007",
        name: "Kemin Human Nutrition",
        provide_at: "USA",
        traceability_process: "FloraGLO® Lutein extraction and microbial fermentation Hyaluronic Acid joint lubrication matrix."
    }
];
// 2. Science Summaries / Evidences Buffer (16 Research Studies)
const evidencesBuffer = [
    // Category 1: Vitamin C
    {
        evidence_id: "ev_vitaminc_001",
        id: "ev_vitaminc_001",
        benefit_title: "Vitamin C ในการเสริมสร้างภูมิคุ้มกันและลดความรุนแรงของไข้หวัด",
        evidence_level: "High Level A (Meta-Analysis)",
        pubmed_id: "29099763",
        summary: "การรับประทาน Vitamin C ปริมาณ 1,000 mg/วัน ช่วยกระตุ้นการทำงานของ White Blood Cells (Phagocytes และ T-Cells) และช่วยลดระยะเวลาการเป็นไข้หวัดลง 8-14%"
    },
    {
        evidence_id: "ev_vitaminc_002",
        id: "ev_vitaminc_002",
        benefit_title: "บทบาทของ Vitamin C ต่อการสังเคราะห์คอลลาเจนในชั้นผิว",
        evidence_level: "High Level A (Clinical Trial)",
        pubmed_id: "30101672",
        summary: "Vitamin C ทำหน้าที่เป็น Co-factor สำคัญสำหรับเอนไซม์ Prolyl Hydroxylase ช่วยเพิ่มความแข็งแรงของเส้นใยคอลลาเจนในชั้นผิวหนังและต่อต้านอนุมูลอิสระจากแสง UV"
    },
    // Category 2: Fish Oil
    {
        evidence_id: "ev_fishoil_001",
        id: "ev_fishoil_001",
        benefit_title: "Omega-3 (EPA/DHA) ในการลดระดับไตรกลีเซอไรด์และดูแลหลอดเลือดหัวใจ",
        evidence_level: "High Level A (Randomized Controlled Trial)",
        pubmed_id: "31563508",
        summary: "กรดไขมัน EPA และ DHA เข้มข้น ช่วยลดระดับ Triglycerides ในเลือดได้ 20-30% พร้อมทั้งลดการอักเสบของหลอดเลือดหัวใจและยับยั้งการเกาะตัวของเกล็ดเลือด"
    },
    {
        evidence_id: "ev_fishoil_002",
        id: "ev_fishoil_002",
        benefit_title: "DHA ต่อการบำรุงเซลล์สมอง ชะลอความเสื่อมของระบบประสาทและความจำ",
        evidence_level: "Moderate Level B (Clinical Study)",
        pubmed_id: "28466549",
        summary: "DHA เป็นกรดไขมันโครงสร้างหลักในเยื่อหุ้มเซลล์สมอง การได้รับ DHA วันละ 500-1,000 mg ช่วยเพิ่มความคล่องตัวของการส่งสัญญาณประสาทและการจำจดข้อมูล"
    },
    // Category 3: Magnesium
    {
        evidence_id: "ev_magnesium_001",
        id: "ev_magnesium_001",
        benefit_title: "Magnesium Glycinate ในการปรับสมดุลระบบประสาทและคุณภาพการนอนหลับ",
        evidence_level: "High Level A (Clinical Trial)",
        pubmed_id: "28445426",
        summary: "Magnesium Glycinate จับกับตัวรับ GABA ในสมอง ช่วยลดฮอร์โมนความเครียด Cortisol และช่วยให้ร่างกายเข้าสู่ภาวะ Deep Sleep ได้รวดเร็วขึ้น 27%"
    },
    {
        evidence_id: "ev_magnesium_002",
        id: "ev_magnesium_002",
        benefit_title: "ผลของ Magnesium ต่อการผ่อนคลายกล้ามเนื้อและลดการเกิดตะคริว",
        evidence_level: "Moderate Level B (Double-Blind Study)",
        pubmed_id: "29849470",
        summary: "Magnesium ควบคุมการเข้าออกของ Calcium Ion ในเซลล์กล้ามเนื้อ ป้องกันภาวะกล้ามเนื้อหดเกร็งค้าง และลดความถี่ของการเกิดตะคริวขณะนอนหรือออกกำลังกาย"
    },
    // Category 4: Astaxanthin & Collagen
    {
        evidence_id: "ev_astax_001",
        id: "ev_astax_001",
        benefit_title: "Astaxanthin สารต้านอนุมูลอิสระประสิทธิภาพสูงต่อการชะลอวัยและริ้วรอย",
        evidence_level: "High Level A (Human Trial)",
        pubmed_id: "32470701",
        summary: "Astaxanthin มีฤทธิ์ต้านอนุมูลอิสระแรงกว่า Vitamin C 6,000 เท่า ช่วยปกป้องคอลลาเจนในชั้นผิวจากการทำลายของรังสี UVA และเพิ่มความยืดหยุ่นของผิวอย่างมีนัยสำคัญ"
    },
    {
        evidence_id: "ev_astax_002",
        id: "ev_astax_002",
        benefit_title: "Hydrolyzed Collagen Tripeptide ต่อการฟื้นฟูผิวและข้อต่อ",
        evidence_level: "High Level A (Clinical Trial)",
        pubmed_id: "31627309",
        summary: "คอลลาเจนไดเปปไทด์/ไตรเปปไทด์ โมเลกุลเล็ก ดูดซึมเข้าสู่กระแสเลือดได้เร็ว กระตุ้น Chondrocytes ในกระดูกอ่อน และช่วยเพิ่มความชุ่มชื้นของผิวหนัง"
    },
    // Category 5: CoQ10 & Multivitamins
    {
        evidence_id: "ev_coq10_001",
        id: "ev_coq10_001",
        benefit_title: "Coenzyme Q10 ในการสร้างพลังงาน ATP ระดับไมโตคอนเดรียและกล้ามเนื้อหัวใจ",
        evidence_level: "High Level A (Meta-Analysis)",
        pubmed_id: "26512574",
        summary: "CoQ10 เป็นส่วนประกอบสำคัญใน Electron Transport Chain ของ Mitochondria ช่วยเพิ่มการสร้าง ATP ในกล้ามเนื้อหัวใจและลดอาการเหนื่อยล้าในผู้สูงอายุ"
    },
    {
        evidence_id: "ev_coq10_002",
        id: "ev_coq10_002",
        benefit_title: "การเสริม CoQ10 เพื่อชดเชยภาวะสูญเสียจากยาลดไขมันกลุ่ม Statin",
        evidence_level: "Moderate Level B (Clinical Trial)",
        pubmed_id: "30255868",
        summary: "ยาลดไขมัน Statin ยับยั้งการสร้าง CoQ10 ในร่างกาย การเสริม CoQ10 100-200 mg/วัน ช่วยลดอาการปวดเมื่อยกล้ามเนื้อ (Statin-induced myopathy) ได้ถึง 40%"
    },
    // Category 6: Joint Protection
    {
        evidence_id: "ev_uc2_001",
        id: "ev_uc2_001",
        benefit_title: "Undenatured Type II Collagen (UC-II) ในการฟื้นฟูข้อต่อและเพิ่มความยืดหยุ่น",
        evidence_level: "High Level A (Randomized Controlled Trial)",
        pubmed_id: "24153020",
        summary: "UC-II เพียง 40 mg/วัน ออกฤทธิ์ผ่านกลไก Oral Tolerance ชะลอการทำลายกระดูกอ่อนข้อเข่า เพิ่มระยะเวลาการเหยียดข้อเข่าได้ดีกว่า Glucosamine ถึง 2 เท่า"
    },
    {
        evidence_id: "ev_uc2_002",
        id: "ev_uc2_002",
        benefit_title: "Glucosamine & Chondroitin ในการลดการสึกหรอของกระดูกอ่อนข้อต่อ",
        evidence_level: "High Level A (Clinical Trial)",
        pubmed_id: "26818908",
        summary: "Glucosamine Sulfate 1,500 mg ช่วยเสริมสร้างการสังเคราะห์ Glycosaminoglycans เพิ่มน้ำเลี้ยงข้อต่อ และลดความเจ็บปวดขณะเดินหรือลงน้ำหนัก"
    },
    // Category 7: Energy & Metabolism
    {
        evidence_id: "ev_lcarnitine_001",
        id: "ev_lcarnitine_001",
        benefit_title: "L-Carnitine L-Tartrate (Carnipure®) ในการเร่งการเผาผลาญไขมันและเพิ่มความอึด",
        evidence_level: "High Level A (Clinical Study)",
        pubmed_id: "32354158",
        summary: "L-Carnitine ทำหน้าที่ขนส่ง Long-chain Fatty Acids เข้าสู่ไมโตคอนเดรียเพื่อเบิร์นเป็นพลังงาน ช่วยเร่งการเผาผลาญไขมันขณะออกกำลังกายแบบ Cardio"
    },
    {
        evidence_id: "ev_lcarnitine_002",
        id: "ev_lcarnitine_002",
        benefit_title: "สารสกัดชาเขียว (EGCG) ต่อการเพิ่มอัตราการเผาผลาญพลังงาน (Thermogenesis)",
        evidence_level: "Moderate Level B (Clinical Trial)",
        pubmed_id: "31926645",
        summary: "EGCG ยับยั้งเอนไซม์ COMT ช่วยยืดอายุการทำงานของ Norepinephrine ส่งผลให้อัตราการเผาผลาญแคลอรีขณะพักและขณะออกกำลังกายเพิ่มขึ้น 4-5%"
    },
    // Category 8: Recovery & Hydration
    {
        evidence_id: "ev_electrolytes_001",
        id: "ev_electrolytes_001",
        benefit_title: "Electrolytes (Na/K/Mg) ในการรักษาสมดุลน้ำและป้องกันการเกิดตะคริว",
        evidence_level: "High Level A (Sports Medicine Study)",
        pubmed_id: "31448317",
        summary: "เกลือแร่อิออนสมดุลช่วยทดแทนการเสียเหงื่อขณะเต้นแอโรบิกหรือคาร์ดิโอ ชะลอภาวะ Dehydration และป้องกันภาวะกล้ามเนื้อหดเกร็งค้างอย่างได้ผล"
    },
    {
        evidence_id: "ev_electrolytes_002",
        id: "ev_electrolytes_002",
        benefit_title: "Protein Isolate ในการฟื้นฟูและซ่อมแซมเส้นใยกล้ามเนื้อหลังออกกำลังกาย",
        evidence_level: "High Level A (Meta-Analysis)",
        pubmed_id: "29497353",
        summary: "การได้รับโปรตีนสกัดเข้มข้น 20-30g หลังออกกำลังกาย กระต้น mTOR Pathway ช่วยซ่อมแซมเส้นใยกล้ามเนื้อที่ฉีกขาดและลดอาการปวดเมื่อย (DOMS)"
    }
];
// 3. Ingredients Buffer (12 Active Ingredients Mapped to Providers)
const ingredientsBuffer = [
    { id: "igd_001", name: "Vitamin C (Ascorbic Acid)", provider_id: "prv_001" },
    { id: "igd_002", name: "Omega-3 (EPA/DHA Fish Oil)", provider_id: "prv_002" },
    { id: "igd_003", name: "Magnesium Glycinate / Oxide", provider_id: "prv_005" },
    { id: "igd_004", name: "Coenzyme Q10 (CoQ10)", provider_id: "prv_001" },
    { id: "igd_005", name: "Acerola Cherry Extract", provider_id: "prv_004" },
    { id: "igd_006", name: "Undenatured Collagen Type II (UC-II)", provider_id: "prv_006" },
    { id: "igd_007", name: "L-Carnitine L-Tartrate (Carnipure®)", provider_id: "prv_005" },
    { id: "igd_008", name: "Electrolytes (Sodium, Potassium, Magnesium)", provider_id: "prv_004" },
    { id: "igd_009", name: "Astaxanthin (Natural Microalgae)", provider_id: "prv_003" },
    { id: "igd_010", name: "Hydrolyzed Fish Collagen Tripeptide", provider_id: "prv_003" },
    { id: "igd_011", name: "Glucosamine Sulfate & Chondroitin", provider_id: "prv_006" },
    { id: "igd_012", name: "Green Tea Extract (EGCG)", provider_id: "prv_004" }
];
// 4. Brands Buffer (38 Brands Mapped to Country & Providers)
const brandsBuffer = [
    { id: "br_001", name: "Blackmores", provide_at: "Australia", provider_list: ["prv_001", "prv_002", "prv_006"] },
    { id: "br_002", name: "Vistra", provide_at: "Thailand", provider_list: ["prv_003", "prv_004", "prv_005"] },
    { id: "br_003", name: "NOW Foods", provide_at: "USA", provider_list: ["prv_001", "prv_005", "prv_006"] },
    { id: "br_004", name: "Mega We Care", provide_at: "Thailand", provider_list: ["prv_001", "prv_002", "prv_004"] },
    { id: "br_005", name: "Swisse", provide_at: "Australia", provider_list: ["prv_001", "prv_002", "prv_005"] },
    { id: "br_006", name: "Move Free (Schiff)", provide_at: "USA", provider_list: ["prv_006", "prv_007"] },
    { id: "br_007", name: "SaltStick", provide_at: "USA", provider_list: ["prv_004", "prv_005"] },
    { id: "br_008", name: "DHC", provide_at: "Japan", provider_list: ["prv_001", "prv_003"] },
    { id: "br_009", name: "Hicee", provide_at: "Japan", provider_list: ["prv_001"] },
    { id: "br_010", name: "Kirkland Signature", provide_at: "USA", provider_list: ["prv_001", "prv_002"] },
    { id: "br_011", name: "21st Century", provide_at: "USA", provider_list: ["prv_001", "prv_005"] },
    { id: "br_012", name: "California Gold Nutrition", provide_at: "USA", provider_list: ["prv_001", "prv_003"] },
    { id: "br_013", name: "Demosana", provide_at: "Germany", provider_list: ["prv_004"] },
    { id: "br_014", name: "Nordic Naturals", provide_at: "Norway", provider_list: ["prv_002"] },
    { id: "br_015", name: "Carlson Labs", provide_at: "Norway", provider_list: ["prv_002"] },
    { id: "br_016", name: "GNC", provide_at: "USA", provider_list: ["prv_001", "prv_002"] },
    { id: "br_017", name: "Doctor's Best", provide_at: "USA", provider_list: ["prv_001", "prv_005", "prv_006"] },
    { id: "br_018", name: "KAL", provide_at: "USA", provider_list: ["prv_005"] },
    { id: "br_019", name: "Life Extension", provide_at: "USA", provider_list: ["prv_001", "prv_005", "prv_006"] },
    { id: "br_020", name: "Nature's Bounty", provide_at: "USA", provider_list: ["prv_001", "prv_005"] },
    { id: "br_021", name: "Meiji", provide_at: "Japan", provider_list: ["prv_003"] },
    { id: "br_022", name: "Neocell", provide_at: "USA", provider_list: ["prv_003"] },
    { id: "br_023", name: "Amado Colligi", provide_at: "Thailand", provider_list: ["prv_003"] },
    { id: "br_024", name: "Bomi", provide_at: "Thailand", provider_list: ["prv_003"] },
    { id: "br_025", name: "Centrum", provide_at: "USA", provider_list: ["prv_001"] },
    { id: "br_026", name: "InterCare", provide_at: "Thailand", provider_list: ["prv_005", "prv_006"] },
    { id: "br_027", name: "Yanhee", provide_at: "Thailand", provider_list: ["prv_005"] },
    { id: "br_028", name: "Nutrex Research", provide_at: "USA", provider_list: ["prv_005"] },
    { id: "br_029", name: "Watsons", provide_at: "Hong Kong", provider_list: ["prv_004"] },
    { id: "br_030", name: "Gold Nutrition", provide_at: "Portugal", provider_list: ["prv_005"] },
    { id: "br_031", name: "Pocari Sweat", provide_at: "Japan", provider_list: ["prv_004"] },
    { id: "br_032", name: "Active Peak", provide_at: "Thailand", provider_list: ["prv_004"] },
    { id: "br_033", name: "Dever", provide_at: "Thailand", provider_list: ["prv_004"] },
    { id: "br_034", name: "AMMO", provide_at: "Thailand", provider_list: ["prv_004"] },
    { id: "br_035", name: "Royal-D", provide_at: "Thailand", provider_list: ["prv_004"] },
    { id: "br_036", name: "GU Energy", provide_at: "USA", provider_list: ["prv_004"] },
    { id: "br_037", name: "Plantae", provide_at: "Thailand", provider_list: ["prv_004"] },
    { id: "br_000", name: "General Brand", provide_at: "Global", provider_list: ["prv_001"] }
];
// Helper to map category to 2 scientific evidence IDs
function getCategoryEvidenceIds(categorySlug) {
    switch (categorySlug) {
        case 'vitamin-c': return ['ev_vitaminc_001', 'ev_vitaminc_002'];
        case 'omega-3-fish-oil': return ['ev_fishoil_001', 'ev_fishoil_002'];
        case 'magnesium': return ['ev_magnesium_001', 'ev_magnesium_002'];
        case 'astaxanthin-collagen': return ['ev_astax_001', 'ev_astax_002'];
        case 'coq10-multivitamins': return ['ev_coq10_001', 'ev_coq10_002'];
        case 'joint-protection': return ['ev_uc2_001', 'ev_uc2_002'];
        case 'energy-metabolism': return ['ev_lcarnitine_001', 'ev_lcarnitine_002'];
        case 'recovery-hydration': return ['ev_electrolytes_001', 'ev_electrolytes_002'];
        default: return ['ev_vitaminc_001'];
    }
}
// 5. Build 80 Products Buffer
const mockupProductsFile = node_path_1.default.resolve(__dirname, '../../../nutritrust-web-app/mockup/products_mockup.json');
const rawProducts = JSON.parse(node_fs_1.default.readFileSync(mockupProductsFile, 'utf-8'));
const productsBuffer = rawProducts.map((p) => ({
    ...p,
    evidence_ids: getCategoryEvidenceIds(p.category_slug)
}));
// 6. Build 80 Analytics Buffer
const mockupAnalyticsFile = node_path_1.default.resolve(__dirname, '../../../nutritrust-web-app/mockup/products_analytics_mockup.json');
const analyticsBuffer = JSON.parse(node_fs_1.default.readFileSync(mockupAnalyticsFile, 'utf-8'));
// Write all Buffer JSON files to ./buffer/
node_fs_1.default.writeFileSync(node_path_1.default.join(bufferDir, 'providers_mockup_buffer.json'), JSON.stringify(providersBuffer, null, 2));
node_fs_1.default.writeFileSync(node_path_1.default.join(bufferDir, 'science_summaries_mockup_buffer.json'), JSON.stringify(evidencesBuffer, null, 2));
node_fs_1.default.writeFileSync(node_path_1.default.join(bufferDir, 'ingredients_mockup_buffer.json'), JSON.stringify(ingredientsBuffer, null, 2));
node_fs_1.default.writeFileSync(node_path_1.default.join(bufferDir, 'brands_mockup_buffer.json'), JSON.stringify(brandsBuffer, null, 2));
node_fs_1.default.writeFileSync(node_path_1.default.join(bufferDir, 'products_mockup_buffer.json'), JSON.stringify(productsBuffer, null, 2));
node_fs_1.default.writeFileSync(node_path_1.default.join(bufferDir, 'products_analytics_mockup_buffer.json'), JSON.stringify(analyticsBuffer, null, 2));
console.log('✅ Created 6 Buffer files in ./buffer/ directory successfully!');
// Function to seed Buffer JSON files to MongoDB Atlas
async function seedBufferToMongoDB() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri)
            throw new Error('MONGODB_URI missing in .env');
        console.log('🔌 Connecting to MongoDB Atlas for Buffer Seeding...');
        await mongoose_1.default.connect(mongoUri, {
            dbName: 'Web_application_base',
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Connected to MongoDB Atlas');
        console.log('🧹 Clearing 6 collections for Buffer insertion...');
        await Promise.all([
            Brand_1.BrandModel.deleteMany({}),
            Ingredient_1.IngredientModel.deleteMany({}),
            Provider_1.ProviderModel.deleteMany({}),
            Product_1.ProductModel.deleteMany({}),
            Evidence_1.EvidenceModel.deleteMany({}),
            ProductAnalytics_1.ProductAnalyticsModel.deleteMany({})
        ]);
        console.log('📦 Seeding Traceability Buffer into MongoDB Atlas...');
        const [brands, ingredients, providers, products, evidences, analytics] = await Promise.all([
            Brand_1.BrandModel.insertMany(brandsBuffer),
            Ingredient_1.IngredientModel.insertMany(ingredientsBuffer),
            Provider_1.ProviderModel.insertMany(providersBuffer),
            Product_1.ProductModel.insertMany(productsBuffer),
            Evidence_1.EvidenceModel.insertMany(evidencesBuffer),
            ProductAnalytics_1.ProductAnalyticsModel.insertMany(analyticsBuffer)
        ]);
        console.log('\n🎉 Traceability Buffer Seed Successful!');
        console.log(`- Brands: ${brands.length}`);
        console.log(`- Ingredients: ${ingredients.length}`);
        console.log(`- Providers: ${providers.length}`);
        console.log(`- Products: ${products.length}`);
        console.log(`- Science Evidences: ${evidences.length}`);
        console.log(`- Product Analytics: ${analytics.length}`);
        await mongoose_1.default.disconnect();
        console.log('👋 Disconnected from MongoDB Atlas.');
    }
    catch (err) {
        console.error('❌ Buffer Seed Error:', err);
    }
}
seedBufferToMongoDB();
