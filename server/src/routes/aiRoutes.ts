import { Router } from 'express';
import {
  chatWithAI,
  listConversations,
  getConversationById,
  deleteConversation,
  getAIUsage,
  getAIStatus,
  verifyGeminiKey,
  getAdminAIConfig,
  saveAdminAIConfig,
  toggleAIAssistant,
  disconnectAIProvider,
  testAIRequest,
  translateAIResponse,
  getConversationHistory,
} from '../controllers/aiController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// Primary conversation routes
router.post('/chat', optionalAuthenticate, chatWithAI);
router.post('/translate', optionalAuthenticate, translateAIResponse);
router.get('/conversations', authenticate, listConversations);
router.get('/conversations/:id', optionalAuthenticate, getConversationById);
router.delete('/conversations/:id', optionalAuthenticate, deleteConversation);

// Public / storefront status
router.get('/status', optionalAuthenticate, getAIStatus);

// Verification (both legacy and config paths)
router.post('/verify', authenticate, authorize('admin'), verifyGeminiKey);
router.post('/config/verify', authenticate, authorize('admin'), verifyGeminiKey);

// Admin AI Provider Settings Management
router.get('/config', authenticate, authorize('admin'), getAdminAIConfig);
router.post('/config/save', authenticate, authorize('admin'), saveAdminAIConfig);
router.post('/config/toggle', authenticate, authorize('admin'), toggleAIAssistant);
router.post('/config/disconnect', authenticate, authorize('admin'), disconnectAIProvider);
router.post('/config/test', authenticate, authorize('admin'), testAIRequest);

// Token usage analytics & quotas
router.get('/usage', authenticate, getAIUsage);

// Legacy backwards-compatibility alias
router.get('/history/:sessionId', optionalAuthenticate, getConversationHistory);

export default router;
