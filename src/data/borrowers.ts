export type KYCStatus = "valid" | "expiring_soon" | "expired" | "pending";
export type BorrowerRating = "A" | "B" | "C" | "D" | "unrated";

export interface BorrowerContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface CorporateEntity {
  name: string;
  type: "SPV" | "Holding" | "Sponsor" | "UBO";
  jurisdiction: string;
  registrationNumber?: string;
  ownership?: string;
}

export interface KYCRecord {
  item: string;
  status: KYCStatus;
  lastChecked?: string;
  expiryDate?: string;
  notes?: string;
}

export interface CompletedProject {
  name: string;
  location: string;
  year: number;
  units: number;
  loanAmount: number;
  irr: number;
  multiple: number;
  daysDelay: number;
  outcome: "on_time" | "minor_delay" | "significant_delay";
}

export interface Borrower {
  id: string;
  name: string;
  group: string;
  type: "Developer" | "Sponsor" | "Developer & Sponsor";
  internalRating: BorrowerRating;
  ratingDate: string;
  headquarters: string;
  yearEstablished: number;
  website?: string;
  description: string;

  contacts: BorrowerContact[];
  corporateStructure: CorporateEntity[];
  kyc: KYCRecord[];
  completedProjects: CompletedProject[];

  // Linked deals (by deal ID from sampleDeals)
  activeDealIds: string[];

  // Aggregate metrics
  totalExposure: number;
  totalCommitments: number;
  numberOfActiveDeals: number;
  avgIRR?: number;
  avgMultiple?: number;
}

export const ratingColors: Record<BorrowerRating, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-red-100 text-red-600",
  unrated: "bg-gray-100 text-gray-500",
};

export const kycStatusColors: Record<KYCStatus, string> = {
  valid: "text-success",
  expiring_soon: "text-warning",
  expired: "text-destructive",
  pending: "text-muted-foreground",
};

export const sampleBorrowers: Borrower[] = [
  {
    id: "bor-001",
    name: "Solaris Promociones SL",
    group: "Grupo Valverde Inversiones",
    type: "Developer",
    internalRating: "A",
    ratingDate: "2025-03-15",
    headquarters: "Marbella, Málaga",
    yearEstablished: 2009,
    website: "www.valverde-inversiones.es",
    description: "Leading Costa del Sol residential developer specializing in premium beachfront and golf-adjacent projects. Strong pipeline of completed luxury developments with consistent sales performance.",
    contacts: [
      { name: "E. Sandoval", role: "CEO & UBO", email: "r.montalban@valverde-inv.es", phone: "+34 952 XXX XXX" },
      { name: "M. Sandoval", role: "CFO", email: "e.montalban@valverde-inv.es", phone: "+34 952 XXX XXX" },
      { name: "R. Fuentes", role: "Head of Construction", email: "j.ortega@solaris-dev.es", phone: "+34 652 XXX XXX" },
    ],
    corporateStructure: [
      { name: "Grupo Valverde Inversiones SL", type: "Holding", jurisdiction: "Spain", registrationNumber: "B-29XXXXXX", ownership: "100% Valverde Family" },
      { name: "Solaris Promociones SL", type: "SPV", jurisdiction: "Spain", registrationNumber: "B-29XXXXXX", ownership: "100% Grupo Valverde" },
      { name: "Valverde Family Office SL", type: "Sponsor", jurisdiction: "Spain", registrationNumber: "B-29XXXXXX" },
      { name: "E. Sandoval García", type: "UBO", jurisdiction: "Spain", ownership: "85% beneficial ownership" },
    ],
    kyc: [
      { item: "ID Verification (UBO)", status: "valid", lastChecked: "2025-02-10", expiryDate: "2027-02-10" },
      { item: "Proof of Address (UBO)", status: "valid", lastChecked: "2025-02-10", expiryDate: "2026-08-10" },
      { item: "Corporate Registry Extract", status: "valid", lastChecked: "2025-03-01", expiryDate: "2026-03-01" },
      { item: "AML Screening (WorldCheck)", status: "valid", lastChecked: "2026-01-15", expiryDate: "2026-07-15" },
      { item: "Source of Funds Declaration", status: "valid", lastChecked: "2025-04-05" },
      { item: "PEP Screening", status: "valid", lastChecked: "2026-01-15", expiryDate: "2026-07-15" },
      { item: "Sanctions Screening", status: "valid", lastChecked: "2026-03-01", expiryDate: "2026-09-01" },
      { item: "Audited Financial Statements", status: "valid", lastChecked: "2025-06-20", notes: "FY2024 audited by external firm" },
    ],
    completedProjects: [
      { name: "Hacienda Los Olivos", location: "Benahavís", year: 2025, units: 10, loanAmount: 7200000, irr: 14.2, multiple: 1.28, daysDelay: 0, outcome: "on_time" },
      { name: "Residencial Playa Dorada", location: "Estepona", year: 2023, units: 24, loanAmount: 5800000, irr: 12.8, multiple: 1.22, daysDelay: 15, outcome: "on_time" },
      { name: "Villas del Golf", location: "Benahavís", year: 2022, units: 8, loanAmount: 4200000, irr: 11.5, multiple: 1.18, daysDelay: 45, outcome: "minor_delay" },
      { name: "Marina Gardens", location: "Marbella", year: 2020, units: 32, loanAmount: 9500000, irr: 13.1, multiple: 1.25, daysDelay: 0, outcome: "on_time" },
      { name: "Sunset Terrace", location: "Fuengirola", year: 2019, units: 20, loanAmount: 6100000, irr: 10.8, multiple: 1.16, daysDelay: 90, outcome: "minor_delay" },
    ],
    activeDealIds: ["deal-001"],
    totalExposure: 10536400,
    totalCommitments: 14200000,
    numberOfActiveDeals: 1,
    avgIRR: 12.5,
    avgMultiple: 1.22,
  },
  {
    id: "bor-002",
    name: "Norte Residencial SL",
    group: "Altamira Capital Partners",
    type: "Developer & Sponsor",
    internalRating: "B",
    ratingDate: "2026-02-20",
    headquarters: "Madrid",
    yearEstablished: 2015,
    description: "Madrid-focused residential developer with growing track record. Part of Altamira Capital group with interests in residential and mixed-use developments across central Spain.",
    contacts: [
      { name: "H. Paredes", role: "Managing Partner", email: "f.velazquez@altamiracap.es", phone: "+34 915 XXX XXX" },
      { name: "A. Quintero", role: "Finance Director", email: "c.iglesias@altamiracap.es", phone: "+34 915 XXX XXX" },
    ],
    corporateStructure: [
      { name: "Altamira Capital Partners SL", type: "Sponsor", jurisdiction: "Spain", registrationNumber: "B-28XXXXXX", ownership: "60% F. Velázquez, 40% institutional" },
      { name: "Norte Residencial SL", type: "SPV", jurisdiction: "Spain", registrationNumber: "B-28XXXXXX", ownership: "100% Altamira Capital" },
      { name: "H. Paredes Ruiz", type: "UBO", jurisdiction: "Spain", ownership: "60% beneficial ownership" },
    ],
    kyc: [
      { item: "ID Verification (UBO)", status: "valid", lastChecked: "2026-02-01", expiryDate: "2028-02-01" },
      { item: "Corporate Registry Extract", status: "valid", lastChecked: "2026-02-15", expiryDate: "2027-02-15" },
      { item: "AML Screening (WorldCheck)", status: "valid", lastChecked: "2026-02-20", expiryDate: "2026-08-20" },
      { item: "Source of Funds Declaration", status: "valid", lastChecked: "2026-02-25" },
      { item: "Audited Financial Statements", status: "expiring_soon", lastChecked: "2025-07-10", expiryDate: "2026-04-30", notes: "FY2025 accounts requested — deadline approaching" },
      { item: "PEP Screening", status: "valid", lastChecked: "2026-02-20", expiryDate: "2026-08-20" },
    ],
    completedProjects: [
      { name: "Residencial Arturo Soria", location: "Madrid", year: 2024, units: 36, loanAmount: 11200000, irr: 11.0, multiple: 1.17, daysDelay: 60, outcome: "minor_delay" },
      { name: "Apartamentos Chamberí", location: "Madrid", year: 2022, units: 18, loanAmount: 5400000, irr: 9.8, multiple: 1.14, daysDelay: 120, outcome: "significant_delay" },
      { name: "Pisos Retiro Park", location: "Madrid", year: 2021, units: 22, loanAmount: 7600000, irr: 10.5, multiple: 1.15, daysDelay: 30, outcome: "on_time" },
    ],
    activeDealIds: ["deal-002"],
    totalExposure: 0,
    totalCommitments: 19500000,
    numberOfActiveDeals: 1,
    avgIRR: 10.4,
    avgMultiple: 1.15,
  },
  {
    id: "bor-003",
    name: "Levantina Homes SL",
    group: "Mediterráneo Desarrollos",
    type: "Developer",
    internalRating: "A",
    ratingDate: "2026-01-10",
    headquarters: "Valencia",
    yearEstablished: 2004,
    description: "One of Valencia's most experienced residential developers with 22+ years of activity. Known for quality boutique projects in central Valencia neighborhoods. Excellent reputation among local buyers and agents.",
    contacts: [
      { name: "G. Navarro", role: "CEO", email: "a.pascual@meddesarrollos.es", phone: "+34 963 XXX XXX" },
      { name: "I. Molina", role: "Commercial Director", email: "l.ferrer@meddesarrollos.es", phone: "+34 963 XXX XXX" },
      { name: "O. Blanco", role: "Technical Director", email: "m.soriano@meddesarrollos.es", phone: "+34 648 XXX XXX" },
    ],
    corporateStructure: [
      { name: "Mediterráneo Desarrollos SA", type: "Holding", jurisdiction: "Spain", registrationNumber: "A-46XXXXXX", ownership: "Navarro Family (70%), Institutional (30%)" },
      { name: "Levantina Homes SL", type: "SPV", jurisdiction: "Spain", registrationNumber: "B-46XXXXXX", ownership: "100% Mediterráneo Desarrollos" },
      { name: "G. Navarro López", type: "UBO", jurisdiction: "Spain", ownership: "70% through family holding" },
    ],
    kyc: [
      { item: "ID Verification (UBO)", status: "valid", lastChecked: "2026-01-05", expiryDate: "2028-01-05" },
      { item: "Corporate Registry Extract", status: "valid", lastChecked: "2026-01-10", expiryDate: "2027-01-10" },
      { item: "AML Screening (WorldCheck)", status: "valid", lastChecked: "2026-01-10", expiryDate: "2026-07-10" },
      { item: "Source of Funds Declaration", status: "valid", lastChecked: "2026-01-15" },
      { item: "Audited Financial Statements", status: "valid", lastChecked: "2025-09-20", notes: "FY2024 audited by external firm" },
      { item: "PEP Screening", status: "valid", lastChecked: "2026-01-10", expiryDate: "2026-07-10" },
      { item: "Sanctions Screening", status: "valid", lastChecked: "2026-01-10", expiryDate: "2026-07-10" },
    ],
    completedProjects: [
      { name: "Lofts Ciutat Vella", location: "Valencia", year: 2024, units: 14, loanAmount: 3800000, irr: 13.5, multiple: 1.24, daysDelay: 0, outcome: "on_time" },
      { name: "Terrasses del Carme", location: "Valencia", year: 2023, units: 20, loanAmount: 5200000, irr: 12.2, multiple: 1.20, daysDelay: 0, outcome: "on_time" },
      { name: "Jardins de Benimaclet", location: "Valencia", year: 2021, units: 28, loanAmount: 6800000, irr: 11.8, multiple: 1.19, daysDelay: 20, outcome: "on_time" },
      { name: "Residencial Mestalla", location: "Valencia", year: 2020, units: 16, loanAmount: 4100000, irr: 10.9, multiple: 1.16, daysDelay: 0, outcome: "on_time" },
      { name: "Plaza del Ayuntamiento Apts", location: "Valencia", year: 2018, units: 12, loanAmount: 3200000, irr: 11.2, multiple: 1.17, daysDelay: 0, outcome: "on_time" },
    ],
    activeDealIds: ["deal-003"],
    totalExposure: 0,
    totalCommitments: 6800000,
    numberOfActiveDeals: 1,
    avgIRR: 11.9,
    avgMultiple: 1.19,
  },
  {
    id: "bor-004",
    name: "Eixample Heritage SL",
    group: "Tramontana Group",
    type: "Developer",
    internalRating: "C",
    ratingDate: "2026-03-28",
    headquarters: "Barcelona",
    yearEstablished: 2020,
    description: "Younger Barcelona-based developer focused on heritage refurbishment projects. Limited track record but led by experienced management team from larger developers. Currently in screening phase.",
    contacts: [
      { name: "D. Estrada", role: "Founder & CEO", email: "p.casanova@tramontana-dev.es", phone: "+34 934 XXX XXX" },
      { name: "L. Prado", role: "Project Manager", email: "n.almirall@tramontana-dev.es", phone: "+34 672 XXX XXX" },
    ],
    corporateStructure: [
      { name: "Tramontana Group SL", type: "Sponsor", jurisdiction: "Spain", registrationNumber: "B-08XXXXXX", ownership: "Estrada Family (80%), Angel investors (20%)" },
      { name: "Eixample Heritage SL", type: "SPV", jurisdiction: "Spain", registrationNumber: "B-08XXXXXX", ownership: "100% Tramontana Group" },
      { name: "D. Estrada Vega", type: "UBO", jurisdiction: "Spain", ownership: "80% beneficial ownership" },
    ],
    kyc: [
      { item: "ID Verification (UBO)", status: "valid", lastChecked: "2026-03-20", expiryDate: "2028-03-20" },
      { item: "Corporate Registry Extract", status: "valid", lastChecked: "2026-03-25", expiryDate: "2027-03-25" },
      { item: "AML Screening (WorldCheck)", status: "pending", notes: "Screening initiated — awaiting results" },
      { item: "Source of Funds Declaration", status: "pending" },
      { item: "Audited Financial Statements", status: "expired", lastChecked: "2025-01-15", expiryDate: "2026-01-15", notes: "FY2025 accounts not yet available" },
    ],
    completedProjects: [
      { name: "Can Piqué Residences", location: "Barcelona", year: 2024, units: 8, loanAmount: 2800000, irr: 9.2, multiple: 1.12, daysDelay: 75, outcome: "minor_delay" },
      { name: "Eixample Lofts", location: "Barcelona", year: 2023, units: 6, loanAmount: 1900000, irr: 8.5, multiple: 1.10, daysDelay: 45, outcome: "minor_delay" },
    ],
    activeDealIds: ["deal-004"],
    totalExposure: 0,
    totalCommitments: 8500000,
    numberOfActiveDeals: 1,
    avgIRR: 8.9,
    avgMultiple: 1.11,
  },
  {
    id: "bor-005",
    name: "Marina Residences SL",
    group: "Balear Real Estate",
    type: "Developer & Sponsor",
    internalRating: "B",
    ratingDate: "2026-01-15",
    headquarters: "Palma de Mallorca",
    yearEstablished: 2012,
    description: "Balearic Islands-focused developer with strong track record in Palma de Mallorca premium residential. Known for seafront and old town projects. Solid relationships with local authorities and construction firms.",
    contacts: [
      { name: "F. Marín", role: "Managing Director", email: "b.serra@balear-re.es", phone: "+34 971 XXX XXX" },
      { name: "B. Costa", role: "CFO", email: "m.fiol@balear-re.es", phone: "+34 971 XXX XXX" },
    ],
    corporateStructure: [
      { name: "Balear Real Estate SL", type: "Sponsor", jurisdiction: "Spain", registrationNumber: "B-07XXXXXX", ownership: "Marín Family (65%), Private investors (35%)" },
      { name: "Marina Residences SL", type: "SPV", jurisdiction: "Spain", registrationNumber: "B-07XXXXXX", ownership: "100% Balear RE" },
      { name: "F. Marín Soler", type: "UBO", jurisdiction: "Spain", ownership: "65% beneficial ownership" },
    ],
    kyc: [
      { item: "ID Verification (UBO)", status: "valid", lastChecked: "2026-01-10", expiryDate: "2028-01-10" },
      { item: "Corporate Registry Extract", status: "valid", lastChecked: "2026-01-15", expiryDate: "2027-01-15" },
      { item: "AML Screening (WorldCheck)", status: "valid", lastChecked: "2026-01-15", expiryDate: "2026-07-15" },
      { item: "Source of Funds Declaration", status: "valid", lastChecked: "2026-01-20" },
      { item: "Audited Financial Statements", status: "valid", lastChecked: "2025-08-15", notes: "FY2024 audited by external firm" },
      { item: "PEP Screening", status: "valid", lastChecked: "2026-01-15", expiryDate: "2026-07-15" },
    ],
    completedProjects: [
      { name: "Ses Voltes Apartments", location: "Palma", year: 2024, units: 18, loanAmount: 5600000, irr: 12.0, multiple: 1.20, daysDelay: 30, outcome: "on_time" },
      { name: "Portixol Marina Lofts", location: "Palma", year: 2022, units: 12, loanAmount: 3900000, irr: 11.5, multiple: 1.18, daysDelay: 0, outcome: "on_time" },
      { name: "Santa Catalina Townhouses", location: "Palma", year: 2021, units: 6, loanAmount: 2400000, irr: 10.8, multiple: 1.15, daysDelay: 60, outcome: "minor_delay" },
      { name: "Son Vida Heights", location: "Palma", year: 2019, units: 8, loanAmount: 3200000, irr: 11.2, multiple: 1.17, daysDelay: 0, outcome: "on_time" },
    ],
    activeDealIds: ["deal-006"],
    totalExposure: 0,
    totalCommitments: 13500000,
    numberOfActiveDeals: 1,
    avgIRR: 11.4,
    avgMultiple: 1.18,
  },
];
