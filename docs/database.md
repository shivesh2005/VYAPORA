# NEXORA — AI Commerce Cloud: Database Design & Schema Specifications

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Store : "owns (seller)"
    User ||--o{ Address : "has"
    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"
    User ||--o| Cart : "maintains"
    User ||--o| Wishlist : "maintains"
    User ||--o| Subscription : "subscribes"
    User ||--o{ SellerApplication : "submits"
    User ||--o{ AuditLog : "initiates (admin)"

    Store ||--o{ Product : "lists"
    Store ||--o{ Order : "receives"

    Category ||--o{ Product : "categorizes"
    SubscriptionPlan ||--o{ Subscription : "defines limits for"

    Product ||--o{ Review : "receives"
    Order ||--|{ OrderItem : "contains"
    Cart ||--|{ CartItem : "holds"

    User {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role
        string avatar
        boolean isSuspended
        Date createdAt
    }

    Store {
        ObjectId _id PK
        ObjectId sellerId FK
        string storeName
        string slug UK
        string brandAccentColor
        string logoUrl
        string bannerUrl
        number totalSales
    }

    Product {
        ObjectId _id PK
        ObjectId sellerId FK
        ObjectId storeId FK
        string title
        string slug UK
        number price
        number compareAtPrice
        string sku UK
        number stock
        number rating
        number numReviews
        boolean isPublished
    }

    Order {
        ObjectId _id PK
        string orderNumber UK
        ObjectId customerId FK
        string orderStatus
        string paymentStatus
        string paymentMethod
        number subtotal
        number discount
        number totalAmount
        string trackingNumber
    }

    SubscriptionPlan {
        ObjectId _id PK
        string name UK
        string slug UK
        number price
        object limits
    }

    Subscription {
        ObjectId _id PK
        ObjectId sellerId FK
        ObjectId planId FK
        string status
        object usage
        Date currentPeriodEnd
    }
```

---

## 2. Model Specifications & Index Strategy

### 1. `User` Collection
- **Indexes**:
  - `{ email: 1 }` (Unique)
  - `{ role: 1 }`

### 2. `Store` Collection
- **Indexes**:
  - `{ sellerId: 1 }` (Unique)
  - `{ slug: 1 }` (Unique)

### 3. `Product` Collection
- **Compound Indexes**:
  - `{ isPublished: 1, category: 1, price: 1, rating: -1 }`
  - `{ title: "text", description: "text", brand: "text", tags: "text" }`
  - `{ sku: 1 }` (Unique)
  - `{ slug: 1 }` (Unique)

### 4. `Order` Collection
- **Indexes**:
  - `{ orderNumber: 1 }` (Unique)
  - `{ customerId: 1, createdAt: -1 }`
  - `{ sellerIds: 1, createdAt: -1 }`
  - `{ orderStatus: 1 }`

### 5. `Review` Collection
- **Indexes**:
  - `{ productId: 1, customerId: 1 }` (Unique compound index to ensure one review per user per product)

### 6. `SubscriptionPlan` & `Subscription` Collections
- Enforces multi-tenant resource limits: `maxProducts`, `maxMonthlyAiRequests`, and entitlement toggles (`advancedAnalytics`, `customStoreBranding`).

### 7. `Coupon` Collection
- **Indexes**:
  - `{ code: 1 }` (Unique)
- Auto-validation against `minOrderValue`, `expiresAt`, and `usageLimit`.

### 8. `AIUsage` Collection (Audited Token Accounting)
- **Indexes**:
  - `{ userId: 1, createdAt: -1 }` (Compound index for monthly quota aggregation)
  - `{ createdAt: -1 }` (Platform telemetry sorting)
  - `{ model: 1, requestStatus: 1 }`
- **Fields**: `userId`, `accountId`, `conversationId`, `model`, `inputTokens`, `outputTokens`, `totalTokens`, `cachedTokens`, `requestStatus`, `estimatedCost`, `mode`.
