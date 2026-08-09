# NutriTrust Backend (Fastify) - Journey Implementation Tasks (v1.0)
**Project Stage:** Incubation Pivot (Post IP Management Workshop)
**Stack:** Fastify 5.x, Mongoose 9.x, TypeScript, MongoDB Atlas, Railway.app

---

## 🗺️ Journey Alignment Context
The backend serves as the core infrastructure of the NutriTrust platform. To stand out as a true **Deep Tech / GovTech solution** in incubation, we must build a proprietary **Data-Privacy Guard Layer** rather than being a basic API wrapper. This backend roadmap integrates our custom **((7+1 slots) + operation) * compress SIR** Tokenizer to parse and compress Thai prompts, implements high-speed overnight caching (Batch Computing) to keep latency under 50ms, and expands our database to seed 30 localized active-fitness products.

---

## 🔤 Epic 1: Thai Tokenizer & Secure Processing Pipeline
**Goal:** Integrate our proprietary natural language processing (NLP) logic as a pre-processing API middleware to protect user privacy and slash LLM token costs by over 70%.

### 📋 Tasks:
- [ ] **Task 1.1: Build the Compress SIR Tokenizer Middleware**
  - **Description:** Implement an API middleware that intercepts incoming user raw search prompts or health issue text in Thai.
  - **Technical Requirements:**
    - Parse the Thai string into a structured **7-Slot Semantic Matrix**:
      - `Subject`: Target user (e.g., patient, grandparent)
      - `Auxiliary`: Special allowances/conditions
      - `Verb`: Desired action/outcome
      - `Direction`: Brand/ingredient destination
      - `Object`: Supplement molecules
      - `Modifier`: Core health filters
      - `Context`: Historic illnesses
      - `Slot +1`: Cryptographic signature of user consent
    - Apply the **Compress SIR (Subject-Intent-Resource)** serialization algorithm to strip out fluff words, converting the parsed matrix into a dense, minified JSON object before querying or forwarding to external research APIs.
- [ ] **Task 1.2: Enforce Local Edge Anonymization Protocol**
  - **Description:** Create a secure processing isolation loop (Zero-Knowledge proof concept) to guarantee user data privacy (GDPR / PDPA compliant).
  - **Technical Requirements:**
    - Never save raw, identifiable medical histories or sensitive prompts directly to MongoDB.
    - Write a utility helper that hashes/scrubs all Personally Identifiable Information (PII) at the edge nodes, storing only anonymized tokens in the database.

---

## 🦴 Epic 2: Active Fitness & Joint Category Database Seeding
**Goal:** Expand our MongoDB Atlas models to ingest, structure, and link 30 new localized trending products to target the active aerobic-dance and elderly demographic.

### 📋 Tasks:
- [ ] **Task 2.1: Write the 30-Product Seeding Pipeline (`src/scripts/seed.ts`)**
  - **Description:** Implement a robust database seed script that populates the 30 localized items across 3 fitness categories (Fish Oil, JointProtection, and Energy & Metabolism).
  - **Technical Requirements:**
    - Ensure clean relational references are preserved:
      - Create and map **5 Brands** (Mega We Care, Blackmores, NOW Foods, Vistra, Swisse) across **30 Products**.
      - Map active ingredients (e.g., UC-II Collagen, EPA/DHA, L-Carnitine, EGCG) to their respective upstream raw material **Providers** (e.g., DSM, Kemin) to ensure traceability.
    - Set up a fallback DNS SRV Resolver within the script (utilizing Google 8.8.8.8 and Cloudflare 1.1.1.1) to bypass local environment connection limits.
- [ ] **Task 2.2: Implement Advanced Multi-Field Filtering in `/api/products`**
  - **Description:** Upgrade the product list endpoint to handle specific query params for health goals and ingredient dosages.
  - **Technical Requirements:**
    - Support querying by `category_slug` (e.g., `active_fitness_joint`) and nested `sub_category` (e.g., `joint_protection`).
    - Expose fields for sorting products by "lowest unit price" (Price per 100mg of active ingredient) to fuel the frontend comparison engine.

---

## ⚡ Epic 3: High-Speed Caching & Telemetry Optimization
**Goal:** Maintain sub-50ms API response times (FTO standard) and protect MongoDB Atlas from write bottlenecks during peak traffic times.

### 📋 Tasks:
- [ ] **Task 3.1: Develop overnight Batch Compute Worker**
  - **Description:** Build a cron job or worker thread that runs during low-traffic periods to pre-compute compound product scores.
  - **Technical Requirements:**
    - Instead of calculating complex multi-relational lookups (Products -> Brands -> Ingredients -> Providers -> Science Summaries -> Analytics) on every request, pre-calculate the complete JSON populate payloads.
    - Save these structured, ready-to-serve payloads into a dedicated Redis cache or an indexed `products_cache` collection.
    - Modify the `GET /api/products/:id` endpoint to check the cache first, falling back to a database lookup only if a cache-miss occurs.
- [ ] **Task 3.2: Refine the In-Memory Telemetry Buffer (`src/services/analyticsBuffer.ts`)**
  - **Description:** Optimize the asynchronous analytics collector that buffers high-frequency user actions.
  - **Technical Requirements:**
    - Set up a thread-safe in-memory cache layer to record `page_view` and `search_product` events.
    - Implement a 60-minute interval worker that flushes and aggregates the buffered data to MongoDB Atlas.
    - Expose a thread-safe getter that instantly merges live in-memory telemetry counts with database snapshots, keeping the frontend `<VisitorStats />` numbers strictly accurate without hitting the database on every search event.
