import mongoose from 'mongoose';
import { AIUsage, IAIUsage, AIRequestStatus } from '../models/AIUsage';
import { Subscription } from '../models/Subscription';
import { SubscriptionPlan } from '../models/SubscriptionPlan';

export interface IQuotaCheckResult {
  allowed: boolean;
  limit: number;
  usedThisMonth: number;
  remaining: number;
  planName: string;
  reason?: string;
}

export interface IUserUsageSummary {
  userId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
  estimatedCostUSD: number;
  thisMonthRequests: number;
  quotaLimit: number;
  quotaRemaining: number;
  planName: string;
  disclaimer: string;
}

export interface IPlatformUsageSummary {
  totalRequests: number;
  totalTokens: number;
  promptTokens: number;
  candidatesTokens: number;
  cachedTokens: number;
  estimatedCostUSD: number;
  byModel: Record<string, { requests: number; tokens: number }>;
  byStatus: Record<string, number>;
  activeUsersCount: number;
  disclaimer: string;
}

export class AIUsageService {
  // Approximate Gemini API pricing (as of 2025/2026 for Flash tier: ~$0.075/1M input, ~$0.30/1M output)
  // Used SOLELY as an educational estimate; provider billing may differ.
  private static readonly INPUT_PRICE_PER_TOKEN_USD = 0.000000075;
  private static readonly OUTPUT_PRICE_PER_TOKEN_USD = 0.0000003;

  /**
   * Calculates an approximate reference cost in USD.
   * Disclaimer: Indicative calculation only, not an actual invoice or provider bill.
   */
  public static calculateEstimatedCost(inputTokens: number, outputTokens: number): number {
    const cost =
      inputTokens * this.INPUT_PRICE_PER_TOKEN_USD +
      outputTokens * this.OUTPUT_PRICE_PER_TOKEN_USD;
    return parseFloat(cost.toFixed(6));
  }

  /**
   * Records an AI invocation event in MongoDB
   */
  public static async recordUsage(params: {
    userId?: string | mongoose.Types.ObjectId;
    accountId?: string | mongoose.Types.ObjectId;
    conversationId?: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cachedTokens?: number;
    requestStatus: AIRequestStatus;
    mode: 'gemini_official' | 'catalog_grounded_demo';
    errorMessage?: string;
  }): Promise<IAIUsage> {
    const inTokens = params.inputTokens || 0;
    const outTokens = params.outputTokens || 0;
    const totTokens = params.totalTokens || inTokens + outTokens;
    const cachedTokens = params.cachedTokens || 0;

    const estimatedCost =
      params.mode === 'gemini_official'
        ? this.calculateEstimatedCost(inTokens, outTokens)
        : 0;

    const record = new AIUsage({
      userId: params.userId ? new mongoose.Types.ObjectId(params.userId.toString()) : undefined,
      accountId: params.accountId ? new mongoose.Types.ObjectId(params.accountId.toString()) : undefined,
      conversationId: params.conversationId,
      model: params.model,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: totTokens,
      cachedTokens,
      requestStatus: params.requestStatus,
      estimatedCost,
      mode: params.mode,
      errorMessage: params.errorMessage,
    });

    return await record.save();
  }

  /**
   * Enforces monthly AI request limits based on user role and SaaS subscription entitlements
   */
  public static async checkQuota(
    userId?: string | mongoose.Types.ObjectId,
    userRole: string = 'customer'
  ): Promise<IQuotaCheckResult> {
    // Unauthenticated guest allowance (per session)
    if (!userId) {
      return {
        allowed: true,
        limit: 20,
        usedThisMonth: 0,
        remaining: 20,
        planName: 'GUEST_DEMO',
      };
    }

    // Platform Admins have unrestricted test capacity
    if (userRole === 'admin') {
      return {
        allowed: true,
        limit: 999999,
        usedThisMonth: 0,
        remaining: 999999,
        planName: 'ADMIN_UNLIMITED',
      };
    }

    // Determine monthly boundary
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count successful requests this month
    const usedThisMonth = await AIUsage.countDocuments({
      userId: new mongoose.Types.ObjectId(userId.toString()),
      requestStatus: 'success',
      createdAt: { $gte: startOfMonth },
    });

    let monthlyLimit = 50; // Default customer allowance
    let planName = 'CUSTOMER_BASE';

    if (userRole === 'seller') {
      // Find seller's active SaaS subscription
      const subscription = await Subscription.findOne({
        sellerId: new mongoose.Types.ObjectId(userId.toString()),
        status: 'active',
      }).populate('planId');

      if (subscription && subscription.planId) {
        const plan = subscription.planId as any;
        monthlyLimit = plan.limits?.maxMonthlyAiRequests || 30;
        planName = plan.name || 'STARTER';
      } else {
        monthlyLimit = 30; // Free Starter tier default
        planName = 'STARTER';
      }
    }

    const remaining = Math.max(0, monthlyLimit - usedThisMonth);
    const allowed = usedThisMonth < monthlyLimit;

    let reason: string | undefined;
    if (!allowed) {
      reason =
        userRole === 'seller'
          ? `You have reached your monthly AI request limit of ${monthlyLimit} on your ${planName} plan. Please upgrade to Growth or Scale in SaaS Subscriptions to continue.`
          : `You have reached your monthly limit of ${monthlyLimit} shopping assistant requests. Please check back next month or log in as a seller/admin for higher limits.`;
    }

    return {
      allowed,
      limit: monthlyLimit,
      usedThisMonth,
      remaining,
      planName,
      reason,
    };
  }

  /**
   * Retrieve aggregated usage statistics for a specific user
   */
  public static async getUserUsageSummary(
    userId: string | mongoose.Types.ObjectId,
    userRole: string = 'customer'
  ): Promise<IUserUsageSummary> {
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());
    const quotaInfo = await this.checkQuota(userObjectId, userRole);

    const records = await AIUsage.find({ userId: userObjectId }).lean();

    let totalRequests = records.length;
    let successfulRequests = 0;
    let failedRequests = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let totalTokens = 0;
    let cachedTokens = 0;
    let estimatedCostUSD = 0;

    for (const r of records) {
      if (r.requestStatus === 'success') successfulRequests++;
      else failedRequests++;

      inputTokens += r.inputTokens || 0;
      outputTokens += r.outputTokens || 0;
      totalTokens += r.totalTokens || 0;
      cachedTokens += r.cachedTokens || 0;
      estimatedCostUSD += r.estimatedCost || 0;
    }

    return {
      userId: userId.toString(),
      totalRequests,
      successfulRequests,
      failedRequests,
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens,
      estimatedCostUSD: parseFloat(estimatedCostUSD.toFixed(5)),
      thisMonthRequests: quotaInfo.usedThisMonth,
      quotaLimit: quotaInfo.limit,
      quotaRemaining: quotaInfo.remaining,
      planName: quotaInfo.planName,
      disclaimer:
        'Estimated API cost is a reference calculation based on standard token pricing and does not reflect actual billing.',
    };
  }

  /**
   * Retrieve aggregated platform-wide usage metrics for Admin dashboard
   */
  public static async getPlatformUsageSummary(): Promise<IPlatformUsageSummary> {
    const allRecords = await AIUsage.find().lean();

    let totalRequests = allRecords.length;
    let totalTokens = 0;
    let promptTokens = 0;
    let candidatesTokens = 0;
    let cachedTokens = 0;
    let estimatedCostUSD = 0;

    const byModel: Record<string, { requests: number; tokens: number }> = {};
    const byStatus: Record<string, number> = {};
    const userSet = new Set<string>();

    for (const r of allRecords) {
      totalTokens += r.totalTokens || 0;
      promptTokens += r.inputTokens || 0;
      candidatesTokens += r.outputTokens || 0;
      cachedTokens += r.cachedTokens || 0;
      estimatedCostUSD += r.estimatedCost || 0;

      if (r.userId) {
        userSet.add(r.userId.toString());
      }

      // Group by model
      const model = r.model || 'unknown';
      if (!byModel[model]) byModel[model] = { requests: 0, tokens: 0 };
      byModel[model].requests++;
      byModel[model].tokens += r.totalTokens || 0;

      // Group by status
      const status = r.requestStatus || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    }

    return {
      totalRequests,
      totalTokens,
      promptTokens,
      candidatesTokens,
      cachedTokens,
      estimatedCostUSD: parseFloat(estimatedCostUSD.toFixed(5)),
      byModel,
      byStatus,
      activeUsersCount: userSet.size,
      disclaimer:
        'Platform token usage metrics are aggregated from recorded AIUsage events. Estimated cost is an approximation for architectural planning only.',
    };
  }
}
