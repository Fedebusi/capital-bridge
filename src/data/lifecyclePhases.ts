// ===== LOAN LIFECYCLE PHASES =====
// Based on the 12-phase bridge loan lifecycle for real estate development
// Each phase has: agents (responsible parties), milestone (hito), substeps, and dependencies

export type PhaseId =
  | "origination"
  | "term_sheet"
  | "due_diligence"
  | "ic_approval"
  | "legal_documentation"
  | "conditions_precedent"
  | "drawdown_construction"
  | "monitoring_reporting"
  | "commercialization"
  | "completion_handover"
  | "repayment"
  | "close_out";

export type PhaseStatus = "not_started" | "in_progress" | "completed" | "blocked" | "skipped";

export interface PhaseAgent {
  name: string;
  role: string;
  organization: "internal" | "external" | "borrower" | "capital_partner";
}

export interface PhaseSubstep {
  id: string;
  label: string;
  description: string;
  status: PhaseStatus;
  completedDate?: string;
  assignee?: string;
  notes?: string;
}

export interface PhaseMilestone {
  description: string;
  achieved: boolean;
  achievedDate?: string;
  evidence?: string; // document or record that proves the milestone
}

export interface LifecyclePhase {
  id: PhaseId;
  number: number;
  name: string;
  description: string;
  agents: PhaseAgent[];
  milestones: PhaseMilestone[];
  substeps: PhaseSubstep[];
  status: PhaseStatus;
  startDate?: string;
  completedDate?: string;
  estimatedDuration?: string; // e.g. "2-4 weeks"
  dependsOn: PhaseId[]; // phases that must be completed before this one
  notes?: string;
}

export interface DealLifecycle {
  dealId: string;
  currentPhase: PhaseId;
  phases: LifecyclePhase[];
}

// ===== PHASE DEFINITIONS (template) =====

export const phaseDefinitions: Omit<LifecyclePhase, "status" | "substeps" | "milestones" | "startDate" | "completedDate">[] = [
  {
    id: "origination",
    number: 1,
    name: "Originación y Sourcing",
    description: "Identificación de oportunidades a través de relaciones directas con promotores, intermediarios financieros, bancos y deal flow propio. Primer filtro rápido (screening) contra la política de inversión del fondo.",
    agents: [
      { name: "Equipo de Originación", role: "Deal sourcing & screening", organization: "internal" },
      { name: "Brokers de Deuda", role: "Deal referral", organization: "external" },
      { name: "Promotor", role: "Project presentation", organization: "borrower" },
      { name: "Asesor Financiero", role: "Advisory to borrower", organization: "borrower" },
    ],
    estimatedDuration: "1-2 weeks",
    dependsOn: [],
  },
  {
    id: "term_sheet",
    number: 2,
    name: "Term Sheet y Exclusividad",
    description: "Emisión de term sheet indicativo con condiciones principales. Requiere validación de Castlelake con memo/modelo previo. Negociación de términos y firma de acuerdo de exclusividad.",
    agents: [
      { name: "Equipo de Originación", role: "Term sheet drafting", organization: "internal" },
      { name: "Equipo Legal Interno", role: "Legal review of terms", organization: "internal" },
      { name: "Castlelake", role: "Term sheet validation & approval", organization: "capital_partner" },
      { name: "Promotor", role: "Terms negotiation", organization: "borrower" },
    ],
    estimatedDuration: "2-3 weeks",
    dependsOn: ["origination"],
  },
  {
    id: "due_diligence",
    number: 3,
    name: "Due Diligence",
    description: "Fase más densa del proceso. Se desarrolla en paralelo por 6 vías: técnica/urbanística, comercial, valoración, legal, financiera/promotor, y medioambiental/compliance. Todas las DD se realizan in-house con apoyo puntual externo.",
    agents: [
      { name: "Equipo de Underwriting", role: "Financial analysis & modeling", organization: "internal" },
      { name: "Abogados Externos", role: "Legal due diligence", organization: "external" },
      { name: "Tasador Independiente", role: "Independent valuation (ECO)", organization: "external" },
      { name: "Monitoring Surveyor", role: "Technical & construction review", organization: "external" },
      { name: "Consultores de Mercado", role: "Market analysis", organization: "external" },
      { name: "Compliance", role: "KYC/AML screening", organization: "internal" },
    ],
    estimatedDuration: "4-8 weeks",
    dependsOn: ["term_sheet"],
  },
  {
    id: "ic_approval",
    number: 4,
    name: "Aprobación IC / Crédito",
    description: "Presentación del investment memorandum al comité de inversiones. Incluye resumen ejecutivo, análisis de riesgos, modelo financiero con escenarios. La decisión final es de Castlelake — hay que consensuar el contenido del memo/modelo.",
    agents: [
      { name: "Equipo de Underwriting", role: "Credit paper preparation", organization: "internal" },
      { name: "Comité de Inversiones", role: "IC vote & decision", organization: "internal" },
      { name: "CIO", role: "Investment decision", organization: "internal" },
      { name: "Risk Officer", role: "Risk assessment", organization: "internal" },
      { name: "Castlelake", role: "Final approval authority", organization: "capital_partner" },
    ],
    estimatedDuration: "1-2 weeks",
    dependsOn: ["due_diligence"],
  },
  {
    id: "legal_documentation",
    number: 5,
    name: "Negociación y Documentación Legal",
    description: "Negociación de documentación definitiva: facility agreement, escritura de hipoteca, prenda de participaciones, project account, direct agreement con constructor. Puede llevar varias semanas.",
    agents: [
      { name: "Abogados del Fondo", role: "Draft & negotiate loan docs", organization: "external" },
      { name: "Abogados del Promotor", role: "Review & negotiate on behalf of borrower", organization: "borrower" },
      { name: "Notario", role: "Public deed execution", organization: "external" },
    ],
    estimatedDuration: "3-6 weeks",
    dependsOn: ["ic_approval"],
  },
  {
    id: "conditions_precedent",
    number: 6,
    name: "Conditions Precedent y Primer Desembolso",
    description: "Verificación del cumplimiento de todas las CP: licencia de obra, seguros, cuenta proyecto, equity del promotor, contrato de obra. Firma notarial y primer desembolso.",
    agents: [
      { name: "Equipo Legal", role: "CP verification", organization: "internal" },
      { name: "Notario", role: "Deed execution & registration", organization: "external" },
      { name: "Promotor", role: "CP delivery", organization: "borrower" },
      { name: "Aseguradora", role: "Insurance policy issuance", organization: "external" },
      { name: "Registro de la Propiedad", role: "Mortgage registration", organization: "external" },
    ],
    estimatedDuration: "2-4 weeks",
    dependsOn: ["legal_documentation"],
  },
  {
    id: "drawdown_construction",
    number: 7,
    name: "Periodo de Disposición y Seguimiento de Obra",
    description: "Disposiciones periódicas contra certificaciones de obra. El monitoring surveyor verifica avance, compara con planning y presupuesto, y emite informe con recomendación. Retenciones de obra como garantía.",
    agents: [
      { name: "Monitoring Surveyor", role: "Site inspection & certification review", organization: "internal" },
      { name: "Director de Obra", role: "Construction oversight", organization: "borrower" },
      { name: "Constructor", role: "Construction execution", organization: "borrower" },
      { name: "Equipo de Asset Management", role: "Drawdown authorization", organization: "internal" },
    ],
    estimatedDuration: "12-24 months (ongoing)",
    dependsOn: ["conditions_precedent"],
  },
  {
    id: "monitoring_reporting",
    number: 8,
    name: "Seguimiento Continuo y Reporting",
    description: "Monitorización de covenants financieros, gestión de waivers (requieren OK de Castlelake con fee adicional), reporting periódico del promotor, control de project account. Protocolos de desviación.",
    agents: [
      { name: "Equipo de Loan Management", role: "Covenant monitoring & reporting", organization: "internal" },
      { name: "Promotor", role: "Periodic reporting (sales, financials, construction)", organization: "borrower" },
      { name: "Monitoring Surveyor", role: "Construction progress reporting", organization: "internal" },
      { name: "Castlelake", role: "Waiver approval & oversight", organization: "capital_partner" },
    ],
    estimatedDuration: "Ongoing (parallel to phases 7-10)",
    dependsOn: ["drawdown_construction"],
  },
  {
    id: "commercialization",
    number: 9,
    name: "Comercialización y Preventas",
    description: "Monitorización del ritmo de ventas vs business plan, precios de cierre vs hipótesis, calidad de compradores. Covenant de nivel mínimo de preventas como condición para desembolsos finales.",
    agents: [
      { name: "Equipo Comercial Promotor", role: "Sales execution", organization: "borrower" },
      { name: "Agencia de Ventas", role: "Marketing & sales", organization: "borrower" },
      { name: "Equipo de Asset Management", role: "Sales monitoring & covenant check", organization: "internal" },
    ],
    estimatedDuration: "Ongoing (parallel to construction)",
    dependsOn: ["drawdown_construction"],
  },
  {
    id: "completion_handover",
    number: 10,
    name: "Finalización de Obra y Entrega de Llaves",
    description: "Certificado de final de obra, licencia de primera ocupación (cédula de habitabilidad), alta de suministros, entrega de viviendas. Cada venta genera ingreso en cuenta proyecto según waterfall.",
    agents: [
      { name: "Promotor", role: "Completion & handover management", organization: "borrower" },
      { name: "Dirección Facultativa", role: "Final de obra certification", organization: "external" },
      { name: "Ayuntamiento", role: "Licencia primera ocupación", organization: "external" },
      { name: "Notarios", role: "Buyer purchase deeds", organization: "external" },
      { name: "Equipo de Loan Management", role: "Cash flow monitoring", organization: "internal" },
    ],
    estimatedDuration: "2-6 months",
    dependsOn: ["drawdown_construction", "commercialization"],
  },
  {
    id: "repayment",
    number: 11,
    name: "Repago del Préstamo",
    description: "Cada venta genera repago parcial obligatorio (mandatory prepayment) según release price pactado. Cancelación parcial de hipoteca por unidad. Balloon al vencimiento si quedan unidades sin vender.",
    agents: [
      { name: "Notarios", role: "Sale deeds & mortgage releases", organization: "external" },
      { name: "Registro de la Propiedad", role: "Charge cancellation", organization: "external" },
      { name: "Equipo de Loan Management", role: "Prepayment tracking & release authorization", organization: "internal" },
      { name: "Promotor", role: "Sales coordination", organization: "borrower" },
      { name: "Compradores Finales", role: "Unit purchase", organization: "external" },
    ],
    estimatedDuration: "3-12 months",
    dependsOn: ["completion_handover"],
  },
  {
    id: "close_out",
    number: 12,
    name: "Cierre de la Operación",
    description: "Cancelaciones registrales, liberación de garantías (prenda, fianzas), cierre de cuentas proyecto, revisión final interna (post-mortem). Documentación del rendimiento real (TIR, múltiplo) para track record del fondo.",
    agents: [
      { name: "Equipo Legal", role: "Guarantee release & deregistration", organization: "internal" },
      { name: "Equipo de Reporting", role: "Performance analysis & lessons learned", organization: "internal" },
      { name: "Portfolio Manager", role: "Track record documentation", organization: "internal" },
    ],
    estimatedDuration: "2-4 weeks",
    dependsOn: ["repayment"],
  },
];

// ===== PHASE STATUS LABELS & COLORS =====

export const phaseStatusLabels: Record<PhaseStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  skipped: "Skipped",
};

export const phaseStatusColors: Record<PhaseStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  blocked: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-400",
};

export const agentOrgColors: Record<string, string> = {
  internal: "bg-blue-50 text-blue-700 border-blue-200",
  external: "bg-purple-50 text-purple-700 border-purple-200",
  borrower: "bg-amber-50 text-amber-700 border-amber-200",
  capital_partner: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const agentOrgLabels: Record<string, string> = {
  internal: "Internal",
  external: "External Advisor",
  borrower: "Borrower / Promotor",
  capital_partner: "Capital Partner",
};

// ===== SAMPLE LIFECYCLE DATA =====

export const sampleLifecycles: Record<string, DealLifecycle> = {
  "deal-001": {
    dealId: "deal-001",
    currentPhase: "monitoring_reporting",
    phases: [
      {
        ...phaseDefinitions[0], status: "completed", startDate: "2025-04-10", completedDate: "2025-04-18",
        milestones: [{ description: "Indicación de interés emitida al promotor", achieved: true, achievedDate: "2025-04-15", evidence: "IOI letter sent" }],
        substeps: [
          { id: "o1", label: "Teaser/IM received from broker", description: "Information memorandum received", status: "completed", completedDate: "2025-04-10", assignee: "Javier Catón" },
          { id: "o2", label: "Initial screening against fund criteria", description: "LTV, LTC, location, asset type, ticket size check", status: "completed", completedDate: "2025-04-12", assignee: "Federico Busacca" },
          { id: "o3", label: "Preliminary financial analysis", description: "Quick model to validate returns", status: "completed", completedDate: "2025-04-14", assignee: "Reyes Dorado" },
          { id: "o4", label: "Indication of interest issued", description: "Non-binding IOI sent to borrower", status: "completed", completedDate: "2025-04-15", assignee: "Javier Catón" },
        ],
      },
      {
        ...phaseDefinitions[1], status: "completed", startDate: "2025-04-15", completedDate: "2025-05-15",
        milestones: [
          { description: "Term sheet validado por Castlelake", achieved: true, achievedDate: "2025-04-28", evidence: "Castlelake approval email" },
          { description: "Firma del term sheet y acuerdo de exclusividad", achieved: true, achievedDate: "2025-05-15", evidence: "Signed term sheet" },
        ],
        substeps: [
          { id: "ts1", label: "Draft term sheet preparation", description: "Internal draft with key terms", status: "completed", completedDate: "2025-04-15", assignee: "Javier Catón" },
          { id: "ts2", label: "Internal review (legal + credit)", description: "Legal and credit team review", status: "completed", completedDate: "2025-04-22", assignee: "Fernando Martínez" },
          { id: "ts3", label: "Castlelake memo & model submitted", description: "Preliminary memo and model for CP validation", status: "completed", completedDate: "2025-04-25", assignee: "Juan L. Torres Otero" },
          { id: "ts4", label: "Castlelake validation received", description: "CP approved with conditions", status: "completed", completedDate: "2025-04-28", assignee: "Sarah Chen (Castlelake)" },
          { id: "ts5", label: "Term sheet issued to borrower", description: "Indicative term sheet sent", status: "completed", completedDate: "2025-04-28", assignee: "Javier Catón" },
          { id: "ts6", label: "Exclusivity agreement signed", description: "Period of exclusivity for DD", status: "completed", completedDate: "2025-05-02", assignee: "Borrower" },
          { id: "ts7", label: "Term sheet signed by borrower", description: "Borrower accepts terms", status: "completed", completedDate: "2025-05-15", assignee: "Luminara Promociones SL" },
        ],
      },
      {
        ...phaseDefinitions[2], status: "completed", startDate: "2025-04-20", completedDate: "2025-05-15",
        milestones: [{ description: "Informes de DD completos y satisfactorios — investment memorandum elaborado", achieved: true, achievedDate: "2025-05-15", evidence: "Investment memorandum v2" }],
        substeps: [
          { id: "dd1", label: "Technical & urban planning DD", description: "Licenses, soil survey, construction budget review", status: "completed", completedDate: "2025-05-01", assignee: "Ana Reyes" },
          { id: "dd2", label: "Commercial / market DD", description: "Comparables, absorption, pre-sales verification", status: "completed", completedDate: "2025-05-15", assignee: "María López" },
          { id: "dd3", label: "Independent valuation (ECO)", description: "Current and GDV appraisal", status: "completed", completedDate: "2025-05-12", assignee: "CBRE Valuation" },
          { id: "dd4", label: "Legal DD", description: "Title, corporate structure, litigation, contracts", status: "completed", completedDate: "2025-05-08", assignee: "Bufete Garrigues" },
          { id: "dd5", label: "Financial & developer DD", description: "Financials, track record, cash flow model, stress test", status: "completed", completedDate: "2025-05-08", assignee: "Diego Martín" },
          { id: "dd6", label: "Environmental / KYC / AML", description: "Environmental risk, KYC/AML on UBOs", status: "completed", completedDate: "2025-04-28", assignee: "Compliance Team" },
        ],
      },
      {
        ...phaseDefinitions[3], status: "completed", startDate: "2025-05-28", completedDate: "2025-06-10",
        milestones: [
          { description: "Aprobación formal por el comité de inversiones", achieved: true, achievedDate: "2025-06-05", evidence: "IC minutes" },
          { description: "Sign-off de Castlelake", achieved: true, achievedDate: "2025-06-10", evidence: "Castlelake approval letter" },
        ],
        substeps: [
          { id: "ic1", label: "Credit paper prepared & distributed", description: "Investment memorandum sent to IC members", status: "completed", completedDate: "2025-05-30", assignee: "Isabel Navarro" },
          { id: "ic2", label: "IC meeting held", description: "Committee voted on the deal", status: "completed", completedDate: "2025-06-05", assignee: "Comité de Inversiones" },
          { id: "ic3", label: "IC approval documented", description: "Formal approval with conditions", status: "completed", completedDate: "2025-06-05", assignee: "System" },
          { id: "ic4", label: "Castlelake sign-off obtained", description: "Capital partner final approval", status: "completed", completedDate: "2025-06-10", assignee: "Jürgen Weber (Castlelake)" },
        ],
      },
      {
        ...phaseDefinitions[4], status: "completed", startDate: "2025-06-11", completedDate: "2025-07-15",
        milestones: [{ description: "Cierre de documentación legal definitiva", achieved: true, achievedDate: "2025-07-15", evidence: "Executed facility agreement" }],
        substeps: [
          { id: "ld1", label: "Facility agreement negotiation", description: "Loan agreement with all clauses", status: "completed", completedDate: "2025-07-10", assignee: "Bufete Garrigues" },
          { id: "ld2", label: "Mortgage deed preparation", description: "First-ranking mortgage over the asset", status: "completed", completedDate: "2025-07-15", assignee: "Notaría Rodríguez" },
          { id: "ld3", label: "Share pledge execution", description: "Pledge over SPV and sponsor shares", status: "completed", completedDate: "2025-07-12", assignee: "Bufete Garrigues" },
          { id: "ld4", label: "Project account agreement", description: "Escrow / project account setup", status: "completed", completedDate: "2025-07-08", assignee: "CaixaBank" },
          { id: "ld5", label: "Direct agreement with constructor", description: "Step-in rights for the fund", status: "completed", completedDate: "2025-07-14", assignee: "Bufete Garrigues" },
          { id: "ld6", label: "Corporate & personal guarantees", description: "UBO personal guarantee executed", status: "completed", completedDate: "2025-07-10", assignee: "Bufete Garrigues" },
        ],
      },
      {
        ...phaseDefinitions[5], status: "completed", startDate: "2025-06-18", completedDate: "2025-08-01",
        milestones: [
          { description: "Firma de escritura pública e inscripción en Registro de la Propiedad", achieved: true, achievedDate: "2025-07-20", evidence: "Registered deed" },
          { description: "Primer desembolso realizado", achieved: true, achievedDate: "2025-08-01", evidence: "Wire confirmation €4M" },
        ],
        substeps: [
          { id: "cp1", label: "Building license verified", description: "Valid licencia de obras", status: "completed", completedDate: "2025-06-20", assignee: "Ana Reyes" },
          { id: "cp2", label: "Construction insurance in place", description: "All-risk + RC + decenal", status: "completed", completedDate: "2025-06-25", assignee: "Marcos Peña" },
          { id: "cp3", label: "Project account opened", description: "Operational project account", status: "completed", completedDate: "2025-06-22", assignee: "Diego Martín" },
          { id: "cp4", label: "Developer equity contributed", description: "Min 20% equity in", status: "completed", completedDate: "2025-06-28", assignee: "Diego Martín" },
          { id: "cp5", label: "Construction contract signed", description: "Signed contract with main contractor", status: "completed", completedDate: "2025-06-30", assignee: "Marcos Peña" },
          { id: "cp6", label: "All security docs executed", description: "Mortgage, pledges, guarantees registered", status: "completed", completedDate: "2025-07-15", assignee: "Marcos Peña" },
          { id: "cp7", label: "First drawdown disbursed", description: "€4M for land & site preparation", status: "completed", completedDate: "2025-08-01", assignee: "Equipo de Loan Management" },
        ],
      },
      {
        ...phaseDefinitions[6], status: "in_progress", startDate: "2025-08-01",
        milestones: [
          { description: "Certificación #1 aprobada y Drawdown 1 desembolsado", achieved: true, achievedDate: "2025-10-10" },
          { description: "Certificación #2 aprobada y Drawdown 2 desembolsado", achieved: true, achievedDate: "2025-12-08" },
          { description: "Certificación #3 aprobada y Drawdown 3 desembolsado", achieved: true, achievedDate: "2026-03-12" },
          { description: "Certificación #4 — pendiente revisión", achieved: false },
        ],
        substeps: [
          { id: "dc1", label: "Monthly site inspections", description: "Monitoring surveyor visits & reports", status: "in_progress", assignee: "Ing. Carlos Vega" },
          { id: "dc2", label: "Construction certifications processing", description: "Cert review, retention calc, drawdown auth", status: "in_progress", assignee: "Equipo Asset Management" },
          { id: "dc3", label: "Drawdown 4 (Interior finishes)", description: "€2.56M — scheduled Aug 2026", status: "not_started" },
          { id: "dc4", label: "Drawdown 5 (Completion & landscaping)", description: "€1.7M — scheduled Jan 2027", status: "not_started" },
        ],
      },
      {
        ...phaseDefinitions[7], status: "in_progress", startDate: "2025-08-01",
        milestones: [
          { description: "Informe trimestral Q4 2025", achieved: true, achievedDate: "2025-12-15" },
          { description: "Informe trimestral Q1 2026", achieved: true, achievedDate: "2026-03-20" },
        ],
        substeps: [
          { id: "mr1", label: "Monthly covenant recalculation", description: "LTV, LTC, pre-sales, timeline check", status: "in_progress", assignee: "Equipo Loan Management" },
          { id: "mr2", label: "PIK interest accrual tracking", description: "Monthly interest calculation and capitalization", status: "in_progress", assignee: "Equipo Loan Management" },
          { id: "mr3", label: "Quarterly reporting to Castlelake", description: "Portfolio report with metrics", status: "in_progress", assignee: "Juan L. Torres Otero" },
          { id: "mr4", label: "Project account cash flow control", description: "Monitoring fund flows", status: "in_progress", assignee: "Diego Martín" },
        ],
      },
      {
        ...phaseDefinitions[8], status: "in_progress", startDate: "2025-10-01",
        milestones: [
          { description: "Nivel mínimo de preventas (30%) alcanzado", achieved: true, achievedDate: "2026-01-15" },
          { description: "Primeras escrituras de compraventa firmadas", achieved: true, achievedDate: "2026-02-15" },
        ],
        substeps: [
          { id: "cm1", label: "Sales pace monitoring vs business plan", description: "Track velocity and pricing vs underwriting", status: "in_progress", assignee: "Equipo Asset Management" },
          { id: "cm2", label: "Buyer quality assessment", description: "Profile of buyers (individuals, investors)", status: "in_progress", assignee: "María López" },
          { id: "cm3", label: "Pre-sales covenant compliance", description: "47% achieved vs 30% threshold", status: "completed", completedDate: "2026-01-15", assignee: "Equipo Loan Management" },
        ],
      },
      {
        ...phaseDefinitions[9], status: "not_started",
        milestones: [
          { description: "Certificado de final de obra obtenido", achieved: false },
          { description: "Licencia de primera ocupación concedida", achieved: false },
          { description: "Inicio de entregas y escrituración a compradores", achieved: false },
        ],
        substeps: [
          { id: "ch1", label: "Final de obra certificate", description: "From dirección facultativa", status: "not_started" },
          { id: "ch2", label: "Licencia primera ocupación", description: "Municipal approval for habitation", status: "not_started" },
          { id: "ch3", label: "Alta de suministros", description: "Utilities connected", status: "not_started" },
          { id: "ch4", label: "Key handover to buyers", description: "Unit by unit delivery", status: "not_started" },
          { id: "ch5", label: "Buyer purchase deeds", description: "Notarial escrituras", status: "not_started" },
        ],
      },
      {
        ...phaseDefinitions[10], status: "not_started",
        milestones: [
          { description: "Repago total del préstamo — principal + PIK + fees", achieved: false },
          { description: "Cancelación registral de la hipoteca", achieved: false },
        ],
        substeps: [
          { id: "rp1", label: "Mandatory prepayments from sales", description: "Per release price schedule", status: "not_started" },
          { id: "rp2", label: "Partial mortgage cancellation per unit", description: "Registro de la Propiedad", status: "not_started" },
          { id: "rp3", label: "Final balloon / full repayment", description: "At maturity or last sale", status: "not_started" },
          { id: "rp4", label: "Exit fee collection", description: "0.75% exit fee", status: "not_started" },
        ],
      },
      {
        ...phaseDefinitions[11], status: "not_started",
        milestones: [
          { description: "Todas las garantías canceladas y liberadas", achieved: false },
          { description: "Cierre contable y registro del track record", achieved: false },
        ],
        substeps: [
          { id: "co1", label: "Guarantee releases", description: "Share pledges, personal guarantees released", status: "not_started" },
          { id: "co2", label: "Mortgage full cancellation", description: "All charges removed from Registro", status: "not_started" },
          { id: "co3", label: "Project account closure", description: "Final settlement and account close", status: "not_started" },
          { id: "co4", label: "Post-mortem / lessons learned", description: "Internal review of deviations vs plan", status: "not_started" },
          { id: "co5", label: "Performance documentation", description: "IRR, multiple, deviations for track record", status: "not_started" },
        ],
      },
    ],
  },
  "deal-002": {
    dealId: "deal-002",
    currentPhase: "due_diligence",
    phases: [
      {
        ...phaseDefinitions[0], status: "completed", startDate: "2026-03-01", completedDate: "2026-03-08",
        milestones: [{ description: "Indicación de interés emitida", achieved: true, achievedDate: "2026-03-05" }],
        substeps: [
          { id: "o1", label: "Teaser received", description: "Information memorandum received", status: "completed", completedDate: "2026-03-01", assignee: "Federico Busacca" },
          { id: "o2", label: "Initial screening passed", description: "Criteria check", status: "completed", completedDate: "2026-03-03", assignee: "Federico Busacca" },
          { id: "o3", label: "IOI issued", description: "Non-binding indication", status: "completed", completedDate: "2026-03-05", assignee: "Javier Catón" },
        ],
      },
      {
        ...phaseDefinitions[1], status: "completed", startDate: "2026-03-10", completedDate: "2026-03-22",
        milestones: [
          { description: "Term sheet emitido (pendiente validación Castlelake)", achieved: true, achievedDate: "2026-03-22" },
        ],
        substeps: [
          { id: "ts1", label: "Draft term sheet", description: "Initial draft", status: "completed", completedDate: "2026-03-10", assignee: "Federico Busacca" },
          { id: "ts2", label: "Internal review", description: "Credit team review", status: "completed", completedDate: "2026-03-18", assignee: "Reyes Dorado" },
          { id: "ts3", label: "Submitted to Castlelake", description: "Memo attached, model pending", status: "completed", completedDate: "2026-03-20", assignee: "Juan L. Torres Otero", notes: "Financial model not yet attached" },
          { id: "ts4", label: "Castlelake validation", description: "Awaiting response", status: "in_progress", assignee: "Castlelake" },
        ],
      },
      {
        ...phaseDefinitions[2], status: "in_progress", startDate: "2026-03-25",
        milestones: [{ description: "DD completa — investment memorandum elaborado", achieved: false }],
        substeps: [
          { id: "dd1", label: "Technical & urban planning DD", description: "License verification in progress", status: "in_progress", assignee: "Pablo Herrera" },
          { id: "dd2", label: "Commercial / market DD", description: "Market analysis underway", status: "in_progress", assignee: "Sofía Ruiz" },
          { id: "dd3", label: "Independent valuation", description: "Pending", status: "not_started" },
          { id: "dd4", label: "Legal DD", description: "Title search complete, SPV review ongoing", status: "in_progress", assignee: "Uría Menéndez" },
          { id: "dd5", label: "Financial & developer DD", description: "FLAGGED — Missing FY2025 audited accounts", status: "blocked", assignee: "Elena Torres", notes: "Missing FY2025 audited accounts — requested from borrower" },
          { id: "dd6", label: "Environmental / KYC / AML", description: "KYC complete, environmental pending", status: "in_progress", assignee: "Compliance Team" },
        ],
      },
      ...phaseDefinitions.slice(3).map(p => ({
        ...p, status: "not_started" as PhaseStatus,
        milestones: [] as PhaseMilestone[],
        substeps: [] as PhaseSubstep[],
      })),
    ],
  },
  "deal-003": {
    dealId: "deal-003",
    currentPhase: "ic_approval",
    phases: [
      {
        ...phaseDefinitions[0], status: "completed", startDate: "2026-02-15", completedDate: "2026-02-22",
        milestones: [{ description: "Indicación de interés emitida", achieved: true, achievedDate: "2026-02-20" }],
        substeps: [{ id: "o1", label: "Screening & IOI", description: "Quick turnaround", status: "completed", completedDate: "2026-02-20", assignee: "Javier Catón" }],
      },
      {
        ...phaseDefinitions[1], status: "completed", startDate: "2026-03-01", completedDate: "2026-03-15",
        milestones: [{ description: "Term sheet firmado", achieved: true, achievedDate: "2026-03-15" }],
        substeps: [
          { id: "ts1", label: "Term sheet drafted & approved by Castlelake", description: "Fast-track", status: "completed", completedDate: "2026-03-08", assignee: "Javier Catón" },
          { id: "ts2", label: "Term sheet signed", description: "Borrower signed", status: "completed", completedDate: "2026-03-15", assignee: "Ruzafa Homes SL" },
        ],
      },
      {
        ...phaseDefinitions[2], status: "completed", startDate: "2026-03-01", completedDate: "2026-04-05",
        milestones: [{ description: "DD completa", achieved: true, achievedDate: "2026-04-05" }],
        substeps: [
          { id: "dd1", label: "All 6 DD workstreams completed", description: "Clean results", status: "completed", completedDate: "2026-04-05", assignee: "Equipo de Underwriting" },
        ],
      },
      {
        ...phaseDefinitions[3], status: "in_progress", startDate: "2026-04-10",
        milestones: [
          { description: "IC aprobación — pending Castlelake sign-off", achieved: false },
        ],
        substeps: [
          { id: "ic1", label: "IC voted unanimously", description: "3/3 approve", status: "completed", completedDate: "2026-04-10", assignee: "Comité de Inversiones" },
          { id: "ic2", label: "Submitted to Castlelake", description: "Awaiting sign-off", status: "in_progress", assignee: "Alejandro Durán" },
        ],
      },
      ...phaseDefinitions.slice(4).map(p => ({
        ...p, status: "not_started" as PhaseStatus,
        milestones: [] as PhaseMilestone[],
        substeps: [] as PhaseSubstep[],
      })),
    ],
  },
};

// Helper to get completion percentage
export function getLifecycleProgress(lifecycle: DealLifecycle): number {
  const completed = lifecycle.phases.filter(p => p.status === "completed").length;
  return Math.round((completed / lifecycle.phases.length) * 100);
}

export function getCurrentPhaseNumber(lifecycle: DealLifecycle): number {
  const current = lifecycle.phases.find(p => p.id === lifecycle.currentPhase);
  return current?.number || 1;
}
