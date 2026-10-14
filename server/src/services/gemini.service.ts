import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { AIProviderConfig, IAIProviderConfigDocument, AIConnectionStatus } from '../models/AIProviderConfig';

export type GeminiVerificationStatus =
  | 'verified'
  | 'configured'
  | 'missing_key'
  | 'invalid_credentials'
  | 'permission_denied'
  | 'quota_exceeded'
  | 'model_unavailable'
  | 'service_error';

export interface IGeminiStatusResult {
  status: GeminiVerificationStatus;
  keyPresent: boolean;
  model: string;
  message: string;
  provider: string;
  sdkVersion: string;
  checkedAt: string | null;
  demoFallbackActive: boolean;
  isEnabled?: boolean;
}

export interface IGeminiGenerationResult {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    cachedTokens: number;
  };
  durationMs: number;
}

export class GeminiService {
  private static cachedStatus: IGeminiStatusResult | null = null;
  private static cacheExpiry: number = 0;
  private static clientInstance: GoogleGenAI | null = null;
  private static clientKey: string | null = null;

  public static readonly SUPPORTED_MODELS = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-pro',
  ];

  /**
   * Lazily initializes or reuses the official @google/genai client
   */
  private static async getClient(overrideKey?: string): Promise<{ client: GoogleGenAI | null; model: string }> {
    if (overrideKey && overrideKey.trim() !== '') {
      return { client: new GoogleGenAI({ apiKey: overrideKey.trim() }), model: config.geminiModel };
    }

    let apiKey = '';
    let model = config.geminiModel || 'gemini-2.5-flash';

    try {
      const dbConfig = await AIProviderConfig.getEffectiveConfig();
      apiKey = dbConfig.getPlaintextApiKey();
      if (dbConfig.model) {
        model = dbConfig.model;
      }
    } catch {
      apiKey = config.geminiApiKey?.trim() || '';
    }

    if (!apiKey || apiKey.trim() === '') {
      return { client: null, model };
    }

    const trimmedKey = apiKey.trim();
    if (!this.clientInstance || this.clientKey !== trimmedKey) {
      this.clientInstance = new GoogleGenAI({ apiKey: trimmedKey });
      this.clientKey = trimmedKey;
    }

    return { client: this.clientInstance, model };
  }

  /**
   * Re-initializes client (useful if settings change)
   */
  public static resetClient(): void {
    this.clientInstance = null;
    this.clientKey = null;
    this.cachedStatus = null;
    this.cacheExpiry = 0;
  }

  /**
   * Returns current sanitized status for storefront & health consumers
   */
  public static async getSanitizedStatusAsync(): Promise<IGeminiStatusResult> {
    try {
      const dbConfig = await AIProviderConfig.getEffectiveConfig();
      const keyPresent = dbConfig.hasApiKey || Boolean(config.geminiApiKey && config.geminiApiKey.trim() !== '');
      const isVerified = dbConfig.connectionStatus === 'connected';

      return {
        status: isVerified ? 'verified' : keyPresent ? 'configured' : 'missing_key',
        keyPresent,
        model: dbConfig.model || config.geminiModel,
        message: isVerified
          ? `Verified & connected to Google Gemini using model ${dbConfig.model}.`
          : keyPresent
          ? 'API key configured in secure storage. Verification pending.'
          : 'No API key configured. Heuristic catalog intelligence engine active.',
        provider: 'Google Gemini Official SDK (@google/genai)',
        sdkVersion: '2.29.1',
        checkedAt: dbConfig.lastVerifiedAt ? dbConfig.lastVerifiedAt.toISOString() : null,
        demoFallbackActive: !isVerified,
        isEnabled: dbConfig.isEnabled,
      };
    } catch {
      return this.getSanitizedStatus();
    }
  }

  /**
   * Synchronous fallback for existing callers
   */
  public static getSanitizedStatus(): IGeminiStatusResult {
    const keyPresent = Boolean(config.geminiApiKey && config.geminiApiKey.trim() !== '');

    if (!keyPresent) {
      return {
        status: 'missing_key',
        keyPresent: false,
        model: config.geminiModel,
        message: 'No GEMINI_API_KEY configured. Catalog-grounded demo mode active.',
        provider: 'Google Gemini Official SDK (@google/genai)',
        sdkVersion: '2.29.1',
        checkedAt: null,
        demoFallbackActive: true,
      };
    }

    if (this.cachedStatus && Date.now() < this.cacheExpiry) {
      return this.cachedStatus;
    }

    return {
      status: 'configured',
      keyPresent: true,
      model: config.geminiModel,
      message: 'GEMINI_API_KEY configured. Verification pending or cache expired.',
      provider: 'Google Gemini Official SDK (@google/genai)',
      sdkVersion: '2.29.1',
      checkedAt: this.cachedStatus?.checkedAt || null,
      demoFallbackActive: this.cachedStatus ? this.cachedStatus.status !== 'verified' : false,
    };
  }

  /**
   * Performs an authentic, lightweight verification call to Google Gemini API
   * Can verify a candidate key before saving, or test current stored configuration.
   */
  public static async verifyApiKey(
    force: boolean = false,
    candidateKey?: string,
    candidateModel?: string
  ): Promise<IGeminiStatusResult> {
    const isTestingCandidate = Boolean(candidateKey && candidateKey.trim() !== '');

    let effectiveKey = '';
    let effectiveModel = candidateModel || config.geminiModel || 'gemini-2.5-flash';
    let dbConfig: IAIProviderConfigDocument | null = null;

    if (isTestingCandidate) {
      effectiveKey = candidateKey!.trim();
    } else {
      try {
        dbConfig = await AIProviderConfig.getEffectiveConfig();
        if (dbConfig) {
          effectiveKey = dbConfig.getPlaintextApiKey();
          if (dbConfig.model && !candidateModel) {
            effectiveModel = dbConfig.model;
          }
        }
      } catch {
        effectiveKey = config.geminiApiKey?.trim() || '';
      }
    }

    const keyPresent = Boolean(effectiveKey && effectiveKey !== '');

    if (!keyPresent) {
      const res: IGeminiStatusResult = {
        status: 'missing_key',
        keyPresent: false,
        model: effectiveModel,
        message: 'No Gemini API key provided or configured in secure storage.',
        provider: 'Google Gemini Official SDK (@google/genai)',
        sdkVersion: '2.29.1',
        checkedAt: new Date().toISOString(),
        demoFallbackActive: true,
      };
      if (dbConfig && !isTestingCandidate) {
        dbConfig.connectionStatus = 'not_configured';
        dbConfig.lastVerificationError = 'No API key configured.';
        await dbConfig.save();
      }
      return res;
    }

    const client = new GoogleGenAI({ apiKey: effectiveKey });
    const timestamp = new Date().toISOString();

    try {
      // Lightweight verification ping
      const testCall = client.models.generateContent({
        model: effectiveModel,
        contents: 'Respond with the single word "OK" for connection verification.',
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), config.geminiTimeoutMs || 15000)
      );

      await Promise.race([testCall, timeoutPromise]);

      const verifiedResult: IGeminiStatusResult = {
        status: 'verified',
        keyPresent: true,
        model: effectiveModel,
        message: `Successfully authenticated with Gemini API using model ${effectiveModel}.`,
        provider: 'Google Gemini Official SDK (@google/genai)',
        sdkVersion: '2.29.1',
        checkedAt: timestamp,
        demoFallbackActive: false,
      };

      this.cachedStatus = verifiedResult;
      this.cacheExpiry = Date.now() + 10 * 60 * 1000;

      // Update database status if we verified the stored key
      if (dbConfig && !isTestingCandidate) {
        dbConfig.connectionStatus = 'connected';
        dbConfig.lastVerifiedAt = new Date();
        dbConfig.lastVerificationError = '';
        await dbConfig.save();
      }

      return verifiedResult;
    } catch (err: any) {
      const errMsg = (err.message || '').toLowerCase();
      let status: GeminiVerificationStatus = 'service_error';
      let message = 'Temporary service failure while contacting Google Gemini API.';

      if (
        errMsg.includes('api_key_invalid') ||
        errMsg.includes('invalid api key') ||
        err.status === 400 ||
        err.status === 401
      ) {
        status = 'invalid_credentials';
        message = 'The provided Gemini API key was rejected by Google as invalid.';
      } else if (errMsg.includes('permission_denied') || err.status === 403) {
        status = 'permission_denied';
        message = 'Permission denied for this API key or model access scope.';
      } else if (errMsg.includes('resource_exhausted') || errMsg.includes('quota') || err.status === 429) {
        status = 'quota_exceeded';
        message = 'Gemini API quota or rate limit exceeded for this Google Cloud project.';
      } else if (errMsg.includes('not found') || errMsg.includes('model') || err.status === 404) {
        status = 'model_unavailable';
        message = `Configured model "${effectiveModel}" is not accessible on your API plan.`;
      } else if (errMsg === 'gemini_timeout') {
        status = 'service_error';
        message = `Request timed out after ${(config.geminiTimeoutMs || 15000) / 1000} seconds contacting Gemini.`;
      }

      const errResult: IGeminiStatusResult = {
        status,
        keyPresent: true,
        model: effectiveModel,
        message,
        provider: 'Google Gemini Official SDK (@google/genai)',
        sdkVersion: '2.29.1',
        checkedAt: timestamp,
        demoFallbackActive: true,
      };

      this.cachedStatus = errResult;
      this.cacheExpiry = Date.now() + 2 * 60 * 1000;

      if (dbConfig && !isTestingCandidate) {
        dbConfig.connectionStatus = 'error';
        dbConfig.lastVerificationError = message;
        await dbConfig.save();
      }

      return errResult;
    }
  }

  /**
   * Executes an authentic test shopping request for the admin console
   */
  public static async executeTestRequest(testPrompt: string = 'Recommend 2 high-rated headphones'): Promise<{
    prompt: string;
    reply: string;
    model: string;
    durationMs: number;
    tokensUsed: number;
  }> {
    const { client, model } = await this.getClient();
    if (!client) {
      throw new Error('Gemini API client is not configured with a valid key.');
    }

    const startTime = Date.now();
    const response = await client.models.generateContent({
      model,
      contents: `You are the VYAPORA AI Shopping Assistant. In 2 concise sentences, answer this test query: "${testPrompt}". Mention you are running a live connection test.`,
    });

    const durationMs = Date.now() - startTime;
    const text = response.text || 'Test response generated successfully.';
    const usageMetadata = (response as any).usageMetadata || {};
    const tokensUsed = Number(usageMetadata.totalTokenCount || 0);

    return {
      prompt: testPrompt,
      reply: text,
      model,
      durationMs,
      tokensUsed,
    };
  }

  /**
   * Grounded content generation using official @google/genai SDK
   */
  public static async generateShoppingResponse(params: {
    userQuery: string;
    catalogContext: any[];
    conversationHistory: Array<{ role: string; content: string }>;
    language?: 'en' | 'hi';
  }): Promise<IGeminiGenerationResult> {
    const { client, model } = await this.getClient();
    if (!client) {
      throw new Error('Gemini client unavailable (No API key configured)');
    }

    const startTime = Date.now();
    const catalogJson = JSON.stringify(params.catalogContext, null, 2);
    const targetLang = params.language === 'hi' ? 'hi' : 'en';

    const langInstruction =
      targetLang === 'hi'
        ? 'Respond in natural Hindi. Keep product names, brand names, model numbers, prices, and technical identifiers unchanged.'
        : 'Respond entirely in English. Keep product names, brand names, model numbers, prices, and technical identifiers unchanged.';

    const systemInstruction = `You are "VYAPORA Shopping Assistant" (व्यापोरा शॉपिंग सहायक), an optional, intelligent, and honest shopping companion for VYAPORA Multi-Vendor Marketplace.
Your role is to guide shoppers using STRICTLY the verified MongoDB catalog provided.

STRICT ACCURACY GUARANTEES:
1. Ground every recommendation solely in the VERIFIED CATALOG CONTEXT below.
2. DO NOT invent, hallucinate, or alter product names, prices, discounts, stock levels, or specifications.
3. If no matching product exists for the user's budget or category, explicitly tell the user that no matching products were found in the live catalog, and suggest how to broaden their search (e.g. higher budget, alternative category).
4. All prices must be quoted in Indian Rupees (₹) exactly matching the context.
5. Format key product highlights with bold titles and specifications.
6. MANDATORY LANGUAGE INSTRUCTION: ${langInstruction}

VERIFIED CATALOG CONTEXT:
${catalogJson}`;

    const contents: any[] = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      {
        role: 'model',
        parts: [
          {
            text:
              targetLang === 'hi'
                ? 'समझ गया। नमस्ते! मैं व्यापोरा (VYAPORA) शॉपिंग सहायक हूँ। मैं आपके अनुरोध का उत्तर प्राकृतिक हिंदी में दूंगा और प्रोडक्ट के नाम, ब्रांड, मॉडल और मूल्यों को अपरिवर्तित रखूँगा।'
                : 'Understood. Hello! I am the VYAPORA Shopping Assistant. I will respond entirely in English and strictly ground all recommendations in the verified catalog without altering product names, specs, or prices.',
          },
        ],
      },
    ];

    for (const h of params.conversationHistory.slice(-6)) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      });
    }

    // Add user query with explicit language reinforcement
    contents.push({
      role: 'user',
      parts: [{ text: `${params.userQuery}\n\n[Instruction: ${langInstruction}]` }],
    });

    const response = await client.models.generateContent({
      model,
      contents,
    });

    const durationMs = Date.now() - startTime;
    const text = response.text || 'Here are the verified options from our catalog.';

    const usageMetadata = (response as any).usageMetadata || {};
    const promptTokens = Number(usageMetadata.promptTokenCount || 0);
    const candidatesTokens = Number(usageMetadata.candidatesTokenCount || 0);
    const cachedTokens = Number(usageMetadata.cachedContentTokenCount || 0);
    const totalTokens = Number(usageMetadata.totalTokenCount || promptTokens + candidatesTokens);

    return {
      text,
      model,
      usage: {
        promptTokens,
        candidatesTokens,
        totalTokens,
        cachedTokens,
      },
      durationMs,
    };
  }

  /**
   * Translates an assistant response between English and Hindi while preserving product entities
   */
  public static async translateText(params: {
    text: string;
    targetLanguage: 'en' | 'hi';
  }): Promise<{ translatedText: string; model: string; tokensUsed: number }> {
    const { client, model } = await this.getClient();
    if (!client) {
      throw new Error('Gemini API client is not configured.');
    }

    const isHindiTarget = params.targetLanguage === 'hi';
    const translationPrompt = isHindiTarget
      ? `You are an expert bilingual e-commerce translator for VYAPORA.
Translate the following assistant message into natural Hindi.
STRICT ENTITY PRESERVATION RULES:
1. Keep ALL product names, brand names, model numbers, SKUs, and specifications (e.g. "ANC", "RAM", "GB", "MSRP") completely UNCHANGED.
2. Keep ALL prices in Indian Rupees (₹) exactly unchanged.
3. Keep ALL coupon codes (e.g. \`SAVE20\`, \`VYAPORA10\`) and markdown bullets/formatting intact.
4. Output ONLY the translated message text without explanations or introductory notes.

Text to translate:
"""
${params.text}
"""`
      : `You are an expert bilingual e-commerce translator for VYAPORA.
Translate the following assistant message into fluent, natural English.
STRICT ENTITY PRESERVATION RULES:
1. Keep ALL product names, brand names, model numbers, SKUs, and specifications completely UNCHANGED.
2. Keep ALL prices in Indian Rupees (₹) exactly unchanged.
3. Keep ALL coupon codes (e.g. \`SAVE20\`, \`VYAPORA10\`) and markdown bullets/formatting intact.
4. Output ONLY the translated message text without explanations or introductory notes.

Text to translate:
"""
${params.text}
"""`;

    const response = await client.models.generateContent({
      model,
      contents: translationPrompt,
    });

    const translatedText = (response.text || '').trim();
    const usageMetadata = (response as any).usageMetadata || {};
    const tokensUsed = Number(usageMetadata.totalTokenCount || 0);

    return {
      translatedText: translatedText || params.text,
      model,
      tokensUsed,
    };
  }
}
