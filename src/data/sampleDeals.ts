export type DealStage = 
  | "screening" 
  | "due_diligence" 
  | "ic_approval" 
  | "documentation" 
  | "active" 
  | "repaid" 
  | "rejected";

export type CovenantStatus = "compliant" | "watch" | "breach";

export interface ScreeningCriteria {
  label: string;
  pass: boolean;
  value: string;
  threshold: string;
}

export interface Drawdown {
  id: string;
  milestone: string;
  amount: number;
  scheduledDate: string;
  status: "pending" | "requested" | "approved" | "disbursed";
  constructionProgress: number;
}

export interface Covenant {
  name: string;
  metric: string;
  threshold: string;
  currentValue: string;
  status: CovenantStatus;
}

export interface UnitSale {
  unit: string;
  type: string;
  area: number;
  listPrice: number;
  status: "available" | "reserved" | "contracted" | "sold";
  salePrice?: number;
  releasePrice?: number;
}

export interface Deal {
  id: string;
  projectName: string;
  borrower: string;
  sponsor: string;
  location: string;
  city: string;
  stage: DealStage;
  assetType: string;
  description: string;

  // Financial
  loanAmount: number;
  currency: string;
  interestRate: number;
  pikSpread: number;
  totalRate: number;
  originationFee: number;
  exitFee: number;
  tenor: number; // months
  maturityDate: string;
  disbursedAmount: number;
  outstandingPrincipal: number;
  accruedPIK: number;
  totalExposure: number;

  // Real Estate
  gdv: number; // Gross Development Value
  currentAppraisal: number;
  totalUnits: number;
  totalArea: number; // sqm
  constructionBudget: number;
  constructionSpent: number;
  constructionProgress: number; // percentage
  landCost: number;

  // Ratios
  ltv: number;
  ltc: number;
  preSalesPercent: number;

  // Developer
  developerExperience: string;
  developerTrackRecord: number; // number of projects completed
  
  // Dates
  dateReceived: string;
  termSheetDate?: string;
  icApprovalDate?: string;
  closingDate?: string;
  firstDrawdownDate?: string;
  expectedMaturity: string;

  // Screening
  screeningCriteria?: ScreeningCriteria[];
  screeningScore?: number;

  // Drawdowns
  drawdowns: Drawdown[];

  // Covenants
  covenants: Covenant[];

  // Sales
  unitSales: UnitSale[];

  // Tags
  tags: string[];
}

export const stageLabels: Record<DealStage, string> = {
  screening: "Screening",
  due_diligence: "Due Diligence",
  ic_approval: "IC Approval",
  documentation: "Documentation",
  active: "Active",
  repaid: "Repaid",
  rejected: "Rejected",
};

export const stageColors: Record<DealStage, string> = {
  screening: "bg-blue-500/20 text-blue-400",
  due_diligence: "bg-amber-500/20 text-amber-400",
  ic_approval: "bg-purple-500/20 text-purple-400",
  documentation: "bg-cyan-500/20 text-cyan-400",
  active: "bg-emerald-500/20 text-emerald-400",
  repaid: "bg-muted-foreground/20 text-muted-foreground",
  rejected: "bg-destructive/20 text-destructive",
};

export const sampleDeals: Deal[] = [
  {
    id: "deal-001",
    projectName: "Residencial Marina Bay",
    borrower: "Marina Bay Developments SL",
    sponsor: "Grupo Inversiones Costa",
    location: "Estepona, Málaga",
    city: "Estepona",
    stage: "active",
    assetType: "Residential - Build to Sell",
    description: "42-unit luxury residential complex with sea views, rooftop pool, and underground parking. Phase 1 of a 3-phase masterplan in Costa del Sol.",
    loanAmount: 12500000,
    currency: "EUR",
    interestRate: 4.5,
    pikSpread: 4.5,
    totalRate: 9.0,
    originationFee: 1.5,
    exitFee: 0.75,
    tenor: 24,
    maturityDate: "2027-06-15",
    disbursedAmount: 8750000,
    outstandingPrincipal: 8750000,
    accruedPIK: 525000,
    totalExposure: 9275000,
    gdv: 28500000,
    currentAppraisal: 18200000,
    totalUnits: 42,
    totalArea: 4850,
    constructionBudget: 14200000,
    constructionSpent: 9940000,
    constructionProgress: 68,
    landCost: 3800000,
    ltv: 51.0,
    ltc: 69.4,
    preSalesPercent: 45,
    developerExperience: "Established - 15+ years",
    developerTrackRecord: 8,
    dateReceived: "2025-02-10",
    termSheetDate: "2025-02-28",
    icApprovalDate: "2025-04-01",
    closingDate: "2025-05-15",
    firstDrawdownDate: "2025-06-01",
    expectedMaturity: "2027-06-15",
    drawdowns: [
      { id: "dd-001-1", milestone: "Land acquisition & initial works", amount: 3500000, scheduledDate: "2025-06-01", status: "disbursed", constructionProgress: 0 },
      { id: "dd-001-2", milestone: "Foundation & structure", amount: 2500000, scheduledDate: "2025-09-15", status: "disbursed", constructionProgress: 25 },
      { id: "dd-001-3", milestone: "Envelope & MEP rough-in", amount: 2750000, scheduledDate: "2026-01-15", status: "disbursed", constructionProgress: 55 },
      { id: "dd-001-4", milestone: "Finishes & fit-out", amount: 2250000, scheduledDate: "2026-06-01", status: "pending", constructionProgress: 75 },
      { id: "dd-001-5", milestone: "Final completion & landscaping", amount: 1500000, scheduledDate: "2026-10-01", status: "pending", constructionProgress: 95 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "51.0%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "69.4%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 30%", currentValue: "45%", status: "compliant" },
      { name: "Construction Timeline", metric: "Timeline", threshold: "≤ 6 months delay", currentValue: "On schedule", status: "compliant" },
    ],
    unitSales: [
      { unit: "1A", type: "2-bed apartment", area: 95, listPrice: 485000, status: "sold", salePrice: 478000, releasePrice: 195000 },
      { unit: "1B", type: "2-bed apartment", area: 98, listPrice: 495000, status: "sold", salePrice: 490000, releasePrice: 198000 },
      { unit: "2A", type: "3-bed apartment", area: 125, listPrice: 685000, status: "contracted", salePrice: 680000, releasePrice: 275000 },
      { unit: "2B", type: "3-bed penthouse", area: 155, listPrice: 895000, status: "reserved" },
      { unit: "3A", type: "2-bed apartment", area: 92, listPrice: 475000, status: "available" },
      { unit: "3B", type: "3-bed apartment", area: 128, listPrice: 695000, status: "reserved" },
    ],
    tags: ["Costa del Sol", "Luxury", "Sea Views", "Phase 1"],
  },
  {
    id: "deal-002",
    projectName: "Jardines de Valdebebas",
    borrower: "Valdebebas Residencial SL",
    sponsor: "Promociones Castellana",
    location: "Valdebebas, Madrid",
    city: "Madrid",
    stage: "due_diligence",
    assetType: "Residential - Build to Sell",
    description: "65-unit residential development in Madrid's Valdebebas district. Mix of 2 and 3 bedroom apartments with community amenities. Strong pre-sales driven by location near airport and business district.",
    loanAmount: 18000000,
    currency: "EUR",
    interestRate: 4.25,
    pikSpread: 4.25,
    totalRate: 8.5,
    originationFee: 1.25,
    exitFee: 0.5,
    tenor: 30,
    maturityDate: "2028-09-30",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 42000000,
    currentAppraisal: 24500000,
    totalUnits: 65,
    totalArea: 7200,
    constructionBudget: 22000000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 8500000,
    ltv: 73.5,
    ltc: 59.0,
    preSalesPercent: 22,
    developerExperience: "Experienced - 10 years",
    developerTrackRecord: 5,
    dateReceived: "2026-03-01",
    termSheetDate: "2026-03-20",
    expectedMaturity: "2028-09-30",
    drawdowns: [
      { id: "dd-002-1", milestone: "Land & permits", amount: 5000000, scheduledDate: "2026-07-01", status: "pending", constructionProgress: 0 },
      { id: "dd-002-2", milestone: "Foundation", amount: 4000000, scheduledDate: "2026-11-01", status: "pending", constructionProgress: 20 },
      { id: "dd-002-3", milestone: "Structure", amount: 4500000, scheduledDate: "2027-04-01", status: "pending", constructionProgress: 50 },
      { id: "dd-002-4", milestone: "Finishes", amount: 4500000, scheduledDate: "2027-10-01", status: "pending", constructionProgress: 80 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "73.5%", status: "breach" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "59.0%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 30%", currentValue: "22%", status: "watch" },
    ],
    unitSales: [],
    tags: ["Madrid", "New Development Area", "Airport Proximity"],
  },
  {
    id: "deal-003",
    projectName: "Torres del Puerto",
    borrower: "Puerto Valencia Invest SL",
    sponsor: "Mediterranean Capital Group",
    location: "Poblats Marítims, Valencia",
    city: "Valencia",
    stage: "ic_approval",
    assetType: "Residential - Build to Sell",
    description: "28-unit boutique residential project near Valencia marina. Premium finishes targeting international buyers. Developer has strong local presence.",
    loanAmount: 7500000,
    currency: "EUR",
    interestRate: 5.0,
    pikSpread: 4.0,
    totalRate: 9.0,
    originationFee: 1.5,
    exitFee: 1.0,
    tenor: 22,
    maturityDate: "2028-04-15",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 19500000,
    currentAppraisal: 11800000,
    totalUnits: 28,
    totalArea: 3100,
    constructionBudget: 9800000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 2900000,
    ltv: 63.6,
    ltc: 59.1,
    preSalesPercent: 35,
    developerExperience: "Established - 20+ years",
    developerTrackRecord: 12,
    dateReceived: "2026-02-15",
    termSheetDate: "2026-03-05",
    expectedMaturity: "2028-04-15",
    drawdowns: [
      { id: "dd-003-1", milestone: "Land & initial works", amount: 2500000, scheduledDate: "2026-06-01", status: "pending", constructionProgress: 0 },
      { id: "dd-003-2", milestone: "Structure", amount: 2500000, scheduledDate: "2026-11-01", status: "pending", constructionProgress: 35 },
      { id: "dd-003-3", milestone: "Finishes", amount: 2500000, scheduledDate: "2027-05-01", status: "pending", constructionProgress: 70 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "63.6%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "59.1%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 25%", currentValue: "35%", status: "compliant" },
    ],
    unitSales: [
      { unit: "PH-1", type: "3-bed penthouse", area: 165, listPrice: 1250000, status: "contracted", salePrice: 1220000, releasePrice: 410000 },
      { unit: "A-01", type: "2-bed apartment", area: 88, listPrice: 520000, status: "reserved" },
      { unit: "A-05", type: "2-bed apartment", area: 92, listPrice: 545000, status: "contracted", salePrice: 540000, releasePrice: 180000 },
    ],
    tags: ["Valencia", "Boutique", "Marina", "International Buyers"],
  },
  {
    id: "deal-004",
    projectName: "Nou Eixample Residences",
    borrower: "Eixample Living SL",
    sponsor: "Grupo BCN Desarrollos",
    location: "Eixample, Barcelona",
    city: "Barcelona",
    stage: "screening",
    assetType: "Residential - Refurbishment & Sale",
    description: "Full refurbishment of a classic Eixample building into 18 high-end apartments. Listed façade to be preserved. Premium location near Passeig de Gràcia.",
    loanAmount: 9200000,
    currency: "EUR",
    interestRate: 5.5,
    pikSpread: 4.0,
    totalRate: 9.5,
    originationFee: 1.75,
    exitFee: 1.0,
    tenor: 20,
    maturityDate: "2028-02-28",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 25200000,
    currentAppraisal: 12800000,
    totalUnits: 18,
    totalArea: 2400,
    constructionBudget: 8900000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 6200000,
    ltv: 71.9,
    ltc: 60.9,
    preSalesPercent: 0,
    developerExperience: "Mid-level - 5 years",
    developerTrackRecord: 3,
    dateReceived: "2026-04-01",
    expectedMaturity: "2028-02-28",
    screeningCriteria: [
      { label: "Asset Type", pass: true, value: "Residential - Refurb", threshold: "Residential" },
      { label: "Location", pass: true, value: "Barcelona Prime", threshold: "Spain Tier 1 Cities" },
      { label: "LTV at Origination", pass: false, value: "71.9%", threshold: "≤ 65%" },
      { label: "LTC", pass: true, value: "60.9%", threshold: "≤ 75%" },
      { label: "Ticket Size", pass: true, value: "€9.2M", threshold: "€5M - €25M" },
      { label: "Developer Track Record", pass: false, value: "3 projects", threshold: "≥ 5 projects" },
      { label: "Pre-Sales", pass: false, value: "0%", threshold: "≥ 15%" },
      { label: "Construction Risk", pass: true, value: "Refurbishment", threshold: "Acceptable" },
    ],
    screeningScore: 62,
    drawdowns: [],
    covenants: [],
    unitSales: [],
    tags: ["Barcelona", "Refurbishment", "Listed Building", "Prime Location"],
  },
  {
    id: "deal-005",
    projectName: "Villas Sotogrande",
    borrower: "Sotogrande Premium Villas SL",
    sponsor: "Andalucía Luxury Homes",
    location: "Sotogrande, Cádiz",
    city: "Sotogrande",
    stage: "repaid",
    assetType: "Residential - Build to Sell",
    description: "12 luxury villas in Sotogrande with golf course views. Fully sold prior to completion. Strong IRR performance.",
    loanAmount: 8000000,
    currency: "EUR",
    interestRate: 5.0,
    pikSpread: 4.5,
    totalRate: 9.5,
    originationFee: 1.5,
    exitFee: 0.75,
    tenor: 18,
    maturityDate: "2025-12-31",
    disbursedAmount: 8000000,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 21000000,
    currentAppraisal: 21000000,
    totalUnits: 12,
    totalArea: 3600,
    constructionBudget: 10500000,
    constructionSpent: 10500000,
    constructionProgress: 100,
    landCost: 4200000,
    ltv: 38.1,
    ltc: 54.4,
    preSalesPercent: 100,
    developerExperience: "Established - 18 years",
    developerTrackRecord: 10,
    dateReceived: "2024-03-15",
    termSheetDate: "2024-04-01",
    icApprovalDate: "2024-05-10",
    closingDate: "2024-06-15",
    firstDrawdownDate: "2024-07-01",
    expectedMaturity: "2025-12-31",
    drawdowns: [
      { id: "dd-005-1", milestone: "Land & infrastructure", amount: 2500000, scheduledDate: "2024-07-01", status: "disbursed", constructionProgress: 0 },
      { id: "dd-005-2", milestone: "Structure", amount: 3000000, scheduledDate: "2024-11-01", status: "disbursed", constructionProgress: 40 },
      { id: "dd-005-3", milestone: "Finishes & landscaping", amount: 2500000, scheduledDate: "2025-04-01", status: "disbursed", constructionProgress: 75 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "38.1%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "54.4%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 30%", currentValue: "100%", status: "compliant" },
    ],
    unitSales: [
      { unit: "V-01", type: "4-bed villa", area: 320, listPrice: 1750000, status: "sold", salePrice: 1720000, releasePrice: 580000 },
      { unit: "V-02", type: "4-bed villa", area: 310, listPrice: 1680000, status: "sold", salePrice: 1700000, releasePrice: 570000 },
      { unit: "V-03", type: "5-bed villa", area: 380, listPrice: 1950000, status: "sold", salePrice: 1950000, releasePrice: 650000 },
    ],
    tags: ["Sotogrande", "Luxury Villas", "Golf", "Fully Repaid"],
  },
  {
    id: "deal-006",
    projectName: "Paseo Marítimo Towers",
    borrower: "Palma Residencial SL",
    sponsor: "Balearic Development Partners",
    location: "Palma de Mallorca",
    city: "Palma",
    stage: "documentation",
    assetType: "Residential - Build to Sell",
    description: "Two 8-storey residential towers with 56 apartments. Seafront location in Palma with premium positioning. IC approved with conditions - documentation phase.",
    loanAmount: 15000000,
    currency: "EUR",
    interestRate: 4.75,
    pikSpread: 4.25,
    totalRate: 9.0,
    originationFee: 1.25,
    exitFee: 0.75,
    tenor: 28,
    maturityDate: "2028-08-31",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 38000000,
    currentAppraisal: 22000000,
    totalUnits: 56,
    totalArea: 6200,
    constructionBudget: 19500000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 7500000,
    ltv: 68.2,
    ltc: 55.6,
    preSalesPercent: 28,
    developerExperience: "Established - 12 years",
    developerTrackRecord: 7,
    dateReceived: "2026-01-20",
    termSheetDate: "2026-02-10",
    icApprovalDate: "2026-03-15",
    expectedMaturity: "2028-08-31",
    drawdowns: [
      { id: "dd-006-1", milestone: "Land & pre-construction", amount: 4000000, scheduledDate: "2026-06-01", status: "pending", constructionProgress: 0 },
      { id: "dd-006-2", milestone: "Foundation & structure T1", amount: 3500000, scheduledDate: "2026-10-01", status: "pending", constructionProgress: 20 },
      { id: "dd-006-3", milestone: "Structure T2 & MEP", amount: 4000000, scheduledDate: "2027-03-01", status: "pending", constructionProgress: 50 },
      { id: "dd-006-4", milestone: "Finishes & common areas", amount: 3500000, scheduledDate: "2027-09-01", status: "pending", constructionProgress: 80 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 70%", currentValue: "68.2%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "55.6%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 25%", currentValue: "28%", status: "compliant" },
    ],
    unitSales: [
      { unit: "T1-PH", type: "4-bed penthouse", area: 210, listPrice: 1850000, status: "contracted", salePrice: 1800000, releasePrice: 480000 },
      { unit: "T1-3A", type: "3-bed apartment", area: 120, listPrice: 680000, status: "reserved" },
    ],
    tags: ["Mallorca", "Seafront", "Two Towers", "Premium"],
  },
];

export const formatCurrency = (amount: number, currency = "EUR"): string => {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatMillions = (amount: number): string => {
  return `€${(amount / 1000000).toFixed(1)}M`;
};

export const getPortfolioMetrics = () => {
  const activeDeals = sampleDeals.filter(d => d.stage === "active");
  const allDeals = sampleDeals.filter(d => d.stage !== "rejected");
  
  const totalCommitments = allDeals.reduce((sum, d) => sum + d.loanAmount, 0);
  const totalExposure = allDeals.reduce((sum, d) => sum + d.totalExposure, 0);
  const totalGDV = allDeals.reduce((sum, d) => sum + d.gdv, 0);
  const totalDisbursed = allDeals.reduce((sum, d) => sum + d.disbursedAmount, 0);
  const avgLTV = activeDeals.length > 0 ? activeDeals.reduce((sum, d) => sum + d.ltv, 0) / activeDeals.length : 0;
  const avgLTC = activeDeals.length > 0 ? activeDeals.reduce((sum, d) => sum + d.ltc, 0) / activeDeals.length : 0;
  const pipelineDeals = sampleDeals.filter(d => ["screening", "due_diligence", "ic_approval", "documentation"].includes(d.stage)).length;
  const totalAccruedPIK = allDeals.reduce((sum, d) => sum + d.accruedPIK, 0);

  return {
    totalCommitments,
    totalExposure,
    totalGDV,
    totalDisbursed,
    avgLTV,
    avgLTC,
    activeDeals: activeDeals.length,
    pipelineDeals,
    totalDeals: allDeals.length,
    totalAccruedPIK,
  };
};
