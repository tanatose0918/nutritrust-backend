import { edgeAnonymizer } from '../services/anonymizer';
import { sirTokenizer, ISIRCompressed } from '../services/sirTokenizer';

export interface IPrivacyTokenizerMCPResult {
  zk_token: string;
  anonymized_prompt: string;
  sir_compression: ISIRCompressed;
}

export class PrivacyTokenizerMCP {
  /**
   * Process raw user health input: Scrub PII, Generate ZK-Token, Compress SIR Matrix
   */
  public processUserInput(userEmail?: string, rawPrompt?: string, consentSecret?: string): IPrivacyTokenizerMCPResult {
    const inputEmail = userEmail || 'anonymous_guest@nutritrust.com';
    const zkToken = edgeAnonymizer.generateZKToken(inputEmail);
    
    const promptText = rawPrompt || '';
    const safeText = edgeAnonymizer.scrubPII(promptText);
    const compressed = sirTokenizer.compressSIR(safeText, consentSecret);

    return {
      zk_token: zkToken,
      anonymized_prompt: safeText,
      sir_compression: compressed
    };
  }
}

export const privacyTokenizerMCP = new PrivacyTokenizerMCP();
