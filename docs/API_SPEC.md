# A2Zee API Specification & Developer Documentation
## Cooperative Gig Services Platform for Household & Community Services
**App Name:** **A2Zee**  
**Motto:** *"Your Need. Our People. One Platform."*  
**Problem Statement ID:** 26089 | **Ministry of Cooperation** | **NCCT**  
**Base URL:** `http://localhost:3000/api`  
**Protocol:** REST over HTTP/HTTPS | **Payload Format:** JSON (`application/json`)  
**Database Engine:** Neon Serverless PostgreSQL via Prisma ORM 5.22

---

## 📑 Table of Contents
1. [Prisma Schema Mapping](#1-prisma-schema-mapping)
2. [Dual-Mode Intelligent Dispatch Algorithm](#2-dual-mode-intelligent-dispatch-algorithm)
3. [Authentication Endpoints](#3-authentication-endpoints)
   - [3.1 POST /api/auth/login (Customer, Worker, & Cooperative Admin)](#31-post-apiauthlogin)
   - [3.2 POST /api/auth/register](#32-post-apiauthregister)
   - [3.3 GET /api/auth/me](#33-get-apiauthme)
4. [Bookings & Dispatch Endpoints](#4-bookings--dispatch-endpoints)
   - [4.1 POST /api/bookings (Intelligent Dual-Mode Dispatch)](#41-post-apibookings)
   - [4.2 GET /api/bookings (List Bookings)](#42-get-apibookings)
   - [4.3 GET /api/bookings/[id]](#43-get-apibookingsid)
   - [4.4 POST /api/bookings/[id]/accept (Worker Accept)](#44-post-apibookingsidaccept)
   - [4.5 POST /api/bookings/[id]/reject (Cascading Reassignment)](#45-post-apibookingsidreject)
   - [4.6 POST /api/bookings/[id]/extra-charges (Mid-Work Adjustments)](#46-post-apibookingsidextra-charges)
   - [4.7 POST /api/bookings/[id]/mock-pay (85-10-5 Split Settlement)](#47-post-apibookingsidmock-pay)
   - [4.8 POST /api/bookings/[id]/review](#48-post-apibookingsidreview)
5. [Artisans, Cooperatives & Schedule Endpoints](#5-artisans-cooperatives--schedule-endpoints)
   - [5.1 GET /api/workers/nearby (Radar & Candidate Ranking)](#51-get-apiworkersnearby)
   - [5.2 PATCH /api/workers/location (Live GPS & Availability Toggle)](#52-patch-apiworkerslocation)
   - [5.3 GET /api/workers/schedule (Worker Booked Slots)](#53-get-apiworkersschedule)
   - [5.4 GET /api/services (10 Target Skills Catalog)](#54-get-apiservices)
   - [5.5 GET /api/cooperatives](#55-get-apicooperatives)

---

## 1. Prisma Schema Mapping

### Models & Key Fields:
- **User**: `id`, `fullName`, `email`, `phone`, `passwordHash`, `role` (`CUSTOMER`, `WORKER`, `ADMIN`), `latitude`, `longitude`.
- **Cooperative**: `id`, `name`, `registrationNumber`, `adminEmail`, `adminPasswordHash`, `adminPhone`.
- **Worker**: `id`, `userId`, `cooperativeId`, `bio`, `averageRating`, `totalJobs`, `verificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`), `availabilityStatus` (`AVAILABLE`, `BUSY`, `OFFLINE`), `latitude`, `longitude`.
- **Skill**: `id`, `name` (10 seeded skills).
- **WorkerSkill**: `id`, `workerId`, `skillId` (unique `[workerId, skillId]`).
- **Service**: `id`, `skillId`, `name`, `description`, `basePrice`.
- **Booking**: `id`, `customerId`, `workerId`, `serviceId`, `bookingDate`, `bookingTime`, `scheduledStartTime`, `scheduledEndTime`, `address`, `latitude`, `longitude`, `status`, `isEmergency`, `rejectedWorkerIds`, `basePrice`, `additionalWork`, `additionalDescription`, `additionalPrice`, `additionalStatus`, `finalPrice`.
- **Payment**: `id`, `bookingId`, `amount`, `paymentStatus` (`PENDING`, `SUCCESS`, `FAILED`), `razorpayPaymentId`.
- **Review**: `id`, `bookingId`, `rating` (1–5), `comment`.

### The 10 Target Skills:
1. `Electrician`
2. `Plumbers`
3. `Househelp`
4. `Carpenters`
5. `Painters`
6. `Caregivers`
7. `Drivers`
8. `Gardeners`
9. `Cleaners`
10. `Technicians`

---

## 2. Dual-Mode Intelligent Dispatch Algorithm

All distances are calculated via the **Haversine Formula**:
$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

### Optimization Matrix:

| Mode | Proximity Weight | Rating Weight | Workload / Experience Weight | Worker Availability Constraint |
|---|---|---|---|---|
| **Emergency Priority** (`isEmergency: true`) | **60%** ($1 - d/15\text{km}$) | **30%** ($\text{rating}/5$) | **10%** ($\min(1, \text{jobs}/100)$) | Must be strictly **`AVAILABLE` and online** with no schedule collision |
| **Cooperative Fair-Share** (`isEmergency: false`) | **35%** ($1 - d/25\text{km}$) | **35%** ($\text{rating}/5$) | **30%** ($1 - \text{jobs}/(\text{maxJobs}\times 1.25)$) | **Offline artisans allowed** for scheduled slots; checked for schedule collisions |

---

## 3. Authentication Endpoints

### 3.1 POST `/api/auth/login`
Supports **Customer**, **Artisan**, and **Cooperative Admin** logins. Cooperative Admins can log in using either their `adminEmail` or cooperative `registrationNumber` + `password`.

- **Cooperative Admin Request:**
```json
{
  "identifier": "admin.pragati@a2zee.local",
  "password": "password123"
}
```
*Or with registration number:*
```json
{
  "identifier": "COOP-WB-2024-001",
  "password": "password123"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "id": "coop_admin_...",
    "name": "Pragati Labour Cooperative Society Admin",
    "email": "admin.pragati@a2zee.local",
    "cooperativeId": "uuid",
    "registrationNumber": "COOP-WB-2024-001",
    "role": "ADMIN",
    "isCooperativeAdmin": true
  },
  "token": "jwt_token..."
}
```

---

## 4. Bookings & Dispatch Endpoints

### 4.1 POST `/api/bookings`
Dispatches a service job using the intelligent dispatch algorithm.
- **Request Body:**
```json
{
  "trade": "Electrician",
  "isEmergency": true,
  "latitude": 22.6950,
  "longitude": 88.4550,
  "address": "Flat 402, Green Meadows, Madhyamgram, Kolkata",
  "basePrice": 199.00
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Emergency Artisan Dispatched: Ramesh Kumar (ETA ~10 mins, 0.95 km away)",
  "data": {
    "id": "uuid",
    "bookingCode": "A2Z-B91F4A80",
    "isEmergency": true,
    "finalPrice": 299.00,
    "worker": {
      "id": "uuid",
      "name": "Ramesh Kumar",
      "cooperative": "Pragati Labour Cooperative Society",
      "rating": 4.9,
      "distanceKm": 0.95,
      "etaMinutes": 10
    },
    "dispatchDetails": {
      "mode": "EMERGENCY_PROXIMITY_RATING",
      "matchScore": 0.895,
      "totalCandidatesRanked": 2
    }
  }
}
```

### 4.4 POST `/api/bookings/[id]/accept`
Worker accepts the assigned booking, setting `status = 'ACCEPTED'`.

### 4.5 POST `/api/bookings/[id]/reject`
Worker declines the gig. The worker is appended to `rejectedWorkerIds` and the algorithm **automatically cascades to the next best candidate**.
- **Request Body:**
```json
{
  "workerId": "uuid",
  "reason": "Schedule overlap / current emergency in progress"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Job rejected by Ramesh Kumar. Automatically reassigned to NEXT BEST CANDIDATE: Debashis Pal (Score: 0.762, ETA: ~22 mins)",
  "data": {
    "bookingId": "uuid",
    "rejectedWorker": { "id": "uuid", "name": "Ramesh Kumar" },
    "newAssignedArtisan": {
      "workerId": "uuid",
      "name": "Debashis Pal",
      "cooperative": "Navchetana Labour Cooperative Society",
      "rating": 4.7,
      "distanceKm": 4.8,
      "etaMinutes": 22
    },
    "allRejectedWorkerIds": ["uuid1"]
  }
}
```

---

## 5. Artisans, Cooperatives & Schedule Endpoints

### 5.1 GET `/api/workers/nearby`
Previews nearby ranked candidate artisans before booking.
- **URL:** `/api/workers/nearby?lat=22.695&lng=88.455&skill=Electrician&emergency=true`

### 5.2 PATCH `/api/workers/location`
Allows an artisan to update live GPS coordinates and availability.
- **Request Body:**
```json
{
  "workerId": "uuid",
  "latitude": 22.6980,
  "longitude": 88.4520,
  "availabilityStatus": "AVAILABLE"
}
```

### 5.3 GET `/api/workers/schedule`
Queries an artisan's booked calendar slots to view schedule collisions.
- **URL:** `/api/workers/schedule?workerId=uuid`

### 5.4 Seeded Cooperatives:
1. **Pragati Labour Cooperative Society** (`COOP-WB-2024-001`)
   - Admin Login: `admin.pragati@a2zee.local` / `password123`
   - 10 Workers across 10 trades
2. **Navchetana Labour Cooperative Society** (`COOP-WB-2024-002`)
   - Admin Login: `admin.navchetana@a2zee.local` / `password123`
   - 10 Workers across 10 trades

---

## 6. Admin Verification & Governance Endpoints

### 6.1 GET `/api/admin/verifications`
Retrieves all newly registered artisan applications with `verificationStatus = 'PENDING'`.
- **Query Params:** `?status=PENDING|ALL`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "uuid",
      "name": "Subhash Ghosh",
      "email": "subhash@example.com",
      "phone": "+91 98765 43211",
      "cooperative": "Pragati Labour Cooperative Society",
      "skills": ["Electrician"],
      "bio": "Certified wireman with 5 years experience",
      "verificationStatus": "PENDING",
      "registeredAt": "2026-09-04T12:00:00.000Z"
    }
  ]
}
```

### 6.2 PATCH `/api/admin/verifications`
Cooperative Administrator approves or rejects an artisan application.
- **Request Body:**
```json
{
  "workerId": "uuid",
  "status": "VERIFIED"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Artisan Subhash Ghosh is now VERIFIED.",
  "data": {
    "workerId": "uuid",
    "name": "Subhash Ghosh",
    "verificationStatus": "VERIFIED",
    "availabilityStatus": "AVAILABLE"
  }
}
```

### 6.3 GET `/api/admin/stats`
Aggregates live bookings, workers directory, 85-10-5 split ledger, and average platform ratings.
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBookings": 12,
      "completedBookings": 8,
      "totalWorkers": 20,
      "verifiedWorkersCount": 20,
      "pendingVerificationsCount": 0,
      "averageRating": 4.8
    },
    "revenueSplit": {
      "totalGrossRevenue": 142000,
      "workerWallet85": 120700,
      "societyOperations10": 14200,
      "welfareTrust5": 7100
    },
    "cooperatives": [ ... ],
    "recentBookings": [ ... ],
    "workers": [ ... ]
  }
}
```

