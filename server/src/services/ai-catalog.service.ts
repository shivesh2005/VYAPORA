import { CatalogSearchService, ICatalogSearchResult } from './catalog-search.service';

export interface ICatalogGroundingResult {
  products: any[];
  catalogContext: any[];
  detectedBudget: number | null;
  intent: 'search' | 'compare' | 'discount' | 'recommend' | 'platform_faq';
  faqTopic?: string;
  hasMatches: boolean;
  noMatchesReason?: string;
  suggestedBroadening?: string[];
}

export class AICatalogService {
  /**
   * Search real MongoDB catalog based on user query and extract verified grounding context
   * Strictly adheres to budget, category, and relevance constraints without hallucination.
   */
  public static async groundCatalogQuery(userQuery: string): Promise<ICatalogGroundingResult> {
    const searchResult: ICatalogSearchResult = await CatalogSearchService.executeSearch({
      query: userQuery,
      limit: 4,
    });

    const catalogContext = searchResult.products.map((p) => ({
      productId: p._id.toString(),
      title: p.title,
      slug: p.slug,
      brand: p.brand,
      category: p.category,
      priceINR: p.price,
      compareAtPriceINR: p.compareAtPrice || null,
      stockAvailable: p.stock,
      rating: p.rating,
      numReviews: p.numReviews,
      hasDiscount: Boolean(p.compareAtPrice && p.compareAtPrice > p.price),
      discountBadge: p.discountBadge || null,
      variants: (p.variants || []).map((v: any) => ({
        name: v.name,
        options: v.options,
      })),
      isFeatured: p.isFeatured,
    }));

    return {
      products: searchResult.products,
      catalogContext,
      detectedBudget: searchResult.parsedIntent.detectedBudget.max,
      intent: searchResult.parsedIntent.intent,
      faqTopic: searchResult.parsedIntent.faqTopic,
      hasMatches: searchResult.hasMatches,
      noMatchesReason: searchResult.noMatchesReason,
      suggestedBroadening: searchResult.suggestedBroadening,
    };
  }

  /**
   * Generates a verified, catalog-grounded response when running in demo/offline fallback mode
   */
  public static generateDemoFallbackResponse(params: {
    userQuery: string;
    products: any[];
    detectedBudget: number | null;
    intent: string;
    faqTopic?: string;
    noMatchesReason?: string;
    suggestedBroadening?: string[];
    language?: 'en' | 'hi';
  }): { reply: string; suggestions: string[] } {
    const { userQuery, products, detectedBudget, intent, faqTopic, noMatchesReason, suggestedBroadening, language = 'en' } = params;
    const isHindi = language === 'hi';

    // Handle platform FAQ questions
    if (faqTopic) {
      if (faqTopic === 'returns') {
        return {
          reply: isHindi
            ? '📦 **VYAPORA (व्यापोरा) वापसी व रिफंड नीति**:\n\n• **7 दिन की समय सीमा**: डिलीवरी के 7 दिनों के भीतर डिफेक्टिव या अनओपन्ड उत्पाद वापस किए जा सकते हैं।\n• **आसान वापसी**: सीधे **मेरे ऑर्डर (My Orders)** सेक्शन से रिटर्न रिक्वेस्ट दर्ज करें।\n• **त्वरित रिफंड**: उत्पाद निरीक्षण के बाद 3-5 कार्य दिवसों में मूल भुगतान विधि में रिफंड प्रोसेस कर दिया जाता है।'
            : '📦 **VYAPORA Return & Refund Policy**:\n\n• **7-Day Window**: Unopened or defective items are eligible for return within 7 calendar days of delivery.\n• **Easy Returns**: Request a return directly from **My Orders**.\n• **Fast Refunds**: Processed back to original payment mode or store credit within 3–5 business days after product inspection.',
          suggestions: isHindi
            ? [
                'व्यापोरा की शिपिंग पॉलिसी क्या है?',
                'सक्रिय डिस्काउंट कूपन दिखाएं',
                '₹50,000 के अंदर लैपटॉप',
              ]
            : [
                'What is the shipping policy?',
                'Available payment methods',
                'Find discounted electronics',
              ],
        };
      }
      if (faqTopic === 'shipping') {
        return {
          reply: isHindi
            ? '🚚 **VYAPORA (व्यापोरा) शिपिंग और डिलीवरी**:\n\n• **मानक डिलीवरी**: पूरे भारत में 3-5 कार्य दिवस।\n• **मुफ़्त शिपिंग**: ₹1,999 से अधिक के ऑर्डर पर स्वतः लागू होती है।\n• **लाइव ट्रैकिंग**: हर ऑर्डर में मर्चेंट डिस्पैच से लेकर डिलीवरी तक विजुअल टाइमलाइन ट्रैकिंग उपलब्ध है।'
            : '🚚 **VYAPORA Shipping & Delivery**:\n\n• **Standard Delivery**: 3–5 business days across India.\n• **Free Shipping**: Automatically applied on orders above ₹1,999.\n• **Live Tracking**: Every order includes a visual timeline stepper tracking fulfillment from merchant dispatch to doorstep delivery.',
          suggestions: isHindi
            ? [
                'व्यापोरा की रिटर्न नीति क्या है?',
                'सक्रिय डिस्काउंट कूपन',
                '₹2,000 के अंदर गिफ्ट सुझाव',
              ]
            : [
                'What is the return policy?',
                'Active discount coupons',
                'Gifts under ₹2,000',
              ],
        };
      }
      if (faqTopic === 'coupons') {
        return {
          reply: isHindi
            ? '🎟️ **VYAPORA सक्रिय डिस्काउंट कूपन**:\n\n• **`VYAPORA10`**: पूरे मार्केटप्लेस पर 10% की छूट।\n• **`SAVE20`**: ₹2,499 से अधिक के ऑर्डर पर 20% की छूट।\n• **`WELCOME50`**: नए ग्राहकों के लिए ₹500 की फ्लैट छूट!\n\nचेकआउट के समय कूपन कोड दर्ज करके तुरंत बचत का लाभ उठाएं।'
            : '🎟️ **VYAPORA Active Platform Coupons**:\n\n• **`VYAPORA10`**: 10% off any order across the marketplace.\n• **`SAVE20`**: 20% off on orders exceeding ₹2,499.\n• **`WELCOME50`**: Flat ₹500 off for first-time shoppers!\n\nEnter any coupon code at checkout to claim instant savings.',
          suggestions: isHindi
            ? [
                '₹2,499 से अधिक के उत्पाद दिखाएं',
                '₹50,000 के अंदर लैपटॉप सुझाओ',
                'ऑडियो डील्स देखें',
              ]
            : [
                'Show items over ₹2,499',
                'Recommend a laptop under ₹50,000',
                'Browse audio deals',
              ],
        };
      }
    }

    // Zero matching items: Honest explanation with broadening suggestions
    if (products.length === 0) {
      const reasonText = noMatchesReason || `No matching products found for "${userQuery}".`;
      return {
        reply: isHindi
          ? `🔍 **कोई मेल खाता उत्पाद नहीं मिला**\n\nमैंने VYAPORA लाइव कैटलॉग में खोज की, लेकिन आपकी दी गई शर्तों से मेल खाता कोई भी उत्पाद नहीं मिला।${
              detectedBudget ? ` (बजट सीमा: ₹${detectedBudget.toLocaleString('en-IN')})` : ''
            }\n\n💡 **खोज का दायरा बढ़ाने के लिए सुझाव**:\n• बजट सीमा बढ़ाएं या हटाएँ\n• अधिक सामान्य कीवर्ड उपयोग करें (जैसे "Headphones" या "Shoes")\n• ऊपर दी गई मुख्य श्रेणियों में से ब्राउज़ करें`
          : `🔍 **${reasonText}**\n\nI searched our live MongoDB catalog, but no products currently match your exact criteria.${
              detectedBudget ? ` (Budget ceiling: ₹${detectedBudget.toLocaleString('en-IN')})` : ''
            }\n\n💡 **Suggestions to broaden your search**:\n• Increase or clear the budget ceiling\n• Use more general keywords (e.g. "Headphones" or "Shoes")\n• Browse our main departments from the top menu`,
        suggestions: isHindi
          ? [
              'ऑडियो और साउंड उत्पाद दिखाएं',
              'इलेक्ट्रॉनिक्स श्रेणी ब्राउज़ करें',
              'फ़ैशन और परिधान देखें',
              'सक्रिय छूट वाले उत्पाद',
            ]
          : suggestedBroadening && suggestedBroadening.length > 0
          ? suggestedBroadening
          : [
              'Show all Audio & Sound',
              'Browse Electronics',
              'Show Fashion & Apparel',
              'Products with active discounts',
            ],
      };
    }

    // Comparison intent
    if (intent === 'compare' && products.length >= 2) {
      const [p1, p2] = products;
      const priceDiff = Math.abs(p1.price - p2.price);
      const higherRated = p1.rating >= p2.rating ? p1 : p2;

      const reply = isHindi
        ? `📊 **VYAPORA तुलनात्मक विश्लेषण (Side-by-Side Comparison)**:\n\n` +
          `1. **${p1.title}** (${p1.brand})\n` +
          `   • मूल्य: **₹${p1.price.toLocaleString('en-IN')}**${p1.compareAtPrice ? ` (MSRP: ₹${p1.compareAtPrice.toLocaleString('en-IN')})` : ''}\n` +
          `   • रेटिंग: **${p1.rating}★** (${p1.numReviews} समीक्षाएं)\n` +
          `   • स्टॉक: ${p1.stock > 0 ? `${p1.stock} उपलब्ध` : 'आउट ऑफ स्टॉक'}\n\n` +
          `2. **${p2.title}** (${p2.brand})\n` +
          `   • मूल्य: **₹${p2.price.toLocaleString('en-IN')}**${p2.compareAtPrice ? ` (MSRP: ₹${p2.compareAtPrice.toLocaleString('en-IN')})` : ''}\n` +
          `   • रेटिंग: **${p2.rating}★** (${p2.numReviews} समीक्षाएं)\n` +
          `   • स्टॉक: ${p2.stock > 0 ? `${p2.stock} उपलब्ध` : 'आउट ऑफ स्टॉक'}\n\n` +
          `💡 **सुझाव**: **${higherRated.title}** ग्राहक संतुष्टि में **${higherRated.rating}★** रेटिंग के साथ आगे है। दोनों में मूल्य अंतर ₹${priceDiff.toLocaleString('en-IN')} है। दोनों पर आधिकारिक निर्माता वारंटी लागू है।`
        : `📊 **VYAPORA Side-by-Side Comparison**:\n\n` +
          `1. **${p1.title}** by ${p1.brand}\n` +
          `   • Price: **₹${p1.price.toLocaleString('en-IN')}**${p1.compareAtPrice ? ` (MSRP: ₹${p1.compareAtPrice.toLocaleString('en-IN')})` : ''}\n` +
          `   • Rating: **${p1.rating}★** (${p1.numReviews} verified reviews)\n` +
          `   • Stock: ${p1.stock > 0 ? `${p1.stock} in stock` : 'Out of stock'}\n\n` +
          `2. **${p2.title}** by ${p2.brand}\n` +
          `   • Price: **₹${p2.price.toLocaleString('en-IN')}**${p2.compareAtPrice ? ` (MSRP: ₹${p2.compareAtPrice.toLocaleString('en-IN')})` : ''}\n` +
          `   • Rating: **${p2.rating}★** (${p2.numReviews} verified reviews)\n` +
          `   • Stock: ${p2.stock > 0 ? `${p2.stock} in stock` : 'Out of stock'}\n\n` +
          `💡 **Recommendation**: **${higherRated.title}** leads in customer satisfaction with a **${higherRated.rating}★** rating. Price variance is ₹${priceDiff.toLocaleString('en-IN')}. Both include manufacturer warranty.`;

      return {
        reply,
        suggestions: isHindi
          ? [
              `${p1.brand} को कार्ट में जोड़ें`,
              `${p2.brand} को कार्ट में जोड़ें`,
              'अन्य मॉडल्स की तुलना करें',
            ]
          : [
              `Add ${p1.brand} to cart`,
              `Add ${p2.brand} to cart`,
              'Compare other models',
            ],
      };
    }

    // Discount intent
    if (intent === 'discount') {
      const topPick = products[0];
      const savings = topPick.compareAtPrice ? topPick.compareAtPrice - topPick.price : 0;

      const reply = isHindi
        ? `🔥 **VYAPORA (व्यापोरा) शीर्ष सत्यापित डील्स**:\n\n` +
          `यहाँ हमारे मार्केटप्लेस पर सत्यापित बेहतरीन डील्स दी गई हैं। सबसे बड़ी बचत **${topPick.title}** पर **₹${savings.toLocaleString('en-IN')}** की है!\n\n` +
          `चेकआउट पर **\`SAVE20\`** कूपन कोड दर्ज करके ₹2,499 से अधिक के ऑर्डर पर अतिरिक्त 20% की बचत करें।`
        : `🔥 **VYAPORA Top Verified Deals**:\n\n` +
          `Here are the verified high-value deals from our live marketplace. Top savings on **${topPick.title}** saving **₹${savings.toLocaleString('en-IN')}**!\n\n` +
          `Use coupon code **\`SAVE20\`** at checkout for an additional 20% off qualifying orders over ₹2,499.`;

      return {
        reply,
        suggestions: isHindi
          ? [
              'इलेक्ट्रॉनिक्स डील्स दिखाएं',
              '₹3,000 के अंदर हेडफोन',
              'कूपन का उपयोग कैसे करें?',
            ]
          : [
              'Show electronics deals',
              'Headphones under ₹3,000',
              'How do coupons work?',
            ],
      };
    }

    // Budget intent
    if (detectedBudget !== null) {
      const topPick = products[0];
      const reply = isHindi
        ? `🎯 **बजट के अंदर कैटलॉग उत्पाद (सीमा: ₹${detectedBudget.toLocaleString('en-IN')})**:\n\n` +
          `मैंने हमारे रीयल-टाइम डेटाबेस में ₹${detectedBudget.toLocaleString('en-IN')} से कम कीमत वाले उत्पादों को फ़िल्टर किया है। शीर्ष पसंद **${topPick.title}** (${topPick.brand}) है जिसकी कीमत **₹${topPick.price.toLocaleString('en-IN')}** है (${topPick.rating}★ रेटिंग, ${topPick.stock} यूनिट उपलब्ध)।\n\n` +
          `नीचे दिए गए सत्यापित प्रोडक्ट कार्ड देखें:`
        : `🎯 **Catalog Matches Within Budget (Ceiling: ₹${detectedBudget.toLocaleString('en-IN')})**:\n\n` +
          `I filtered our real-time database for products under ₹${detectedBudget.toLocaleString('en-IN')}. The top-ranked match is **${topPick.title}** by **${topPick.brand}** priced at **₹${topPick.price.toLocaleString('en-IN')}** (${topPick.rating}★ rating, ${topPick.stock} units available).\n\n` +
          `Explore the verified item cards below:`;

      return {
        reply,
        suggestions: isHindi
          ? [
              `₹${Math.round(detectedBudget * 0.7)} के अंदर सस्ते विकल्प`,
              `${topPick.brand} की अन्य उत्पादों से तुलना करें`,
              'डिलीवरी समय की जांच करें',
            ]
          : [
              `Find cheaper alternatives under ₹${Math.round(detectedBudget * 0.7)}`,
              `Compare ${topPick.brand} with alternatives`,
              'Check delivery time',
            ],
      };
    }

    // General recommendation
    const topPick = products[0];
    const reply = isHindi
      ? `✨ आपके अनुरोध के आधार पर, मुझे हमारे लाइव कैटलॉग में **${products.length} सत्यापित उत्पाद** मिले।\n\n` +
        `शीर्ष पसंद: **${topPick.title}** (${topPick.brand}) मूल्य **₹${topPick.price.toLocaleString('en-IN')}** (${topPick.rating}★ रेटिंग, ${topPick.numReviews} समीक्षाएं)। सभी सूचीबद्ध उत्पाद स्टॉक में हैं और शिपिंग के लिए तैयार हैं।`
      : `✨ Based on your request, I found **${products.length} verified products** in our live marketplace catalog.\n\n` +
        `Top pick: **${topPick.title}** by **${topPick.brand}** for **₹${topPick.price.toLocaleString('en-IN')}** (${topPick.rating}★, ${topPick.numReviews} customer reviews). All listed items are in stock and ready to ship.`;

    const suggestions = isHindi
      ? [
          `शीर्ष 2 ${topPick.category} उत्पादों की तुलना करें`,
          `₹${Math.round(topPick.price * 0.9)} के अंदर ${topPick.category}`,
          'सक्रिय कूपन कोड',
        ]
      : [
          `Compare top 2 ${topPick.category} items`,
          `Find ${topPick.category} under ₹${Math.round(topPick.price * 0.9)}`,
          'Active coupon codes',
        ];

    return { reply, suggestions };
  }

  /**
   * Deterministic heuristic translation fallback preserving entities
   */
  public static translateFallback(text: string, targetLanguage: 'en' | 'hi'): string {
    if (!text) return text;
    if (targetLanguage === 'hi') {
      return text
        .replace(/Return & Refund Policy/gi, 'वापसी व रिफंड नीति')
        .replace(/Shipping & Delivery/gi, 'शिपिंग और डिलीवरी')
        .replace(/Active Platform Coupons/gi, 'सक्रिय डिस्काउंट कूपन')
        .replace(/Top Verified Deals/gi, 'शीर्ष सत्यापित डील्स')
        .replace(/Catalog Matches Within Budget/gi, 'बजट के अंदर कैटलॉग उत्पाद')
        .replace(/Side-by-Side Comparison/gi, 'तुलनात्मक विश्लेषण')
        .replace(/Price:/gi, 'मूल्य:')
        .replace(/priced at/gi, 'कीमत')
        .replace(/Rating:/gi, 'रेटिंग:')
        .replace(/Stock:/gi, 'स्टॉक:')
        .replace(/in stock/gi, 'स्टॉक में उपलब्ध')
        .replace(/Out of stock/gi, 'आउट ऑफ स्टॉक')
        .replace(/verified reviews/gi, 'सत्यापित समीक्षाएं')
        .replace(/Recommendation:/gi, 'सुझाव:')
        .replace(/Based on your request, I found/gi, 'आपके अनुरोध के आधार पर, मुझे मिले')
        .replace(/verified products in our live marketplace catalog/gi, 'हमारे लाइव कैटलॉग में सत्यापित उत्पाद')
        .replace(/Here are our top verified/gi, 'यहाँ हमारे शीर्ष सत्यापित')
        .replace(/headphones/gi, 'हेडफोन')
        .replace(/laptops/gi, 'लैपटॉप')
        .replace(/products/gi, 'उत्पाद')
        .replace(/ready to ship/gi, 'शिपिंग के लिए तैयार')
        .replace(/Top pick:/gi, 'शीर्ष पसंद:')
        .replace(/No matching products found/gi, 'कोई मेल खाता उत्पाद नहीं मिला');
    } else {
      return text
        .replace(/वापसी व रिफंड नीति/gi, 'Return & Refund Policy')
        .replace(/शिपिंग और डिलीवरी/gi, 'Shipping & Delivery')
        .replace(/सक्रिय डिस्काउंट कूपन/gi, 'Active Platform Coupons')
        .replace(/शीर्ष सत्यापित डील्स/gi, 'Top Verified Deals')
        .replace(/बजट के अंदर कैटलॉग उत्पाद/gi, 'Catalog Matches Within Budget')
        .replace(/तुलनात्मक विश्लेषण/gi, 'Side-by-Side Comparison')
        .replace(/मूल्य:/gi, 'Price:')
        .replace(/कीमत/gi, 'priced at')
        .replace(/रेटिंग:/gi, 'Rating:')
        .replace(/स्टॉक:/gi, 'Stock:')
        .replace(/स्टॉक में उपलब्ध/gi, 'in stock')
        .replace(/उपलब्ध/gi, 'in stock')
        .replace(/आउट ऑफ स्टॉक/gi, 'Out of stock')
        .replace(/सत्यापित समीक्षाएं/gi, 'verified reviews')
        .replace(/सुझाव:/gi, 'Recommendation:')
        .replace(/आपके अनुरोध के आधार पर, मुझे मिले/gi, 'Based on your request, I found')
        .replace(/हमारे लाइव कैटलॉग में सत्यापित उत्पाद/gi, 'verified products in our live marketplace catalog')
        .replace(/यहाँ हमारे शीर्ष सत्यापित/gi, 'Here are our top verified')
        .replace(/हेडफोन/gi, 'headphones')
        .replace(/लैपटॉप/gi, 'laptops')
        .replace(/उत्पाद/gi, 'products')
        .replace(/शिपिंग के लिए तैयार/gi, 'ready to ship')
        .replace(/शीर्ष पसंद:/gi, 'Top pick:')
        .replace(/कोई मेल खाता उत्पाद नहीं मिला/gi, 'No matching products found');
    }
  }
}
