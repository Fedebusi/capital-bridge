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
  loanAmount: number;
  currency: string;
  interestRate: number;
  pikSpread: number;
  totalRate: number;
  originationFee: number;
  exitFee: number;
  tenor: number;
  maturityDate: string;
  disbursedAmount: number;
  outstandingPrincipal: number;
  accruedPIK: number;
  totalExposure: number;
  gdv: number;
  currentAppraisal: number;
  totalUnits: number;
  totalArea: number;
  constructionBudget: number;
  constructionSpent: number;
  constructionProgress: number;
  landCost: number;
  ltv: number;
  ltc: number;
  preSalesPercent: number;
  developerExperience: string;
  developerTrackRecord: number;
  dateReceived: string;
  termSheetDate?: string;
  icApprovalDate?: string;
  closingDate?: string;
  firstDrawdownDate?: string;
  expectedMaturity: string;
  screeningCriteria?: ScreeningCriteria[];
  screeningScore?: number;
  drawdowns: Drawdown[];
  covenants: Covenant[];
  unitSales: UnitSale[];
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
  screening: "bg-blue-100 text-blue-700",
  due_diligence: "bg-amber-100 text-amber-700",
  ic_approval: "bg-purple-100 text-purple-700",
  documentation: "bg-cyan-100 text-cyan-700",
  active: "bg-emerald-100 text-emerald-700",
  repaid: "bg-gray-100 text-gray-500",
  rejected: "bg-red-100 text-red-600",
};

export const sampleDeals: Deal[] = [
  {
    id: "deal-001",
    projectName: "Terrazas del Faro",
    borrower: "Solaris Promociones SL",
    sponsor: "Grupo Valverde Inversiones",
    location: "Marbella, Málaga",
    city: "Marbella",
    stage: "active",
    assetType: "Residential - Build to Sell",
    description: "38-unit luxury residential complex with panoramic sea views, infinity pool, private gardens, and underground parking. Located in Marbella's Golden Mile area, targeting high-net-worth international buyers.",
    loanAmount: 14200000,
    currency: "EUR",
    interestRate: 4.5,
    pikSpread: 4.5,
    totalRate: 9.0,
    originationFee: 1.5,
    exitFee: 0.75,
    tenor: 24,
    maturityDate: "2027-08-20",
    disbursedAmount: 9940000,
    outstandingPrincipal: 9940000,
    accruedPIK: 596400,
    totalExposure: 10536400,
    gdv: 31200000,
    currentAppraisal: 20100000,
    totalUnits: 38,
    totalArea: 4520,
    constructionBudget: 15800000,
    constructionSpent: 10740000,
    constructionProgress: 72,
    landCost: 4100000,
    ltv: 52.4,
    ltc: 71.4,
    preSalesPercent: 47,
    developerExperience: "Established - 16 years",
    developerTrackRecord: 9,
    dateReceived: "2025-04-10",
    termSheetDate: "2025-04-28",
    icApprovalDate: "2025-06-05",
    closingDate: "2025-07-20",
    firstDrawdownDate: "2025-08-01",
    expectedMaturity: "2027-08-20",
    drawdowns: [
      { id: "dd-001-1", milestone: "Land acquisition & site preparation", amount: 4000000, scheduledDate: "2025-08-01", status: "disbursed", constructionProgress: 0 },
      { id: "dd-001-2", milestone: "Foundation & structural frame", amount: 2800000, scheduledDate: "2025-11-15", status: "disbursed", constructionProgress: 28 },
      { id: "dd-001-3", milestone: "Envelope, MEP & rough-in", amount: 3140000, scheduledDate: "2026-03-15", status: "disbursed", constructionProgress: 58 },
      { id: "dd-001-4", milestone: "Interior finishes & fit-out", amount: 2560000, scheduledDate: "2026-08-01", status: "pending", constructionProgress: 78 },
      { id: "dd-001-5", milestone: "Completion, landscaping & handover", amount: 1700000, scheduledDate: "2027-01-15", status: "pending", constructionProgress: 95 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "52.4%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "71.4%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 30%", currentValue: "47%", status: "compliant" },
      { name: "Construction Timeline", metric: "Timeline", threshold: "≤ 6 months delay", currentValue: "On schedule", status: "compliant" },
    ],
    unitSales: [
      { unit: "A-01", type: "2-bed apartment", area: 97, listPrice: 510000, status: "sold", salePrice: 502000, releasePrice: 204000 },
      { unit: "A-02", type: "2-bed apartment", area: 101, listPrice: 525000, status: "sold", salePrice: 520000, releasePrice: 210000 },
      { unit: "B-01", type: "3-bed apartment", area: 132, listPrice: 740000, status: "contracted", salePrice: 735000, releasePrice: 296000 },
      { unit: "B-02", type: "3-bed penthouse", area: 160, listPrice: 980000, status: "reserved" },
      { unit: "C-01", type: "2-bed apartment", area: 94, listPrice: 490000, status: "available" },
      { unit: "C-02", type: "3-bed apartment", area: 135, listPrice: 755000, status: "reserved" },
    ],
    tags: ["Costa del Sol", "Luxury", "Sea Views", "Golden Mile"],
  },
  {
    id: "deal-002",
    projectName: "Arcos de Canillejas",
    borrower: "Norte Residencial SL",
    sponsor: "Altamira Capital Partners",
    location: "Canillejas, Madrid",
    city: "Madrid",
    stage: "due_diligence",
    assetType: "Residential - Build to Sell",
    description: "72-unit residential development in eastern Madrid, close to IFEMA convention center and Barajas airport. Mix of 1, 2, and 3 bedroom apartments targeting young professionals and families. Strong transport links.",
    loanAmount: 19500000,
    currency: "EUR",
    interestRate: 4.25,
    pikSpread: 4.25,
    totalRate: 8.5,
    originationFee: 1.25,
    exitFee: 0.5,
    tenor: 30,
    maturityDate: "2028-11-30",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 46000000,
    currentAppraisal: 26800000,
    totalUnits: 72,
    totalArea: 7850,
    constructionBudget: 24000000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 9200000,
    ltv: 72.8,
    ltc: 58.7,
    preSalesPercent: 18,
    developerExperience: "Experienced - 11 years",
    developerTrackRecord: 6,
    dateReceived: "2026-03-05",
    termSheetDate: "2026-03-22",
    expectedMaturity: "2028-11-30",
    drawdowns: [
      { id: "dd-002-1", milestone: "Land & permits", amount: 5500000, scheduledDate: "2026-08-01", status: "pending", constructionProgress: 0 },
      { id: "dd-002-2", milestone: "Foundation & basement", amount: 4200000, scheduledDate: "2026-12-01", status: "pending", constructionProgress: 18 },
      { id: "dd-002-3", milestone: "Superstructure", amount: 5000000, scheduledDate: "2027-05-01", status: "pending", constructionProgress: 48 },
      { id: "dd-002-4", milestone: "Finishes & landscaping", amount: 4800000, scheduledDate: "2027-11-01", status: "pending", constructionProgress: 82 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "72.8%", status: "breach" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "58.7%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 30%", currentValue: "18%", status: "watch" },
    ],
    unitSales: [],
    tags: ["Madrid", "IFEMA Area", "Transport Hub"],
  },
  {
    id: "deal-003",
    projectName: "Jardines de Ruzafa",
    borrower: "Levantina Homes SL",
    sponsor: "Mediterráneo Desarrollos",
    location: "Ruzafa, Valencia",
    city: "Valencia",
    stage: "ic_approval",
    assetType: "Residential - Build to Sell",
    description: "24-unit boutique residential project in Valencia's trendy Ruzafa district. Contemporary design with rooftop terraces. Targeting both local buyers and digital nomads relocating to Valencia.",
    loanAmount: 6800000,
    currency: "EUR",
    interestRate: 5.0,
    pikSpread: 4.0,
    totalRate: 9.0,
    originationFee: 1.5,
    exitFee: 1.0,
    tenor: 22,
    maturityDate: "2028-06-30",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 17800000,
    currentAppraisal: 10700000,
    totalUnits: 24,
    totalArea: 2750,
    constructionBudget: 8900000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 2600000,
    ltv: 63.6,
    ltc: 59.1,
    preSalesPercent: 38,
    developerExperience: "Established - 22 years",
    developerTrackRecord: 14,
    dateReceived: "2026-02-20",
    termSheetDate: "2026-03-08",
    expectedMaturity: "2028-06-30",
    drawdowns: [
      { id: "dd-003-1", milestone: "Land & initial works", amount: 2200000, scheduledDate: "2026-07-01", status: "pending", constructionProgress: 0 },
      { id: "dd-003-2", milestone: "Structure", amount: 2300000, scheduledDate: "2026-12-01", status: "pending", constructionProgress: 35 },
      { id: "dd-003-3", milestone: "Finishes", amount: 2300000, scheduledDate: "2027-06-01", status: "pending", constructionProgress: 72 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "63.6%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "59.1%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 25%", currentValue: "38%", status: "compliant" },
    ],
    unitSales: [
      { unit: "PH-A", type: "3-bed penthouse", area: 148, listPrice: 1120000, status: "contracted", salePrice: 1095000, releasePrice: 375000 },
      { unit: "1-B", type: "2-bed apartment", area: 85, listPrice: 480000, status: "reserved" },
      { unit: "2-A", type: "2-bed apartment", area: 89, listPrice: 505000, status: "contracted", salePrice: 498000, releasePrice: 168000 },
    ],
    tags: ["Valencia", "Boutique", "Ruzafa", "Trendy District"],
  },
  {
    id: "deal-004",
    projectName: "Palau de Gràcia",
    borrower: "Eixample Heritage SL",
    sponsor: "Tramontana Group",
    location: "Gràcia, Barcelona",
    city: "Barcelona",
    stage: "screening",
    assetType: "Residential - Refurbishment & Sale",
    description: "Complete renovation of a 1920s modernist building into 16 high-end loft-style apartments. Protected façade, interior courtyard to be restored. Prime location in Barcelona's Gràcia neighborhood.",
    loanAmount: 8500000,
    currency: "EUR",
    interestRate: 5.5,
    pikSpread: 4.0,
    totalRate: 9.5,
    originationFee: 1.75,
    exitFee: 1.0,
    tenor: 20,
    maturityDate: "2028-04-30",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 23600000,
    currentAppraisal: 11900000,
    totalUnits: 16,
    totalArea: 2180,
    constructionBudget: 8200000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 5800000,
    ltv: 71.4,
    ltc: 60.7,
    preSalesPercent: 0,
    developerExperience: "Mid-level - 6 years",
    developerTrackRecord: 3,
    dateReceived: "2026-04-02",
    expectedMaturity: "2028-04-30",
    screeningCriteria: [
      { label: "Asset Type", pass: true, value: "Residential - Refurb", threshold: "Residential" },
      { label: "Location", pass: true, value: "Barcelona Prime", threshold: "Spain Tier 1 Cities" },
      { label: "LTV at Origination", pass: false, value: "71.4%", threshold: "≤ 65%" },
      { label: "LTC", pass: true, value: "60.7%", threshold: "≤ 75%" },
      { label: "Ticket Size", pass: true, value: "€8.5M", threshold: "€5M - €25M" },
      { label: "Developer Track Record", pass: false, value: "3 projects", threshold: "≥ 5 projects" },
      { label: "Pre-Sales", pass: false, value: "0%", threshold: "≥ 15%" },
      { label: "Construction Risk", pass: true, value: "Refurbishment", threshold: "Acceptable" },
    ],
    screeningScore: 62,
    drawdowns: [],
    covenants: [],
    unitSales: [],
    tags: ["Barcelona", "Refurbishment", "Modernist", "Gràcia"],
  },
  {
    id: "deal-005",
    projectName: "Hacienda Los Olivos",
    borrower: "Olivos Premium Villas SL",
    sponsor: "Sierra Bermeja Desarrollos",
    location: "Benahavís, Málaga",
    city: "Benahavís",
    stage: "repaid",
    assetType: "Residential - Build to Sell",
    description: "10 luxury detached villas in the Benahavís hills with golf course and mountain views. Fully sold 4 months before completion. Excellent fund performance.",
    loanAmount: 7200000,
    currency: "EUR",
    interestRate: 5.0,
    pikSpread: 4.5,
    totalRate: 9.5,
    originationFee: 1.5,
    exitFee: 0.75,
    tenor: 18,
    maturityDate: "2025-11-30",
    disbursedAmount: 7200000,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 19500000,
    currentAppraisal: 19500000,
    totalUnits: 10,
    totalArea: 3200,
    constructionBudget: 9600000,
    constructionSpent: 9600000,
    constructionProgress: 100,
    landCost: 3900000,
    ltv: 36.9,
    ltc: 53.3,
    preSalesPercent: 100,
    developerExperience: "Established - 19 years",
    developerTrackRecord: 11,
    dateReceived: "2024-02-20",
    termSheetDate: "2024-03-10",
    icApprovalDate: "2024-04-15",
    closingDate: "2024-05-30",
    firstDrawdownDate: "2024-06-15",
    expectedMaturity: "2025-11-30",
    drawdowns: [
      { id: "dd-005-1", milestone: "Land & infrastructure", amount: 2200000, scheduledDate: "2024-06-15", status: "disbursed", constructionProgress: 0 },
      { id: "dd-005-2", milestone: "Structure", amount: 2700000, scheduledDate: "2024-10-15", status: "disbursed", constructionProgress: 38 },
      { id: "dd-005-3", milestone: "Finishes & landscaping", amount: 2300000, scheduledDate: "2025-03-15", status: "disbursed", constructionProgress: 76 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 65%", currentValue: "36.9%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "53.3%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 30%", currentValue: "100%", status: "compliant" },
    ],
    unitSales: [
      { unit: "V-01", type: "4-bed villa", area: 340, listPrice: 1890000, status: "sold", salePrice: 1870000, releasePrice: 620000 },
      { unit: "V-02", type: "4-bed villa", area: 325, listPrice: 1780000, status: "sold", salePrice: 1800000, releasePrice: 598000 },
      { unit: "V-03", type: "5-bed villa", area: 395, listPrice: 2100000, status: "sold", salePrice: 2100000, releasePrice: 695000 },
    ],
    tags: ["Benahavís", "Luxury Villas", "Golf", "Fully Repaid"],
  },
  {
    id: "deal-006",
    projectName: "Mirador del Port",
    borrower: "Marina Residences SL",
    sponsor: "Balear Real Estate",
    location: "Portixol, Palma de Mallorca",
    city: "Palma",
    stage: "documentation",
    assetType: "Residential - Build to Sell",
    description: "Two boutique residential buildings with 48 apartments total. Seafront location in Palma's Portixol district, premium positioning with sea and old town views. IC approved — final documentation in progress.",
    loanAmount: 13500000,
    currency: "EUR",
    interestRate: 4.75,
    pikSpread: 4.25,
    totalRate: 9.0,
    originationFee: 1.25,
    exitFee: 0.75,
    tenor: 28,
    maturityDate: "2028-10-31",
    disbursedAmount: 0,
    outstandingPrincipal: 0,
    accruedPIK: 0,
    totalExposure: 0,
    gdv: 35000000,
    currentAppraisal: 20500000,
    totalUnits: 48,
    totalArea: 5600,
    constructionBudget: 17800000,
    constructionSpent: 0,
    constructionProgress: 0,
    landCost: 6800000,
    ltv: 65.9,
    ltc: 54.9,
    preSalesPercent: 31,
    developerExperience: "Established - 14 years",
    developerTrackRecord: 8,
    dateReceived: "2026-01-25",
    termSheetDate: "2026-02-12",
    icApprovalDate: "2026-03-20",
    expectedMaturity: "2028-10-31",
    drawdowns: [
      { id: "dd-006-1", milestone: "Land & pre-construction", amount: 3600000, scheduledDate: "2026-07-01", status: "pending", constructionProgress: 0 },
      { id: "dd-006-2", milestone: "Foundation & structure Bldg A", amount: 3200000, scheduledDate: "2026-11-01", status: "pending", constructionProgress: 22 },
      { id: "dd-006-3", milestone: "Structure Bldg B & MEP", amount: 3600000, scheduledDate: "2027-04-01", status: "pending", constructionProgress: 52 },
      { id: "dd-006-4", milestone: "Finishes & common areas", amount: 3100000, scheduledDate: "2027-10-01", status: "pending", constructionProgress: 82 },
    ],
    covenants: [
      { name: "Maximum LTV", metric: "LTV", threshold: "≤ 70%", currentValue: "65.9%", status: "compliant" },
      { name: "Maximum LTC", metric: "LTC", threshold: "≤ 75%", currentValue: "54.9%", status: "compliant" },
      { name: "Minimum Pre-Sales", metric: "Pre-Sales", threshold: "≥ 25%", currentValue: "31%", status: "compliant" },
    ],
    unitSales: [
      { unit: "A-PH1", type: "4-bed penthouse", area: 195, listPrice: 1680000, status: "contracted", salePrice: 1640000, releasePrice: 445000 },
      { unit: "A-3B", type: "3-bed apartment", area: 115, listPrice: 635000, status: "reserved" },
    ],
    tags: ["Mallorca", "Seafront", "Portixol", "Premium"],
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

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export const formatMillions = (amount: number): string => `€${(amount / 1000000).toFixed(1)}M`;

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
  return { totalCommitments, totalExposure, totalGDV, totalDisbursed, avgLTV, avgLTC, activeDeals: activeDeals.length, pipelineDeals, totalDeals: allDeals.length, totalAccruedPIK };
};
