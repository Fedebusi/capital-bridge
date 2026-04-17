-- P0.3 — Deal Lifecycle Tables
--
-- Adds persistence for the 12-phase loan lifecycle (origination through close-out),
-- including per-phase substeps, milestones, and responsible agents.
--
-- ⚠ SCHEMA CHANGE — Federico must review before this migration is applied on production.
-- See /home/user/capital-bridge/AGENTS.md "DO NOT TOUCH without human approval".
--
-- No seed data included here; records can be backfilled from
-- src/data/lifecyclePhases.ts after the tables are live.

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE phase_status AS ENUM ('not_started','in_progress','completed','blocked','skipped');

-- ============================================================
-- LIFECYCLE TABLES
-- ============================================================

CREATE TABLE deal_lifecycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL UNIQUE REFERENCES deals(id) ON DELETE CASCADE,
  current_phase TEXT NOT NULL DEFAULT 'origination',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deal_lifecycles_deal ON deal_lifecycles(deal_id);

CREATE TABLE lifecycle_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lifecycle_id UUID NOT NULL REFERENCES deal_lifecycles(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status phase_status NOT NULL DEFAULT 'not_started',
  start_date DATE,
  completed_date DATE,
  estimated_duration TEXT,
  depends_on TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  agents JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lifecycle_id, phase_id)
);

CREATE INDEX idx_lifecycle_phases_lifecycle ON lifecycle_phases(lifecycle_id);
CREATE INDEX idx_lifecycle_phases_phase ON lifecycle_phases(phase_id);

CREATE TABLE phase_substeps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES lifecycle_phases(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status phase_status NOT NULL DEFAULT 'not_started',
  completed_date DATE,
  assignee TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_phase_substeps_phase ON phase_substeps(phase_id);

CREATE TABLE phase_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES lifecycle_phases(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  achieved BOOLEAN NOT NULL DEFAULT FALSE,
  achieved_date DATE,
  evidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_phase_milestones_phase ON phase_milestones(phase_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- (Reuses the update_updated_at() function defined in 00001_initial_schema.sql)
-- ============================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON deal_lifecycles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lifecycle_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Same pattern as 00001_initial_schema.sql:
--   SELECT  → any authenticated user
--   INSERT  → admin/analyst/portfolio_manager
--   UPDATE  → admin/analyst/portfolio_manager
--   DELETE  → admin only
-- ============================================================

ALTER TABLE deal_lifecycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_substeps ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_milestones ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'deal_lifecycles','lifecycle_phases','phase_substeps','phase_milestones'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT TO authenticated USING (true)',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON %I FOR INSERT TO authenticated WITH CHECK (get_user_role() IN (''admin'',''analyst'',''portfolio_manager''))',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON %I FOR UPDATE TO authenticated USING (get_user_role() IN (''admin'',''analyst'',''portfolio_manager''))',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON %I FOR DELETE TO authenticated USING (get_user_role() = ''admin'')',
      tbl, tbl
    );
  END LOOP;
END;
$$;
