import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { GeminiService } from '../services/gemini.service';
import { AICatalogService } from '../services/ai-catalog.service';
import { AIUsageService } from '../services/ai-usage.service';
import { AIConversation } from '../models/AIConversation';
import { Subscription } from '../models/Subscription';
import { AIProviderConfig } from '../models/AIProviderConfig';

/**
 * POST /api/ai/chat
 * Primary shopping assistant chat endpoint
 */
export const chatWithAI = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, sessionId = `session-${Date.now()}`, history = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ success: false, message: 'A prompt message is required.' });
      return;
    }

    const trimmedMessage = message.trim();
    const isHindi = language === 'hi';

    // 0. Verify assistant enabled state
    const providerConfig = await AIProviderConfig.getEffectiveConfig();
    if (!providerConfig.isEnabled) {
      res.status(200).json({
        success: false,
        isAssistantDisabled: true,
        sessionId,
        reply: isHindi
          ? 'शॉपिंग सहायक वर्तमान में स्टोर व्यवस्थापक द्वारा अक्षम है। कृपया उत्पादों को खोजने के लिए पृष्ठ के शीर्ष पर मुख्य खोज बार का उपयोग करें।'
          : 'The Shopping Assistant is currently disabled by the store administrator. Please use the main search bar at the top of the page to discover products.',
        products: [],
        suggestions: isHindi
          ? ['सभी उत्पाद खोजें', 'इलेक्ट्रॉनिक्स देखें', 'ऑडियो उत्पाद']
          : ['Search all products', 'Browse Electronics', 'Browse Audio & Sound'],
        mode: 'disabled',
        tokensUsed: 0,
        quotaRemaining: 0,
      });
      return;
    }

    // 1. Enforce SaaS & User AI Quota limits
    const quotaInfo = await AIUsageService.checkQuota(req.user?._id, req.user?.role);
    if (!quotaInfo.allowed) {
      await AIUsageService.recordUsage({
        userId: req.user?._id,
        conversationId: sessionId,
        model: 'quota_blocked',
        requestStatus: 'quota_exceeded',
        mode: 'catalog_grounded_demo',
        errorMessage: quotaInfo.reason,
      });

      res.status(429).json({
        success: false,
        message: quotaInfo.reason,
        quotaRemaining: 0,
        quotaLimit: quotaInfo.limit,
        planName: quotaInfo.planName,
        isQuotaExceeded: true,
      });
      return;
    }

    // 2. Perform live catalog grounding in MongoDB
    const grounding = await AICatalogService.groundCatalogQuery(trimmedMessage);

    let finalReply = '';
    let finalSuggestions: string[] = [];
    let activeMode: 'gemini_official' | 'catalog_grounded_demo' = 'catalog_grounded_demo';
    let tokensRecorded = 0;

    // 3. Attempt Google Gemini execution if key is present & connected
    const geminiStatus = GeminiService.getSanitizedStatus();
    let geminiSucceeded = false;

    if (geminiStatus.keyPresent) {
      try {
        const geminiResult = await GeminiService.generateShoppingResponse({
          userQuery: trimmedMessage,
          catalogContext: grounding.catalogContext,
          conversationHistory: history,
          language: isHindi ? 'hi' : 'en',
        });

        finalReply = geminiResult.text;
        tokensRecorded = geminiResult.usage.totalTokens;
        activeMode = 'gemini_official';
        geminiSucceeded = true;

        // Record official token metadata
        await AIUsageService.recordUsage({
          userId: req.user?._id,
          conversationId: sessionId,
          model: geminiResult.model,
          inputTokens: geminiResult.usage.promptTokens,
          outputTokens: geminiResult.usage.candidatesTokens,
          totalTokens: geminiResult.usage.totalTokens,
          cachedTokens: geminiResult.usage.cachedTokens,
          requestStatus: 'success',
          mode: 'gemini_official',
        });

        // Contextual follow-up suggestions
        if (grounding.products.length > 0) {
          finalSuggestions = isHindi
            ? [
                `शीर्ष 2 ${grounding.products[0].category} उत्पादों की तुलना करें`,
                `₹${Math.round(grounding.products[0].price * 0.85)} के अंदर खोजें`,
                'डिलीवरी समय और रिटर्न पॉलिसी क्या है?',
              ]
            : [
                `Compare top 2 ${grounding.products[0].category} items`,
                `Find products under ₹${Math.round(grounding.products[0].price * 0.85)}`,
                'What is the delivery time and return policy?',
              ];
        } else {
          finalSuggestions =
            grounding.suggestedBroadening && grounding.suggestedBroadening.length > 0
              ? grounding.suggestedBroadening
              : isHindi
              ? [
                  '₹3,000 के अंदर हेडफोन',
                  'कॉलेज के लिए लैपटॉप सुझाएं',
                  'सक्रिय डिस्काउंट कूपन',
                ]
              : [
                  'Find headphones under ₹3,000',
                  'Recommend a laptop for college',
                  'Active discount coupons',
                ];
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to catalog intelligence engine:', err.message);

        // Record failed attempt
        await AIUsageService.recordUsage({
          userId: req.user?._id,
          conversationId: sessionId,
          model: geminiStatus.model,
          requestStatus: 'failed',
          mode: 'gemini_official',
          errorMessage: err.message,
        });
      }
    }

    // 4. Fallback to catalog-grounded engine if Gemini was missing or threw error
    if (!geminiSucceeded) {
      const demoResult = AICatalogService.generateDemoFallbackResponse({
        userQuery: trimmedMessage,
        products: grounding.products,
        detectedBudget: grounding.detectedBudget,
        intent: grounding.intent,
        faqTopic: grounding.faqTopic,
        noMatchesReason: grounding.noMatchesReason,
        suggestedBroadening: grounding.suggestedBroadening,
        language: isHindi ? 'hi' : 'en',
      });

      finalReply = demoResult.reply;
      finalSuggestions = demoResult.suggestions;
      activeMode = 'catalog_grounded_demo';

      // Record demo engine request
      await AIUsageService.recordUsage({
        userId: req.user?._id,
        conversationId: sessionId,
        model: 'catalog-grounded-engine',
        requestStatus: 'success',
        mode: 'catalog_grounded_demo',
      });
    }

    // 5. If user is a seller, increment monthly AI usage in Subscription
    if (req.user && req.user.role === 'seller') {
      await Subscription.findOneAndUpdate(
        { sellerId: req.user._id },
        { $inc: { 'usage.aiRequestsThisMonth': 1 } }
      );
    }

    // 6. Persist conversation history in MongoDB (ownership enforced)
    let conversation = await AIConversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new AIConversation({
        sessionId,
        userId: req.user ? req.user._id : undefined,
        messages: [],
      });
    } else if (req.user && !conversation.userId) {
      conversation.userId = req.user._id;
    }

    conversation.messages.push({
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
    });

    conversation.messages.push({
      role: 'assistant',
      content: finalReply,
      productsRecommended: grounding.products.map((p) => p._id),
      timestamp: new Date(),
    });

    if (conversation.messages.length > 30) {
      conversation.messages = conversation.messages.slice(-30);
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      sessionId,
      reply: finalReply,
      products: grounding.products,
      suggestions: finalSuggestions,
      mode: activeMode,
      tokensUsed: tokensRecorded,
      quotaRemaining: Math.max(0, quotaInfo.remaining - 1),
      hasMatches: grounding.hasMatches,
      noMatchesReason: grounding.noMatchesReason,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/conversations
 * List user conversations with ownership scoping
 */
export const listConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const conversations = await AIConversation.find({ userId: req.user._id })
      .select('sessionId messages.content createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const formatted = conversations.map((c) => ({
      sessionId: c.sessionId,
      lastMessage: c.messages[c.messages.length - 1]?.content || 'Empty conversation',
      messageCount: c.messages.length,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    res.status(200).json({ success: true, conversations: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/conversations/:id
 * Retrieve specific conversation history
 */
export const getConversationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idStr = String(req.params.id || '');
    const isObjectId = mongoose.isValidObjectId(idStr);

    const conversation = await AIConversation.findOne({
      $or: [{ sessionId: idStr }, ...(isObjectId ? [{ _id: idStr }] : [])],
    }).populate({
      path: 'messages.productsRecommended',
      select: 'title slug price compareAtPrice images rating numReviews brand discountBadge',
    });

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    if (conversation.userId && req.user && req.user.role !== 'admin') {
      if (conversation.userId.toString() !== req.user._id.toString()) {
        res.status(403).json({ success: false, message: 'Access denied to this conversation.' });
        return;
      }
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/ai/conversations/:id
 * Delete a conversation with ownership enforcement
 */
export const deleteConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idStr = String(req.params.id || '');
    const isObjectId = mongoose.isValidObjectId(idStr);

    const conversation = await AIConversation.findOne({
      $or: [{ sessionId: idStr }, ...(isObjectId ? [{ _id: idStr }] : [])],
    });

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    if (conversation.userId && (!req.user || (req.user.role !== 'admin' && conversation.userId.toString() !== req.user._id.toString()))) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this conversation.' });
      return;
    }

    await AIConversation.deleteOne({ _id: conversation._id });

    res.status(200).json({ success: true, message: 'Conversation successfully cleared.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/usage
 * Token accounting & quota usage summary
 */
export const getAIUsage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role === 'admin') {
      const [platformSummary, userSummary] = await Promise.all([
        AIUsageService.getPlatformUsageSummary(),
        AIUsageService.getUserUsageSummary(req.user._id, req.user.role),
      ]);

      res.status(200).json({
        success: true,
        scope: 'platform_admin',
        platform: platformSummary,
        user: userSummary,
      });
      return;
    }

    const userSummary = await AIUsageService.getUserUsageSummary(req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      scope: req.user.role,
      user: userSummary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/status
 * Public sanitized AI system configuration status
 */
export const getAIStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = await GeminiService.getSanitizedStatusAsync();
    res.status(200).json({
      success: true,
      ai: status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/verify
 * Legacy / primary endpoint for verifying API key
 * Restricted to Platform Admins
 */
export const verifyGeminiKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin authorization required to run API verification.' });
      return;
    }

    const candidateKey = req.body?.apiKey;
    const candidateModel = req.body?.model;

    const result = await GeminiService.verifyApiKey(true, candidateKey, candidateModel);

    res.status(200).json({
      success: true,
      verification: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/config
 * Dedicated Admin AI Provider Settings inspection
 */
export const getAdminAIConfig = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin authorization required.' });
      return;
    }

    const dbConfig = await AIProviderConfig.getEffectiveConfig();

    res.status(200).json({
      success: true,
      config: {
        provider: dbConfig.provider,
        model: dbConfig.model,
        isEnabled: dbConfig.isEnabled,
        connectionStatus: dbConfig.connectionStatus,
        hasApiKey: dbConfig.hasApiKey,
        keyMask: dbConfig.keyMask,
        lastVerifiedAt: dbConfig.lastVerifiedAt,
        lastVerificationError: dbConfig.lastVerificationError,
        supportedModels: GeminiService.SUPPORTED_MODELS,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/config/save
 * Dedicated Admin AI Provider Settings saving
 * Securely encrypts and saves API key & model
 */
export const saveAdminAIConfig = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin authorization required.' });
      return;
    }

    const { apiKey, model } = req.body;
    const dbConfig = await AIProviderConfig.getEffectiveConfig();

    if (model && GeminiService.SUPPORTED_MODELS.includes(model)) {
      dbConfig.model = model;
    }

    if (apiKey !== undefined && typeof apiKey === 'string') {
      const trimmedKey = apiKey.trim();
      if (trimmedKey !== '') {
        dbConfig.setPlaintextApiKey(trimmedKey);
        // Connection status must not falsely claim connected merely because key is saved!
        dbConfig.connectionStatus = 'not_configured';
        dbConfig.lastVerificationError = '';
      }
    }

    dbConfig.lastUpdatedBy = req.user._id;
    await dbConfig.save();
    GeminiService.resetClient();

    res.status(200).json({
      success: true,
      message: 'AI provider configuration saved securely.',
      config: {
        provider: dbConfig.provider,
        model: dbConfig.model,
        isEnabled: dbConfig.isEnabled,
        connectionStatus: dbConfig.connectionStatus,
        hasApiKey: dbConfig.hasApiKey,
        keyMask: dbConfig.keyMask,
        lastVerifiedAt: dbConfig.lastVerifiedAt,
        lastVerificationError: dbConfig.lastVerificationError,
        supportedModels: GeminiService.SUPPORTED_MODELS,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/config/toggle
 * Enable / Disable storefront assistant
 */
export const toggleAIAssistant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin authorization required.' });
      return;
    }

    const { isEnabled } = req.body;
    const dbConfig = await AIProviderConfig.getEffectiveConfig();

    dbConfig.isEnabled = Boolean(isEnabled);
    dbConfig.lastUpdatedBy = req.user._id;
    await dbConfig.save();

    res.status(200).json({
      success: true,
      message: dbConfig.isEnabled
        ? 'Shopping Assistant enabled on storefront.'
        : 'Shopping Assistant disabled on storefront.',
      isEnabled: dbConfig.isEnabled,
      connectionStatus: dbConfig.connectionStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/config/disconnect
 * Disconnect active provider (requires confirm: true)
 */
export const disconnectAIProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin authorization required.' });
      return;
    }

    const { confirm } = req.body;
    if (confirm !== true) {
      res.status(400).json({
        success: false,
        message: 'Confirmation is required before disconnecting the active AI provider.',
      });
      return;
    }

    const dbConfig = await AIProviderConfig.getEffectiveConfig();
    dbConfig.setPlaintextApiKey('');
    dbConfig.isEnabled = false;
    dbConfig.connectionStatus = 'disconnected';
    dbConfig.lastVerifiedAt = null;
    dbConfig.lastVerificationError = '';
    dbConfig.lastUpdatedBy = req.user._id;
    await dbConfig.save();

    GeminiService.resetClient();

    res.status(200).json({
      success: true,
      message: 'Google Gemini provider has been disconnected. Assistant is disabled.',
      config: {
        provider: dbConfig.provider,
        model: dbConfig.model,
        isEnabled: false,
        connectionStatus: 'disconnected',
        hasApiKey: false,
        keyMask: '',
        lastVerifiedAt: null,
        lastVerificationError: '',
        supportedModels: GeminiService.SUPPORTED_MODELS,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/config/test
 * Test AI Request button
 */
export const testAIRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin authorization required.' });
      return;
    }

    const prompt = req.body?.prompt || 'Recommend 2 high-rated headphones in our catalog';
    const testResult = await GeminiService.executeTestRequest(prompt);

    res.status(200).json({
      success: true,
      result: testResult,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Test AI request failed.',
    });
  }
};

/**

 * POST /api/ai/translate
 * Translates an existing assistant response between English and Hindi
 */
export const translateAIResponse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text, targetLanguage = 'en' } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Text to translate is required.' });
      return;
    }

    const lang: 'en' | 'hi' = targetLanguage === 'hi' ? 'hi' : 'en';

    // 1. Try official Gemini translation if configured
    const geminiStatus = GeminiService.getSanitizedStatus();
    if (geminiStatus.keyPresent) {
      try {
        const result = await GeminiService.translateText({ text: text.trim(), targetLanguage: lang });
        res.status(200).json({
          success: true,
          translatedText: result.translatedText,
          targetLanguage: lang,
          mode: 'gemini_official',
          tokensUsed: result.tokensUsed,
        });
        return;
      } catch (err: any) {
        console.warn('Gemini translation failed, using fallback:', err.message);
      }
    }

    // 2. Deterministic translation fallback preserving entities
    const fallbackText = AICatalogService.translateFallback(text.trim(), lang);
    res.status(200).json({
      success: true,
      translatedText: fallbackText,
      targetLanguage: lang,
      mode: 'catalog_grounded_demo',
      tokensUsed: 0,
    });
  } catch (error) {
    next(error);
  }
};

// Backwards-compatibility alias
export const getConversationHistory = getConversationById;
