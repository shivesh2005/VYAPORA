import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { runSeed } from '../src/seed/seed';
import { GeminiService } from '../src/services/gemini.service';
import { AICatalogService } from '../src/services/ai-catalog.service';
import { AIUsageService } from '../src/services/ai-usage.service';
import { AIUsage } from '../src/models/AIUsage';
import { AIConversation } from '../src/models/AIConversation';
import { User } from '../src/models/User';

describe('Gemini AI Engine, Token Accounting & Catalog Grounding Tests', () => {
  let adminToken: string;
  let customerToken: string;
  let customerId: string;
  let secondCustomerToken: string;

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = 'true';
    await connectDB();
    await runSeed();

    // Log in admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@nexora.com', password: 'password123' });
    adminToken = adminRes.body.token;

    // Log in customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@nexora.com', password: 'password123' });
    customerToken = custRes.body.token;
    customerId = custRes.body.user.id;

    // Log in second customer
    const cust2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya@example.com', password: 'password123' });
    secondCustomerToken = cust2Res.body.token;
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Configuration & Key Verification Status', () => {
    it('should return sanitized AI configuration status without exposing credentials', async () => {
      const res = await request(app).get('/api/ai/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ai).toBeDefined();
      expect(res.body.ai.model).toBeDefined();
      expect(res.body.ai.provider).toContain('Google Gemini');
      expect(res.body.ai.sdkVersion).toBe('2.29.1');
      // Must NEVER expose the API key
      expect(res.body.ai.apiKey).toBeUndefined();
      expect(res.body.ai.geminiApiKey).toBeUndefined();
    });

    it('should prevent non-admins from running verification check', async () => {
      const res = await request(app)
        .post('/api/ai/verify')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow admin to run key verification and return structured status', async () => {
      const res = await request(app)
        .post('/api/ai/verify')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.verification).toBeDefined();
      expect(res.body.verification.status).toBeDefined();
      expect(res.body.verification.demoFallbackActive).toBeDefined();
    });
  });

  describe('2. Catalog Grounding Intelligence (Zero Hallucination)', () => {
    it('should ground query in real MongoDB products within specified budget', async () => {
      const grounding = await AICatalogService.groundCatalogQuery('Find wireless headphones under 3000');
      expect(grounding.detectedBudget).toBe(3000);
      expect(grounding.products.length).toBeGreaterThan(0);
      for (const p of grounding.products) {
        expect(p.price).toBeLessThanOrEqual(3000);
      }
    });

    it('should detect comparison intent and compare live catalog products', async () => {
      const grounding = await AICatalogService.groundCatalogQuery('Compare ANC headphones vs earbuds');
      expect(grounding.intent).toBe('compare');
      const fallback = AICatalogService.generateDemoFallbackResponse({
        userQuery: 'Compare ANC headphones vs earbuds',
        products: grounding.products,
        detectedBudget: null,
        intent: 'compare',
      });
      expect(fallback.reply).toContain('Comparison');
    });

    it('should answer verified platform policies (returns/shipping/coupons)', async () => {
      const grounding = await AICatalogService.groundCatalogQuery('What is your return policy?');
      expect(grounding.intent).toBe('platform_faq');
      expect(grounding.faqTopic).toBe('returns');

      const fallback = AICatalogService.generateDemoFallbackResponse({
        userQuery: 'What is your return policy?',
        products: [],
        detectedBudget: null,
        intent: 'platform_faq',
        faqTopic: 'returns',
      });
      expect(fallback.reply).toContain('7-Day Window');
    });
  });

  describe('3. Chat Execution & Fallback Processing', () => {
    it('should process chat request and return grounded recommendations', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          message: 'Recommend a laptop under 60000',
          sessionId: 'test-session-grounding-1',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toBeDefined();
      expect(res.body.products).toBeDefined();
      expect(res.body.suggestions.length).toBeGreaterThan(0);
      expect(res.body.mode).toMatch(/gemini_official|catalog_grounded_demo/);
    });

    it('should mock Gemini service response with realistic usage metadata without paid calls', async () => {
      // Spy on GeminiService.generateShoppingResponse
      const spy = vi.spyOn(GeminiService, 'generateShoppingResponse').mockResolvedValueOnce({
        text: 'Mocked Gemini response: I recommend the Vanguard Ultra Laptop based on verified specs.',
        model: 'gemini-2.5-flash',
        usage: {
          promptTokens: 145,
          candidatesTokens: 62,
          totalTokens: 207,
          cachedTokens: 0,
        },
        durationMs: 310,
      });

      // Temporarily mock getSanitizedStatus to simulate verified key
      const statusSpy = vi.spyOn(GeminiService, 'getSanitizedStatus').mockReturnValueOnce({
        status: 'verified',
        keyPresent: true,
        model: 'gemini-2.5-flash',
        message: 'Mock verified',
        provider: 'Google Gemini Official SDK (@google/genai)',
        sdkVersion: '2.29.1',
        checkedAt: new Date().toISOString(),
        demoFallbackActive: false,
      });

      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          message: 'Show me ultra laptops',
          sessionId: 'test-gemini-mock-session',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mode).toBe('gemini_official');
      expect(res.body.tokensUsed).toBe(207);

      spy.mockRestore();
      statusSpy.mockRestore();
    });
  });

  describe('4. Token Accounting & Quota Enforcement', () => {
    it('should record token usage and calculate reference estimated cost', async () => {
      const usage = await AIUsageService.recordUsage({
        userId: customerId,
        conversationId: 'test-usage-session',
        model: 'gemini-2.5-flash',
        inputTokens: 1000,
        outputTokens: 500,
        requestStatus: 'success',
        mode: 'gemini_official',
      });

      expect(usage.inputTokens).toBe(1000);
      expect(usage.outputTokens).toBe(500);
      expect(usage.totalTokens).toBe(1500);
      expect(usage.estimatedCost).toBeGreaterThan(0);
    });

    it('should provide authorized user usage summary to customer', async () => {
      const res = await request(app)
        .get('/api/ai/usage')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.quotaRemaining).toBeGreaterThanOrEqual(0);
      expect(res.body.user.disclaimer).toBeDefined();
    });

    it('should provide platform-wide analytics to platform admin', async () => {
      const res = await request(app)
        .get('/api/ai/usage')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.scope).toBe('platform_admin');
      expect(res.body.platform).toBeDefined();
      expect(res.body.platform.totalRequests).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. Conversation Ownership & Management', () => {
    let createdSessionId = `test-ownership-${Date.now()}`;

    it('should associate conversation with authenticated customer', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          message: 'My private shopping inquiry',
          sessionId: createdSessionId,
        });

      expect(res.status).toBe(200);

      const conv = await AIConversation.findOne({ sessionId: createdSessionId });
      expect(conv).toBeDefined();
      expect(conv?.userId?.toString()).toBe(customerId);
    });

    it('should list customer conversations', async () => {
      const res = await request(app)
        .get('/api/ai/conversations')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.conversations).toBeDefined();
      expect(Array.isArray(res.body.conversations)).toBe(true);
    });

    it('should forbid other customers from reading private conversation', async () => {
      const res = await request(app)
        .get(`/api/ai/conversations/${createdSessionId}`)
        .set('Authorization', `Bearer ${secondCustomerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow conversation owner to delete their session', async () => {
      const res = await request(app)
        .delete(`/api/ai/conversations/${createdSessionId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await AIConversation.findOne({ sessionId: createdSessionId });
      expect(check).toBeNull();
    });
  });

  describe('6. Admin AI Connection Management & Key Security', () => {
    it('should allow admin to retrieve current AI provider configuration without exposing raw key', async () => {
      const res = await request(app)
        .get('/api/ai/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toBeDefined();
      expect(res.body.config.provider).toBe('gemini');
      expect(res.body.config.supportedModels).toContain('gemini-2.5-flash');
      // Must NEVER expose raw API key
      expect(res.body.config.apiKey).toBeUndefined();
      expect(res.body.config.encryptedApiKey).toBeUndefined();
    });

    it('should save configuration securely with masked key and not mark connected without verification', async () => {
      const testApiKey = 'TEST-SECRET-KEY-FOR-ADMIN-VERIFICATION-1234';
      const saveRes = await request(app)
        .post('/api/ai/config/save')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          apiKey: testApiKey,
          model: 'gemini-2.0-flash',
        });

      expect(saveRes.status).toBe(200);
      expect(saveRes.body.success).toBe(true);
      expect(saveRes.body.config.model).toBe('gemini-2.0-flash');
      expect(saveRes.body.config.hasApiKey).toBe(true);
      expect(saveRes.body.config.keyMask).toContain('TEST');
      expect(saveRes.body.config.keyMask).toContain('1234');
      // Must NOT falsely claim connected merely because key was saved
      expect(saveRes.body.config.connectionStatus).toBe('not_configured');
    });

    it('should allow admin to toggle assistant enabled state', async () => {
      const toggleOff = await request(app)
        .post('/api/ai/config/toggle')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isEnabled: false });

      expect(toggleOff.status).toBe(200);
      expect(toggleOff.body.isEnabled).toBe(false);

      // Verify chat reflects disabled assistant
      const chatRes = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Recommend a laptop' });

      expect(chatRes.body.isAssistantDisabled).toBe(true);
      expect(chatRes.body.reply).toContain('currently disabled');

      // Re-enable
      const toggleOn = await request(app)
        .post('/api/ai/config/toggle')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isEnabled: true });

      expect(toggleOn.status).toBe(200);
      expect(toggleOn.body.isEnabled).toBe(true);
    });

    it('should require confirmation before disconnecting active provider', async () => {
      const failRes = await request(app)
        .post('/api/ai/config/disconnect')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ confirm: false });

      expect(failRes.status).toBe(400);
      expect(failRes.body.success).toBe(false);

      const successRes = await request(app)
        .post('/api/ai/config/disconnect')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ confirm: true });

      expect(successRes.status).toBe(200);
      expect(successRes.body.config.connectionStatus).toBe('disconnected');
      expect(successRes.body.config.hasApiKey).toBe(false);
    });
  });

  describe('7. Accurate Product Search & Grounded Recommendation Constraints', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/ai/config/toggle')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isEnabled: true });
    });

    it('should ground audio query in only audio products and reject furniture/clothing', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Find wireless noise cancelling headphones' });

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.products.length).toBeGreaterThan(0);

      // Every returned product MUST be Audio & Sound, never furniture or apparel
      for (const p of res.body.products) {
        expect(p.category).toBe('Audio & Sound');
        expect(p.category).not.toBe('Home & Living');
        expect(p.category).not.toBe('Fashion & Apparel');
      }
    });

    it('should enforce hard budget constraints and not return items above budget', async () => {
      const budgetCeiling = 3000;
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: `Wireless earbuds under ${budgetCeiling}` });

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      for (const p of res.body.products) {
        expect(p.price).toBeLessThanOrEqual(budgetCeiling);
      }
    });

    it('should return empty results and broadening suggestions when no items meet budget', async () => {
      const impossibleBudget = 50; // No laptop or headphone exists under ₹50
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: `Laptop under ${impossibleBudget}` });

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(0);
      expect(res.body.hasMatches).toBe(false);
      expect(res.body.reply).toMatch(/No .*products found|कोई भी उत्पाद नहीं मिला/i);
    });

    it('should use the same search pipeline for main product search bar', async () => {
      const searchRes = await request(app)
        .get('/api/products?search=headphones');

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.products).toBeDefined();
      expect(searchRes.body.products.length).toBeGreaterThan(0);
      for (const p of searchRes.body.products) {
        expect(p.category).toBe('Audio & Sound');
      }
    });
  });

  describe('8. Bilingual Shopping Assistant & Message Translation (Requirement E)', () => {
    it('should generate a shopping response in Hindi when requested with language="hi"', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          message: 'Recommend top wireless headphones',
          language: 'hi',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toBeDefined();
      // Should contain Hindi characters
      expect(/[\u0900-\u097F]/.test(res.body.reply)).toBe(true);
      expect(res.body.suggestions).toBeDefined();
      expect(res.body.suggestions.length).toBeGreaterThan(0);
      expect(/[\u0900-\u097F]/.test(res.body.suggestions[0])).toBe(true);
    });

    it('should generate an English shopping response when requested with language="en"', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          message: 'Recommend top wireless headphones',
          language: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply).toMatch(/headphones|audio|catalog/i);
    });

    it('should translate assistant response to Hindi while preserving product entities, INR prices and model numbers', async () => {
      const sampleEnglish = 'Here are our top verified headphones from Sony WH-1000XM5 priced at ₹24,990 with 30-hour battery life.';
      const res = await request(app)
        .post('/api/ai/translate')
        .send({
          text: sampleEnglish,
          targetLanguage: 'hi',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.targetLanguage).toBe('hi');
      expect(res.body.translatedText).toBeDefined();
      // Preserves INR price ₹24,990
      expect(res.body.translatedText).toContain('₹24,990');
      // Preserves brand and model name
      expect(res.body.translatedText).toContain('Sony');
      // Contains Hindi translation
      expect(/[\u0900-\u097F]/.test(res.body.translatedText)).toBe(true);
    });

    it('should translate assistant response to English while preserving product entities and prices', async () => {
      const sampleHindi = 'यहाँ ₹2,499 कीमत में हमारे टॉप हेडफोन उपलब्ध हैं। यह इन-स्टॉक है।';
      const res = await request(app)
        .post('/api/ai/translate')
        .send({
          text: sampleHindi,
          targetLanguage: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.targetLanguage).toBe('en');
      expect(res.body.translatedText).toBeDefined();
      expect(res.body.translatedText).toContain('₹2,499');
    });

    it('should return 400 when text to translate is missing or empty', async () => {
      const res = await request(app)
        .post('/api/ai/translate')
        .send({
          text: '   ',
          targetLanguage: 'hi',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/required/i);
    });
  });
});


