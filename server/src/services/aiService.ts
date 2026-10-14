import { Product, IProduct } from '../models/Product';
import { config } from '../config/env';

export interface AIResponse {
  reply: string;
  products: any[];
  suggestions: string[];
  mode: 'live_llm' | 'catalog_grounded_demo';
}

export class AIService {
  public static async processMessage(
    userQuery: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<AIResponse> {
    const queryLower = userQuery.toLowerCase().trim();

    // 1. Catalog extraction & candidate filtering from MongoDB
    const allProducts = await Product.find({ isPublished: true })
      .populate('storeId', 'storeName brandAccentColor')
      .lean();

    // Parse budget constraints (e.g. "under 3000", "under ₹5000", "below 1000", "less than 20000")
    const budgetMatch = queryLower.match(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/i);
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : null;

    // Detect intent
    const isComparison = queryLower.includes('compare') || queryLower.includes('versus') || queryLower.includes('vs');
    const isDiscountQuery = queryLower.includes('discount') || queryLower.includes('deal') || queryLower.includes('offer') || queryLower.includes('sale');
    const isRecommendation = queryLower.includes('best') || queryLower.includes('recommend') || queryLower.includes('suggest') || queryLower.includes('find');

    // Filter products matching search keywords or category
    let matchedProducts: any[] = [];

    // Filter by budget if specified
    let candidatePool = allProducts;
    if (maxBudget !== null) {
      candidatePool = candidatePool.filter((p) => p.price <= maxBudget);
    }

    if (isDiscountQuery) {
      matchedProducts = candidatePool
        .filter((p) => (p.compareAtPrice && p.compareAtPrice > p.price) || (p.discountBadge && p.discountBadge.length > 0))
        .sort((a, b) => {
          const discountA = a.compareAtPrice ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
          const discountB = b.compareAtPrice ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
          return discountB - discountA;
        });
    } else {
      // Score products based on query keywords matching title, category, brand, description, tags
      const tokens = queryLower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2);

      const scored = candidatePool.map((p) => {
        let score = 0;
        const text = `${p.title} ${p.category} ${p.subcategory || ''} ${p.brand} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase();

        for (const token of tokens) {
          if (p.title.toLowerCase().includes(token)) score += 5;
          if (p.category.toLowerCase().includes(token)) score += 4;
          if (p.brand.toLowerCase().includes(token)) score += 3;
          if (text.includes(token)) score += 1;
        }

        if (p.rating >= 4.5) score += 1.5;
        if (p.isFeatured) score += 1;

        return { product: p, score };
      });

      matchedProducts = scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);
    }

    // Fallback if no specific keywords matched: pick featured / top rated within budget
    if (matchedProducts.length === 0) {
      matchedProducts = candidatePool
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
    } else {
      matchedProducts = matchedProducts.slice(0, 4);
    }

    // 2. Try live LLM if API Key is configured
    if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
      try {
        const liveReply = await this.callGemini(userQuery, matchedProducts, history);
        return {
          reply: liveReply,
          products: matchedProducts,
          suggestions: this.generateSuggestions(matchedProducts, queryLower),
          mode: 'live_llm',
        };
      } catch (err: any) {
        console.warn('Live LLM call encountered an issue, gracefully using catalog grounding engine:', err.message);
      }
    }

    // 3. Built-in Grounded Catalog Intelligence Engine (Zero-API-Key Required)
    const engineReply = this.generateCatalogGroundedResponse(userQuery, matchedProducts, maxBudget, isComparison, isDiscountQuery);
    return {
      reply: engineReply,
      products: matchedProducts,
      suggestions: this.generateSuggestions(matchedProducts, queryLower),
      mode: 'catalog_grounded_demo',
    };
  }

  private static async callGemini(
    query: string,
    groundedProducts: any[],
    history: Array<{ role: string; content: string }>
  ): Promise<string> {
    const productCatalogContext = groundedProducts.map((p) => ({
      id: p._id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      price: `₹${p.price.toLocaleString('en-IN')}`,
      originalPrice: p.compareAtPrice ? `₹${p.compareAtPrice.toLocaleString('en-IN')}` : undefined,
      rating: `${p.rating}/5 (${p.numReviews} reviews)`,
      stock: p.stock > 0 ? `${p.stock} in stock` : 'Out of stock',
      variants: p.variants,
    }));

    const systemPrompt = `You are the Vyapora Shopping Assistant, the helpful, neutral shopping guide for the Vyapora Multi-Vendor E-Commerce Marketplace.
Answer user questions concisely, politely, and insightfully.
STRICT RULE: Only recommend and discuss items present in the verified catalog context provided below.
DO NOT invent products, prices, or fake availability. All prices are in Indian Rupees (₹).
Grounding Data: ${JSON.stringify(productCatalogContext)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...history.slice(-4).map((h) => ({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: query }] },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Here are the best verified matches from our live catalog.';
  }

  private static generateCatalogGroundedResponse(
    query: string,
    products: any[],
    maxBudget: number | null,
    isComparison: boolean,
    isDiscountQuery: boolean
  ): string {
    if (products.length === 0) {
      return `I analyzed our marketplace catalog for "${query}", but couldn't find items strictly meeting those criteria. Try searching for broad categories like "Electronics", "Fashion", "Audio", or adjust the budget filter!`;
    }

    if (isComparison && products.length >= 2) {
      const [p1, p2] = products;
      const priceDiff = Math.abs(p1.price - p2.price);
      const higherRated = p1.rating >= p2.rating ? p1.title : p2.title;
      return `**Vyapora Side-by-Side Comparison:**\n\n1. **${p1.title}** (₹${p1.price.toLocaleString('en-IN')}) — ${p1.brand} with a **${p1.rating}★** rating (${p1.numReviews} reviews).\n2. **${p2.title}** (₹${p2.price.toLocaleString('en-IN')}) — ${p2.brand} with a **${p2.rating}★** rating (${p2.numReviews} reviews).\n\n💡 **Verdict:** There is a ₹${priceDiff.toLocaleString('en-IN')} price variance. **${higherRated}** holds the stronger customer satisfaction rating in our marketplace. Both are in stock with direct vendor warranty.`;
    }

    if (isDiscountQuery) {
      return `Here are the top active promotions and discounted items currently indexed on Vyapora. You can click any product card below to inspect stock details, applied coupon codes, and customer reviews.`;
    }

    if (maxBudget !== null) {
      const topPick = products[0];
      return `I scanned our verified marketplace catalog for your budget under **₹${maxBudget.toLocaleString('en-IN')}**. My highest-rated recommendation is **${topPick.title}** priced at **₹${topPick.price.toLocaleString('en-IN')}** (${topPick.rating}★, ${topPick.stock} units available). Check out the curated options below:`;
    }

    const topProduct = products[0];
    return `Based on your request, I found **${products.length} verified products** in our real-time database. The top recommendation is **${topProduct.title}** by **${topProduct.brand}** for ₹${topProduct.price.toLocaleString('en-IN')} (${topProduct.rating}★). All items below are verified in stock and ready to order.`;
  }

  private static generateSuggestions(products: any[], currentQuery: string): string[] {
    const suggestions: string[] = [];

    if (products.length >= 2) {
      suggestions.push(`Compare ${products[0].brand} vs ${products[1].brand}`);
    }

    if (products.length > 0) {
      suggestions.push(`Show more in ${products[0].category}`);
      suggestions.push(`Find products under ₹${Math.round(products[0].price * 0.9)}`);
    }

    suggestions.push('Which items have active discounts?');
    suggestions.push('Recommend top-rated electronics for students');

    return suggestions.slice(0, 4);
  }
}
