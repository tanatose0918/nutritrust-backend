# 🚀 NutriTrust Backend (Fastify + MongoDB Atlas) - Status & Architecture Summary

**Project Name:** NutriTrust Backend API  
**Environment:** Fastify 5.x + TypeScript + Mongoose 9.x  
**Deployment Platform:** Railway.app  
**Production Base URL:** `https://nutritrust-backend-production.up.railway.app`  
**Database Name:** `Web_application_base` (MongoDB Atlas)  
**Last Updated:** August 9, 2026  

---

## 📊 1. Overview & Current Progress

The NutriTrust Backend service is **fully functional, production-deployed, and integrated** with the Next.js Frontend (`nutritrust-web-app`). All core MVP (Phase 1) requirements—including product searching, detailed traceability populates, 3-product side-by-side comparison matrix, user profile saving, early access waitlist, and real-time telemetry buffering—are 100% completed and verified.

---

## 🗄️ 2. Database Collections & Schemas (`src/models/`)

We have **9 Mongoose Schemas & Models** fully configured and populated in MongoDB Atlas:

| Collection Name | Model File | Purpose & Description |
| :--- | :--- | :--- |
| `products` | [Product.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/Product.ts) | Finished products, active ingredient volumes, package size, prices, safety profiles, evidence IDs. |
| `brands` | [Brand.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/Brand.ts) | Supplement brands, country of origin (`provide_at`), and raw material provider IDs. |
| `ingredients` | [Ingredient.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/Ingredient.ts) | Master list of active ingredients mapped to upstream raw material suppliers. |
| `providers` | [Provider.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/Provider.ts) | Upstream raw material factories & verified 100% traceability process descriptions. |
| `science_summaries` | [Evidence.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/Evidence.ts) | Scientific evidence summaries, benefit titles, confidence levels, and PubMed IDs. |
| `products_analytics` | [ProductAnalytics.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/ProductAnalytics.ts) | E-commerce merchant scores (Shopee, Lazada, TikTok), authenticity metrics, repurchase rates. |
| `users` | [User.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/User.ts) | Member profiles, early adopters, health goals/issues, current supplements, system ratings, feedback. |
| `waitlists` | [Waitlist.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/Waitlist.ts) | Early access subscribers & interest areas. |
| `surveys` | [Survey.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/Survey.ts) | User feedback submissions and usefulness ratings. |
| `web_analytics` | [WebAnalytics.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/models/WebAnalytics.ts) | Daily snapshot analytics (`YYYY-MM-DD`), unique visitors, total searches, early adopters. |

---

## 🔌 3. Complete API Endpoint Catalog (`src/routes/`)

### 🟢 Core & System Endpoints
- `GET /health`: Server status, uptime, and database connection state.
- `GET /api/collections`: Overview & real-time document counts for all 9 collections.

### 💊 Product & Traceability Endpoints
- `GET /api/products`: List products with multi-field search and category/brand filters.
- `GET /api/products/:id`: Get single product with full relational populates (Brand, Ingredients, Providers, Evidences, Analytics).
- `GET /api/products/compare?ids=p_001,p_002,p_003`: Side-by-side comparison matrix for 2–3 products, ingredient quantity alignment, price-per-serving, and best-value calculations.
- `POST /api/products`: Create new product entry.

### 🏷️ Master Data Endpoints
- `GET /api/brands` & `GET /api/brands/:id`: Brand directory and supplier linkages.
- `GET /api/ingredients` & `GET /api/ingredients/:id`: Active ingredient catalog and provider references.
- `GET /api/providers` & `GET /api/providers/:id`: Upstream factory traceability detail.
- `GET /api/science-summaries`: Scientific literature summaries & PubMed citations.
- `GET /api/search?q={query}`: Cross-collection search across Products, Brands, and Ingredients.

### 👤 User, Waitlist & Feedback Endpoints
- `POST /api/users`: Upsert user profile, health goals, prompt inputs, system ratings, and feedback.
- `GET /api/users` & `GET /api/users/:email`: Fetch user profile list or single user by email.
- `POST /api/waitlist` & `GET /api/waitlist/count`: Register early access email and get total subscriber count.
- `POST /api/survey` & `GET /api/surveys`: Submit user survey response and fetch survey history.

### 📈 Web Analytics & Telemetry Endpoints
- `POST /api/telemetry/event`: High-performance asynchronous endpoint receiving `page_view` and `search` events (buffers in memory, returns `HTTP 202 Accepted`).
- `GET /api/web-analytics`: Real-time community stats for Frontend's `<VisitorStats />` (combines MongoDB daily snapshot with live in-memory pending buffer counts).

---

## ⚙️ 4. Services & Architecture Design (`src/services/`)

### ⚡ Telemetry In-Memory Buffer & Worker (`src/services/analyticsBuffer.ts`)
- **High-Concurrency Protection:** Prevents MongoDB from overheating by buffering high-frequency telemetry events in Node.js memory (`activeSessions: Set<string>`, `searchCounter: number`).
- **60-Minute Batch Worker:** Automatically syncs & upserts aggregated metrics to `web_analytics` collection in MongoDB every 60 minutes.
- **Real-Time Instant Getter:** Provides `getPendingSessionCount()` and `getPendingSearchCount()`, allowing `GET /api/web-analytics` to return real-time live numbers instantly without waiting 60 minutes for DB flush.

---

## 🛠️ 5. Utility Scripts (`src/scripts/`)

- `npm run seed` ([seed.ts](file:///d:/0_Blue%20Horizon/NutriTrust/MVP%20NutriTrust%20Web%20Application/nutritrust-backend/src/scripts/seed.ts)): Clears and seeds all 6 initial mockup collections (Products, Brands, Ingredients, Providers, Science Summaries, Product Analytics) into MongoDB Atlas. Includes Windows DNS SRV resolver fallback (`8.8.8.8`, `1.1.1.1`).

---

## 🚀 6. Next Steps & Recommended Development Roadmap

Based on the MVP Scope Priorities (from `NutriTrust - MVP Spec.pdf`), here are the **Recommended Next Tasks** for Backend:

1. **Step 2 (Should Have): Category & Health Goal Filtering**
   - Enhance `GET /api/products` to filter products by health goals (`immunity`, `heart`, `sleep`, `joint`, `skin`, `energy`).
2. **Step 2 (Should Have): Educational Articles API**
   - Create `ArticleModel` & `GET /api/articles` / `GET /api/articles/:slug` to serve SEO articles (e.g. Omega-3 guide, Magnesium forms comparison).
3. **Step 3 (Should Have): Historical Price Trend API**
   - Create `PriceHistoryModel` & `GET /api/products/:id/price-history` for 30-day / 90-day price trend line charts.
