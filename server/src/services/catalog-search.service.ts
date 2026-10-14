import { Product, IProduct } from '../models/Product';

export interface ISearchFilterParams {
  query?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
  skip?: number;
  sort?: string;
}

export interface IParsedSearchIntent {
  normalizedQuery: string;
  detectedBudget: { min: number | null; max: number | null };
  detectedCategory: string | null;
  detectedBrand: string | null;
  detectedAttributes: {
    color?: string;
    variant?: string;
  };
  intent: 'search' | 'compare' | 'discount' | 'recommend' | 'platform_faq';
  faqTopic?: string;
  comparisonTerms?: string[];
  searchTokens: string[];
}

export interface ICatalogSearchResult {
  products: any[];
  totalMatches: number;
  parsedIntent: IParsedSearchIntent;
  hasMatches: boolean;
  noMatchesReason?: string;
  suggestedBroadening?: string[];
  appliedConstraints: {
    budget: { min: number | null; max: number | null };
    category: string | null;
    brand: string | null;
    relevanceThreshold: number;
  };
}

export class CatalogSearchService {
  private static readonly STOP_WORDS = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'with', 'by',
    'show', 'me', 'find', 'get', 'give', 'i', 'want', 'need', 'looking', 'please',
    'some', 'any', 'all', 'is', 'are', 'what', 'which', 'who', 'under', 'below', 'less',
    'than', 'above', 'over', 'around', 'about', 'within', 'upto', 'up', 'budget', 'price',
    'rs', 'inr', 'rupees', 'rupee', 'k', 'cheapest', 'cheap', 'best'
  ]);

  private static readonly CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Audio & Sound': [
      'headphone', 'headphones', 'earphone', 'earphones', 'earbud', 'earbuds',
      'anc', 'tws', 'soundbar', 'speaker', 'speakers', 'audio', 'mic', 'microphone', 'sound'
    ],
    'Electronics': [
      'laptop', 'laptops', 'notebook', 'macbook', 'computer', 'pc', 'smartwatch', 'watch',
      'watches', 'tablet', 'monitor', 'monitors', 'keyboard', 'keyboards', 'mouse', 'powerbank',
      'charger', 'cable', 'electronics', 'gadget', 'screen', 'tech'
    ],
    'Fashion & Apparel': [
      'shoe', 'shoes', 'sneaker', 'sneakers', 'runner', 'runners', 'running shoes', 'boots',
      'footwear', 'shirt', 'shirts', 't-shirt', 'tee', 'hoodie', 'jacket', 'jackets',
      'jeans', 'pants', 'trousers', 'backpack', 'backpacks', 'bag', 'bags', 'apparel', 'fashion', 'clothing'
    ],
    'Smart Living': [
      'chair', 'chairs', 'desk', 'desks', 'furniture', 'lamp', 'lamps', 'light', 'diffuser',
      'organizer', 'home', 'living', 'decor', 'bottle', 'flask', 'ergonomic'
    ],
    'Accessories & Bags': [
      'backpack', 'backpacks', 'bag', 'bags', 'pouch', 'wallet', 'case', 'sleeve', 'travel'
    ],
    'Home & Workspace': [
      'desk mat', 'mount', 'lamp', 'organizer', 'stand', 'workspace', 'office'
    ],
  };

  private static readonly KNOWN_BRANDS = [
    'vanguard', 'sonicpulse', 'zenith', 'aerofit', 'artisan', 'lumina', 'hyperion',
    'nomad', 'hp', 'apple', 'samsung', 'sony', 'dell', 'lenovo', 'asus', 'boat',
    'noise', 'nike', 'adidas', 'puma', 'reebok'
  ];

  private static readonly KNOWN_COLORS = [
    'black', 'white', 'silver', 'matte black', 'grey', 'gray', 'navy', 'blue',
    'green', 'red', 'gold', 'space gray', 'starlight'
  ];

  /**
   * 1. Validate, normalize and parse user search intent
   */
  public static parseSearchIntent(rawQuery: string): IParsedSearchIntent {
    const normalized = (rawQuery || '').toLowerCase().trim();

    // 1. Detect FAQ topics
    let faqTopic: string | undefined;
    if (
      normalized.includes('return') ||
      normalized.includes('refund') ||
      normalized.includes('shipping') ||
      normalized.includes('delivery') ||
      normalized.includes('payment') ||
      normalized.includes('cod') ||
      normalized.includes('coupon') ||
      normalized.includes('discount code') ||
      normalized.includes('seller') ||
      normalized.includes('warranty')
    ) {
      if (normalized.includes('return') || normalized.includes('refund')) faqTopic = 'returns';
      else if (normalized.includes('shipping') || normalized.includes('delivery')) faqTopic = 'shipping';
      else if (normalized.includes('payment') || normalized.includes('cod')) faqTopic = 'payments';
      else if (normalized.includes('coupon') || normalized.includes('discount code')) faqTopic = 'coupons';
      else if (normalized.includes('seller') || normalized.includes('merchant')) faqTopic = 'sellers';
      else if (normalized.includes('warranty')) faqTopic = 'warranty';
    }

    // 2. Detect budget
    let minBudget: number | null = null;
    let maxBudget: number | null = null;

    // Pattern for "between X and Y"
    const rangeMatch = normalized.match(/between\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/i);
    if (rangeMatch) {
      minBudget = parseInt(rangeMatch[1].replace(/,/g, ''), 10);
      maxBudget = parseInt(rangeMatch[2].replace(/,/g, ''), 10);
    } else {
      // Pattern for "under 2000", "below 50000", "less than 1500"
      const maxMatch = normalized.match(/(?:under|below|less than|within|around|upto|up to|max(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/i);
      if (maxMatch) {
        maxBudget = parseInt(maxMatch[1].replace(/,/g, ''), 10);
      }
      // Pattern for "above 1000", "min 2000"
      const minMatch = normalized.match(/(?:above|more than|over|greater than|min(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)?)/i);
      if (minMatch) {
        minBudget = parseInt(minMatch[1].replace(/,/g, ''), 10);
      }
    }

    // 3. Detect Category
    let detectedCategory: string | null = null;
    for (const [catName, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(normalized)) {
          detectedCategory = catName;
          break;
        }
      }
      if (detectedCategory) break;
    }

    // 4. Detect Brand
    let detectedBrand: string | null = null;
    for (const brand of this.KNOWN_BRANDS) {
      if (
        brand === 'noise' &&
        (normalized.includes('noise cancel') ||
          normalized.includes('noise-cancel') ||
          normalized.includes('noise isolation') ||
          normalized.includes('noise reduc'))
      ) {
        continue;
      }
      const regex = new RegExp(`\\b${brand}\\b`, 'i');
      if (regex.test(normalized)) {
        detectedBrand = brand;
        break;
      }
    }

    // 5. Detect Colors / Attributes
    let detectedColor: string | undefined;
    for (const color of this.KNOWN_COLORS) {
      const regex = new RegExp(`\\b${color}\\b`, 'i');
      if (regex.test(normalized)) {
        detectedColor = color;
        break;
      }
    }

    // 6. Detect Comparison
    const isComparison =
      normalized.includes('compare') ||
      normalized.includes(' versus ') ||
      normalized.includes(' vs ') ||
      normalized.includes('difference between');

    let comparisonTerms: string[] | undefined;
    if (isComparison) {
      const vsMatch = normalized.split(/\s+(?:vs\.?|versus|and)\s+/i);
      if (vsMatch.length >= 2) {
        comparisonTerms = vsMatch.map((s) => s.replace(/compare|difference between/gi, '').trim()).filter(Boolean);
      }
    }

    // 7. Detect Intent
    const isDiscount =
      normalized.includes('discount') ||
      normalized.includes('deal') ||
      normalized.includes('offer') ||
      normalized.includes('sale') ||
      normalized.includes('coupon');

    const isRecommend =
      normalized.includes('best') ||
      normalized.includes('recommend') ||
      normalized.includes('suggest') ||
      normalized.includes('top ') ||
      normalized.includes('gift');

    const intent = isComparison
      ? 'compare'
      : isDiscount
      ? 'discount'
      : faqTopic
      ? 'platform_faq'
      : isRecommend
      ? 'recommend'
      : 'search';

    // 8. Extract meaningful tokens
    const tokens = normalized
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !this.STOP_WORDS.has(t));

    return {
      normalizedQuery: normalized,
      detectedBudget: { min: minBudget, max: maxBudget },
      detectedCategory,
      detectedBrand,
      detectedAttributes: {
        color: detectedColor,
      },
      intent,
      faqTopic,
      comparisonTerms,
      searchTokens: tokens,
    };
  }

  /**
   * Search real MongoDB catalog strictly adhering to hard constraints and relevance thresholds.
   * NEVER returns random or unrelated items when search yields no matches.
   */
  public static async executeSearch(params: ISearchFilterParams): Promise<ICatalogSearchResult> {
    const rawQuery = params.query || '';
    const parsed = this.parseSearchIntent(rawQuery);

    // Build base MongoDB query with hard constraints
    const mongoQuery: any = { isPublished: true };

    // Hard Constraint: Availability
    if (params.inStockOnly) {
      mongoQuery.stock = { $gt: 0 };
    }

    // Hard Constraint: Category (prefer explicit filter param, then detected category)
    const effectiveCategory = params.category && params.category !== 'All' ? params.category : parsed.detectedCategory;
    if (effectiveCategory) {
      mongoQuery.category = new RegExp(`^${effectiveCategory}$`, 'i');
    }

    // Hard Constraint: Subcategory
    if (params.subcategory) {
      mongoQuery.subcategory = new RegExp(`^${params.subcategory}$`, 'i');
    }

    // Hard Constraint: Brand
    const effectiveBrand = params.brand ? params.brand : parsed.detectedBrand;
    if (effectiveBrand) {
      mongoQuery.brand = new RegExp(`^${effectiveBrand}$`, 'i');
    }

    // Hard Constraint: Budget (combine explicit filter and query-detected budget)
    const minPrice = params.minPrice !== undefined ? params.minPrice : parsed.detectedBudget.min;
    const maxPrice = params.maxPrice !== undefined ? params.maxPrice : parsed.detectedBudget.max;

    if (minPrice !== null && minPrice !== undefined) {
      mongoQuery.price = mongoQuery.price || {};
      mongoQuery.price.$gte = Number(minPrice);
    }
    if (maxPrice !== null && maxPrice !== undefined) {
      mongoQuery.price = mongoQuery.price || {};
      mongoQuery.price.$lte = Number(maxPrice);
    }

    // Fetch candidate products matching all hard constraints from MongoDB
    const candidates = await Product.find(mongoQuery)
      .populate('storeId', 'storeName slug brandAccentColor')
      .lean();

    // If comparing specific products, perform targeted lookup
    if (parsed.intent === 'compare' && parsed.comparisonTerms && parsed.comparisonTerms.length >= 2) {
      const compared = candidates.filter((p) => {
        const text = `${p.title} ${p.brand} ${p.slug}`.toLowerCase();
        return parsed.comparisonTerms!.some((term) => term.length > 2 && text.includes(term));
      });

      if (compared.length > 0) {
        return {
          products: compared.slice(0, 4),
          totalMatches: compared.length,
          parsedIntent: parsed,
          hasMatches: true,
          appliedConstraints: {
            budget: { min: minPrice ?? null, max: maxPrice ?? null },
            category: effectiveCategory ?? null,
            brand: effectiveBrand ?? null,
            relevanceThreshold: 1,
          },
        };
      }
    }

    // Score candidates based on query relevance
    const tokens = parsed.searchTokens;
    const colorAttr = parsed.detectedAttributes.color;

    const scored = candidates.map((p) => {
      let score = 0;
      const titleLower = p.title.toLowerCase();
      const brandLower = p.brand.toLowerCase();
      const catLower = p.category.toLowerCase();
      const subLower = (p.subcategory || '').toLowerCase();
      const descLower = p.description.toLowerCase();
      const tagsText = (p.tags || []).join(' ').toLowerCase();
      const variantText = (p.variants || [])
        .map((v: any) => `${v.name} ${(v.options || []).join(' ')}`)
        .join(' ')
        .toLowerCase();

      // Check full phrase match
      if (rawQuery.length > 3 && titleLower.includes(rawQuery.toLowerCase())) {
        score += 25;
      }

      // Check token matches
      for (const token of tokens) {
        if (titleLower.includes(token)) score += 10;
        else if (brandLower.includes(token)) score += 8;
        else if (catLower.includes(token) || subLower.includes(token)) score += 6;
        else if (tagsText.includes(token)) score += 5;
        else if (variantText.includes(token)) score += 4;
        else if (descLower.includes(token)) score += 2;
      }

      // Attribute match (e.g. "black" running shoes)
      if (colorAttr) {
        if (variantText.includes(colorAttr) || titleLower.includes(colorAttr) || tagsText.includes(colorAttr)) {
          score += 8;
        } else {
          // If color was explicitly requested and this item clearly does not match, penalize
          score -= 4;
        }
      }

      // Quality bonuses
      if (p.rating >= 4.5) score += 1;
      if (p.isFeatured) score += 1;
      if (p.stock > 0) score += 2;

      return { product: p, score };
    });

    // Determine relevance threshold
    // If user provided specific search tokens, reject products with 0 or negligible match score
    const RELEVANCE_THRESHOLD = tokens.length > 0 ? 5 : 0;

    let matchingItems = scored
      .filter((item) => item.score >= RELEVANCE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    // Sort handling
    if (params.sort === 'price_asc') {
      matchingItems.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      matchingItems.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'rating') {
      matchingItems.sort((a, b) => b.rating - a.rating);
    } else if (params.sort === 'newest') {
      matchingItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (params.sort === 'discount' || parsed.intent === 'discount') {
      matchingItems = matchingItems
        .filter((p) => (p.compareAtPrice && p.compareAtPrice > p.price) || (p.discountBadge && p.discountBadge.length > 0))
        .sort((a, b) => {
          const discA = a.compareAtPrice ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
          const discB = b.compareAtPrice ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
          return discB - discA;
        });
    }

    const limitNum = params.limit || 12;
    const skipNum = params.skip || 0;
    const totalMatches = matchingItems.length;
    const paginatedProducts = matchingItems.slice(skipNum, skipNum + limitNum);

    if (totalMatches === 0) {
      // Construct an informative, honest reason without returning fake or unrelated items!
      let reason = 'No matching products found matching your exact criteria.';
      const broadening: string[] = [];

      if (maxPrice !== null && maxPrice !== undefined && effectiveCategory) {
        reason = `No ${effectiveCategory} products found under ₹${maxPrice.toLocaleString('en-IN')}.`;
        broadening.push(`Increase your budget above ₹${maxPrice.toLocaleString('en-IN')}`);
        broadening.push(`Browse all available products in ${effectiveCategory}`);
      } else if (maxPrice !== null && maxPrice !== undefined) {
        reason = `No products found within the budget of ₹${maxPrice.toLocaleString('en-IN')}.`;
        broadening.push('Try removing the budget constraint');
      } else if (effectiveCategory) {
        reason = `No products currently available in category "${effectiveCategory}".`;
        broadening.push('Browse our other product categories');
      }

      broadening.push('Try using broader search terms (e.g. "wireless" or "running")');

      return {
        products: [],
        totalMatches: 0,
        parsedIntent: parsed,
        hasMatches: false,
        noMatchesReason: reason,
        suggestedBroadening: broadening,
        appliedConstraints: {
          budget: { min: minPrice ?? null, max: maxPrice ?? null },
          category: effectiveCategory ?? null,
          brand: effectiveBrand ?? null,
          relevanceThreshold: RELEVANCE_THRESHOLD,
        },
      };
    }

    return {
      products: paginatedProducts,
      totalMatches,
      parsedIntent: parsed,
      hasMatches: true,
      appliedConstraints: {
        budget: { min: minPrice ?? null, max: maxPrice ?? null },
        category: effectiveCategory ?? null,
        brand: effectiveBrand ?? null,
        relevanceThreshold: RELEVANCE_THRESHOLD,
      },
    };
  }
}
