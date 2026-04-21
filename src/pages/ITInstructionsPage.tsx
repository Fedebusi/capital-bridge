import AppLayout from "@/components/layout/AppLayout";
import { BookOpen, FolderTree, FileText, Database, Palette, Wrench, Server, Shield, Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "¿Qué es CapitalBridge?",
    icon: Target,
    color: "bg-primary/5 text-primary",
    content: `CapitalBridge es una plataforma de gestión de portafolio para fondos de deuda inmobiliaria institucional.

Permite a un equipo de originación y gestión de préstamos:
• Evaluar rápidamente nuevas oportunidades de inversión (screening)
• Seguir todo el ciclo de vida de un deal desde la originación hasta el repago
• Monitorear covenants, construcción y riesgo del portafolio
• Generar reportes para inversores y comités de inversión
• Importar/exportar datos de deals via Excel

El usuario típico es un analista o portfolio manager de un fondo de deuda que presta dinero a promotores inmobiliarios para desarrollo residencial, comercial o refurbishment.`,
  },
  {
    title: "Páginas y su Lógica de Negocio (con Prioridad)",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600",
    content: `═══════════════════════════════════════════════
 P0 — CORE (construir primero)
═══════════════════════════════════════════════

DASHBOARD (/) — [P0 CORE]
Para qué sirve: Vista ejecutiva del fondo. El portfolio manager abre esta página cada mañana para ver el estado general.
Qué muestra: NAV total del fondo, métricas clave (IRR, impaired ratio, cash distribuible), últimas transacciones, timeline de eventos recientes, y distribución sectorial.
Lógica: Los datos se calculan agregando todos los deals activos — suma de exposiciones, media ponderada de tasas, etc.
Técnico: Usa useDeals() context. Datos vienen de Supabase cuando configurado, fallback a datos demo.

LOAN BOOK (/deals) — [P0 CORE]
Para qué sirve: Vista tabular completa de todo el portafolio de préstamos. Es la referencia diaria del equipo.
Qué muestra: Tabla con todas las métricas de cada deal (facility, disbursed, PIK, exposure, rate, LTV, construction progress, maturity). Cards de resumen arriba con totales.
Lógica: Filtrable por stage, buscable por nombre/borrower, ordenable por columnas. Exportable a Excel.
Técnico: Usa useDeals() context. Tabla con overflow-x-auto para mobile.

PIPELINE (/pipeline) — [P0 CORE]
Para qué sirve: Gestionar el flujo de nuevos deals. Es la "bandeja de entrada" del equipo de originación.
Qué muestra: Grid de cards de deals filtrable por stage (Screening, Due Diligence, IC Approval, Documentation, Active, Repaid). Cada card muestra nombre, borrower, facility, métricas clave.
Lógica: Los deals pasan por stages secuenciales. Se pueden IMPORTAR nuevos deals via Excel y CREAR via formulario.
Técnico: Usa useDeals() context. DealFormDialog con validación Zod (21 campos). Excel import via SheetJS.

DEAL DETAIL (/deals/:id) — [P0 CORE]
Para qué sirve: Vista 360° de un deal específico. Todo lo que necesitas saber de un préstamo en una sola página.
Qué muestra: 7 paneles — Due Diligence (checklist items), Approvals (votación IC), Term Sheet & Waivers, Legal & Security, Waterfall (distribución cash flows), PIK Schedule (intereses mensuales), Construction Monitoring.
Lógica: Cada panel carga datos del deal específico. Los paneles son independientes y se pueden expandir/colapsar.
Técnico: Usa useDeals() para encontrar el deal por ID. Sub-datos (DD, approvals, etc.) usan datos demo actualmente — necesitan hooks Supabase dedicados.

BORROWERS (/borrowers) — [P0 CORE]
Para qué sirve: Registro centralizado de todos los prestatarios/promotores con los que trabaja el fondo.
Qué muestra: Tabla con nombre, grupo, rating interno (A/B/C), deals activos, commitments, exposure, IRR histórico, track record, estado KYC.
Lógica: Rating interno basado en track record. KYC verifica identidad, documentos, compliance AML.
Técnico: Usa useBorrowersQuery() de Supabase con fallback a sampleBorrowers. BorrowerFormDialog para crear nuevos.

BORROWER DETAIL (/borrowers/:id) — [P0 CORE]
Para qué sirve: Vista completa de un borrower con todo su historial.
Qué muestra: 4 tabs — Perfil (info empresa, contactos, estructura societaria), Exposure & Deals (deals vinculados), Track Record (proyectos completados con IRR y multiple), KYC & Compliance (checklist de documentos con fechas de vencimiento).
Lógica: Evalúa riesgo de concentración y verifica que el KYC esté al día.
Técnico: Usa useBorrowersQuery() + useDeals(). Sub-datos (contacts, KYC, corporate) necesitan hooks Supabase dedicados.

═══════════════════════════════════════════════
 P1 — IMPORTANTE (construir segundo)
═══════════════════════════════════════════════

SCREENING (/screening) — [P1 IMPORTANTE]
Para qué sirve: Evaluar rápidamente si una oportunidad cumple los criterios del fondo ANTES de invertir tiempo en due diligence.
Qué muestra: Formulario donde ingresas tipo de activo, loan amount, GDV, total cost, pre-sales. El sistema calcula LTV, LTC y evalúa contra umbrales.
Lógica: Criterios predefinidos — max LTV 65%, max LTC 75%, ticket €5-25M, min pre-sales 15%. Resultado: score en % con "PROCEED TO DD" / "REVIEW REQUIRED" / "DOES NOT MEET CRITERIA".
Técnico: Lógica standalone (no necesita DB). 10 tests unitarios cubren esta lógica.

DUE DILIGENCE (/due-diligence) — [P1 IMPORTANTE]
Para qué sirve: Trackear el progreso de la due diligence. Es el checklist de todo lo que hay que verificar antes de prestar.
Qué muestra: Lista de items de DD por deal (valuation, legal, environmental, insurance) con status. Progress bar por deal. Exporta reporte PDF.
Lógica: Cada deal tiene ~15-20 items de DD agrupados por categoría.
Técnico: Usa useDeals() para la lista de deals. Items de DD son datos demo — necesitan useDueDiligenceItems(dealId) de Supabase.

APPROVALS (/approvals) — [P1 IMPORTANTE]
Para qué sirve: Gestionar el proceso de aprobación del Investment Committee (IC).
Qué muestra: Deals pendientes y completados. Votación del IC (approve/reject/abstain por miembro), condiciones, status del Capital Partner.
Lógica: Un deal necesita aprobación del IC antes de emitir term sheet. Se registra el voto de cada miembro.
Técnico: Usa useDeals(). Datos de approval son demo — necesitan useApprovalRecord(dealId) y useICVotes(approvalId) de Supabase.

TERM SHEETS (/term-sheets) — [P1 IMPORTANTE]
Para qué sirve: Gestionar term sheets emitidos y covenant waivers.
Qué muestra: Key terms (facility, rates, fees, tenor, LTV/LTC limits), security package, waivers activos, validación Capital Partner, historial versiones, audit trail.
Lógica: Term sheet stages: Draft → Internal Review → CP Validation → Issued → Signed. Waivers requieren aprobación interna + CP.
Técnico: Usa useDeals(). Datos de term sheet son demo — necesitan useTermSheet(dealId) y useWaivers(dealId).

═══════════════════════════════════════════════
 P2 — ÚTIL (construir tercero)
═══════════════════════════════════════════════

LIFECYCLE (/lifecycle) — [P2 ÚTIL]
Para qué sirve: Seguir el workflow completo de 12 fases de cada deal.
Qué muestra: Barra de progreso visual, fase actual, agentes asignados, milestones, blockers.
Lógica: 12 fases secuenciales con milestones específicos y agentes responsables.
Técnico: Usa useDeals(). Fases de lifecycle son demo — necesitan tabla dedicada en Supabase.

PIK ENGINE (/pik-engine) — [P2 ÚTIL]
Para qué sirve: Calcular y proyectar intereses PIK que se capitalizan mensualmente.
Qué muestra: Tabla con principal outstanding, PIK accrued, total exposure, proyección al vencimiento.
Lógica: PIK = outstanding × PIK spread / 12, se acumula al principal. 11 tests unitarios cubren esta lógica.
Técnico: Usa useDeals(). Cálculos en src/data/pikEngine.ts (bien testeado).

CONSTRUCTION MONITORING (/construction) — [P2 ÚTIL]
Para qué sirve: Monitorear avance de obra. Fundamental para autorizar drawdowns.
Qué muestra: Site visits, certificaciones de avance, monitoring reports, retenciones.
Lógica: El fondo desembolsa solo cuando la construcción avanza según certificaciones.
Técnico: Usa useDeals(). Datos de construction son demo — necesitan useSiteVisits(), useConstructionCertifications(), useMonitoringReports().

INVESTOR PORTAL (/investor) — [P2 ÚTIL]
Para qué sirve: Página orientada al inversor/LP del fondo.
Qué muestra: Valor portafolio, rendimientos, IRR, chart performance, asset allocation, calendario pagos. Genera Tax Report PDF.
Lógica: Agrega datos de deals activos para mostrar returns.
Técnico: Usa useDeals(). Layout separado (InvestorLayout). Acceso via login dedicado (/login?role=investor).

═══════════════════════════════════════════════
 P3 — NICE TO HAVE
═══════════════════════════════════════════════

MAP (/map) — [P3 NICE TO HAVE]
Para qué sirve: Visualizar dónde están los proyectos.
Qué muestra: Mapa interactivo de España con pins coloreados por stage.
Técnico: Usa Leaflet + CartoDB tiles. Cada deal tiene coordenadas GPS.`,
  },
  {
    title: "Modelo de Datos — Qué Representa Cada Campo",
    icon: Database,
    color: "bg-violet-50 text-violet-600",
    content: `El tipo principal es "Deal" que representa un préstamo:

IDENTIFICACIÓN:
• projectName — Nombre del proyecto inmobiliario (ej: "Terrazas del Faro")
• borrower — La empresa que recibe el préstamo
• sponsor — El grupo o holding detrás del borrower
• location/city — Dónde está el proyecto
• assetType — Tipo de activo (Residential Build to Sell, Refurbishment, Commercial)

TÉRMINOS DEL PRÉSTAMO:
• loanAmount — Importe total del préstamo (facility)
• interestRate — Tasa de interés cash (se paga mensualmente)
• pikSpread — Spread PIK (se capitaliza, no se paga hasta el final)
• totalRate — interestRate + pikSpread
• originationFee — Comisión de apertura (% sobre facility)
• exitFee — Comisión de salida
• tenor — Plazo en meses

MÉTRICAS DE RIESGO:
• ltv — Loan to Value: préstamo / valor de mercado. Cuanto menor, mejor. Límite típico: 65%
• ltc — Loan to Cost: préstamo / coste total. Límite típico: 75%
• preSalesPercent — % de unidades pre-vendidas. Más pre-sales = menos riesgo

EXPOSICIÓN ACTUAL:
• disbursedAmount — Dinero ya desembolsado
• outstandingPrincipal — Principal pendiente de repago
• accruedPIK — Intereses PIK acumulados (se suman al principal)
• totalExposure — disbursed + accruedPIK = riesgo total actual

CONSTRUCCIÓN:
• constructionBudget — Presupuesto total de obra
• constructionSpent — Dinero ya gastado en obra
• constructionProgress — % de avance (0-100)

STAGES (ciclo de vida):
screening → due_diligence → ic_approval → documentation → active → repaid/rejected

DÓNDE ESTÁN LOS DATOS:
• Backend: Supabase PostgreSQL (28 tablas con RLS, foreign keys, triggers)
• Frontend: useDeals() context + useDealSubdata.ts hooks — switchan automáticamente entre datos Supabase (live) y datos demo (cuando Supabase no está configurado). Si Supabase está conectado pero una tabla está vacía, hace fallback a datos demo.
• Tipos TypeScript: src/types/database.ts (DbDeal, DbBorrower, etc.)
• Converters: src/lib/dbConverters.ts — mapea rows DB → tipos frontend (pure, testeados)
• Hooks Supabase: src/hooks/useSupabaseQuery.ts (36+ hooks) + src/hooks/useDealSubdata.ts (wrappers dual-mode)`,
  },
  {
    title: "Import/Export Excel — Cómo Funciona",
    icon: Wrench,
    color: "bg-rose-50 text-rose-600",
    content: `IMPORTAR DEALS:
1. El usuario va a Pipeline → click "Import Excel"
2. Descarga el template (archivo .xlsx con columnas predefinidas)
3. Llena el template con los datos del nuevo deal
4. Sube el archivo → el sistema lo parsea automáticamente
5. Ve una preview en tabla con los deals parseados
6. Si hay errores de validación (campo requerido vacío) aparecen en amarillo
7. Confirma → los deals se añaden al pipeline como "Screening"

Campos requeridos: Project Name, Borrower, Loan Amount, Interest Rate, Tenor, GDV
Campos opcionales: Sponsor, PIK Spread, Fees, Construction Budget, Pre-Sales, etc.

Cálculos automáticos al importar:
• LTV = Loan Amount / GDV × 100
• LTC = Loan Amount / (Construction Budget + Land Cost) × 100
• Total Rate = Interest Rate + PIK Spread

EXPORTAR:
• Botón "Export Excel" en Pipeline y Loan Book
• Descarga un .xlsx con todos los deals y sus métricas
• Nombre archivo: CapitalBridge_LoanBook_YYYY-MM-DD.xlsx

Librería utilizada: xlsx (SheetJS)
Archivo principal: src/lib/excelDealImport.ts`,
  },
  {
    title: "Stack Tecnológico",
    icon: Server,
    color: "bg-cyan-50 text-cyan-600",
    content: `FRONTEND:
• React 18 + TypeScript — Framework principal
• Vite — Bundler y dev server
• Tailwind CSS — Estilos utility-first
• shadcn/ui — 40+ componentes UI (Button, Dialog, Tabs, Select, etc.)
• Recharts — Charts (AreaChart, PieChart)
• Leaflet — Mapa interactivo
• Lucide React — Iconos
• jsPDF — Generación de reportes PDF
• xlsx (SheetJS) — Import/export Excel
• React Router — Navegación
• React Query — Data fetching y cache
• Zod — Validación de schemas en formularios

BACKEND:
• Supabase (PostgreSQL) — Base de datos con RLS (Row Level Security)
• Supabase Auth — Autenticación con email/password
• Supabase Storage — Almacenamiento de documentos y fotos
• Supabase Realtime — Notificaciones en tiempo real

INFRAESTRUCTURA:
• Vercel — Deploy automático desde GitHub (branch main)
• Vercel Analytics — Page views y performance
• Sentry — Error tracking en producción (VITE_SENTRY_DSN)
• GitHub Actions — CI/CD pipeline (lint + typecheck + test + build en cada PR)
• vercel.json — Security headers (X-Frame-Options, X-Content-Type-Options, etc.)

CÓMO EJECUTAR:
  npm install          → Instalar dependencias
  npm run dev          → Dev server en http://localhost:5173
  npm run build        → Build de producción
  npm run lint         → Verificar código con ESLint
  npm run test         → Ejecutar 22 tests con Vitest

VARIABLES DE ENTORNO (.env):
  VITE_SUPABASE_URL    → URL de tu proyecto Supabase
  VITE_SUPABASE_ANON_KEY → Anon key de Supabase
  VITE_SENTRY_DSN      → DSN de Sentry (opcional)`,
  },
  {
    title: "Estado Actual y Qué Falta",
    icon: Shield,
    color: "bg-amber-50 text-amber-600",
    content: `═══════════════════════════════════════════════
 ✅ YA COMPLETADO
═══════════════════════════════════════════════

Frontend:
• 19 páginas funcionales con 67+ componentes
• Design system unificado estilo fintech (Clikalia teal/pink)
• Pipeline Kanban drag-and-drop (@dnd-kit)
• Formularios con validación Zod (crear/editar deal, borrower)
• Generación PDF (Term Sheet, DD Report, Tax Report, IC Memo)
• Export UW Model Excel per deal (exceljs, preserva estilos)
• Import/Export Excel (pipeline completo, loan book)
• Botones Edit/Delete en Deal Detail y Borrower Detail
• Cambio de stage de deal (botón en Deal Detail)
• Loading skeletons + empty states con CTA en todas las páginas
• Error boundary global
• Responsive (sidebar mobile, tablas scrollables)

Backend — Supabase (100% conectado):
• 28 tablas con RLS (Row Level Security) + 6 migraciones
• useDeals() context con dual-mode: Supabase (live) ↔ datos demo (cuando no configurado)
• Sub-datos conectados: DD items, approvals, IC votes, term sheets, waivers, site visits, certifications, monitoring reports, lifecycle — todos con fallback a sample data
• 36+ hooks React Query (useSupabaseQuery.ts + useDealSubdata.ts)
• Auth system completo (login, signup, password recovery, roles: admin/analyst/pm/investor/viewer)
• File upload con validación (documentos DD + fotos site visit)
• Audit logging en creación de deals y borrowers
• Realtime notifications via Supabase Realtime

Infraestructura:
• CI/CD pipeline (GitHub Actions: lint + typecheck + 99 tests + build)
• Auto-deploy migraciones on push to main
• Security headers (vercel.json: X-Frame-Options, CSP, etc.)
• Sentry error tracking integrado
• Vercel Analytics

Finanzas (auditoría completada):
• NAV corregido (era 7× sobrestimado — usaba commitments en vez de disbursed)
• Métricas ponderadas por exposición (LTV, LTC, Rate)
• totalReturns incluye deals repaid
• UW Cash Flow con formulas correctas (PIK accrual, repayment sweep, loan balance)

═══════════════════════════════════════════════
 🔧 QUÉ FALTA PARA PRODUCCIÓN
═══════════════════════════════════════════════

PRIORIDAD P0 — Bloqueado en configuración:
1. Aplicar migración 00006 (lifecycle tables) en Supabase prod — necesita secrets en GitHub
2. QA end-to-end en live mode: file upload, RLS, lifecycle con datos reales

PRIORIDAD P1 — Mejora mucho la experiencia:
3. IC Memo Excel export per deal (template en desarrollo)
4. User management UI (invitar usuarios, cambiar rol)
5. Email transaccionales (covenant breach, stage change, waiver decisions)
6. Mobile optimization pass

PRIORIDAD P2 — Nice to have:
7. Dark mode
8. Chatbot AI para queries de datos
9. Integración Business Central
10. Custom domain + Supabase backup automático

═══════════════════════════════════════════════
 📋 ARCHIVOS CLAVE
═══════════════════════════════════════════════

Configuración:
• src/lib/supabase.ts — Cliente Supabase (con fallback demo)
• src/contexts/AuthContext.tsx — Estado auth, login, signup, roles
• src/hooks/useDeals.tsx — Context de deals (demo/live switch)
• src/hooks/useDealSubdata.ts — Sub-datos dual-mode (live ↔ demo) con fallback
• src/hooks/useSupabaseQuery.ts — 36+ hooks React Query para Supabase
• src/types/database.ts — Tipos TypeScript para todas las tablas
• src/lib/pdf/downloadUWForDeal.ts — Export UW Model Excel per deal

Migraciones DB:
• supabase/migrations/00001_initial_schema.sql — Schema completo (24 tablas + RLS)
• supabase/migrations/00002_seed_data.sql — Datos de ejemplo
• supabase/migrations/00003_fix_auth_trigger.sql — Fix auth trigger
• supabase/migrations/00004_fix_audit_logs_policy.sql — Fix audit logs RLS
• supabase/migrations/00005_first_user_admin.sql — Primer signup → admin
• supabase/migrations/00006_lifecycle_tables.sql — Lifecycle + phases + substeps + milestones

Datos demo:
• src/data/sampleDeals.ts — 6 deals de ejemplo
• src/data/borrowers.ts — 5 borrowers de ejemplo
• src/data/dealModules.ts — DD items, approvals de ejemplo
• src/data/termSheetData.ts — Term sheets de ejemplo
• src/data/constructionMonitoring.ts — Site visits, certificaciones
• src/data/lifecyclePhases.ts — Fases de lifecycle
• src/data/pikEngine.ts — Motor de cálculo PIK (99 tests)`,
  },
];

export default function ITInstructionsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Instrucciones para IT</h1>
          <p className="text-slate-500 text-base mt-2">Documentación funcional y técnica del proyecto CapitalBridge</p>
        </header>

        <div className="grid gap-4">
          {sections.map((section) => (
            <div key={section.title} className="bg-slate-50 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", section.color)}>
                  <section.icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-primary">{section.title}</h2>
              </div>
              <div className="px-6 py-5">
                <pre className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-body">{section.content}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
