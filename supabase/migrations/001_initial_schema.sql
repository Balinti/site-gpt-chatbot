-- SiteGPT Verified Resolution Agent - Initial Schema
-- This migration creates all tables needed for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memberships table (user-merchant relationships)
CREATE TABLE IF NOT EXISTS memberships (
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (merchant_id, user_id)
);

-- Policies table (return/refund policies)
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  policy JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  external_source TEXT NOT NULL DEFAULT 'manual' CHECK (external_source IN ('manual', 'demo', 'gorgias', 'zendesk', 'freshdesk')),
  external_id TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'contained', 'escalated', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket entities table (orders, tracking, returns linked to tickets)
CREATE TABLE IF NOT EXISTS ticket_entities (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('order', 'tracking', 'return')),
  external_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit events table (append-only)
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  ticket_id TEXT REFERENCES tickets(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'system' CHECK (actor_type IN ('user', 'system')),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'ticket_created',
    'resolution_generated',
    'draft_copied',
    'marked_contained',
    'policy_changed',
    'integration_connected',
    'integration_disconnected'
  )),
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB NOT NULL DEFAULT '{}',
  citations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage events table (for billing/tracking)
CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  ticket_id TEXT REFERENCES tickets(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('generated', 'contained', 'sent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table (Stripe subscription data)
CREATE TABLE IF NOT EXISTS subscriptions (
  merchant_id TEXT PRIMARY KEY REFERENCES merchants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN (
    'active', 'canceled', 'incomplete', 'incomplete_expired',
    'past_due', 'trialing', 'unpaid', 'inactive'
  )),
  price_id TEXT,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrations table (external service connections)
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('shopify', 'gorgias', 'aftership', 'zendesk', 'freshdesk')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'disconnected')),
  credentials_encrypted TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (merchant_id, provider)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_merchant_id ON tickets(merchant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_merchant_id ON audit_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_ticket_id ON audit_events(ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_merchant_id ON usage_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_merchant_provider ON integrations(merchant_id, provider);
