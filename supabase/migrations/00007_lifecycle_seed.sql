-- P0.3 — Deal Lifecycle Seed Data
--
-- Seeds one `deal_lifecycles` row per demo deal (from 00002_seed_data.sql) plus the
-- 12 phase stubs per lifecycle (from src/data/lifecyclePhases.ts `phaseDefinitions`).
--
-- Depends on 00006_lifecycle_tables.sql being applied first.
--
-- Idempotent:
--   - `deal_lifecycles` INSERTs use ON CONFLICT (deal_id) DO NOTHING
--   - `lifecycle_phases` INSERTs use ON CONFLICT (lifecycle_id, phase_id) DO NOTHING
--
-- Substeps and milestones are NOT seeded — they can be backfilled through the UI.
--
-- Status mapping (per each deal's stage):
--   Phases BEFORE current_phase (in order) → completed
--   current_phase itself                  → in_progress
--   Phases AFTER current_phase            → not_started

-- ============================================================
-- DEAL_LIFECYCLES — one per deal, with current_phase per stage
-- ============================================================

INSERT INTO deal_lifecycles (deal_id, current_phase) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'drawdown_construction'), -- active
  ('d0000002-0000-0000-0000-000000000002', 'due_diligence'),         -- due_diligence
  ('d0000003-0000-0000-0000-000000000003', 'ic_approval'),           -- ic_approval
  ('d0000004-0000-0000-0000-000000000004', 'origination'),           -- screening
  ('d0000005-0000-0000-0000-000000000005', 'repayment'),             -- repaid
  ('d0000006-0000-0000-0000-000000000006', 'legal_documentation')    -- documentation
ON CONFLICT (deal_id) DO NOTHING;

-- ============================================================
-- LIFECYCLE_PHASES — 12 rows per lifecycle
-- ------------------------------------------------------------
-- We use a PL/pgSQL DO block with a static array of phase templates and a per-deal
-- status function, to keep this manageable. Agents are embedded as JSONB literals.
-- ============================================================

DO $seed$
DECLARE
  phase_templates JSONB := '[
    {
      "phase_id": "origination",
      "number": 1,
      "name": "Originación y Sourcing",
      "description": "Identificación de oportunidades a través de relaciones directas con promotores, intermediarios financieros, bancos y deal flow propio. Primer filtro rápido (screening) contra la política de inversión del fondo.",
      "estimated_duration": "1-2 weeks",
      "depends_on": [],
      "agents": [
        {"name": "Equipo de Originación", "role": "Deal sourcing & screening", "organization": "internal"},
        {"name": "Brokers de Deuda", "role": "Deal referral", "organization": "external"},
        {"name": "Promotor", "role": "Project presentation", "organization": "borrower"},
        {"name": "Asesor Financiero", "role": "Advisory to borrower", "organization": "borrower"}
      ]
    },
    {
      "phase_id": "term_sheet",
      "number": 2,
      "name": "Term Sheet y Exclusividad",
      "description": "Emisión de term sheet indicativo con condiciones principales. Requiere validación de Capital Partner con memo/modelo previo. Negociación de términos y firma de acuerdo de exclusividad.",
      "estimated_duration": "2-3 weeks",
      "depends_on": ["origination"],
      "agents": [
        {"name": "Equipo de Originación", "role": "Term sheet drafting", "organization": "internal"},
        {"name": "Equipo Legal Interno", "role": "Legal review of terms", "organization": "internal"},
        {"name": "Capital Partner", "role": "Term sheet validation & approval", "organization": "capital_partner"},
        {"name": "Promotor", "role": "Terms negotiation", "organization": "borrower"}
      ]
    },
    {
      "phase_id": "due_diligence",
      "number": 3,
      "name": "Due Diligence",
      "description": "Fase más densa del proceso. Se desarrolla en paralelo por 6 vías: técnica/urbanística, comercial, valoración, legal, financiera/promotor, y medioambiental/compliance. Todas las DD se realizan in-house con apoyo puntual externo.",
      "estimated_duration": "4-8 weeks",
      "depends_on": ["term_sheet"],
      "agents": [
        {"name": "Equipo de Underwriting", "role": "Financial analysis & modeling", "organization": "internal"},
        {"name": "Abogados Externos", "role": "Legal due diligence", "organization": "external"},
        {"name": "Tasador Independiente", "role": "Independent valuation (ECO)", "organization": "external"},
        {"name": "Monitoring Surveyor", "role": "Technical & construction review", "organization": "external"},
        {"name": "Consultores de Mercado", "role": "Market analysis", "organization": "external"},
        {"name": "Compliance", "role": "KYC/AML screening", "organization": "internal"}
      ]
    },
    {
      "phase_id": "ic_approval",
      "number": 4,
      "name": "Aprobación IC / Crédito",
      "description": "Presentación del investment memorandum al comité de inversiones. Incluye resumen ejecutivo, análisis de riesgos, modelo financiero con escenarios. La decisión final es de Capital Partner — hay que consensuar el contenido del memo/modelo.",
      "estimated_duration": "1-2 weeks",
      "depends_on": ["due_diligence"],
      "agents": [
        {"name": "Equipo de Underwriting", "role": "Credit paper preparation", "organization": "internal"},
        {"name": "Comité de Inversiones", "role": "IC vote & decision", "organization": "internal"},
        {"name": "CIO", "role": "Investment decision", "organization": "internal"},
        {"name": "Risk Officer", "role": "Risk assessment", "organization": "internal"},
        {"name": "Capital Partner", "role": "Final approval authority", "organization": "capital_partner"}
      ]
    },
    {
      "phase_id": "legal_documentation",
      "number": 5,
      "name": "Negociación y Documentación Legal",
      "description": "Negociación de documentación definitiva: facility agreement, escritura de hipoteca, prenda de participaciones, project account, direct agreement con constructor. Puede llevar varias semanas.",
      "estimated_duration": "3-6 weeks",
      "depends_on": ["ic_approval"],
      "agents": [
        {"name": "Abogados del Fondo", "role": "Draft & negotiate loan docs", "organization": "external"},
        {"name": "Abogados del Promotor", "role": "Review & negotiate on behalf of borrower", "organization": "borrower"},
        {"name": "Notario", "role": "Public deed execution", "organization": "external"}
      ]
    },
    {
      "phase_id": "conditions_precedent",
      "number": 6,
      "name": "Conditions Precedent y Primer Desembolso",
      "description": "Verificación del cumplimiento de todas las CP: licencia de obra, seguros, cuenta proyecto, equity del promotor, contrato de obra. Firma notarial y primer desembolso.",
      "estimated_duration": "2-4 weeks",
      "depends_on": ["legal_documentation"],
      "agents": [
        {"name": "Equipo Legal", "role": "CP verification", "organization": "internal"},
        {"name": "Notario", "role": "Deed execution & registration", "organization": "external"},
        {"name": "Promotor", "role": "CP delivery", "organization": "borrower"},
        {"name": "Aseguradora", "role": "Insurance policy issuance", "organization": "external"},
        {"name": "Registro de la Propiedad", "role": "Mortgage registration", "organization": "external"}
      ]
    },
    {
      "phase_id": "drawdown_construction",
      "number": 7,
      "name": "Periodo de Disposición y Seguimiento de Obra",
      "description": "Disposiciones periódicas contra certificaciones de obra. El monitoring surveyor verifica avance, compara con planning y presupuesto, y emite informe con recomendación. Retenciones de obra como garantía.",
      "estimated_duration": "12-24 months (ongoing)",
      "depends_on": ["conditions_precedent"],
      "agents": [
        {"name": "Monitoring Surveyor", "role": "Site inspection & certification review", "organization": "internal"},
        {"name": "Director de Obra", "role": "Construction oversight", "organization": "borrower"},
        {"name": "Constructor", "role": "Construction execution", "organization": "borrower"},
        {"name": "Equipo de Asset Management", "role": "Drawdown authorization", "organization": "internal"}
      ]
    },
    {
      "phase_id": "monitoring_reporting",
      "number": 8,
      "name": "Seguimiento Continuo y Reporting",
      "description": "Monitorización de covenants financieros, gestión de waivers (requieren OK de Capital Partner con fee adicional), reporting periódico del promotor, control de project account. Protocolos de desviación.",
      "estimated_duration": "Ongoing (parallel to phases 7-10)",
      "depends_on": ["drawdown_construction"],
      "agents": [
        {"name": "Equipo de Loan Management", "role": "Covenant monitoring & reporting", "organization": "internal"},
        {"name": "Promotor", "role": "Periodic reporting (sales, financials, construction)", "organization": "borrower"},
        {"name": "Monitoring Surveyor", "role": "Construction progress reporting", "organization": "internal"},
        {"name": "Capital Partner", "role": "Waiver approval & oversight", "organization": "capital_partner"}
      ]
    },
    {
      "phase_id": "commercialization",
      "number": 9,
      "name": "Comercialización y Preventas",
      "description": "Monitorización del ritmo de ventas vs business plan, precios de cierre vs hipótesis, calidad de compradores. Covenant de nivel mínimo de preventas como condición para desembolsos finales.",
      "estimated_duration": "Ongoing (parallel to construction)",
      "depends_on": ["drawdown_construction"],
      "agents": [
        {"name": "Equipo Comercial Promotor", "role": "Sales execution", "organization": "borrower"},
        {"name": "Agencia de Ventas", "role": "Marketing & sales", "organization": "borrower"},
        {"name": "Equipo de Asset Management", "role": "Sales monitoring & covenant check", "organization": "internal"}
      ]
    },
    {
      "phase_id": "completion_handover",
      "number": 10,
      "name": "Finalización de Obra y Entrega de Llaves",
      "description": "Certificado de final de obra, licencia de primera ocupación (cédula de habitabilidad), alta de suministros, entrega de viviendas. Cada venta genera ingreso en cuenta proyecto según waterfall.",
      "estimated_duration": "2-6 months",
      "depends_on": ["drawdown_construction", "commercialization"],
      "agents": [
        {"name": "Promotor", "role": "Completion & handover management", "organization": "borrower"},
        {"name": "Dirección Facultativa", "role": "Final de obra certification", "organization": "external"},
        {"name": "Ayuntamiento", "role": "Licencia primera ocupación", "organization": "external"},
        {"name": "Notarios", "role": "Buyer purchase deeds", "organization": "external"},
        {"name": "Equipo de Loan Management", "role": "Cash flow monitoring", "organization": "internal"}
      ]
    },
    {
      "phase_id": "repayment",
      "number": 11,
      "name": "Repago del Préstamo",
      "description": "Cada venta genera repago parcial obligatorio (mandatory prepayment) según release price pactado. Cancelación parcial de hipoteca por unidad. Balloon al vencimiento si quedan unidades sin vender.",
      "estimated_duration": "3-12 months",
      "depends_on": ["completion_handover"],
      "agents": [
        {"name": "Notarios", "role": "Sale deeds & mortgage releases", "organization": "external"},
        {"name": "Registro de la Propiedad", "role": "Charge cancellation", "organization": "external"},
        {"name": "Equipo de Loan Management", "role": "Prepayment tracking & release authorization", "organization": "internal"},
        {"name": "Promotor", "role": "Sales coordination", "organization": "borrower"},
        {"name": "Compradores Finales", "role": "Unit purchase", "organization": "external"}
      ]
    },
    {
      "phase_id": "close_out",
      "number": 12,
      "name": "Cierre de la Operación",
      "description": "Cancelaciones registrales, liberación de garantías (prenda, fianzas), cierre de cuentas proyecto, revisión final interna (post-mortem). Documentación del rendimiento real (TIR, múltiplo) para track record del fondo.",
      "estimated_duration": "2-4 weeks",
      "depends_on": ["repayment"],
      "agents": [
        {"name": "Equipo Legal", "role": "Guarantee release & deregistration", "organization": "internal"},
        {"name": "Equipo de Reporting", "role": "Performance analysis & lessons learned", "organization": "internal"},
        {"name": "Portfolio Manager", "role": "Track record documentation", "organization": "internal"}
      ]
    }
  ]'::jsonb;

  -- Ordered list of phase ids (index = ordinal position, 1-based)
  phase_order TEXT[] := ARRAY[
    'origination',
    'term_sheet',
    'due_diligence',
    'ic_approval',
    'legal_documentation',
    'conditions_precedent',
    'drawdown_construction',
    'monitoring_reporting',
    'commercialization',
    'completion_handover',
    'repayment',
    'close_out'
  ];

  lifecycle_row RECORD;
  tpl JSONB;
  current_idx INT;
  phase_idx INT;
  computed_status phase_status;
  depends_on_arr TEXT[];
  agents_jsonb JSONB;
BEGIN
  FOR lifecycle_row IN
    SELECT dl.id AS lifecycle_id, dl.current_phase
    FROM deal_lifecycles dl
    WHERE dl.deal_id IN (
      'd0000001-0000-0000-0000-000000000001',
      'd0000002-0000-0000-0000-000000000002',
      'd0000003-0000-0000-0000-000000000003',
      'd0000004-0000-0000-0000-000000000004',
      'd0000005-0000-0000-0000-000000000005',
      'd0000006-0000-0000-0000-000000000006'
    )
  LOOP
    current_idx := array_position(phase_order, lifecycle_row.current_phase);

    FOR phase_idx IN 1..array_length(phase_order, 1) LOOP
      tpl := phase_templates -> (phase_idx - 1);

      IF phase_idx < current_idx THEN
        computed_status := 'completed';
      ELSIF phase_idx = current_idx THEN
        computed_status := 'in_progress';
      ELSE
        computed_status := 'not_started';
      END IF;

      -- Convert JSONB array of phase ids to TEXT[]
      SELECT COALESCE(array_agg(x.value #>> '{}'), ARRAY[]::TEXT[])
      INTO depends_on_arr
      FROM jsonb_array_elements(tpl -> 'depends_on') AS x(value);

      agents_jsonb := tpl -> 'agents';

      INSERT INTO lifecycle_phases (
        lifecycle_id,
        phase_id,
        number,
        name,
        description,
        status,
        estimated_duration,
        depends_on,
        agents
      ) VALUES (
        lifecycle_row.lifecycle_id,
        tpl ->> 'phase_id',
        (tpl ->> 'number')::INT,
        tpl ->> 'name',
        tpl ->> 'description',
        computed_status,
        tpl ->> 'estimated_duration',
        depends_on_arr,
        agents_jsonb
      )
      ON CONFLICT (lifecycle_id, phase_id) DO NOTHING;
    END LOOP;
  END LOOP;
END
$seed$;
