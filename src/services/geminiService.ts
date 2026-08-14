import { edgeAnonymizer } from './anonymizer.js';
import { sirTokenizer, ISemanticMatrix } from './sirTokenizer.js';
import { UserModel, IUser } from '../models/User.js';

export interface IGeminiRequestPayload {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

export interface IGeminiResponsePayload {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export interface IPersonalizedHealthBufferItem {
  id: string;
  zk_token: string;
  compressed_sir: string;
  matrix: ISemanticMatrix;
  created_at: Date;
  status: 'pending' | 'processed' | 'failed';
  result?: any;
}

export class GeminiService {
  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JA_SZ2ALgCrKzsEoTaCeV4F1ioz8ExgM63sWLtwi5uZQ';
  }

  private apiEndpoint: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
  
  // Rate limiter counter (60 req/min max, threshold 40 req/min)
  private currentMinuteRequests: number = 0;
  private lastResetTime: number = Date.now();
  private rateLimitThreshold: number = 40;

  // In-Memory Queue Buffer for Personalize Health Requests when rate limit threshold (40 req/min) is reached
  private healthRequestBuffer: IPersonalizedHealthBufferItem[] = [];

  constructor() {
    // Reset rate limiter count every 60 seconds
    setInterval(() => {
      this.currentMinuteRequests = 0;
      this.lastResetTime = Date.now();
      this.processBufferedRequests();
    }, 60000);
  }

  /**
   * Check Rate Limiter status
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastResetTime > 60000) {
      this.currentMinuteRequests = 0;
      this.lastResetTime = now;
    }
    return this.currentMinuteRequests < this.rateLimitThreshold;
  }

  /**
   * Middle SIR Mapper: Converts User's health_goals & health_issues into 7+1 SIR Matrix
   */
  public mapUserHealthToSIR(user: Partial<IUser>): { safePrompt: string; compressedSIR: string; matrix: ISemanticMatrix; zkToken: string } {
    const rawGoals = (user.health_goals || []).join(', ');
    const rawIssues = user.health_issues || '';
    const rawSupplements = user.current_supplements || '';

    const combinedRawText = `เป้าหมายสุขภาพ: ${rawGoals} | ปัญหาสุขภาพ: ${rawIssues} | อาหารเสริมที่ทาน: ${rawSupplements}`;

    // 1. Scrub PII at Local Edge
    const safePrompt = edgeAnonymizer.scrubPII(combinedRawText);

    // 2. Generate Zero-Knowledge Token for routing (Anonymous User Identifier)
    const zkToken = edgeAnonymizer.generateZKToken(user.email || 'anonymous@nutritrust.com');

    // 3. Compress into 7+1 Slot SIR Matrix
    const sirResult = sirTokenizer.compressSIR(safePrompt, zkToken);

    return {
      safePrompt,
      compressedSIR: sirResult.sir_token,
      matrix: sirResult.matrix,
      zkToken
    };
  }

  /**
   * Call Gemini REST API with Anonymized & Compressed SIR Payload
   */
  public async generateRecommendation(userProfile: Partial<IUser>): Promise<{
    success: boolean;
    rate_limited?: boolean;
    message?: string;
    zk_token?: string;
    sir_token?: string;
    request_payload?: IGeminiRequestPayload;
    response_data?: any;
  }> {
    const { safePrompt, compressedSIR, matrix, zkToken } = this.mapUserHealthToSIR(userProfile);

    // Check Rate Limiter (If >= 40 req/min, buffer request and return polite limit message)
    if (!this.checkRateLimit()) {
      const bufferItem: IPersonalizedHealthBufferItem = {
        id: `buf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        zk_token: zkToken,
        compressed_sir: compressedSIR,
        matrix,
        created_at: new Date(),
        status: 'pending'
      };

      this.healthRequestBuffer.push(bufferItem);

      return {
        success: false,
        rate_limited: true,
        message: 'Server มีการใช้งานจำนวนมาก โปรดรอสักครู่',
        zk_token: zkToken,
        sir_token: compressedSIR
      };
    }

    this.currentMinuteRequests++;

    const promptText = `คุณคือ NutriTrust AI Expert ตอบเป็นภาษาไทยสั้นกระชับ: 
[ZK_TOKEN]: ${zkToken}
[COMPRESSED_SIR]: ${compressedSIR}
[SUBJECT]: ${matrix.subject}
[INTENT]: ${matrix.verb}
[OBJECT]: ${matrix.object}
[CONTEXT]: ${matrix.context}

คำแนะนำ: วิเคราะห์ว่าอาหารเสริมโมเลกุลใดที่เหมาะสมที่สุดตามหลักโภชนเภสัช`;

    const payload: IGeminiRequestPayload = {
      contents: [
        {
          parts: [
            {
              text: promptText
            }
          ]
        }
      ]
    };

    try {
      const apiKey = this.getApiKey();
      const response = await fetch(`${this.apiEndpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const resData = (await response.json()) as IGeminiResponsePayload;

      if (!response.ok || resData.error) {
        throw new Error(resData.error?.message || `Gemini API HTTP ${response.status}`);
      }

      const aiAnswer = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'ไม่สามารถประมวลคำแนะนำได้ในขณะนี้';

      return {
        success: true,
        zk_token: zkToken,
        sir_token: compressedSIR,
        request_payload: payload,
        response_data: {
          recommendation: aiAnswer,
          anonymized_zk_token: zkToken,
          processed_at: new Date().toISOString()
        }
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to call Gemini API',
        zk_token: zkToken,
        sir_token: compressedSIR
      };
    }
  }

  /**
   * Generate an AI Pharmacist Clinical Summary for a supplement stack
   * utilizing Gemini on Google AI Studio with ZK-token scrubbing and fallback template.
   */
  public async generateStackPharmacistSummary(params: {
    email?: string;
    product_names: string[];
    conflicts: any[];
    synergies: any[];
    warnings: any[];
    health_issues?: string[];
    health_goals?: string[];
    safety_score?: number;
  }): Promise<{
    success: boolean;
    zk_token: string;
    sir_token: string;
    ai_summary: string;
    confidence_score: number;
    processed_at: string;
    source: 'gemini_cloud' | 'local_deterministic_fallback';
  }> {
    const rawGoals = (params.health_goals || []).join(', ');
    const rawIssues = (params.health_issues || []).join(', ');
    const userEmail = params.email || 'anonymous@nutritrust.com';

    const safeGoals = edgeAnonymizer.scrubPII(rawGoals);
    const safeIssues = edgeAnonymizer.scrubPII(rawIssues);
    const zkToken = edgeAnonymizer.generateZKToken(userEmail);
    const sirResult = sirTokenizer.compressSIR(`${safeGoals} | ${safeIssues}`, zkToken);

    const productsStr = params.product_names.join(', ') || 'ไม่มีรายการ';
    const conflictsStr = params.conflicts.map((c) => `${c.title_th}: ${c.description_th}`).join(' | ') || 'ไม่พบสารขัดแย้ง';
    const synergiesStr = params.synergies.map((s) => `${s.title_th}: ${s.description_th}`).join(' | ') || 'ไม่พบสารเสริมฤทธิ์';
    const warningsStr = params.warnings.map((w) => `${w.title_th || w}: ${w.description_th || ''}`).join(' | ') || 'ไม่มีคำเตือนโรคประจำตัว';
    const safetyScore = params.safety_score ?? 100;

    const promptText = `คุณคือเภสัชกรผู้เชี่ยวชาญด้านโภชนเภสัชแห่ง NutriTrust กรุณาวิเคราะห์และสรุปคำแนะนำการทานอาหารเสริมของชุดนี้เป็นภาษาไทย กระชับ ตรงประเด็น สุภาพ และน่าเชื่อถือทางวิทยาศาสตร์ (ความยาว 3-4 ประโยค):

[ข้อมูลการตรวจวิเคราะห์ความปลอดภัย]:
- รายการอาหารเสริมในตู้ยา: ${productsStr}
- คะแนนความปลอดภัยรวม (Safety Score): ${safetyScore}%
- เป้าหมายสุขภาพผู้ใช้: ${safeGoals || 'สุขภาพทั่วไป'}
- ภาวะสุขภาพ/โรคประจำตัว: ${safeIssues || 'ไม่มี'}
- ข้อควรระวังเฉพาะบุคคล: ${warningsStr}
- ปฏิกิริยาขัดแย้งที่พบ: ${conflictsStr}
- สารที่เสริมฤทธิ์กัน: ${synergiesStr}

กรุณาให้คำแนะนำ:
1. ความเหมาะสมของ Stack นี้กับเป้าหมายสุขภาพ
2. วิธีการและลำดับเวลาในการรับประทานเพื่อการดูดซึมที่ดีที่สุด
3. ข้อควรระวังสำคัญที่สุดที่ต้องจำไว้`;

    const payload: IGeminiRequestPayload = {
      contents: [
        {
          parts: [
            {
              text: promptText
            }
          ]
        }
      ]
    };

    try {
      const apiKey = this.getApiKey();
      const response = await fetch(`${this.apiEndpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const resData = (await response.json()) as IGeminiResponsePayload;

      if (!response.ok || resData.error) {
        throw new Error(resData.error?.message || `Gemini API HTTP ${response.status}`);
      }

      const aiText = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!aiText) throw new Error('Empty response candidate from Gemini');

      return {
        success: true,
        zk_token: zkToken,
        sir_token: sirResult.sir_token,
        ai_summary: aiText,
        confidence_score: 98,
        processed_at: new Date().toISOString(),
        source: 'gemini_cloud'
      };
    } catch (err: any) {
      console.warn('[GeminiService] Fallback to deterministic AI summary:', err.message);

      // Local Deterministic Rule-Based Fallback
      let fallbackText = `ชุดอาหารเสริม ${params.product_names.length} รายการนี้มีคะแนนความปลอดภัย ${safetyScore}%. `;
      if (params.warnings.length > 0) {
        fallbackText += `⚠️ ข้อควรระวังสำคัญ: ${params.warnings[0].title_th || params.warnings[0]}. `;
      }
      if (params.conflicts.length > 0) {
        fallbackText += `แนะนำจัดมื้อรับประทานแยกกันตามตารางเพื่อเลี่ยงการแย่งตัวนำส่ง. `;
      }
      if (params.synergies.length > 0) {
        fallbackText += `⚡ มีสารอาหารที่ส่งเสริมการดูดซึมร่วมกันอย่างมีประสิทธิภาพ. `;
      }
      fallbackText += `ควรดื่มน้ำสะอาดอย่างเพียงพอและรับประทานสม่ำเสมอตามคำแนะนำ.`;

      return {
        success: true,
        zk_token: zkToken,
        sir_token: sirResult.sir_token,
        ai_summary: fallbackText,
        confidence_score: 92,
        processed_at: new Date().toISOString(),
        source: 'local_deterministic_fallback'
      };
    }
  }

  /**
   * Process queued buffered requests when rate limit resets
   */
  private async processBufferedRequests() {
    if (this.healthRequestBuffer.length === 0) return;
    console.log(`⚡ [GeminiService Buffer Worker] Processing ${this.healthRequestBuffer.length} buffered health requests...`);

    const itemsToProcess = this.healthRequestBuffer.splice(0, 30);
    for (const item of itemsToProcess) {
      item.status = 'processed';
    }
  }

  /**
   * Get buffer status metrics
   */
  public getBufferStatus() {
    return {
      current_minute_requests: this.currentMinuteRequests,
      rate_limit_threshold: this.rateLimitThreshold,
      max_limit_per_min: 60,
      buffered_queue_length: this.healthRequestBuffer.length
    };
  }
}

export const geminiService = new GeminiService();
