# Technology Stack & Infrastructure Blueprint
## SahakarSeva: Cooperative Gig Services Platform
**Problem Statement ID:** 26089 | **Ministry of Cooperation / NCCT**

---

## 1. Complete Technology Matrix

| Layer | Primary Selection | Alternatives Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Language & Runtime** | **JavaScript (ES6+ / Node.js)** | TypeScript, Python | Pure, modern JavaScript without compilation overhead or transpilation complexity; maximum development velocity, universal ecosystem support, and native JSON compatibility. |
| **Application Architecture (Web + Mobile App)** | **Unified Responsive Web App (PWA / Mobile-First Next.js / React in JavaScript)** | Separate Flutter/React Native app | **Single unified JavaScript codebase** that functions seamlessly as a responsive desktop website and runs directly on mobile devices (via browser, PWA installable home screen, or Capacitor/TWA WebView wrapper). Ensures zero friction, instant deployment, and 100% feature parity across all screens. |
| **Styling & UI Components** | **Tailwind CSS + Lucide Icons + Glassmorphism** | Material UI, Ant Design | Highly customizable modern aesthetics, zero runtime CSS overhead, accessible mobile-touch targets, sleek responsive cards and bottom sheets. |
| **Primary Database** | **Neon Serverless PostgreSQL** | Self-hosted Postgres, Supabase | Instant branching, zero-maintenance auto-scaling serverless architecture, native connection pooling (`pgbouncer`), perfectly suited for modern cloud-native deployment. |
| **ORM & Data Modeling** | **Prisma ORM (JavaScript Client)** | Drizzle, Sequelize | Clean programmatic queries via standard JavaScript `@prisma/client`, automated migrations, declarative schema (`schema.prisma`), zero SQL injection vulnerability. |
| **Backend & Core API Routes** | **Next.js API Routes / Express.js (JavaScript)** | Django, Spring Boot | Full-stack JavaScript colocation, instant serverless execution, sharing helper functions between frontend and backend. |
| **Payment Flow (MVP)** | **Built-in Mock Payment System on Bill Page** | Razorpay / Stripe (Future) | Zero external dependency for hackathon MVP demo; allows 1-click test payments on the Bill page that immediately update booking status to `PAID` and demonstrate the 85-10-5 split logic. |
| **In-Memory Cache & Message Broker** | **Redis 7.x (ioredis JavaScript driver)** | RabbitMQ, Memcached | Ultra-low latency geospatial radius queries (`GEOSEARCH`), worker heartbeat presence tracking, WebSocket pub/sub message fan-out. |
| **Document & KYC Vault** | **MinIO / AWS S3 Compatible** | Local File System | Secure storage of worker police clearances, Aadhaar e-KYC tokens, NCCT training certificates, and generated PDF tax invoices. |
| **Identity & Authentication** | **JWT with Refresh Tokens + DigiLocker OAuth** | Auth0, Firebase Auth | Sovereign identity architecture aligning with India Stack standards (Aadhaar OTP / DigiLocker). |
| **Design & UI Asset Protocol** | **Figma Model Context Protocol (MCP)** | Manual export / Zeplin | Direct two-way integration with Figma designs via `@modelcontextprotocol/server-figma`, enabling automated extraction of UI components, styles, design tokens, and wireframes. |
| **Containerization & CI/CD** | **Docker + Docker Compose + GitHub Actions** | Kubernetes | Lightweight, reproducible development and production builds easily deployable on NIC Cloud / MeghRaj or AWS/GCP. |

---

## 2. Geo-Spatial Technology Specifications

The platform leverages **PostGIS 3.4** running atop PostgreSQL 16:
- **Spatial Reference System Identifier (SRID):** `EPSG:4326` (WGS 84 coordinate system used by standard GPS).
- **Proximity Search Operator:** `ST_DWithin(worker_location, customer_location, radius_in_meters, use_spheroid=true)` ensures hyper-accurate real-world distance calculation without distortion.
- **Dynamic Geofencing:** Cooperative societies define operational territorial boundaries stored as `POLYGON` geometries, guaranteeing that bookings inside a municipal ward automatically route to the corresponding primary labour society.

---

## 3. High-Concurrency & Scalability Benchmarks

```
   [ 10,000+ Active Workers ]       [ 50,000+ Concurrent Customers ]
                │                                    │
                └─────────────────┬──────────────────┘
                                  ▼
                    [ Reverse Proxy / Load Balancer ]
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
       [ API Node Instance 1 ]       [ API Node Instance 2 ]
                   │                             │
                   └──────────────┬──────────────┘
                                  ▼
                  [ Redis Connection Pool & Pub/Sub ]
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
       [ PostgreSQL Primary (Writes) ] ──▶ [ PostgreSQL Read Replica ]
```

- **Target Response Time (P95):** < 180 ms for catalog and booking queries.
- **Worker Presence Heartbeat:** Transmitted every 30 seconds to Redis in-memory store; written to PostgreSQL only on significant location delta (> 100 meters) to minimize disk I/O.
- **Resilience:** Graceful fallback to offline booking mode where SMS notifications are dispatched via CDAC / Gov SMS Gateway when internet connectivity drops in rural clusters.
