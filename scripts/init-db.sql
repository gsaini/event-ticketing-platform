-- =============================================================================
-- Event Ticket Booking Platform — Database Initialization
-- Runs automatically on first PostgreSQL container start
-- =============================================================================

-- Create schemas for service isolation
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS events;
CREATE SCHEMA IF NOT EXISTS bookings;
CREATE SCHEMA IF NOT EXISTS payments;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users Schema ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'attendee' CHECK (role IN ('attendee', 'organizer', 'admin', 'box_office')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users.organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    tax_id VARCHAR(50),
    bank_account VARCHAR(100),
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users.users(email);
CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON users.organizers(user_id);

-- ─── Events Schema ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    total_capacity INTEGER NOT NULL,
    seating_chart JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events.sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES events.venues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    section_type VARCHAR(20) NOT NULL DEFAULT 'seated' CHECK (section_type IN ('seated', 'standing', 'vip_box')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events.seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES events.sections(id) ON DELETE CASCADE,
    row_label VARCHAR(10) NOT NULL,
    seat_number INTEGER NOT NULL,
    is_accessible BOOLEAN NOT NULL DEFAULT false,
    coordinates JSONB,
    UNIQUE (section_id, row_label, seat_number)
);

CREATE TABLE IF NOT EXISTS events.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL,
    venue_id UUID REFERENCES events.venues(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(50),
    image_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events.ticket_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events.events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity_total INTEGER NOT NULL,
    quantity_sold INTEGER NOT NULL DEFAULT 0,
    quantity_held INTEGER NOT NULL DEFAULT 0,
    sale_start TIMESTAMPTZ,
    sale_end TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status_start ON events.events(status, start_time);
CREATE INDEX IF NOT EXISTS idx_events_genre_city ON events.events(genre);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON events.ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_seats_section ON events.seats(section_id);

-- ─── Bookings Schema ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'confirmed', 'cancelled', 'expired', 'refunded')),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    promo_code VARCHAR(50),
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    hold_expires_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings.bookings(id) ON DELETE CASCADE,
    ticket_tier_id UUID NOT NULL,
    seat_id UUID,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'active', 'used', 'cancelled', 'transferred')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings.bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_idempotency ON bookings.bookings(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings.bookings(status);
CREATE INDEX IF NOT EXISTS idx_tickets_booking ON bookings.tickets(booking_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON bookings.tickets(qr_code);

-- ─── Payments Schema ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'stripe' CHECK (provider IN ('stripe', 'razorpay')),
    provider_txn_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded')),
    provider_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_txn ON payments.payments(provider_txn_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments.payments(status);
