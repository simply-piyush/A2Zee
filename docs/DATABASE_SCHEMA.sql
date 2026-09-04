-- ============================================================================
-- SahakarSeva: Cooperative Gig Services Platform
-- PostgreSQL 16 + PostGIS Relational Database Schema
-- Ministry of Cooperation | National Council for Cooperative Training (NCCT)
-- ============================================================================

-- Enable PostGIS & UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. COOPERATIVE FEDERATIONS & PRIMARY SOCIETIES
CREATE TABLE cooperative_federations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    federation_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    contact_email VARCHAR(150),
    contact_phone VARCHAR(20) NOT NULL,
    welfare_trust_account_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cooperative_societies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    federation_id UUID REFERENCES cooperative_federations(id) ON DELETE CASCADE,
    society_name VARCHAR(255) NOT NULL,
    registration_no VARCHAR(100) UNIQUE NOT NULL,
    ward_or_panchayat VARCHAR(150) NOT NULL,
    service_boundary GEOMETRY(Polygon, 4326), -- Geospatial coverage polygon
    bank_account_no VARCHAR(50),
    bank_ifsc VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coop_societies_boundary ON cooperative_societies USING GIST(service_boundary);

-- 2. USERS & ROLES
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'WORKER', 'SOCIETY_ADMIN', 'FEDERATION_ADMIN');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WORKER PROFILES & NCCT SKILL TIERS
CREATE TYPE skill_tier AS ENUM ('APPRENTICE_L1', 'SKILLED_L2', 'MASTER_CRAFTSMAN_L3');
CREATE TYPE trade_type AS ENUM (
    'ELECTRICIAN', 'PLUMBER', 'CARPENTER', 'PAINTER', 
    'DOMESTIC_HELP', 'CAREGIVER', 'GARDENER', 'TECHNICIAN'
);

CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    society_id UUID REFERENCES cooperative_societies(id),
    primary_trade trade_type NOT NULL,
    ncct_certification_level skill_tier NOT NULL DEFAULT 'SKILLED_L2',
    ncct_certificate_id VARCHAR(100),
    police_verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    current_location GEOMETRY(Point, 4326), -- Live GPS coordinate
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00,
    total_gigs_completed INTEGER DEFAULT 0,
    weekly_jobs_count INTEGER DEFAULT 0,
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,
    welfare_balance NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_location ON worker_profiles USING GIST(current_location);
CREATE INDEX idx_worker_trade_avail ON worker_profiles(primary_trade, is_available, is_active);

-- 4. TRADE PRICING CONFIGURATION & SERVICE CATALOG
-- Base inspection fee applies when users define custom problems outside standard catalog
CREATE TABLE trade_pricing_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade trade_type UNIQUE NOT NULL,
    trade_display_name VARCHAR(100) NOT NULL,
    base_inspection_fee NUMERIC(10, 2) NOT NULL, -- Standard visitation/diagnosis charge for custom problems
    emergency_surcharge NUMERIC(10, 2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE
);

-- Pre-specified standard catalog services with fixed base tariffs
CREATE TABLE service_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade trade_type NOT NULL,
    service_code VARCHAR(50) UNIQUE NOT NULL,    -- e.g. ELEC_FAN_01, ELEC_SWITCH_02
    service_title VARCHAR(200) NOT NULL,        -- e.g. "Ceiling fan not working", "Switch/Socket repair"
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL,         -- Base scheduled tariff
    estimated_duration_minutes INTEGER DEFAULT 45,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed pre-specified catalog items
-- Examples for Electrician:
-- 'Ceiling fan not working' (base: 199.00)
-- 'Switch / Socket not working or sparking' (base: 99.00)
-- 'MCB tripping / Fuse blowout' (base: 249.00)
-- 'Inverter wiring diagnosis' (base: 349.00)
-- Examples for Plumber:
-- 'Tap / Faucet leaking' (base: 149.00)
-- 'Drain pipe clogged' (base: 299.00)
-- 'Toilet flush tank repair' (base: 249.00)

-- 5. BOOKINGS & WORKFLOW STATE MACHINE
CREATE TYPE booking_status AS ENUM (
    'REQUESTED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 
    'COMPLETED', 'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING', 'PAID', 'REFUNDED', 'FAILED'
);

CREATE TYPE quote_approval_status AS ENUM (
    'NOT_APPLICABLE',           -- For standard pre-specified catalog bookings
    'AWAITING_WORKER_QUOTE',    -- Worker assigned, needs on-site inspection
    'AWAITING_CUSTOMER_APPROVAL',-- Worker entered quote, customer must accept
    'CUSTOMER_APPROVED',        -- Customer accepted quote, work commences
    'CUSTOMER_REJECTED'         -- Customer declined quote, pays only inspection fee
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id),
    worker_id UUID REFERENCES worker_profiles(id),
    society_id UUID REFERENCES cooperative_societies(id),
    trade trade_type NOT NULL, -- Field of work (e.g. ELECTRICIAN, PLUMBER)
    
    -- Option A: Pre-specified standard catalog service
    service_id UUID REFERENCES service_catalog(id) ON DELETE SET NULL,
    
    -- Option B: Custom User-Defined Problem (when issue is outside standard catalog)
    is_custom_issue BOOLEAN DEFAULT FALSE,
    custom_issue_title VARCHAR(255),            -- User's own problem summary
    custom_issue_description TEXT,              -- Detailed description of problem
    custom_issue_audio_url TEXT,                -- Voice note recording for vernacular users
    custom_issue_photo_urls TEXT[],             -- Uploaded photos of faulty appliance/site
    
    -- Quoting and Inspection Workflow for Custom Issues
    base_inspection_fee NUMERIC(10, 2) NOT NULL DEFAULT 150.00, -- Guaranteed visit fee
    worker_quoted_labor NUMERIC(10, 2),         -- Labor quote provided after inspection
    quote_status quote_approval_status DEFAULT 'NOT_APPLICABLE',
    
    -- Workflow Statuses
    status booking_status NOT NULL DEFAULT 'REQUESTED',
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    service_location GEOMETRY(Point, 4326) NOT NULL,
    address_text TEXT NOT NULL,
    is_emergency BOOLEAN DEFAULT FALSE,
    
    -- Bill Generation & Extra Charges (Worker-added at bill generation time)
    base_charge NUMERIC(10, 2) NOT NULL,        -- Catalog price OR initial approved quote
    extra_amount NUMERIC(10, 2) DEFAULT 0.00,   -- Extra charge added by worker for this booking at bill generation
    extra_charge_reason VARCHAR(100),           -- Reason: 'EXTRA_TIME_TAKEN', 'UNFORESEEN_COMPLICATIONS', 'ADDITIONAL_TASKS'
    extra_charge_notes TEXT,                    -- Worker explanation for the extra time/work taken
    extra_time_minutes INTEGER DEFAULT 0,       -- Minutes taken beyond normal schedule (e.g., +45 mins)
    material_charge NUMERIC(10, 2) DEFAULT 0.00,-- Replacement parts cost
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,     -- GST (5% cooperative concession)
    total_amount NUMERIC(10, 2) NOT NULL,       -- base_charge + extra_amount + material_charge + tax_amount
    customer_notes TEXT,
    bill_generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_bookings_custom_issue ON bookings(is_custom_issue);

-- 6. COOPERATIVE SPLIT PAYMENTS & FINANCIAL TRANSACTIONS
-- Note: Extra charges (extra_amount, extra_charge_reason, extra_time_minutes) 
-- are stored directly on the bookings table above during bill generation.

-- 7. COOPERATIVE SPLIT PAYMENTS & FINANCIAL TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    total_paid NUMERIC(10, 2) NOT NULL,
    worker_payout_amount NUMERIC(10, 2) NOT NULL,    -- 85%
    society_operating_share NUMERIC(10, 2) NOT NULL, -- 10%
    welfare_fund_deduction NUMERIC(10, 2) NOT NULL,  -- 5%
    payment_method VARCHAR(50) DEFAULT 'UPI_MOCK',
    is_mock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SOCIAL SECURITY & INSURANCE LEDGER
CREATE TABLE worker_insurance_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES worker_profiles(id),
    policy_name VARCHAR(100) NOT NULL, -- 'PMSBY', 'PMJJBY'
    premium_amount NUMERIC(10, 2) NOT NULL,
    coverage_amount NUMERIC(12, 2) NOT NULL,
    deducted_from_welfare_pool BOOLEAN DEFAULT TRUE,
    policy_status VARCHAR(50) DEFAULT 'ACTIVE',
    effective_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. REVIEWS & QUALITY RATINGS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE REFERENCES bookings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
