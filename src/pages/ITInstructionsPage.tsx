import AppLayout from "@/components/layout/AppLayout";
import { BookOpen, FolderTree, FileText, Database, Palette, Wrench, Server, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Arquitectura del Proyecto",
    icon: FolderTree,
    color: "bg-blue-50 text-blue-600",
    content: `El proyecto está construido con React 18 + TypeScript, usando Vite como bundler.
La estructura principal es:

• src/pages/ — Componentes de página (una por ruta)
• src/components/ui/ — Componentes primitivos de shadcn/ui (Button, Dialog, Tabs, etc.)
• src/components/layout/ — AppLayout (sidebar + top nav)
• src/components/dashboard/ — Widgets del dashboard (MetricCard, PortfolioMap, DealImportDialog, etc.)
• src/components/deals/ — Paneles de detalle de deal (DD, Approvals, PIK, etc.)
• src/components/screening/ — Herramienta de screening
• src/data/ — Datos mock y definiciones de tipos
• src/lib/ — Utilidades (cn helper, generación PDF, import/export Excel)
• src/hooks/ — Custom React hooks (useDeals, useMobile)`,
  },
  {
    title: "Páginas y Rutas",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600",
    content: `Cada ruta corresponde a un archivo en src/pages/:

/ → Index.tsx — Dashboard principal con NAV, métricas, tabla de actividad, timeline de eventos, sector allocation
/investor → InvestorPortalPage.tsx — Portal del inversor con valor del portafolio, rendimientos, chart de performance, pagos futuros
/map → MapPage.tsx — Mapa interactivo Leaflet con ubicación geográfica de todos los deals
/lifecycle → LifecyclePage.tsx — Workflow de 12 fases del deal con milestones y agentes asignados
/pipeline → PipelinePage.tsx — Pipeline de deals con filtros por stage, import/export Excel
/screening → ScreeningPage.tsx — Herramienta de evaluación rápida de oportunidades
/deals → LoanBookPage.tsx — Tabla del loan book con filtros, búsqueda, ordenamiento por columnas
/deals/:id → DealDetailPage.tsx — Vista completa del deal (DD, approvals, covenants, drawdowns, unit sales)
/term-sheets → TermSheetPage.tsx — Term sheets con key terms, security package, covenant waivers, audit trail
/pik-engine → PIKEnginePage.tsx — Motor de cálculo de intereses PIK y proyección de exposición
/construction → ConstructionMonitoringPage.tsx — Monitoreo de construcción, visitas, certificaciones
/borrowers → BorrowersPage.tsx — Registro de borrowers con ratings y estado KYC
/borrowers/:id → BorrowerDetailPage.tsx — Detalle del borrower (perfil, exposición, track record, KYC)
/due-diligence → DueDiligencePage.tsx — Tracker de due diligence con exportación PDF
/approvals → ApprovalsPage.tsx — Workflow de aprobación IC con votación
/it-instructions → ITInstructionsPage.tsx — Esta página de documentación
/landing → LandingPage.tsx — Landing page de marketing (oculta, accesible en /landing)`,
  },
  {
    title: "Modelo de Datos",
    icon: Database,
    color: "bg-violet-50 text-violet-600",
    content: `IMPORTANTE: Actualmente todos los datos son MOCK (archivos estáticos en src/data/).
No hay backend ni base de datos conectada. Para producción se necesita:

1. Backend API (Node/Express, FastAPI, o similar)
2. Base de datos PostgreSQL (recomendado para datos financieros)
3. Reemplazar los imports de src/data/ con React Query hooks

Archivos de datos actuales:
• sampleDeals.ts — Tipo Deal completo (488 líneas) con todos los campos: loan, rates, covenants, drawdowns, unit sales
• borrowers.ts — Tipo Borrower con contacts, corporate structure, KYC, track record
• lifecyclePhases.ts — 12 fases del lifecycle con agentes y milestones
• dealModules.ts — Due diligence items y approvals
• pikEngine.ts — Lógica de cálculo PIK mensual
• termSheetData.ts — Term sheets, waivers, audit trail
• constructionMonitoring.ts — Site visits, certificaciones, monitoring reports
• waterfallData.ts — Waterfall de distribución

React Query (@tanstack/react-query) ya está instalado y configurado en App.tsx, listo para conectar.`,
  },
  {
    title: "Sistema de Diseño",
    icon: Palette,
    color: "bg-amber-50 text-amber-600",
    content: `Fuentes:
• Manrope (headlines, font-extrabold) — títulos, números grandes
• Inter (body, labels) — texto, tablas, formularios

Colores principales:
• Primary: #19212E (navy oscuro) — texto principal, fondos hero
• Emerald: #10b981 — indicadores positivos, botones CTA, progress bars
• Slate-400/500: — texto secundario, labels
• White/Slate-50: — fondos de cards y contenido

Componentes UI: shadcn/ui (40+ componentes Radix-based)
Iconos: Lucide React
Charts: Recharts (AreaChart, PieChart)
Mapa: Leaflet (vanilla, sin react-leaflet)

Patrones de diseño:
• Cards con rounded-2xl, border-slate-100, shadow-sm
• Labels uppercase tracking-widest 9-11px
• Badge pills con colores por estado
• Hover con shadow-md transition
• Gradient hero cards para secciones principales`,
  },
  {
    title: "Funcionalidades Implementadas",
    icon: Wrench,
    color: "bg-rose-50 text-rose-600",
    content: `✅ Dashboard con métricas NAV, actividad reciente, timeline eventos
✅ Portal del inversor con performance chart y pagos futuros
✅ Mapa interactivo con ubicación de deals
✅ Import/Export Excel para deals (template descargable, upload con preview)
✅ Pipeline con filtros por stage
✅ Loan Book con búsqueda, filtros, ordenamiento
✅ Detalle deal completo (7 paneles: DD, Approvals, PIK, Construction, Legal, Waterfall, Term Sheet)
✅ Term Sheets con key terms, security package, covenant waivers
✅ Motor PIK con cálculo mensual y proyección a vencimiento
✅ Due Diligence tracker con export PDF (jsPDF)
✅ Monitoreo de construcción (visitas, certificaciones)
✅ Registro borrowers con KYC, ratings, track record
✅ Quick Screen dialog con evaluación rápida
✅ Lifecycle de 12 fases con milestones
✅ Separadores de miles en inputs de moneda
✅ Vercel Analytics integrado

❌ NO implementado (requiere backend):
• Autenticación y roles de usuario
• Persistencia de datos (todo se pierde al recargar)
• CRUD real (crear/editar/eliminar deals)
• Notificaciones push
• Upload de documentos
• Audit trail real
• Integración con APIs externas`,
  },
  {
    title: "Cómo Ejecutar el Proyecto",
    icon: Server,
    color: "bg-cyan-50 text-cyan-600",
    content: `Requisitos: Node.js 18+

Instalación:
  npm install

Desarrollo:
  npm run dev          → Servidor en http://localhost:5173

Build:
  npm run build        → Build de producción en /dist

Scripts disponibles:
  npm run dev          → Dev server con HMR
  npm run build        → Build producción
  npm run preview      → Preview del build
  npm run lint         → ESLint
  npm run test         → Vitest
  npm run test:watch   → Tests en modo watch

Deploy:
  El proyecto está configurado para Vercel.
  Cada push a main triggera un deploy automático.
  Vercel Analytics está integrado.`,
  },
  {
    title: "Próximos Pasos Recomendados",
    icon: Shield,
    color: "bg-primary/5 text-primary",
    content: `Prioridad ALTA:
1. Conectar Supabase (PostgreSQL) como backend
2. Implementar autenticación con Supabase Auth
3. Migrar datos mock a tablas reales
4. Usar React Query para todas las llamadas API
5. Agregar validación con Zod (ya instalado)

Prioridad MEDIA:
6. Agregar Error Boundaries para manejo de errores
7. Implementar tests unitarios para lógica financiera (PIK, screening)
8. Code splitting con React.lazy() para reducir bundle (actualmente 2MB)
9. Agregar atributos ARIA para accesibilidad

Prioridad BAJA:
10. Dark mode
11. Internacionalización (i18n)
12. PWA / offline support`,
  },
];

export default function ITInstructionsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold text-primary">Instrucciones para IT</h1>
          <p className="text-slate-400 text-sm mt-0.5">Documentación técnica completa del proyecto CapitalBridge</p>
        </header>

        <div className="grid gap-4">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", section.color)}>
                  <section.icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-primary">{section.title}</h2>
              </div>
              <div className="px-6 py-5">
                <pre className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap font-body">{section.content}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
