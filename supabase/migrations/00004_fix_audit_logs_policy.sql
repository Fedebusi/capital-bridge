-- Fix audit_logs policies: prevent arbitrary inserts and ensure immutability
-- Previously: any authenticated user could insert fake audit log entries

-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS audit_insert ON audit_logs;

-- Only admin, analyst, and portfolio_manager can insert audit logs
CREATE POLICY audit_insert ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'analyst', 'portfolio_manager'));

-- Audit logs are immutable: nobody can update them
CREATE POLICY audit_no_update ON audit_logs FOR UPDATE TO authenticated
  USING (false);

-- Audit logs are permanent: nobody can delete them
CREATE POLICY audit_no_delete ON audit_logs FOR DELETE TO authenticated
  USING (false);
