# A2Zee (SahakarSeva)
## Cooperative Gig Services Platform for Household & Community Services
**Motto:** *"Your Need. Our People. One Platform."*  
**Problem Statement ID:** 26089 | **Ministry of Cooperation** | **National Council for Cooperative Training (NCCT)**  
**Theme:** Agriculture, FoodTech & Rural Development / Social Empowerment & Gig Economy

---

## 📌 Executive Summary
**A2Zee** is a cooperative-owned, digital-first service marketplace built under the motto *"Your Need. Our People. One Platform."* It directly connects Labour Cooperative Federations, Primary Labour Cooperative Societies, and verified skilled workers with households, resident welfare associations (RWAs), and public/private institutions. 

Unlike private aggregators that extract 20–35% predatory commissions from gig workers, A2Zee operates on a **pioneering 85–10–5 cooperative economic model**:
- **85%** directly paid to the service provider (Worker / *Sahakari Mitra*).
- **10%** allocated to the Primary Cooperative Society & Federation for operational sustainability and tools/equipment support.
- **5%** deposited into a locked **Worker Welfare, Healthcare & Pension Fund** (integrating Pradhan Mantri Suraksha Bima Yojana - PMSBY, PMJJBY, and Ayushman Bharat health checkups).

---

## 🚀 Key Features & Capabilities

### 1. Verified Labour Cooperative Federation & Worker Onboarding
- **Aadhaar & DigiLocker e-KYC Verification:** Background checks and digital identity verification.
- **NCCT & NSDC Skill Profiling:** Certified skill tiering (Apprentice, Skilled, Master Craftsman) recognized by the National Council for Cooperative Training (NCCT).
- **Cooperative Membership Badge:** Provides consumer trust with transparent society affiliation and police verification status.

### 2. Intelligent Geo-Spatial Matching (PostGIS Engine)
- Geo-fencing & dynamic radius matching (`ST_DWithin`) prioritizing hyper-local cooperative clusters.
- Fair-Share Allocation Algorithm: Ensures equitable gig distribution across all active cooperative members, preventing algorithmic bias and burnout.

### 3. Transparent Invoicing & Mock Payment System (MVP Ready)
- Instant bill generation upon job completion or upfront booking.
- Itemized cost breakdown: Labor charges, material cost, and transparent cooperative split.
- **Mock Payment Gateway:** 1-click payment simulation (UPI / NetBanking / Card) that instantly updates booking payment status from `PENDING` to `PAID`, credits worker wallet, and generates downloadable digital receipts.

### 4. Multilingual & Voice-Assisted Interface
- Designed for grassroots accessibility in Hindi, English, and regional languages.
- Voice-prompt assisted booking and gig notifications for workers with varied digital literacy levels.

### 5. Cooperative Federation Admin & Welfare Ledger
- Federation officers monitor active gigs, society revenue pools, worker insurance claims, and dispute settlements.
- Real-time audit logs of the social security reserve fund.

### 6. AI-Driven Demand Forecasting Engine
- Predictive machine learning model forecasting seasonal surge demands (e.g., pre-Diwali painting/electrical repairs, summer AC servicing, monsoon waterproofing).
- Roster pre-scheduling for cooperative societies to deploy workforce proactively.

---

## 🏛️ System Architecture Overview

```
               ┌────────────────────────────────────────────────────────┐
               │                  CLIENT APPLICATIONS                   │
               │   Customer App   │   Worker App   │  Federation Admin  │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │           API GATEWAY & SECURITY (HTTPS/WSS)           │
               │         JWT Auth, Rate Limiter, Role-Based Access      │
               └──────────────────────────┬─────────────────────────────┘
                                          │
         ┌────────────────────────────────┼───────────────────────────────┐
         ▼                                ▼                               ▼
┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
│  BOOKING ENGINE   │           │ GEO-MATCH SERVICE │           │  COOPERATIVE &    │
│ State Machine &   │           │ PostGIS Proximity │           │  WELFARE LEDGER   │
│ Invoicing/Payment │           │ Cluster Routing   │           │ 85-10-5 Split     │
└────────┬──────────┘           └─────────┬─────────┘           └─────────┬─────────┘
         │                                │                               │
         └────────────────────────────────┼───────────────────────────────┘
                                          │
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │             PERSISTENCE & SPATIAL STORAGE              │
               │  PostgreSQL 16 + PostGIS │ Redis Cache │ Document Vault│
               └────────────────────────────────────────────────────────┘
```

---

## 📂 Documentation Directory

| Document | Description |
| :--- | :--- |
| **[prisma/schema.prisma](file:///Users/piyush/Documents/CODE/sih2026/prisma/schema.prisma)** | Production Prisma Schema configured for Neon Serverless PostgreSQL with dual booking & split payment models |
| **[docs/DATABASE_SCHEMA.sql](file:///Users/piyush/Documents/CODE/sih2026/docs/DATABASE_SCHEMA.sql)** | Complete PostgreSQL + PostGIS schema with spatial indices (`GIST`), triggers, and audit ledgers |
| **[docs/SRS.md](file:///Users/piyush/Documents/CODE/sih2026/docs/SRS.md)** | Software Requirements Specification (IEEE 830 standard), user stories, pre-specified & custom problem workflows |
| **[docs/ARCHITECTURE.md](file:///Users/piyush/Documents/CODE/sih2026/docs/ARCHITECTURE.md)** | Detailed High-Level & Low-Level System Design, booking state machine, and PostGIS geo-spatial routing |
| **[docs/COOPERATIVE_MODEL.md](file:///Users/piyush/Documents/CODE/sih2026/docs/COOPERATIVE_MODEL.md)** | Fair wage economics, 85-10-5 split ledger, insurance/welfare scheme integrations & NCCT certification |
| **[docs/TECH_STACK.md](file:///Users/piyush/Documents/CODE/sih2026/docs/TECH_STACK.md)** | In-depth technology justification (Neon Postgres, Prisma ORM, Mobile-First WebApp, PostGIS) |
| **[docs/API_SPEC.md](file:///Users/piyush/Documents/CODE/sih2026/docs/API_SPEC.md)** | REST & WebSocket API specification (OpenAPI standard) with quote submission & mock payment endpoints |
| **[docs/AI_DEMAND_FORECASTING.md](file:///Users/piyush/Documents/CODE/sih2026/docs/AI_DEMAND_FORECASTING.md)** | Demand prediction models & fair-share gig distribution algorithm |
| **[docs/FIGMA_DESIGN.md](file:///Users/piyush/Documents/CODE/sih2026/docs/FIGMA_DESIGN.md)** | Figma design system link, dev mode node IDs, and API integration guide for file A2Zee |
| **[mcp_config.json](file:///Users/piyush/Documents/CODE/sih2026/mcp_config.json)** | Model Context Protocol configuration for Figma design system asset extraction |

---

## 🛠️ Service Catalog & Dual Problem Definition Architecture

The database and business logic accommodate two service request workflows:

### 1. Pre-Specified Standard Catalog Services (Fixed Base Tariffs)
Each trade (Electrician, Plumber, Carpenter, etc.) provides standard scheduled services with regulated cooperative base tariffs:
- **Electrician:**
  - *Ceiling fan not working / humming / capacitor fault:* Base ₹199.00
  - *Switch / Socket repair & replacement:* Base ₹99.00
  - *MCB tripping / Fuse blowout diagnosis:* Base ₹249.00
  - *Inverter / Battery connection check:* Base ₹349.00
- **Plumber:**
  - *Tap / Faucet continuous leak:* Base ₹149.00
  - *Drain / Waste pipe blockage:* Base ₹299.00
  - *Flush tank leakage / valve fix:* Base ₹249.00

### 2. User-Defined Custom Problem Submission
When a household encounters an unlisted or complex breakdown:
1. **Selection:** User selects the field (e.g. Electrician) and chooses *"Describe Custom Problem"*.
2. **Details & Media:** User provides their own problem title, written description, audio voice note (for vernacular / low-literacy accessibility), and photos.
3. **Guaranteed Base Inspection Fee:** A fixed inspection charge (e.g., ₹150 for Electrician) guarantees the cooperative worker's travel and diagnostic effort.
4. **On-Site Diagnosis & Quote Approval:** Worker inspects on-site and submits estimated labor quote in-app; customer approves before work begins.

### 3. Mid-Work Extra Charges (Time Overrun & Unforeseen Work)
When a repair takes significantly longer than scheduled or requires extra tasks (e.g. concealed conduit damage, structural chiseling, rusted pipe threading):
1. **Worker Request:** Worker logs an extra labor charge with reason category (`EXCESSIVE_TIME`, `UNFORESEEN_COMPLICATION`), text justification, estimated extra minutes, and photo proof.
2. **Customer Transparency:** Customer receives an in-app prompt with the exact breakdown and clicks **Approve** or **Decline**.
3. **Bill Integration & Split:** Approved extra charges are added to the final invoice and automatically split under the **85-10-5 cooperative model** (85% worker, 10% society, 5% welfare).

---

## 👥 Target Beneficiaries & Impact
1. **Unorganized Labourers & Technicians:** Dignified livelihood, legal social security, skill upgradation via NCCT, direct digital bank deposits.
2. **Labour Cooperative Societies:** Re-energizing cooperative movement, digitized operations, recurring revenue, community asset building.
3. **Consumers & Institutions:** Trusted, background-verified professionals at regulated, transparent government-certified cooperative tariffs.
