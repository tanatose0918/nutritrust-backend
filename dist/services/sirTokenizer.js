"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sirTokenizer = exports.SIRTokenizer = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
class SIRTokenizer {
    /**
     * Parse Thai prompt into 7-Slot Semantic Matrix + 1 Consent Signature Slot
     */
    parseThaiPrompt(rawPrompt, userConsentSecret = 'NTT_CONSENT_DEFAULT') {
        const cleanText = rawPrompt.trim();
        // Generate Slot +1: Cryptographic signature of user consent
        const consentSignature = node_crypto_1.default
            .createHmac('sha256', userConsentSecret)
            .update(cleanText + Date.now().toString())
            .digest('hex')
            .slice(0, 16);
        // Rule-based Thai NLP Keyword Extraction for 7 Slots
        const subjectMatch = cleanText.match(/(ผู้สูงอายุ|คุณตา|คุณยาย|สายเต้น|สายแอโรบิก|คนทำงาน|ตัวเอง|ฉัน|ผม)/i);
        const auxMatch = cleanText.match(/(ทุกวัน|ตอนเช้า|ก่อนนอน|หลังออกกำลังกาย|เป็นประจำ)/i);
        const verbMatch = cleanText.match(/(เผาผลาญ|เบิร์น|ลดปวดข้อ|บำรุงข้อ|ช่วยนอนหลับ|เสริมภูมิคุ้มกัน|ลดความ fatigue|ฟื้นฟูกล้ามเนื้อ)/i);
        const dirMatch = cleanText.match(/(Blackmores|Vistra|NOW Foods|Mega We Care|Swisse|Move Free|DHC|SaltStick)/i);
        const objMatch = cleanText.match(/(UC-II|Collagen|Fish Oil|Omega-3|Magnesium|L-Carnitine|Astaxanthin|Vitamin C|CoQ10|Electrolytes|EGCG)/i);
        const modMatch = cleanText.match(/(ไม่มีน้ำตาล|วีแกน|เข้มข้น|คุ้มค่า|ราคาถูก|แบบเม็ดฟู่)/i);
        const ctxMatch = cleanText.match(/(ปวดเข่า|นอนไม่หลับ|อ่อนเพลีย|เป็นตะคริว|ภูมิแพ้|ปวดข้อ)/i);
        return {
            subject: subjectMatch ? subjectMatch[0] : 'user',
            auxiliary: auxMatch ? auxMatch[0] : 'standard',
            verb: verbMatch ? verbMatch[0] : 'general_health',
            direction: dirMatch ? dirMatch[0] : 'any_brand',
            object: objMatch ? objMatch[0] : 'multivitamin',
            modifier: modMatch ? modMatch[0] : 'none',
            context: ctxMatch ? ctxMatch[0] : 'wellness',
            slot_plus_1: consentSignature
        };
    }
    /**
     * Compress 7+1 Matrix into minified SIR (Subject-Intent-Resource) Serialization
     */
    compressSIR(rawPrompt, userConsentSecret) {
        const matrix = this.parseThaiPrompt(rawPrompt, userConsentSecret);
        // Minified dense format: S[subject]|A[aux]|V[verb]|D[dir]|O[obj]|M[mod]|C[ctx]|SIG[slot_plus_1]
        const denseTokens = [
            `S:${matrix.subject}`,
            `A:${matrix.auxiliary}`,
            `V:${matrix.verb}`,
            `D:${matrix.direction}`,
            `O:${matrix.object}`,
            `M:${matrix.modifier}`,
            `C:${matrix.context}`,
            `SIG:${matrix.slot_plus_1}`
        ].join('|');
        const originalLen = rawPrompt.length;
        const compressedLen = denseTokens.length;
        const ratio = originalLen > 0 ? ((1 - compressedLen / (originalLen * 3)) * 100).toFixed(1) + '%' : '0%';
        return {
            sir_token: denseTokens,
            matrix,
            compression_ratio: ratio,
            original_length: originalLen,
            compressed_length: compressedLen
        };
    }
}
exports.SIRTokenizer = SIRTokenizer;
exports.sirTokenizer = new SIRTokenizer();
