import AppLayout from "@/components/layout/AppLayout";
import { BookOpen, FolderTree, FileText, Database, Palette, Wrench, Server, Shield, Target } from "lucide-react";
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
    title: "Páginas y su Lógica de Negocio",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600",
    content: `DASHBOARD (/)
Para qué sirve: Vista ejecutiva del fondo. El portfolio manager abre esta página cada mañana para ver el estado general.
Qué muestra: NAV total del fondo, métricas clave (IRR, impaired ratio, cash distribuible), últimas transacciones, timeline de eventos recientes, y distribución sectorial.
Lógica: Los datos se calculan agregando todos los deals activos — suma de exposiciones, media ponderada de tasas, etc.

INVESTOR PORTAL (/investor)
Para qué sirve: Página orientada al inversor/LP del fondo. Sirve para que los inversores vean cómo va su inversión.
Qué muestra: Valor total del portafolio, rendimientos trimestrales, IRR anualizado, chart de performance en el tiempo, donut de asset allocation, lista de inversiones activas con progreso, y calendario de próximos pagos.
Lógica: Agrega datos de deals activos para mostrar returns y distribuciones.

MAPA (/map)
Para qué sirve: Visualizar dónde están físicamente los proyectos financiados.
Qué muestra: Mapa interactivo de España con pins coloreados por stage del deal. Al hacer click en un pin se ve el nombre del proyecto, ubicación, facility y LTV, con link al detalle.
Lógica: Cada deal tiene coordenadas GPS. Los colores de los pins indican el estado (activo=negro, pipeline=azul, repaid=verde).

PIPELINE (/pipeline)
Para qué sirve: Gestionar el flujo de nuevos deals. Es la "bandeja de entrada" del equipo de originación.
Qué muestra: Grid de cards de deals filtrable por stage (Screening, Due Diligence, IC Approval, Documentation, Active, Repaid). Cada card muestra nombre, borrower, facility, métricas clave.
Lógica: Los deals pasan por stages secuenciales. Aquí también se pueden IMPORTAR nuevos deals via Excel y EXPORTAR el portafolio.
Funcionalidad Excel: Botón "Import Excel" abre un dialog donde descargas un template vacío, lo llenas con datos del deal, lo subes, ves una preview y confirmas. Los deals importados entran como "Screening".

SCREENING (/screening)
Para qué sirve: Evaluar rápidamente si una oportunidad cumple los criterios del fondo ANTES de invertir tiempo en due diligence.
Qué muestra: Formulario donde ingresas tipo de activo, loan amount, GDV, total cost, pre-sales. El sistema calcula LTV, LTC y evalúa cada criterio contra los umbrales del fondo.
Lógica: Criterios predefinidos — max LTV 65%, max LTC 75%, ticket €5-25M, min pre-sales 15%. Resultado: score en % con "PROCEED TO DD" / "REVIEW REQUIRED" / "DOES NOT MEET CRITERIA".

LOAN BOOK (/deals)
Para qué sirve: Vista tabular completa de todo el portafolio de préstamos.
Qué muestra: Tabla con todas las métricas de cada deal (facility, disbursed, PIK, exposure, rate, LTV, construction progress, maturity). Cards de resumen arriba con totales.
Lógica: Filtrable por stage, buscable por nombre/borrower, ordenable por columnas (facility, rate, LTV, maturity). También exportable a Excel.

DEAL DETAIL (/deals/:id)
Para qué sirve: Vista 360° de un deal específico. Todo lo que necesitas saber de un préstamo en una sola página.
Qué muestra: 7 paneles — Due Diligence (checklist items), Approvals (votación IC), Term Sheet & Waivers, Legal & Security, Waterfall (distribución cash flows), PIK Schedule (intereses mensuales), Construction Monitoring.
Lógica: Cada panel carga datos del deal específico. Los paneles son independientes y se pueden expandir/colapsar.

TERM SHEETS (/term-sheets)
Para qué sirve: Gestionar los term sheets emitidos y los covenant waivers.
Qué muestra: Para cada deal con term sheet: key terms (facility, rates, fees, tenor, LTV/LTC limits), security package (hipoteca, pledges, garantías), waivers activos de covenants, validación del Capital Partner, historial de versiones, y audit trail completo.
Lógica: Un term sheet pasa por stages: Draft → Internal Review → CP Validation → Issued → Signed. Los waivers se solicitan cuando un covenant se incumple y requieren aprobación interna + del Capital Partner.

LIFECYCLE (/lifecycle)
Para qué sirve: Seguir el workflow completo de 12 fases de cada deal, desde originación hasta close-out.
Qué muestra: Barra de progreso visual por deal, fase actual, agentes asignados, próximos milestones pendientes, y blockers.
Lógica: 12 fases secuenciales con milestones específicos. Cada fase tiene agentes responsables. Se trackean blockers y completamiento de milestones.

PIK ENGINE (/pik-engine)
Para qué sirve: Calcular y proyectar los intereses PIK (Payment-in-Kind) que se capitalizan mensualmente.
Qué muestra: Tabla con principal outstanding, PIK accrued, total exposure, monthly accrual, y proyección de PIK y exposición al vencimiento.
Lógica: El motor calcula mes a mes: PIK = outstanding × PIK spread / 12. Se acumula al principal. Proyecta hasta el tenor completo. Crítico para entender la exposición real del fondo.

CONSTRUCTION MONITORING (/construction)
Para qué sirve: Monitorear el avance de obra de los proyectos financiados. Fundamental para autorizar drawdowns.
Qué muestra: Para cada deal: site visits (informes de visita), certificaciones de avance, monitoring reports, y retenciones.
Lógica: El fondo solo desembolsa dinero cuando la construcción avanza según certificaciones. Esta página trackea ese progreso.

BORROWERS (/borrowers)
Para qué sirve: Registro centralizado de todos los prestatarios/promotores con los que trabaja el fondo.
Qué muestra: Tabla con nombre, grupo, rating interno (A/B/C), deals activos, commitments, exposure, IRR histórico, track record, estado KYC.
Lógica: Rating interno basado en track record y comportamiento. KYC (Know Your Customer) verifica identidad, documentos, compliance AML.

BORROWER DETAIL (/borrowers/:id)
Para qué sirve: Vista completa de un borrower específico con todo su historial.
Qué muestra: 4 tabs — Perfil (info empresa, contactos, estructura societaria), Exposure & Deals (deals vinculados), Track Record (proyectos completados con IRR y multiple), KYC & Compliance (checklist de documentos con fechas de vencimiento).
Lógica: Permite evaluar el riesgo de concentración (cuánta exposición tenemos con un solo borrower) y verificar que el KYC esté al día.

DUE DILIGENCE (/due-diligence)
Para qué sirve: Trackear el progreso de la due diligence en todos los deals. Es el checklist de todo lo que hay que verificar antes de prestar.
Qué muestra: Lista de items de DD por deal (valuation, legal, environmental, insurance, etc.) con status (completed, pending, flagged). Progress bar por deal.
Lógica: Cada deal tiene ~15-20 items de DD agrupados por categoría. Se puede exportar un reporte PDF con el estado de la DD.

APPROVALS (/approvals)
Para qué sirve: Gestionar el proceso de aprobación del Investment Committee (IC).
Qué muestra: Deals pendientes de aprobación y deals ya aprobados/rechazados. Para cada uno: votación del IC (approve/reject/abstain por miembro), condiciones, y status del Capital Partner.
Lógica: Un deal necesita aprobación del IC antes de poder emitir el term sheet. Se registra el voto de cada miembro del comité.`,
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

DATOS MOCK: Actualmente todo está en src/data/*.ts como archivos estáticos.
Para producción necesitáis conectar una base de datos (recomiendo Supabase/PostgreSQL).
React Query ya está instalado y listo para usar.`,
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
• Vite — Bundler y dev server (muy rápido)
• Tailwind CSS — Estilos utility-first
• shadcn/ui — 40+ componentes UI (Button, Dialog, Tabs, Select, etc.)
• Recharts — Charts (AreaChart, PieChart)
• Leaflet — Mapa interactivo
• Lucide React — Iconos
• jsPDF — Generación de reportes PDF
• xlsx (SheetJS) — Import/export Excel
• React Router — Navegación
• React Query — Data fetching (instalado, listo para conectar)
• Zod — Validación de schemas (instalado, listo para usar)

HOSTING:
• Vercel — Deploy automático desde GitHub (branch main)
• Vercel Analytics — Integrado

CÓMO EJECUTAR:
  npm install          → Instalar dependencias
  npm run dev          → Dev server en http://localhost:5173
  npm run build        → Build de producción
  npm run lint         → Verificar código con ESLint
  npm run test         → Ejecutar tests con Vitest`,
  },
  {
    title: "Qué Falta para Producción",
    icon: Shield,
    color: "bg-amber-50 text-amber-600",
    content: `PRIORIDAD ALTA — Sin esto no se puede usar en real:
1. BASE DE DATOS: Conectar Supabase (PostgreSQL). Crear tablas para deals, borrowers, users, documents.
2. AUTENTICACIÓN: Login con email/password o SSO. Roles: admin, analyst, investor (solo lectura).
3. CRUD REAL: Formularios para crear/editar/eliminar deals. Actualmente solo se puede importar via Excel.
4. PERSISTENCIA: Los datos importados via Excel se pierden al recargar la página. Necesitan guardarse en DB.

PRIORIDAD MEDIA — Mejora mucho la experiencia:
5. UPLOAD DE DOCUMENTOS: Subir PDFs de term sheets, valuations, contratos. Almacenar en Supabase Storage.
6. NOTIFICACIONES: Email/push cuando un covenant se incumple, un deal necesita aprobación, etc.
7. AUDIT TRAIL REAL: Registrar quién hizo qué y cuándo en base de datos.
8. ERROR HANDLING: Agregar Error Boundaries y manejo de errores de API.
9. TESTS: Unit tests para la lógica financiera (PIK, screening, covenants).

PRIORIDAD BAJA — Nice to have:
10. Dark mode
11. Internacionalización (español/inglés)
12. App móvil o PWA
13. Integración con APIs externas (registros de propiedad, credit bureaus)
14. Dashboard personalizable (widgets drag & drop)`,
  },
];

export default function ITInstructionsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-extrabold text-primary">Instrucciones para IT</h1>
          <p className="text-slate-500 text-sm mt-1">Documentación funcional y técnica del proyecto CapitalBridge</p>
        </header>

        <div className="grid gap-4">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
