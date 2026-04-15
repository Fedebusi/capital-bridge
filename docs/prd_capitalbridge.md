# PRD — CapitalBridge

**Draft v0.1 · Cluster Capital Markets · Plataforma digital**
Última actualización: abril 2026 · PM: [a completar]

---

## 01 · Contexto

Clikalia ha consolidado un modelo asset-heavy en el que la rotación del portfolio (compra → reforma → venta/alquiler) depende críticamente de la disponibilidad de financiación institucional. En los últimos 24 meses la compañía ha levantado más de 550M€ en deuda (Macquarie, rondas previas) y opera con múltiples vehículos de financiación, cada uno con sus propias reglas de elegibilidad, covenants, PIK y cascadas de pago.

Hoy esta operativa se gestiona principalmente en Excel y correo electrónico. Los equipos de Capital Markets, Finanzas y Portfolio reconstruyen manualmente la exposición por vehículo, el devengo de intereses, el estado de los covenants y la documentación de cada disposición. Cada consulta del Capital Partner (auditoría, sign-off, waiver) genera un ciclo de 2-5 días de consolidación manual.

**CapitalBridge** es la plataforma digital interna que centraliza el ciclo de vida completo de la deuda institucional del portfolio: originación, screening, aprobación, documentación, monitorización activa y repago. Este PRD define el producto en su versión actual (v1.0 funcional en entorno demo y live) y sirve como documento de referencia para stakeholders internos antes de su despliegue productivo en los distintos clusters.

---

## 02 · Problema

**! Fragmentación del portfolio de deuda**
La exposición real por vehículo, borrower y proyecto vive en hojas de cálculo dispersas. No existe un "single source of truth". Conciliar cifras cuesta horas por reporting y abre la puerta a errores materiales ante el Capital Partner.

**! Devengo PIK no trazado**
Los intereses PIK se capitalizan mensualmente sobre (principal + PIK devengado). Al no existir un motor que recalcule automáticamente, la exposición real a vencimiento se estima a ojo y diverge del modelo financiero oficial.

**! Visibilidad de covenants en diferido**
Las ratios LTV, LTC y nivel de pre-ventas se recalculan solo cuando el equipo las solicita. Los breaches se detectan tarde, lo que impide acción correctiva temprana y reduce el margen de negociación de waivers.

**~ Ciclo de aprobación opaco**
Las decisiones del Investment Committee y la validación posterior del Capital Partner (CastleLake) se comunican por email, sin audit trail estructurado. Las condiciones impuestas se pierden entre hilos de correo.

**~ Monitorización de obra desconectada**
Las visitas de obra, certificaciones (con retención del 5%) y reportes mensuales viven en carpetas compartidas. Su vínculo con las disposiciones y los covenants no está explicitado, lo que impide automatizar la liberación de fondos.

**~ Reporting al inversor reactivo**
Cada solicitud del inversor o Capital Partner genera un entregable ad-hoc. No hay portal de inversor, no hay scheduling de pagos visible y el valor del portfolio se entrega con retraso trimestral.

---

## 03 · Usuarios

**DO — Deal Originator / Analista de originación**
Busca y estructura nuevas oportunidades de financiación sobre el portfolio. Carga el deal, ejecuta el screening automático contra los 7 criterios del fondo (tipo de activo, LTV ≤65%, LTC ≤75%, ticket 5-25M€, track record ≥5 proyectos, pre-ventas ≥15%, ubicación Tier 1-2).
*Dolor:* hoy repite el screening manualmente en Excel por cada deal, y el resultado no es trazable.

**PM — Portfolio Manager**
Gestiona el portfolio activo: monitoriza covenants, aprueba disposiciones, escala breaches, tramita waivers. Es el rol con más interacciones diarias con el sistema.
*Dolor:* no tiene visibilidad en tiempo real de qué covenants están en watch/breach ni del PIK acumulado.

**IC — Miembro del Investment Committee**
Vota la aprobación de cada deal tras DD, con opciones approve / reject / approve with conditions. Cada voto queda registrado con autor, rol, fecha y condiciones.
*Dolor:* los informes de DD llegan en PDFs inconexos; las condiciones impuestas no se propagan automáticamente al term sheet.

**CM — Construction Monitor / Inspector técnico**
Realiza visitas de obra, sube fotos georreferenciadas, valida certificaciones mensuales, recomienda desembolsos en función del avance real.
*Dolor:* hoy documenta con móvil y email; la trazabilidad foto ↔ certificación ↔ disposición es manual.

**CP — Capital Partner (CastleLake) / Inversor institucional**
Valida term sheets antes de emisión, firma waivers cuando hay breaches y consulta la exposición de su pocket de forma recurrente. Requiere reporting estructurado y audit trail completo.
*Dolor:* recibe reportes en Excel con datos no reconciliados; cualquier query implica 2-5 días de consolidación.

---

## 04 · Métricas de éxito

| Métrica | Target | Descripción |
|---|---|---|
| **Tiempo de consolidación mensual** | < 2 días | Desde cierre de mes hasta entrega de reporting al Capital Partner |
| **Cobertura de covenants monitorizados** | 100% | % de deals activos con todos los covenants definidos y valor actual cargado |
| **Desfase en devengo PIK** | < 0,5% | Diferencia entre PIK calculado por la plataforma y el modelo financiero oficial |
| **Time-to-screening** | < 30 min | Desde alta del deal hasta resultado del screening automático |
| **Covenant breach detection** | T+1 día | Tiempo desde que un covenant entra en breach hasta que se refleja en el dashboard |
| **Audit trail de aprobaciones** | 100% | % de decisiones IC + CP registradas con voter, decisión, condiciones y fecha |
| **Adopción Portfolio Manager** | 100% | PM que gestiona sus deals exclusivamente desde CapitalBridge (sin Excel paralelo) |
| **NPS inversor** | > 40 | Satisfacción del Capital Partner con la visibilidad sobre su pocket |

---

## 05 · Research questions

**R1.** ¿Cuántos vehículos de financiación distintos operan hoy en Clikalia? ¿Cada uno requiere un modelo de cascada/covenants separado o se pueden unificar bajo una sola estructura de deal?

**R2.** ¿Cómo se integra CapitalBridge con Clikoffice (asset master) y Tempo (workflow operativo)? ¿Vincula cada deal con uno o varios assets del inventario Clikalia?

**R3.** ¿Qué nivel de automatización requiere el Capital Partner (CastleLake / Macquarie / otros) en la validación del term sheet? ¿Digital sign-off vía API, PDF firmado o reunión manual?

**R4.** ¿Los covenants de los vehículos actuales son todos del tipo LTV/LTC/pre-sales, o hay covenants específicos por vehículo (DSCR, interest coverage, NAV trigger) que la plataforma debe modelar?

**R5.** ¿Qué datos externos deben integrarse? Catastro, Registro de la Propiedad y tasaciones externas para recalcular LTV automáticamente; datos bancarios para cash sweep real.

**R6.** ¿Qué requisitos regulatorios y de auditoría (CNMV, Banco de España si aplica, auditor Big4) impone el esquema de fondo de deuda institucional sobre la trazabilidad y custodia de datos?

**R7.** ¿Construction Monitor es rol interno de Clikalia (Cluster Operaciones) o se externaliza a terceros? ¿La plataforma debe soportar permisos granulares para usuarios externos?

**R8.** ¿Qué política de localización aplica? Hoy el producto está construido en inglés con focus España/Portugal en EUR — ¿se extiende a los vehículos de México y Francia en la fase 2?

---

## 06 · Scope de la solución

### Dentro del scope (v1.0 actual)

- **Pipeline de deals** con 6 estados (screening → due_diligence → ic_approval → documentation → active → repaid) y vista kanban
- **Herramienta de screening** automática contra 7 criterios del fondo
- **Loan Book** con filtros por estado y métricas agregadas (facilities, exposure, avg LTV, avg rate)
- **Motor PIK** con cálculo mensual compuesto sobre (principal + PIK devengado) y proyección a vencimiento
- **Dashboard ejecutivo** con NAV, dry powder, weighted average life, sector allocation, timeline de eventos recientes
- **Registro de borrowers** con rating interno A-D, KYC, corporate entities y track record de proyectos
- **Due Diligence** checklist en 6 categorías (técnica, comercial, legal, financiera, ambiental, valoración)
- **Workflow de aprobaciones** con votación IC + sign-off del Capital Partner, audit trail completo
- **Term Sheets** con versionado, condiciones precedentes y paquete de garantías
- **Waivers** con flujo de doble aprobación (interno + CP)
- **Monitorización de obra**: visitas con fotos, certificaciones con retención del 5%, reportes mensuales vinculados a disposiciones
- **Cascada de ventas** con prepago obligatorio al release price (40% del list price por defecto) y cash sweep del 50% sobre exceso
- **Mapa geográfico** del portfolio sobre territorio España/Portugal
- **Portal de inversor** con portfolio value, allocation por tipo de deuda, payment schedule y tax reporting
- **Autenticación + RBAC** con 5 roles (admin, analyst, portfolio_manager, investor, viewer) y Row Level Security en base de datos
- **Audit logging** automático sobre todas las transacciones
- **Notificaciones en tiempo real** de breaches, cambios de estado y aprobaciones
- **Modo demo / live dual** para demos comerciales y entornos productivos
- **Export Excel** de Loan Book y Pipeline

### Fuera del scope (fase 2+)

- Integración nativa con Clikoffice, Tempo y el resto de sistemas internos (hoy CapitalBridge es stand-alone)
- Firma digital integrada (DocuSign / Signaturit) sobre term sheets y waivers
- Conexión en tiempo real con Catastro, Registro de la Propiedad y proveedores de tasación
- Modelo de riesgo de crédito paramétrico (scoring de borrowers con ML)
- Pasarela de pagos para disposiciones y repagos
- Soporte multi-moneda (hoy EUR only)
- Vehículos de México y Francia (hoy España + Portugal)
- Aplicación móvil nativa para Construction Monitor
- Generación de CFDI fiscal / reporting regulatorio específico por jurisdicción
- Integración con Bloomberg / Reuters para tasas de referencia

---

## 07 · Riesgos

**01 · Baja adopción por Portfolio Managers** — *Alto*
Los PM llevan años operando en Excel con sus propios modelos. Si la plataforma no refleja su lógica exacta (o introduce fricción), mantendrán Excel paralelo y el SSoT se degrada. Mitigación: co-diseño con el equipo PM antes del go-live definitivo, migración asistida de sus plantillas.

**02 · Desconexión con Clikoffice** — *Alto*
Si CapitalBridge no se integra con el asset master de Clikoffice, cada deal requerirá duplicar información del activo (dirección, valor, estado de reforma). Esto crea deuda operativa y riesgo de divergencia de datos. Mitigación: definir contract API con el equipo Clikoffice en Q2 antes de expansión a más vehículos.

**03 · Fidelidad del modelo PIK frente al modelo financiero oficial** — *Alto*
El motor PIK de la plataforma debe ser bit-a-bit equivalente al modelo Excel que usa Finanzas para reporting al Capital Partner. Cualquier divergencia, por pequeña que sea, genera discusiones con CastleLake y erosión de confianza. Mitigación: suite de tests con escenarios reales del portfolio actual, validados por el CFO antes del despliegue productivo.

**04 · Cumplimiento regulatorio y auditoría** — *Alto*
El vehículo de deuda institucional está sujeto a requisitos de auditoría (Big4) y potencialmente a supervisión regulatoria. La plataforma debe garantizar inmutabilidad del audit trail, separación de funciones (maker-checker) y retención de datos histórica. Mitigación: revisión legal + auditoría de seguridad antes del go-live productivo.

**05 · Propiedad del producto no clarificada** — *Medio*
CapitalBridge cruza Capital Markets, Finanzas, Portfolio y Tech. Sin un owner único del producto y un steering committee definido, las decisiones de roadmap quedan bloqueadas. Mitigación: asignar un Product Owner de Capital Markets con mandato transversal.

**06 · Dependencia del Capital Partner para validaciones críticas** — *Medio*
El flujo de term sheet y waiver requiere sign-off explícito de CastleLake. Si el CP no se integra en el flujo digital, la plataforma queda desconectada en el paso más crítico y se mantiene el proceso híbrido por email. Mitigación: conversación formal con CastleLake en Q2 para acordar formato de sign-off digital.

**07 · Escalabilidad a nuevos vehículos** — *Medio*
La plataforma hoy está modelada alrededor del vehículo actual. Añadir vehículos nuevos (Macquarie, mezzanine, bridge) puede requerir refactor del modelo de datos si los covenants o cascadas son estructuralmente distintos. Mitigación: auditoría de modelo tras 3 vehículos onboarded antes de seguir escalando.

**08 · Deuda de datos inicial** — *Asumido*
El portfolio existente hoy no está cargado en CapitalBridge. La migración requerirá un esfuerzo puntual de 4-8 semanas de carga y reconciliación con el modelo financiero. Riesgo conocido y aceptado: es el coste de construir la baseline digital.

---

## 08 · Arquitectura funcional (anexo)

> Sección no presente en el PRD-tipo de Clikalia. Se incluye porque este documento describe un producto digital en estado funcional, no un proceso manual a digitalizar, y el lector necesita entender el perímetro técnico.

**Stack tecnológico**
- Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
- Hosting: Vercel (frontend) + Supabase (backend gestionado)
- Modo dual: demo (datos mock) / live (Supabase real) controlado por variable de entorno

**Entidades principales** (19 tablas)
`deals`, `borrowers`, `drawdowns`, `covenants`, `unit_sales`, `screening_criteria`, `due_diligence_items`, `dd_documents`, `approval_records`, `ic_votes`, `term_sheets`, `term_sheet_versions`, `waivers`, `legal_documents`, `conditions_precedent`, `security_items`, `site_visits`, `site_visit_photos`, `construction_certifications`, `monitoring_reports`, `audit_logs`, `profiles`

**Perímetro de integración actual**
- Storage buckets Supabase: `documents` (DD, legal, term sheets) + `site-photos`
- Export Excel (Loan Book, Pipeline)
- Generación PDF client-side (DD reports, term sheets, tax reports)
- Notificaciones realtime (covenant breaches, stage changes, approvals)

**Perímetro de integración previsto (fase 2)**
- API Clikoffice (asset master) → campo `asset_id` en `deals`
- API Tempo (workflow) → sincronización de tareas de DD e inspección
- Webhook CastleLake / Capital Partner → sign-off digital term sheets + waivers
- Catastro + Registro de la Propiedad → enriquecimiento automático de ficha de activo

---

## 09 · Estado actual del producto

**Funcionalidad completa (en producción-demo)**
- 19 páginas UI operativas, 67+ componentes
- Esquema completo de base de datos con RLS y audit triggers desplegado
- Autenticación y RBAC funcionales, redirect por rol activo
- CRUD de deals y borrowers vía formularios dialog
- Dashboard, Borrowers y Deal Detail conectados a Supabase en modo live
- Portal de inversor separado con acceso por rol

**En desarrollo (Q2 2026)**
- Cableado a Supabase de: Approvals, Due Diligence, Term Sheets, Construction, Lifecycle
- Botones de edición y cambio de estado en detalle de deal y borrower

**Roadmap inmediato (Q3 2026)**
- Pipeline CI/CD (GitHub Actions)
- Optimización mobile de formularios
- Pulido de diseño (design polish pass)
- Integración con sistemas internos Clikalia (a definir en función de R2)

---

*Documento generado para consumo interno Clikalia. No contiene datos sensibles del portfolio real. Para dudas sobre el contenido, contactar con el PM del producto.*
