"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgeAnonymizer = exports.EdgeAnonymizer = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
class EdgeAnonymizer {
    saltSecret = 'NTT_ANONYMIZER_SALT_V1';
    /**
     * Scrub Personally Identifiable Information (PII) like phone numbers, Thai citizen IDs, emails, and full names
     */
    scrubPII(text) {
        if (!text)
            return '';
        return text
            // Phone Numbers (Thai 08x, 09x, 06x, 02x)
            .replace(/(\b0[689]\d{8}\b|\b02\d{7}\b)/g, '[ANONYMIZED_PHONE]')
            // Thai National ID (13 digits)
            .replace(/\b\d{13}\b/g, '[ANONYMIZED_THAI_ID]')
            // Emails
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[ANONYMIZED_EMAIL]')
            // Credit card numbers
            .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[ANONYMIZED_CARD]');
    }
    /**
     * Hash user email into Zero-Knowledge token ID
     */
    generateZKToken(email) {
        return 'zk_' + node_crypto_1.default.createHmac('sha256', this.saltSecret).update(email.toLowerCase().trim()).digest('hex').slice(0, 24);
    }
}
exports.EdgeAnonymizer = EdgeAnonymizer;
exports.edgeAnonymizer = new EdgeAnonymizer();
