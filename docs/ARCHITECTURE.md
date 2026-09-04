# System Architecture & Technical Design Document
## SahakarSeva: Cooperative Gig Services Platform
**Version:** 1.0.0 | **Problem Statement:** 26089 (Ministry of Cooperation / NCCT)

---

## 1. High-Level Architecture

The platform adopts a **Domain-Driven Modular Service Architecture** capable of running as a unified monolithic container in MVP stage and scaling into independently deployable microservices for multi-state production rollout.

```mermaid
flowchart TB
    subgraph ClientTier ["Presentation Layer (Pure JavaScript)"]
        C_WEB["Customer Web Portal<br/>(Next.js / React in JavaScript)"]
        C_MOB["Customer Mobile WebApp<br/>(Responsive PWA / WebView in JavaScript)"]
        W_MOB["Worker 'Mitra' App<br/>(Mobile WebApp / PWA in JavaScript)"]
        A_WEB["Federation & Society Admin<br/>(Next.js Dashboard in JavaScript)"]
    end

    subgraph IngressTier ["API Gateway & Ingress"]
        GATEWAY["API Gateway (Reverse Proxy / HTTPS / WSS)<br/>Rate Limiting | JWT Auth | CORS Filter"]
    end

    subgraph ServiceTier ["Core Domain Modules"]
        AUTH_MOD["Auth & KYC Module<br/>(Aadhaar / DigiLocker / RBAC)"]
        BOOK_MOD["Booking & Scheduling Engine<br/>(State Machine / Dispatcher)"]
        GEO_MOD["Geo-Spatial Routing Service<br/>(PostGIS Proximity Matcher)"]
        BILL_MOD["Billing & Split-Payment Engine<br/>(Escrow & Mock Payment)"]
        COOP_MOD["Cooperative & Welfare Service<br/>(85-10-5 Split Ledger)"]
        AI_MOD["AI Demand Forecaster<br/>(FastAPI / Prophet ML)"]
    end

    subgraph DataTier ["Data & Caching Layer"]
        PG_DB[("PostgreSQL 16 + PostGIS<br/>Spatial Tables & Audit Logs")]
        REDIS_CACHE[("Redis Cache<br/>Geo-Hash Index & Socket Pub/Sub")]
        DOC_VAULT[("Object Storage / S3<br/>Worker KYC & Invoices")]
    end

    ClientTier --> GATEWAY
    GATEWAY --> AUTH_MOD
    GATEWAY --> BOOK_MOD
    GATEWAY --> GEO_MOD
    GATEWAY --> BILL_MOD
    GATEWAY --> COOP_MOD
    GATEWAY --> AI_MOD

    BOOK_MOD <--> GEO_MOD
    BOOK_MOD <--> BILL_MOD
    BILL_MOD <--> COOP_MOD

    ServiceTier --> PG_DB
    ServiceTier --> REDIS_CACHE
    ServiceTier --> DOC_VAULT
```

---

## 2. Booking & Payment Lifecycle State Machine

The booking workflow tracks explicit state transitions, ensuring transactional consistency and accurate financial ledgering.

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Customer Selects Field / Service & Location
    DRAFT --> REQUESTED: Submits Booking (Catalog Item OR Custom Problem)
    REQUESTED --> ASSIGNED: Geo-Spatial Engine Matches Cooperative Worker
    ASSIGNED --> REJECTED: Worker Unavailable / Timeout
    REJECTED --> REQUESTED: Fallback to Next Qualified Worker
    ASSIGNED --> ACCEPTED: Worker Accepts Gig
    
    state "Service Execution Paths" as ServiceBranch {
        ACCEPTED --> STANDARD_JOB: Pre-Specified Catalog Service
        STANDARD_JOB --> IN_PROGRESS: Worker Arrives & Starts Work (Fixed Base Tariff)
        
        ACCEPTED --> CUSTOM_JOB: User-Defined Custom Problem
        CUSTOM_JOB --> ON_SITE_DIAGNOSIS: Worker Arrives (Base Inspection Fee Applied)
        ON_SITE_DIAGNOSIS --> AWAITING_CUSTOMER_APPROVAL: Worker Submits Labor Quote
        AWAITING_CUSTOMER_APPROVAL --> IN_PROGRESS: Customer Approves Quote
        AWAITING_CUSTOMER_APPROVAL --> QUOTE_REJECTED: Customer Declines Quote
        QUOTE_REJECTED --> BILL_INSPECTION_ONLY: Bill Inspection Fee Only (₹150)
    }
    
    state IN_PROGRESS {
        [*] --> EXECUTING_TASKS
        EXECUTING_TASKS --> EXTRA_CHARGE_REQUESTED: Time Overrun or Hidden Complication Detected
        EXTRA_CHARGE_REQUESTED --> EXTRA_CHARGE_APPROVED: Customer Approves Additional Scope
        EXTRA_CHARGE_REQUESTED --> EXTRA_CHARGE_DECLINED: Customer Declines Extra Cost
        EXTRA_CHARGE_APPROVED --> EXECUTING_TASKS: Extra Charge Appended to Bill Ledger
        EXTRA_CHARGE_DECLINED --> EXECUTING_TASKS: Continue with Base Scope
        EXECUTING_TASKS --> [*]: Work Concluded
    }
    
    IN_PROGRESS --> COMPLETED: Worker Finishes Work & Uploads Job Proof
    COMPLETED --> BILL_GENERATED: System Computes Tariff (Base + Extra + Materials + GST)
    BILL_INSPECTION_ONLY --> BILL_GENERATED
    BILL_GENERATED --> PAID: Customer Clicks 'Pay Bill' (Mock Payment / Gateway)
    PAID --> SPLIT_EXECUTED: 85% to Worker Wallet, 10% to Society, 5% to Welfare
    SPLIT_EXECUTED --> RATED: Customer & Worker Mutual Reviews
    RATED --> [*]
```

---

## 3. Geo-Spatial Proximity Engine (PostGIS)

### 3.1 Spatial Indexing
Each active worker's device streams periodic location updates (latitude, longitude) stored in PostgreSQL with a `GEOGRAPHY(Point, 4326)` column indexed via **R-Tree (GIST)**.

```sql
-- Spatial Index on Worker Location
CREATE INDEX idx_workers_current_location 
ON worker_profiles 
USING GIST (current_location);
```

### 3.2 Proximity Matching Query
When a household requests a service (e.g. Electrician) at coordinates `(user_lat, user_lng)`:

```sql
SELECT 
    w.id,
    w.full_name,
    w.phone,
    w.ncct_certification_level,
    s.society_name,
    w.rating_avg,
    ST_Distance(w.current_location, ST_MakePoint(:user_lng, :user_lat)::geography) AS distance_meters
FROM worker_profiles w
JOIN cooperative_societies s ON w.society_id = s.id
WHERE w.primary_trade = :service_category
  AND w.is_active = TRUE
  AND w.is_available = TRUE
  AND ST_DWithin(w.current_location, ST_MakePoint(:user_lng, :user_lat)::geography, :search_radius_meters)
ORDER BY 
  -- Balanced metric: Proximity + Rating + Fairness Weight
  (ST_Distance(w.current_location, ST_MakePoint(:user_lng, :user_lat)::geography) * 0.4) 
  - (w.rating_avg * 1000) 
  + (w.weekly_jobs_count * 500) ASC
LIMIT 5;
```

---

## 4. Financial Split Ledger Architecture (85-10-5)

Whenever a customer settles an invoice on the bill page:
1. **Total Invoice Amount (e.g., ₹600.00)**
2. **Worker Payout (85% = ₹510.00):** Immediately credited to worker's in-app wallet, accessible for instant UPI bank transfer.
3. **Cooperative Society Fund (10% = ₹60.00):** Credited to the local Primary Society ledger for administrative overhead, tool rental subsidies, and cooperative dividend reserves.
4. **Worker Welfare Pool (5% = ₹30.00):** Locked in the Federation Social Security Trust fund. When balance reaches ₹20 or ₹436, PMSBY or PMJJBY premiums are automatically funded on the worker's behalf.

---

## 5. Security & Data Protection
- **Aadhaar Vaulting:** No Aadhaar numbers are stored in plain text. Tokenized hashes from DigiLocker are preserved alongside verified badge timestamps.
- **Role-Based Access Control (RBAC):**
  - `CUSTOMER`: Can create bookings, view invoices, trigger payments, submit reviews.
  - `WORKER`: Can accept/reject bookings, mark progress, view personal wallet & welfare ledger.
  - `SOCIETY_ADMIN`: Can verify workers, oversee local disputes, monitor society revenue share.
  - `FEDERATION_ADMIN`: Access to multi-district heatmaps, policy configuration, and AI demand forecasts.
