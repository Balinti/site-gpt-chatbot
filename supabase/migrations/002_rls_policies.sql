-- SiteGPT Verified Resolution Agent - Row Level Security Policies

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

-- Helper function to check if user is member of merchant
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
CREATE POLICY "Users can view merchants they are members of"
  ON merchants FOR SELECT
  USING (is_merchant_member(id));

CREATE POLICY "Users can create merchants"
  ON merchants FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can update their merchants"
  ON merchants FOR UPDATE
  USING (owner_user_id = auth.uid());

-- Memberships policies
CREATE POLICY "Users can view memberships for their merchants"
  ON memberships FOR SELECT
  USING (user_id = auth.uid() OR is_merchant_member(merchant_id));

CREATE POLICY "Users can create memberships for owned merchants"
  ON memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchants
      WHERE merchants.id = memberships.merchant_id
      AND merchants.owner_user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Policies (return policies) table access
CREATE POLICY "Users can view policies for their merchants"
  ON policies FOR SELECT
  USING (is_merchant_member(merchant_id));

CREATE POLICY "Users can create policies for their merchants"
  ON policies FOR INSERT
  WITH CHECK (is_merchant_member(merchant_id));

CREATE POLICY "Users can update policies for their merchants"
  ON policies FOR UPDATE
  USING (is_merchant_member(merchant_id));

-- Tickets policies
CREATE POLICY "Users can view tickets for their merchants"
  ON tickets FOR SELECT
  USING (is_merchant_member(merchant_id));

CREATE POLICY "Users can create tickets for their merchants"
  ON tickets FOR INSERT
  WITH CHECK (is_merchant_member(merchant_id));

CREATE POLICY "Users can update tickets for their merchants"
  ON tickets FOR UPDATE
  USING (is_merchant_member(merchant_id));

-- Ticket entities policies
CREATE POLICY "Users can view ticket entities for their merchant tickets"
  ON ticket_entities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_entities.ticket_id
      AND is_merchant_member(tickets.merchant_id)
    )
  );

CREATE POLICY "Users can create ticket entities for their merchant tickets"
  ON ticket_entities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_entities.ticket_id
      AND is_merchant_member(tickets.merchant_id)
    )
  );

-- Audit events policies (APPEND-ONLY - no update/delete for users)
CREATE POLICY "Users can view audit events for their merchants"
  ON audit_events FOR SELECT
  USING (is_merchant_member(merchant_id));

CREATE POLICY "Users can insert audit events for their merchants"
  ON audit_events FOR INSERT
  WITH CHECK (is_merchant_member(merchant_id));

-- No UPDATE or DELETE policies for audit_events (append-only)

-- Usage events policies
CREATE POLICY "Users can view usage events for their merchants"
  ON usage_events FOR SELECT
  USING (is_merchant_member(merchant_id));

CREATE POLICY "Users can insert usage events for their merchants"
  ON usage_events FOR INSERT
  WITH CHECK (is_merchant_member(merchant_id));

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions for their merchants"
  ON subscriptions FOR SELECT
  USING (is_merchant_member(merchant_id));

-- Subscriptions insert/update only via service role (webhook)
-- No direct user insert/update policies

-- Integrations policies
CREATE POLICY "Users can view integrations for their merchants"
  ON integrations FOR SELECT
  USING (is_merchant_member(merchant_id));

CREATE POLICY "Users can create integrations for their merchants"
  ON integrations FOR INSERT
  WITH CHECK (is_merchant_member(merchant_id));

CREATE POLICY "Users can update integrations for their merchants"
  ON integrations FOR UPDATE
  USING (is_merchant_member(merchant_id));

CREATE POLICY "Users can delete integrations for their merchants"
  ON integrations FOR DELETE
  USING (is_merchant_member(merchant_id));
