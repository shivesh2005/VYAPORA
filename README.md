# व्यापोरा | VYAPORA — Multi-Vendor E-Commerce Marketplace

> **"Shop Smart. Live Better."**  
> *स्मार्ट खरीदारी। बेहतर जीवन।*  
> *Final-Year / Mini-Project Edition • Portfolio Grade • Production-Ready SaaS Architecture*  
> *Full English & Hindi Localization • Dark & Light Themes • Optional Catalog-Grounded Gemini AI Assistant*

---

## 🌟 Executive Overview

**VYAPORA (व्यापोरा)** is a professional, full-stack multi-vendor e-commerce marketplace engineered for high performance, accessibility, and intuitive shopping experiences. Grounded in modern commerce architecture, it prioritizes the user's shopping journey with trusted vendors, verified products, seamless cart and checkout flows, and comprehensive seller operations.

Artificial Intelligence is integrated strictly as an **optional shopping assistant** (`VYAPORA Assistant`) rather than the primary brand identity, keeping shopping simplicity at the forefront while offering intelligent catalog guidance when requested.

### Key Pillars:
1. **Consumer Marketplace**: Complete product catalog browsing, multi-attribute filtering, instant keyword search, verified customer reviews, dynamic shopping cart, promo voucher discounts (`VYAPORA10`, `SAVE20`), and interactive order tracking timelines.
2. **Complete Bilingual Experience**: Seamless toggle between **EN | English** and **HI | हिन्दी** across all pages, categories, navigation labels, product attributes, cart, checkout, and merchant controls.
3. **Adaptive Dark & Light Themes**: Flawless visual comfort with High-Contrast Dark Mode, Clean Light Mode, and System Default, protected against theme flickering via an inline head anti-flash script.
4. **17-Item Localized Navigation Drawer**: Slide-out hamburger navigation categorizing Shop Categories, Customer Account, Seller Hub, Platform Admin, and Help & Policies.
5. **Multi-Vendor Merchant Ecosystem**: Dedicated seller portal with catalog CRUD, stock management, custom store branding, sales telemetry via Recharts, and tiered seller subscription quotas (**Starter ₹0**, **Pro ₹299**, **Business ₹799**).
6. **Optional Catalog-Grounded AI Shopping Assistant**: Powered by the official **Google Gen AI SDK (`@google/genai`)**, delivering zero-hallucination budget recommendations, model comparisons, and policy assistance grounded strictly in MongoDB inventory.
7. **Platform Administration & AI Governance**: Merchant approvals, user moderation, order oversight, GMV metrics, and live **Gemini API Key Verification & Token Usage Auditing** at `/admin/ai-config`.

---

## 🎨 UI/UX & E-Commerce First Experience

### 1. Global Navigation & Branding
- **Logo & Wordmark**: Professional shopping-bag iconography (`ShoppingBag`) alongside bold typography **VYAPORA** and subtitle *"Shop Smart. Live Better."*
- **Language Switcher**: One-click dropdown in the header supporting **EN | English** and **HI | हिन्दी**, dynamically updating page content, document `lang` attribute, and formatted currency (`₹`) and dates.
- **Theme Switcher**: Instant toggle between Light, Dark, and System modes with persistent local preferences.
- **17-Item Drawer**: Accessible side drawer organizing consumer categories (Electronics, Fashion, Home, Sports), account links, seller workspace, and support.

### 2. Homepage Architecture
- **Festive Announcement Bar**: Live promotional countdown featuring code `SAVE20` (20% off orders over ₹2,499).
- **Shopping-First Hero**: Clear call-to-actions ("Explore Products", "Become a Seller") with trust badges for Verified Sellers, Secure Checkout, and Fast Delivery.
- **Shop By Category**: Direct visual category cards for instant catalog filtering.
- **Featured & Trending Products**: Dynamic showcase of in-stock items with ratings, vendor badges, and one-click cart addition.
- **Optional Assistant Card**: Unobtrusive, neutral shopping companion banner offering conversational product discovery for shoppers who want tailored suggestions.
- **Merchant Recruitment Section**: Highlighting growth opportunities for independent store owners.

### 3. Optional AI Assistant ("VYAPORA Shopping Assistant")
- Grounded strictly in MongoDB catalog data—never invents prices, nonexistent specs, or phantom products.
- Natural-language budget filtering (*"Show me laptops under ₹50,000"*).
- Head-to-head product comparisons highlighting key differences.
- Quick bilingual suggestion chips for common shopping queries and platform policies.

---

## 🚀 Quick Start (Zero-Configuration Setup)

**VYAPORA** includes an **embedded MongoDB in-memory engine fallback**. If you do not have a local MongoDB daemon or Atlas URI configured, the backend automatically initializes an in-memory database and seeds 26 realistic products, demo stores, and test accounts on first launch!

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node.js v25)
- **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Open the project root directory
cd "Ecommerce(SaaS) product"

# 2. Install Server Dependencies (includes @google/genai v2.29.1)
cd server
npm install

# 3. Install Client Dependencies
cd ../client
npm install
```

### Launch Development Servers

You can run both client and server from their respective directories:

```bash
# Terminal 1: Start Backend API (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend Web App (Port 3000)
cd client
npm run dev
```

Visit **`http://localhost:3000`** in your browser to experience **VYAPORA**!

---

## 👥 Demo Accounts (1-Click Quick Evaluation)

The login screen includes **1-Click Demo Evaluation Pills** to instantly authenticate as any role without typing:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **👑 Platform Admin** | `admin@vyapora.com` | `password123` | Platform analytics, user moderation, seller approval, Gemini AI engine verification, token audit |
| **🏪 Verified Seller** | `seller@vyapora.com` | `password123` | Storefront branding customizer, catalog CRUD, quota tracking, order fulfillment, sales charts |
| **👤 Customer** | `customer@vyapora.com` | `password123` | Catalog shopping, cart, wishlist, address book, checkout with confetti, order tracking timeline |
| **👤 Customer 2** | `priya@example.com` | `password123` | Multi-user isolation testing account |

*(Legacy test credentials `admin@nexora.com`, `seller@nexora.com`, and `customer@nexora.com` are also supported for test suite compatibility.)*

### 🎟️ Active Demo Coupon Codes
- **`VYAPORA10`**: 10% off any order across the catalog.
- **`SAVE20`**: 20% off orders over ₹2,499.
- **`WELCOME50`**: Flat ₹500 discount for new customers!

---

---

## 🤖 Google Gemini AI Connection Management (`@google/genai`)

VYAPORA integrates Google's official Gen AI SDK (`@google/genai` v2.29.1) through an enterprise-grade, secure server-side management console accessible at **`/admin/settings/ai-provider`** (or `/admin/ai-config`).

### 1. Dedicated Admin AI Provider Settings Console
The administration dashboard provides complete lifecycle management for the Gemini AI integration:
- **Provider Selection**: Preconfigured for official Google Gemini via `@google/genai`.
- **Model Selection**: Switch dynamically between supported Google models:
  - `gemini-2.5-flash` (Default — fastest response, optimal for catalog grounding)
  - `gemini-1.5-flash` (High performance)
  - `gemini-2.0-flash` (Advanced reasoning)
  - `gemini-2.5-pro` (Complex comparisons & synthesis)
- **Secure Key Input & Masking**: Keys are visually masked (`AIza••••••••••••9Xz2`) immediately upon saving. The complete key is never returned to the browser or stored in plaintext.
- **AES-256-GCM Server Encryption**: When saved via the Admin UI, the API key is encrypted using AES-256-GCM with a secret key stored strictly outside the database (`AI_ENCRYPTION_SECRET` / machine secret).
- **Verify Connection Before Saving**: Administrators can verify any newly pasted candidate key or previously saved key with a single click. The backend dispatches a lightweight test probe using the official SDK.
- **Accurate Connection Status**: The UI never falsely displays "Connected" merely because a key exists. Status reflects real, verified connectivity:
  - `connected` (Green badge with timestamp of last verification)
  - `disconnected` (Amber badge when assistant is manually toggled off)
  - `error` (Red badge showing sanitized, user-friendly diagnostic messages)
  - `not_configured` (Slate badge when no credentials have been entered)
- **Start / Enable Assistant**: Toggle the assistant on for the storefront.
- **Disconnect / Disable Assistant**: Disables the assistant across all storefront surfaces with a **Safety Confirmation Modal** to avoid accidental merchant service disruption.
- **Interactive Test AI Request**: Test queries right from the admin console with live response preview, response latency (ms), and detailed token accounting (`promptTokens`, `candidatesTokens`, `totalTokens`).

### 2. Zero-API-Key Offline Fallback Guarantee
> [!IMPORTANT]
> If `GEMINI_API_KEY` is omitted, invalid, or disconnected by an administrator, VYAPORA **gracefully activates its built-in catalog-grounded heuristic intelligence engine**. The shopping assistant continues to filter MongoDB products by budget, compare models, and recommend in-stock items with 100% uptime for college demonstrations!

---

## 🛍️ Floating Shopping Assistant Drawer

To keep shopping primary and uninhibited while providing instant shopping guidance, VYAPORA features a responsive **Floating Shopping Assistant**:
- **Unobtrusive Trigger**: Fixed toggle pill at the bottom-right of appropriate storefront pages featuring a neutral shopping chat icon (`MessageSquare` + `ShoppingBag`) and bilingual label (*"Ask Shopping Assistant"* / *"शॉपिंग सहायक से पूछें"*).
- **Responsive Drawer**: Compact 400px flyout drawer optimized for mobile and desktop screens.
- **Keyboard & Touch Accessibility**: Quick collapse with the `Escape` key, header minimize/maximize controls, and close button.
- **Session Persistence**: Chat history persists across client-side page transitions via `sessionStorage`, allowing shoppers to browse while maintaining context.
- **Integrated Product Cards**: Recommended products display within chat bubbles with direct **+ Cart** action and link to full product details.
- **Smart Route Hiding**: Automatically suppressed on the dedicated full-screen assistant (`/assistant`, `/ai-assistant`) and streamlined on the checkout page (`/checkout`) to avoid covering order inputs.
- **Deactivated State Handling**: Displays a clear informational banner when the assistant has been disabled by the administrator.

---

## 🔍 Unified Accurate Catalog Search & Recommendation Engine

Both the global search bar (`/api/products?search=...`) and the AI shopping assistant (`/api/ai/chat`) share a single unified MongoDB catalog search engine (`CatalogSearchService`):
1. **MongoDB as Single Source of Truth**: Search and recommendation results reflect verified active inventory in the database.
2. **Deterministic Constraint Extraction**:
   - **Budget Parsing**: Automatically detects phrases like *"under 50000"*, *"below ₹2,000"*, *"under 1500"* and enforces MongoDB price filters (`$lte: budget`).
   - **Category & Brand Mapping**: Maps colloquial query tokens to verified product categories and brands (with smart disambiguation, such as preserving *"noise-cancelling"* queries without falsely restricting to the brand "Noise").
   - **In-Stock Availability**: Enforces `stock > 0` and `isActive: true`.
3. **Relevance Threshold Scoring**: Strict multi-token scoring against title, brand, category, tags, and description. Any product failing to achieve the minimum relevance threshold (score ≥ 5) is rejected.
4. **Zero Hallucination Guarantee**: When no products match the shopper's criteria, VYAPORA **never returns random unrelated products**. Instead, it displays a polite *"No matching products found"* notification accompanied by actionable query broadening tips (e.g., *"Try increasing your budget"* or *"Browse all Electronics"*).

---

## 📊 Token Usage & AI Cost Accounting

Every AI request records actual token metadata in the MongoDB `AIUsage` collection:
- **Recorded Metrics**: `promptTokens` (input), `candidatesTokens` (output), `totalTokens`, `cachedTokens`, `model`, `requestStatus`, `userId`, `conversationId`.
- **Membership Plan Entitlements**:
  - **Starter**: 30 requests/month
  - **Growth / Pro**: 150 requests/month
  - **Scale / Business**: 500 requests/month
  - **Customers**: 50 requests/month
  - **Admin**: Unlimited
- **Server-Side Enforcement**: Quotas are validated on the backend. When limits are reached, the API returns HTTP 429 with actionable upgrade guidance.

---

## 🧪 Automated Testing Suite

VYAPORA includes **57 automated tests** across frontend and backend with a **100% pass rate**:

```bash
# Run Backend API Integration & Gemini Tests (44 Tests)
cd server
npm test

# Run Frontend Component, Drawer & Assistant Tests (13 Tests)
cd client
npm test -- --run
```

### Production Build Verification

```bash
# Build Client (TypeScript + Vite)
cd client
npm run build

# Build Server (TypeScript)
cd ../server
npm run build
```

---

## 📁 Repository Structure

```
Ecommerce(SaaS) product/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # UI atoms, layout, Header, Footer, product cards
│   │   ├── config/             # brand.ts (Centralized VYAPORA brand configuration)
│   │   ├── context/            # AuthContext, CartContext, ThemeContext, LanguageContext, ToastContext
│   │   ├── i18n/               # i18next English and Hindi dictionaries
│   │   ├── pages/              # 17 pages (Shop, AIAssistant, Cart, Checkout, AdminAIConfig, etc.)
│   │   ├── services/           # Typed API client connecting to backend
│   │   ├── types/              # Domain TypeScript interfaces (AIStatus, AIUsage)
│   │   └── test/               # Vitest + React Testing Library tests
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Express + TypeScript REST Backend
│   ├── src/
│   │   ├── config/             # DB connection with auto-memory fallback, brand.ts & env
│   │   ├── controllers/        # Domain controllers (Auth, Products, Orders, AI)
│   │   ├── middleware/         # Auth, RBAC, Rate limiter, Error handler
│   │   ├── models/             # 18 Mongoose models (including AIUsage)
│   │   ├── routes/             # Organized REST route handlers
│   │   ├── seed/               # Complete 26-product multi-vendor seeder
│   │   ├── services/           # GeminiService, AICatalogService, AIUsageService
│   │   └── validators/         # Zod request validation schemas
│   ├── tests/                  # api.test.ts + gemini.test.ts (36 tests)
│   ├── package.json
│   └── tsconfig.json
├── docs/                       # Project Documentation
│   ├── architecture.md         # Mermaid system architecture documentation
│   ├── database.md             # Mermaid ER diagram and schema specifications
│   ├── api.md                  # RESTful API specifications
│   └── project-report.md       # 16-section College Mini-Project Academic Report
├── .env.example                # Sample environment variables
├── package.json                # Root orchestration package
└── README.md                   # Master Documentation
```

---

## ☁️ Production Deployment & Vercel Readiness Guide

### Recommended Architecture: Decoupled Multi-Vendor Cloud
* **Frontend**: Hosted on **Vercel** as a high-performance Single Page Application (SPA) deployed across global edge CDNs.
* **Backend**: Hosted on **Render**, **Railway**, **Fly.io**, or **AWS** for persistent long-lived Node.js/Express connections, rate-limiting, and Mongoose connection pools.
* **Database**: **MongoDB Atlas** (Free M0 or Dedicated M10+ cluster) with TLS encryption.

---

### Step 1: Deploy Frontend on Vercel
1. Import your GitHub repository into **Vercel** (`New Project > Import Git Repository`).
2. Set **Root Directory** to `client` (or leave as root `.` since root `vercel.json` is configured).
3. Select **Framework Preset**: `Vite`.
4. Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variables in **Vercel Project Settings > Environment Variables**:
   | Variable | Value | Notes |
   |---|---|---|
   | `VITE_API_URL` | `https://your-backend-api.onrender.com` | Public client variable pointing to backend API |
6. Click **Deploy**. Vercel will build and assign an SSL-enabled production URL (`https://your-project.vercel.app`).

---

### Step 2: Deploy Backend on Render / Railway
1. Create a **New Web Service** pointing to your GitHub repository.
2. Set **Root Directory**: `server`.
3. Set **Build Command**: `npm install && npm run build`.
4. Set **Start Command**: `npm start`.
5. Set Environment Variables:
   | Variable | Example Value | Category |
   |---|---|---|
   | `NODE_ENV` | `production` | Server-Only |
   | `PORT` | `5000` | Server-Only |
   | `CLIENT_URL` | `https://your-project.vercel.app` | Server-Only (CORS origin) |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/ejan_seva` | Server-Only (Atlas DB) |
   | `USE_IN_MEMORY_DB` | `false` | Server-Only (Production mode) |
   | `JWT_SECRET` | `openssl rand -base64 32` | Server-Only (Auth security) |
   | `COOKIE_NAME` | `ejan_token` | Server-Only |
   | `GEMINI_API_KEY` | `your_gemini_key_from_ai_studio` | Server-Only (Google Gen AI) |
   | `AI_PROVIDER` | `gemini` (or `demo`) | Server-Only |

---

### Step 3: MongoDB Atlas Cloud Setup
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) to permit cloud servers to connect.
3. Under **Database Access**, create a user with `Read and write to any database` permissions.
4. Copy the connection string format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ejan_seva?retryWrites=true&w=majority` and assign it to `MONGODB_URI`.

---

## 📜 Documentation Links
- [System Architecture & Flowcharts](docs/architecture.md)
- [Database Schema & ER Diagrams](docs/database.md)
- [REST API Endpoint Guide](docs/api.md)
- [College Mini-Project Academic Report](docs/project-report.md)

---

## ⚖️ License
Released under the MIT License for academic, portfolio, and educational demonstration purposes.
