-- CapitalBridge Database Schema
-- Full migration: profiles, deals, borrowers, DD, approvals, construction, term sheets, audit

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE deal_stage AS ENUM ('screening','due_diligence','ic_approval','documentation','active','repaid','rejected');
CREATE TYPE covenant_status AS ENUM ('compliant','watch','breach');
CREATE TYPE drawdown_status AS ENUM ('pending','requested','approved','disbursed');
CREATE TYPE unit_sale_status AS ENUM ('available','reserved','contracted','sold');
CREATE TYPE dd_status AS ENUM ('pending','in_progress','completed','flagged','not_applicable');
CREATE TYPE dd_category AS ENUM ('technical','commercial','legal','financial','environmental','appraisal');
CREATE TYPE vote_decision AS ENUM ('approve','reject','approve_with_conditions');
CREATE TYPE approval_status AS ENUM ('pending_ic','pending_capital_partner','approved','rejected','approved_with_conditions');
CREATE TYPE legal_doc_status AS ENUM ('not_started','drafting','review','negotiation','agreed','executed');
CREATE TYPE cp_status AS ENUM ('pending','submitted','verified','waived');
CREATE TYPE security_item_status AS ENUM ('pending','in_progress','executed','released');
CREATE TYPE term_sheet_status AS ENUM ('draft','internal_review','cp_validation','issued','negotiation','signed','expired','rejected');
CREATE TYPE waiver_status AS ENUM ('requested','internal_review','cp_review','approved','rejected','expired');
CREATE TYPE kyc_status AS ENUM ('valid','expiring_soon','expired','pending');
CREATE TYPE borrower_rating AS ENUM ('A','B','C','D','unrated');
CREATE TYPE user_role AS ENUM ('admin','analyst','portfolio_manager','investor','viewer');
CREATE TYPE certification_status AS ENUM ('submitted','reviewed','approved','paid','disputed');
CREATE TYPE site_visit_recommendation AS ENUM ('proceed','hold','review');
CREATE TYPE schedule_status AS ENUM ('on_track','minor_delay','major_delay','ahead');
CREATE TYPE cost_status AS ENUM ('within_budget','minor_overrun','major_overrun','under_budget');
CREATE TYPE quality_assessment AS ENUM ('satisfactory','needs_improvement','unsatisfactory');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- BORROWERS
-- ============================================================

CREATE TABLE borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Developer','Sponsor','Developer & Sponsor')),
  internal_rating borrower_rating NOT NULL DEFAULT 'unrated',
  rating_date DATE NOT NULL DEFAULT CURRENT_DATE,
  headquarters TEXT NOT NULL DEFAULT '',
  year_established INT NOT NULL DEFAULT 2000,
  website TEXT,
  description TEXT NOT NULL DEFAULT '',
  total_exposure NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_commitments NUMERIC(15,2) NOT NULL DEFAULT 0,
  number_of_active_deals INT NOT NULL DEFAULT 0,
  avg_irr NUMERIC(6,2),
  avg_multiple NUMERIC(6,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE borrower_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT ''
);

CREATE TABLE corporate_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SPV','Holding','Sponsor','UBO')),
  jurisdiction TEXT NOT NULL DEFAULT '',
  registration_number TEXT,
  ownership TEXT
);

CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  last_checked DATE,
  expiry_date DATE,
  notes TEXT
);

CREATE TABLE completed_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  year INT NOT NULL,
  units INT NOT NULL DEFAULT 0,
  loan_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  irr NUMERIC(6,2) NOT NULL DEFAULT 0,
  multiple NUMERIC(6,3) NOT NULL DEFAULT 0,
  days_delay INT NOT NULL DEFAULT 0,
  outcome TEXT NOT NULL CHECK (outcome IN ('on_time','minor_delay','significant_delay'))
);

-- ============================================================
-- DEALS
-- ============================================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL,
  borrower_name TEXT NOT NULL DEFAULT '',
  sponsor TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  coordinates NUMERIC(10,6)[] NOT NULL DEFAULT ARRAY[0,0]::NUMERIC[],
  stage deal_stage NOT NULL DEFAULT 'screening',
  asset_type TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  loan_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  interest_rate NUMERIC(6,3) NOT NULL DEFAULT 0,
  pik_spread NUMERIC(6,3) NOT NULL DEFAULT 0,
  total_rate NUMERIC(6,3) NOT NULL DEFAULT 0,
  origination_fee NUMERIC(6,3) NOT NULL DEFAULT 0,
  exit_fee NUMERIC(6,3) NOT NULL DEFAULT 0,
  tenor INT NOT NULL DEFAULT 0,
  maturity_date DATE,
  disbursed_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  outstanding_principal NUMERIC(15,2) NOT NULL DEFAULT 0,
  accrued_pik NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_exposure NUMERIC(15,2) NOT NULL DEFAULT 0,
  gdv NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_appraisal NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_units INT NOT NULL DEFAULT 0,
  total_area NUMERIC(10,2) NOT NULL DEFAULT 0,
  construction_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
  construction_spent NUMERIC(15,2) NOT NULL DEFAULT 0,
  construction_progress INT NOT NULL DEFAULT 0 CHECK (construction_progress BETWEEN 0 AND 100),
  land_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
  ltv NUMERIC(6,2) NOT NULL DEFAULT 0,
  ltc NUMERIC(6,2) NOT NULL DEFAULT 0,
  pre_sales_percent NUMERIC(6,2) NOT NULL DEFAULT 0,
  developer_experience TEXT NOT NULL DEFAULT '',
  developer_track_record INT NOT NULL DEFAULT 0,
  date_received DATE NOT NULL DEFAULT CURRENT_DATE,
  term_sheet_date DATE,
  ic_approval_date DATE,
  closing_date DATE,
  first_drawdown_date DATE,
  expected_maturity DATE,
  screening_score INT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_borrower ON deals(borrower_id);

-- ============================================================
-- DEAL SUB-ENTITIES
-- ============================================================

CREATE TABLE drawdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  scheduled_date DATE NOT NULL,
  status drawdown_status NOT NULL DEFAULT 'pending',
  construction_progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE covenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metric TEXT NOT NULL,
  threshold TEXT NOT NULL,
  current_value TEXT NOT NULL DEFAULT '',
  status covenant_status NOT NULL DEFAULT 'compliant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE unit_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  unit TEXT NOT NULL,
  type TEXT NOT NULL,
  area NUMERIC(10,2) NOT NULL DEFAULT 0,
  list_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  status unit_sale_status NOT NULL DEFAULT 'available',
  sale_price NUMERIC(15,2),
  release_price NUMERIC(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE screening_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  pass BOOLEAN NOT NULL DEFAULT FALSE,
  value TEXT NOT NULL DEFAULT '',
  threshold TEXT NOT NULL DEFAULT ''
);

-- ============================================================
-- DUE DILIGENCE
-- ============================================================

CREATE TABLE due_diligence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  category dd_category NOT NULL,
  label TEXT NOT NULL,
  status dd_status NOT NULL DEFAULT 'pending',
  assignee TEXT,
  due_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dd_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dd_item_id UUID NOT NULL REFERENCES due_diligence_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  storage_path TEXT
);

-- ============================================================
-- APPROVALS
-- ============================================================

CREATE TABLE approval_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  ic_date DATE NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending_ic',
  cp_sign_off_approved BOOLEAN,
  cp_sign_off_signed_by TEXT,
  cp_sign_off_date DATE,
  cp_sign_off_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ic_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES approval_records(id) ON DELETE CASCADE,
  voter TEXT NOT NULL,
  role TEXT NOT NULL,
  decision vote_decision NOT NULL,
  conditions TEXT,
  date DATE NOT NULL
);

-- ============================================================
-- LEGAL & SECURITY
-- ============================================================

CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status legal_doc_status NOT NULL DEFAULT 'not_started',
  current_version INT NOT NULL DEFAULT 0,
  assigned_to TEXT NOT NULL DEFAULT '',
  deadline DATE,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT
);

CREATE TABLE conditions_precedent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status cp_status NOT NULL DEFAULT 'pending',
  verified_by TEXT,
  verified_date DATE,
  notes TEXT
);

CREATE TABLE security_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status security_item_status NOT NULL DEFAULT 'pending',
  entity TEXT,
  registration_date DATE,
  expiry_date DATE,
  notes TEXT
);

-- ============================================================
-- TERM SHEETS & WAIVERS
-- ============================================================

CREATE TABLE term_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  current_status term_sheet_status NOT NULL DEFAULT 'draft',
  current_version INT NOT NULL DEFAULT 1,
  issued_date DATE,
  signed_date DATE,
  exclusivity_end DATE,
  cp_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  cp_submitted_date DATE,
  cp_approved BOOLEAN,
  cp_approved_by TEXT,
  cp_approved_date DATE,
  cp_conditions TEXT[],
  cp_memo_attached BOOLEAN NOT NULL DEFAULT FALSE,
  cp_model_attached BOOLEAN NOT NULL DEFAULT FALSE,
  facility NUMERIC(15,2) NOT NULL DEFAULT 0,
  cash_rate NUMERIC(6,3) NOT NULL DEFAULT 0,
  pik_spread NUMERIC(6,3) NOT NULL DEFAULT 0,
  origination_fee NUMERIC(6,3) NOT NULL DEFAULT 0,
  exit_fee NUMERIC(6,3) NOT NULL DEFAULT 0,
  tenor INT NOT NULL DEFAULT 0,
  ltv_covenant NUMERIC(6,2) NOT NULL DEFAULT 0,
  ltc_covenant NUMERIC(6,2) NOT NULL DEFAULT 0,
  min_presales NUMERIC(6,2) NOT NULL DEFAULT 0,
  security_package TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE term_sheet_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_sheet_id UUID NOT NULL REFERENCES term_sheets(id) ON DELETE CASCADE,
  version INT NOT NULL,
  date DATE NOT NULL,
  status term_sheet_status NOT NULL,
  updated_by TEXT NOT NULL,
  changes TEXT
);

CREATE TABLE waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  covenant_name TEXT NOT NULL,
  request_date DATE NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  current_value TEXT NOT NULL DEFAULT '',
  threshold TEXT NOT NULL DEFAULT '',
  proposed_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  fee_type TEXT NOT NULL DEFAULT 'flat' CHECK (fee_type IN ('flat','bps_on_outstanding')),
  status waiver_status NOT NULL DEFAULT 'requested',
  validity_period TEXT,
  internal_approved BOOLEAN,
  internal_approved_by TEXT,
  internal_approved_date DATE,
  cp_approved BOOLEAN,
  cp_approved_by TEXT,
  cp_approved_date DATE,
  cp_conditions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONSTRUCTION MONITORING
-- ============================================================

CREATE TABLE site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  inspector TEXT NOT NULL,
  construction_progress INT NOT NULL DEFAULT 0,
  planning_progress INT NOT NULL DEFAULT 0,
  deviation INT NOT NULL DEFAULT 0,
  weather_conditions TEXT,
  workers_on_site INT,
  findings TEXT[] NOT NULL DEFAULT '{}',
  recommendation site_visit_recommendation NOT NULL DEFAULT 'proceed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE site_visit_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id UUID NOT NULL REFERENCES site_visits(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT ''
);

CREATE TABLE construction_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  cert_number INT NOT NULL,
  period TEXT NOT NULL,
  submitted_date DATE NOT NULL,
  certified_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  retention_percent NUMERIC(5,2) NOT NULL DEFAULT 5,
  retention_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_payable NUMERIC(15,2) NOT NULL DEFAULT 0,
  cumulative_certified NUMERIC(15,2) NOT NULL DEFAULT 0,
  cumulative_retention NUMERIC(15,2) NOT NULL DEFAULT 0,
  status certification_status NOT NULL DEFAULT 'submitted',
  approved_by TEXT,
  approved_date DATE,
  linked_drawdown_id UUID REFERENCES drawdowns(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE monitoring_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  report_number INT NOT NULL,
  date DATE NOT NULL,
  prepared_by TEXT NOT NULL,
  period TEXT NOT NULL,
  construction_progress INT NOT NULL DEFAULT 0,
  budget_utilization INT NOT NULL DEFAULT 0,
  schedule_status schedule_status NOT NULL DEFAULT 'on_track',
  cost_status cost_status NOT NULL DEFAULT 'within_budget',
  quality_assessment quality_assessment NOT NULL DEFAULT 'satisfactory',
  key_findings TEXT[] NOT NULL DEFAULT '{}',
  recommendation TEXT NOT NULL DEFAULT '',
  next_milestone TEXT NOT NULL DEFAULT '',
  next_milestone_date DATE,
  drawdown_recommendation TEXT NOT NULL DEFAULT 'approve' CHECK (drawdown_recommendation IN ('approve','hold','partial')),
  drawdown_amount NUMERIC(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT 'System',
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON covenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON unit_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON borrowers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON due_diligence_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON approval_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON term_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON waivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE covenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrower_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_diligence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dd_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions_precedent ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_sheet_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users see their own, admins see all
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR get_user_role() IN ('admin','portfolio_manager')
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  id = auth.uid() OR get_user_role() = 'admin'
);

-- Deals: all authenticated users can read; admin/analyst/pm can write
CREATE POLICY deals_select ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY deals_insert ON deals FOR INSERT TO authenticated WITH CHECK (
  get_user_role() IN ('admin','analyst','portfolio_manager')
);
CREATE POLICY deals_update ON deals FOR UPDATE TO authenticated USING (
  get_user_role() IN ('admin','analyst','portfolio_manager')
);
CREATE POLICY deals_delete ON deals FOR DELETE TO authenticated USING (
  get_user_role() = 'admin'
);

-- Generic read-all / write-by-role for deal sub-tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'drawdowns','covenants','unit_sales','screening_criteria',
    'due_diligence_items','dd_documents','approval_records','ic_votes',
    'legal_documents','conditions_precedent','security_items',
    'term_sheets','term_sheet_versions','waivers',
    'site_visits','site_visit_photos','construction_certifications','monitoring_reports'
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

-- Borrowers: same pattern
CREATE POLICY borrowers_select ON borrowers FOR SELECT TO authenticated USING (true);
CREATE POLICY borrowers_insert ON borrowers FOR INSERT TO authenticated WITH CHECK (
  get_user_role() IN ('admin','analyst','portfolio_manager')
);
CREATE POLICY borrowers_update ON borrowers FOR UPDATE TO authenticated USING (
  get_user_role() IN ('admin','analyst','portfolio_manager')
);
CREATE POLICY borrowers_delete ON borrowers FOR DELETE TO authenticated USING (
  get_user_role() = 'admin'
);

-- Borrower sub-tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'borrower_contacts','corporate_entities','kyc_records','completed_projects'
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

-- Audit logs: everyone reads, only system/admin inserts
CREATE POLICY audit_select ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY audit_insert ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents', 'documents', false),
  ('site-photos', 'site-photos', false);

-- Documents: authenticated users can read, admin/analyst/pm can upload
CREATE POLICY documents_select ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY documents_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'documents' AND get_user_role() IN ('admin','analyst','portfolio_manager')
);

CREATE POLICY photos_select ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'site-photos');
CREATE POLICY photos_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'site-photos' AND get_user_role() IN ('admin','analyst','portfolio_manager')
);
