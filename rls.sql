-- SiteGPT Verified Resolution Agent - Row Level Security Policies
-- Run this file after schema.sql to set up RLS

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Helper function to check merchant membership
CREATE OR REPLACE FUNCTION is_merchant_member(merchant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.merchant_id = is_merchant_member.merchant_id
    AND memberships.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Merchants policies
DROP POLICY IF EXISTS "Users can view merchants they are members of" ON merchants;
CREATE POLICY "Users can view merchants they are members of"
  ON merchants FOR SELECT USING (is_merchant_member(id));

DROP POLICY IF EXISTS "Users can create merchants" ON merchants;
CREATE POLICY "Users can create merchants"
  ON merchants FOR INSERT WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their merchants" ON merchants;
CREATE POLICY "Owners can update their merchants"
  ON merchants FOR UPDATE USING (owner_user_id = auth.uid());

-- Memberships policies
DROP POLICY IF EXISTS "Users can view memberships for their merchants" ON memberships;
CREATE POLICY "Users can view memberships for their merchants"
  ON memberships FOR SELECT
  USING (user_id = auth.uid() OR is_merchant_member(merchant_id));

DROP POLICY IF EXISTS "Users can create memberships" ON memberships;
CREATE POLICY "Users can create memberships"
  ON memberships FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM merchants WHERE merchants.id = memberships.merchant_id AND merchants.owner_user_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Policies table
DROP POLICY IF EXISTS "Users can view policies for their merchants" ON policies;
CREATE POLICY "Users can view policies for their merchants"
  ON policies FOR SELECT USING (is_merchant_member(merchant_id));

DROP POLICY IF EXISTS "Users can manage policies for their merchants" ON policies;
CREATE POLICY "Users can manage policies for their merchants"
  ON policies FOR ALL USING (is_merchant_member(merchant_id));

-- Tickets policies
DROP POLICY IF EXISTS "Users can view tickets for their merchants" ON tickets;
CREATE POLICY "Users can view tickets for their merchants"
  ON tickets FOR SELECT USING (is_merchant_member(merchant_id));

DROP POLICY IF EXISTS "Users can manage tickets for their merchants" ON tickets;
CREATE POLICY "Users can manage tickets for their merchants"
  ON tickets FOR ALL USING (is_merchant_member(merchant_id));

-- Ticket entities policies
DROP POLICY IF EXISTS "Users can view ticket entities" ON ticket_entities;
CREATE POLICY "Users can view ticket entities"
  ON ticket_entities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tickets WHERE tickets.id = ticket_entities.ticket_id AND is_merchant_member(tickets.merchant_id)
  ));

DROP POLICY IF EXISTS "Users can manage ticket entities" ON ticket_entities;
CREATE POLICY "Users can manage ticket entities"
  ON ticket_entities FOR ALL
  USING (EXISTS (
    SELECT 1 FROM tickets WHERE tickets.id = ticket_entities.ticket_id AND is_merchant_member(tickets.merchant_id)
  ));

-- Audit events policies (APPEND-ONLY)
DROP POLICY IF EXISTS "Users can view audit events" ON audit_events;
CREATE POLICY "Users can view audit events"
  ON audit_events FOR SELECT USING (is_merchant_member(merchant_id));

DROP POLICY IF EXISTS "Users can insert audit events" ON audit_events;
CREATE POLICY "Users can insert audit events"
  ON audit_events FOR INSERT WITH CHECK (is_merchant_member(merchant_id));

-- NO UPDATE/DELETE policies for audit_events - append-only

-- Usage events policies
DROP POLICY IF EXISTS "Users can view usage events" ON usage_events;
CREATE POLICY "Users can view usage events"
  ON usage_events FOR SELECT USING (is_merchant_member(merchant_id));

DROP POLICY IF EXISTS "Users can insert usage events" ON usage_events;
CREATE POLICY "Users can insert usage events"
  ON usage_events FOR INSERT WITH CHECK (is_merchant_member(merchant_id));

-- Subscriptions policies (read-only for users, service role handles updates)
DROP POLICY IF EXISTS "Users can view subscriptions" ON subscriptions;
CREATE POLICY "Users can view subscriptions"
  ON subscriptions FOR SELECT USING (is_merchant_member(merchant_id));

-- Integrations policies
DROP POLICY IF EXISTS "Users can view integrations" ON integrations;
CREATE POLICY "Users can view integrations"
  ON integrations FOR SELECT USING (is_merchant_member(merchant_id));

DROP POLICY IF EXISTS "Users can manage integrations" ON integrations;
CREATE POLICY "Users can manage integrations"
  ON integrations FOR ALL USING (is_merchant_member(merchant_id));
