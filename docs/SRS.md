# Software Requirements Specification (SRS)
## SahakarSeva: Cooperative Gig Services Platform
**Standard:** IEEE Std 830-1998  
**Client:** Ministry of Cooperation | National Council for Cooperative Training (NCCT)  
**Problem Statement ID:** 26089  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **SahakarSeva**, a digital gig marketplace platform operated by Labour Cooperative Federations and Primary Labour Cooperative Societies in India. It defines functional workflows, data requirements, security protocols, and integration points for mobile and web interfaces.

### 1.2 Scope of Product
SahakarSeva bridges the gap between verified skilled cooperative workers (electricians, plumbers, carpenters, domestic helpers, caregivers, painters, technicians) and end consumers (households, housing societies/RWAs, and institutional offices). 

The platform guarantees:
- Worker identity verification and NCCT skill certification.
- Transparent cooperative pricing and an 85-10-5 revenue sharing model.
- Integrated social security and micro-insurance contributions per gig.
- Geo-spatial proximity matching using open GIS standards.
- Real-time billing and payment status updates.

### 1.3 Definitions, Acronyms & Abbreviations
- **NCCT:** National Council for Cooperative Training
- **PACS:** Primary Agricultural Credit Societies / Primary Labour Cooperative Societies
- **Mitra:** Certified gig worker registered under a certified Labour Society
- **RWA:** Resident Welfare Association (Housing societies)
- **GIS:** Geographic Information System
- **PMSBY / PMJJBY:** Pradhan Mantri Suraksha Bima Yojana / Jeevan Jyoti Bima Yojana
- **Escrow:** Financial holding mechanism ensuring payment security before service fulfillment

---

## 2. Overall Description

### 2.1 Product Perspective
SahakarSeva operates as a distributed multi-tenant platform:
1. **Public / Consumer Facing Interface:** Mobile App & Web Booking Portal.
2. **Worker / Sahakari Mitra Interface:** Multilingual, low-bandwidth, voice-prompted mobile app.
3. **Cooperative Federation Admin Portal:** Web management suite for Primary Societies, Federations, and Ministry oversight.

### 2.2 User Personas & User Classes

| Persona | Role | Key Needs & Pain Points |
| :--- | :--- | :--- |
| **Ramesh Kumar (42)** | Certified Electrician, Member of Pragati Labour Cooperative | Needs steady local bookings, fair pay without high aggregator cuts, instant bank payouts, and accident insurance coverage. |
| **Priya Soni (34)** | Household Customer / Working Professional | Wants verified, safe, and punctual service providers with upfront transparent rates and hassle-free billing. |
| **B. K. Sharma (56)** | Secretary, District Labour Cooperative Federation | Needs digitized member roster, transparent audit of federation fees, oversight of customer grievances, and welfare fund balances. |
| **Anil Verma (48)** | President, Green Meadows RWA (350 Flats) | Needs contracted bulk services (monthly plumbing, common area electrical audits, gardening) with GST invoices and cooperative reliability. |

### 2.3 Operating Environment
- **Client Devices:** Android 8.0+, iOS 14.0+, Modern Web Browsers (Chrome, Firefox, Safari, Edge).
- **Backend Infrastructure:** Linux (Ubuntu 22.04 LTS), Node.js LTS, Python 3.11, PostgreSQL 16 with PostGIS, Redis.
- **Network Considerations:** Optimized for 2G/3G/4G/5G connections with offline caching for field workers.

---

## 3. Specific Functional Requirements

### 3.1 Module 1: Provider Onboarding & Verification
- **FR-1.1 (Registration):** Workers register with Aadhaar number, phone number, primary craft, and Primary Labour Cooperative Society affiliation.
- **FR-1.2 (Verification & Badging):** Cooperative society secretary verifies physical membership and police clearance. A digital badge is assigned with tier level (Apprentice, Skilled, Master Craftsman) recognized by NCCT.
- **FR-1.3 (Digital Passbook):** Workers receive a digital passbook recording gigs completed, patron dividends accrued, and welfare fund contributions.

### 3.2 Module 2: Booking, Scheduling & Geo-Matching
- **FR-2.1 (Dual Service Entry Modes):**
  - **FR-2.1A (Pre-Specified Catalog with Fixed Base Prices):** Each trade (Electrician, Plumber, Carpenter, etc.) provides standard scheduled services with government/cooperative approved base prices:
    - *Electrician:* "Ceiling fan not working" (₹199), "Switch/Socket repair" (₹99), "MCB tripping/Fuse blowout" (₹249), "Inverter wiring check" (₹349).
    - *Plumber:* "Tap/Faucet leaking" (₹149), "Drain pipe blockage" (₹299), "Flush tank repair" (₹249).
    - *Carpenter:* "Door lock/latch repair" (₹199), "Hinge replacement" (₹149), "Furniture fitting" (₹399).
  - **FR-2.1B (Custom User-Defined Problem Submission):** When a user's problem is not listed in the standard catalog, the platform allows the user to define their own issue under any chosen field (trade):
    - User inputs custom problem title and description.
    - User can attach media: photos of faulty equipment and audio voice notes (for vernacular / low-literacy users).
    - Automatic application of the field's base inspection fee (e.g. ₹150 for electrician visitation & diagnosis).
  - **FR-2.1C (On-Site Diagnosis & Quotation Approval Workflow):** For custom problems:
    - Worker arrives and conducts diagnosis under the base inspection fee.
    - Worker enters estimated labor quote into the app.
    - Customer receives real-time notification to review and click "Approve Quote" or "Decline".
    - If approved, booking updates to `CUSTOMER_APPROVED` and work begins. If declined, customer only pays the base inspection fee.
- **FR-2.2 (Geo-Spatial Allocation):** Backend utilizes PostGIS spatial indexing (`ST_DWithin`) to locate available providers within a configurable radius (e.g., 3km to 10km).
- **FR-2.3 (Fair-Share Dispatch):** Dispatches job notifications to qualified workers based on a balanced metric of proximity, rating, and fairness quotient (hours worked in the current week).
- **FR-2.4 (Emergency / On-Demand Booking):** Dedicated switch for urgent household breakdowns (pipe burst, short circuit) triggering priority broadcast within 3km.

### 3.3 Module 3: Billing, Invoicing & Mock Payment System
- **FR-3.1 (Itemized Bill Generation):**
  - **FR-3.1A (Core Cost Components):** Upon job completion, an itemized invoice is computed displaying:
    - Base Scheduled Labor Charge (or Initial Approved Quote)
    - Mid-Work Extra Labor Charges (if approved by customer)
    - Material / Parts Cost (wholesale subsidized store rates)
    - Taxes (GST 5% cooperative concession)
    - Total Payable Amount
  - **FR-3.1B (Mid-Work Extra Charges & Time Overrun Workflow):**
    - When work is `IN_PROGRESS` and takes significantly longer than scheduled or uncovers unforeseen complications (e.g., rusted pipe threading, hidden electrical conduit burns, structural chiseling), the worker can raise an **Extra Charge Request** via their mobile app.
    - Worker inputs: Extra amount requested, reason category (`EXCESSIVE_TIME`, `UNFORESEEN_COMPLICATION`, `ADDITIONAL_TASK_REQUESTED`), text justification, estimated additional duration (mins), and photo proof.
    - Customer receives a real-time modal/push notification: *"Worker Ramesh Kumar requests ₹150 for +45 mins of additional conduit rewiring. Do you approve?"*
    - **Approval Action:** If customer clicks **Approve**, the extra charge is added to `extra_charges_total` and incorporated into the final invoice. If declined, worker completes only the initial agreed scope or contacts the primary society for mediation.
- **FR-3.2 (Transparent Split Display):** Invoice displays cooperative contribution breakdown across the entire billable labor:
  - 85% Provider Direct Earning (including 85% of approved extra charges)
  - 10% Cooperative Society & Federation Ops
  - 5% Worker Welfare & Healthcare Fund
- **FR-3.3 (Mock Payment Processing - MVP):** 
  - Bill page provides an interactive "Pay Now" action simulating instant payment.
  - On click, platform updates booking state to `PAID`, marks transaction as successful with generated Mock Txn ID, and triggers instant confirmation.
  - Payment status is synchronized in real-time across Customer, Worker, and Admin interfaces.

### 3.4 Module 4: Worker Welfare & Social Security Ledger
- **FR-4.1 (Welfare Accumulation):** Every completed transaction automatically allocates 5% to the dedicated worker welfare pool.
- **FR-4.2 (Insurance Policy Linking):** System tracks annual renewal dates for government micro-insurance (PMSBY ₹20/year accident coverage, PMJJBY ₹436/year life coverage) funded seamlessly from the worker's welfare accruals.

### 3.5 Module 5: Cooperative Federation Admin Dashboard
- **FR-5.1 (Live Operations Map):** Interactive GIS map displaying active, assigned, and completed service orders across district zones.
- **FR-5.2 (Revenue & Dividend Ledger):** Real-time monitoring of federation funds and patron dividend shares distributed to worker-members.
- **FR-5.3 (Dispute & Grievance Resolution):** Dedicated mediation ticket workflow with society-level arbitration.

### 3.6 Module 6: AI Demand Forecasting
- **FR-6.1 (Predictive Surge Analysis):** Predictive model forecasts service volume per postal pin-code based on historical trends, seasonal indicators, and weather signals.
- **FR-6.2 (Pre-Emptive Resourcing):** Federation alerts cooperative societies 7 days in advance to activate reserve workforce for high-demand windows.

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- Service matching response time under 1.5 seconds.
- Geospatial query processing latency under 250ms for 10,000 concurrent active workers.
- Bill generation and status update latency under 300ms.

### 4.2 Security & Privacy Requirements
- End-to-end encryption (TLS 1.3) for all API payloads.
- Masked phone numbers between customer and worker during active service engagement.
- Strict Role-Based Access Control (RBAC): `CUSTOMER`, `WORKER`, `SOCIETY_ADMIN`, `FEDERATION_SUPERADMIN`.

### 4.3 Reliability & Availability
- 99.9% uptime target with automated failover and containerized resilience.
- Offline-first cache on Worker mobile app to capture status updates in poor network connectivity areas.
