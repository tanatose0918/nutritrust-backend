"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privacyTokenizerMCP = exports.PrivacyTokenizerMCP = void 0;
const anonymizer_1 = require("../services/anonymizer");
const sirTokenizer_1 = require("../services/sirTokenizer");
class PrivacyTokenizerMCP {
    /**
     * Process raw user health input: Scrub PII, Generate ZK-Token, Compress SIR Matrix
     */
    processUserInput(userEmail, rawPrompt, consentSecret) {
        const inputEmail = userEmail || 'anonymous_guest@nutritrust.com';
        const zkToken = anonymizer_1.edgeAnonymizer.generateZKToken(inputEmail);
        const promptText = rawPrompt || '';
        const safeText = anonymizer_1.edgeAnonymizer.scrubPII(promptText);
        const compressed = sirTokenizer_1.sirTokenizer.compressSIR(safeText, consentSecret);
        return {
            zk_token: zkToken,
            anonymized_prompt: safeText,
            sir_compression: compressed
        };
    }
}
exports.PrivacyTokenizerMCP = PrivacyTokenizerMCP;
exports.privacyTokenizerMCP = new PrivacyTokenizerMCP();
