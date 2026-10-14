# NEXORA — AI Commerce Cloud: RESTful API Specifications

Base URL: `http://localhost:5000/api`

All successful responses return JSON conforming to:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register customer or merchant | No |
| `POST` | `/api/auth/login` | Authenticate user, set HTTP-only cookie & return JWT | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | No |
| `GET` | `/api/auth/me` | Fetch active user session, store and subscription | Yes |

---

## 2. Catalog & Discovery (`/api/products`, `/api/categories`)

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/products` | Paginated catalog search & filtering | `search`, `category`, `minPrice`, `maxPrice`, `rating`, `inStock`, `sort`, `page`, `limit` |
| `GET` | `/api/products/featured` | Fetch curated flagship, bestsellers & arrivals | None |
| `GET` | `/api/products/:identifier` | Fetch single product by MongoDB ID or slug | None |
| `GET` | `/api/products/:id/related` | Fetch contextual recommendations | None |
| `GET` | `/api/categories` | List all taxonomy categories | None |

---

## 3. Cart & Wishlist (`/api/cart`, `/api/wishlist`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cart` | Get user active cart and recalculate totals | Yes |
| `POST` | `/api/cart/add` | Add product with quantity and variant | Yes |
| `PUT` | `/api/cart/items/:itemId` | Update cart item quantity | Yes |
| `DELETE` | `/api/cart/items/:itemId` | Remove item from cart | Yes |
| `POST` | `/api/cart/coupon` | Apply promo code (`NEXORA10`, `SAVE20`, `WELCOME50`) | Yes |
| `DELETE` | `/api/cart/coupon` | Remove applied coupon | Yes |
| `GET` | `/api/wishlist` | Fetch customer wishlist | Yes |
| `POST` | `/api/wishlist/toggle` | Toggle item in wishlist | Yes |

---

## 4. Order Management (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/orders` | Place order with server stock deduction & validation | Yes |
| `GET` | `/api/orders` | Fetch customer order history | Yes |
| `GET` | `/api/orders/:id` | Fetch order details and visual tracking stepper | Yes |
| `POST` | `/api/orders/:id/cancel` | Cancel order & restore inventory stock | Yes |

---

## 5. Nexora AI Assistant (`/api/ai`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Send prompt to catalog-grounded AI shopping engine |
| `GET` | `/api/ai/history/:sessionId` | Retrieve chat session history |

**Sample AI Chat Request:**
```json
{
  "message": "Find the best headphones under ₹3,000",
  "sessionId": "session-10294"
}
```

---

## 6. Merchant Portal (`/api/sellers`, `/api/stores`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/sellers/apply` | Submit merchant onboarding application | Customer |
| `GET` | `/api/sellers/analytics` | Fetch merchant sales, AOV & timeline chart | Seller / Admin |
| `GET` | `/api/sellers/products` | List seller products | Seller / Admin |
| `POST` | `/api/sellers/products` | Create product (enforces SaaS plan limit) | Seller / Admin |
| `PUT` | `/api/sellers/products/:id` | Update product details | Seller / Admin |
| `DELETE` | `/api/sellers/products/:id` | Delete product and decrement usage | Seller / Admin |
| `GET` | `/api/sellers/orders` | Fetch orders containing seller items | Seller / Admin |
| `PATCH` | `/api/sellers/orders/:orderId/status` | Update fulfillment stage | Seller / Admin |
| `PUT` | `/api/stores/customization` | Update brand accent color, banner, logo | Seller / Admin |

---

## 7. SaaS Subscriptions (`/api/subscriptions`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/subscriptions/plans` | Fetch available subscription tiers | None |
| `GET` | `/api/subscriptions/my` | Get current active merchant subscription | Seller / Admin |
| `POST` | `/api/subscriptions/upgrade` | Upgrade or downgrade plan (demo simulation) | Seller / Admin |
| `POST` | `/api/subscriptions/cancel` | Toggle auto-renewal state | Seller / Admin |

---

## 8. Platform Administration (`/api/admin`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/admin/analytics` | Fetch platform GMV, order volume, metrics | Admin |
| `GET` | `/api/admin/users` | List platform users with role filtering | Admin |
| `PATCH` | `/api/admin/users/:id/suspend` | Toggle user suspension state | Admin |
| `GET` | `/api/admin/seller-applications` | List pending merchant applications | Admin |
| `POST` | `/api/admin/seller-applications/:id/review` | Approve/reject seller application | Admin |
| `GET` | `/api/admin/products` | Platform-wide product moderation queue | Admin |
| `PATCH` | `/api/admin/products/:id/publish` | Toggle live publishing of product | Admin |
| `DELETE` | `/api/admin/products/:id` | Remove flagged product | Admin |
| `GET` | `/api/admin/audit-logs` | Retrieve administrative audit trail | Admin |

---

## 9. Google Gemini AI Engine & Token Accounting (`/api/ai`)

Powered by Google's official Gen AI SDK (`@google/genai` v2.29.1) with MongoDB catalog grounding.

| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Submit user shopping query, grounds in live MongoDB catalog, generates response via Gemini (or fallback), and audits token usage | Public / Optional Auth (Enforces Quotas) |
| `GET` | `/api/ai/conversations` | List conversation sessions owned by the authenticated user | Authenticated |
| `GET` | `/api/ai/conversations/:id` | Retrieve conversation history (Ownership enforced) | Public (guest) / Owner |
| `DELETE` | `/api/ai/conversations/:id` | Delete conversation history (Ownership enforced) | Owner / Admin |
| `GET` | `/api/ai/usage` | Retrieve token accounting & quota remaining (platform-wide for admin, personal for user) | Authenticated |
| `GET` | `/api/ai/status` | Retrieve sanitized Gemini SDK connection status (No secret key exposed) | Public |
| `POST` | `/api/ai/verify` | Execute authentic lightweight verification ping to Gemini API | Admin Only |
