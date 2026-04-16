# CapitalBridge — Piano operativo e setup team di agenti

**Repo:** `github.com/Fedebusi/capital-bridge`
**Stack:** React, Supabase, Vercel
**Stato:** 19 pagine online, hooks Supabase pronti, audit di sicurezza fatto (6 issue)
**Obiettivo:** chiudere il P0 in 2 settimane usando un team di sub-agents su Claude Code, con Federico come reviewer e non più come esecutore

---

## 1. Contesto e scopo della piattaforma

CapitalBridge **non gestisce denaro né transazioni finanziarie**. È una piattaforma collaborativa di workflow e reporting per un fondo di debito (Clikalia + Castlelake) che finanzia sviluppi residenziali in Spagna.

Gli utenti della piattaforma sono quattro ruoli:

1. **Originator** — carica deal nuovi, compila term sheet, traccia pipeline
2. **Finance team** — vede numeri, covenant, reporting, stato dei prestiti
3. **Architecture / Monitoring team** — carica foto cantiere, milestone, note del monitoring surveyor
4. **Admin (fund manager)** — vede tutto, approva, esporta reporting per Castlelake

Il valore della piattaforma è sostituire email + Excel + SharePoint con un posto solo dove ognuno vede quello che deve vedere e fa quello che deve fare.

Implicazioni importanti per il setup degli agenti:

- Nessuna transazione finanziaria → livello di paranoia sulla sicurezza più basso rispetto a un sistema bancario
- Dati personali e documenti sensibili → GDPR e file upload rimangono critici
- Uso istituzionale (Castlelake accede al reporting) → uptime e correttezza dei dati sono non negoziabili

---

## 2. Stato del lavoro

### Già fatto e funzionante

- 19 pagine UI connesse a Supabase con fallback demo data
- Hooks Supabase scritti (anche per le sotto-entità non ancora collegate)
- Portal investitori e portal admin separati
- 22 test che passano
- Deploy online funzionante
- Audit di sicurezza completato

### P0 — Senza questo non si può usare davvero (2 settimane)

1. Edit/Delete su deal e borrower (hooks pronti, manca UI)
2. Cambio stage deal (es. screening → due diligence)
3. Sub-dati collegati a Supabase: DD items, approvals, IC votes, term sheets, waivers, construction, lifecycle (hooks già scritti, le pagine usano ancora demo data per queste sotto-entità)
4. Searchbar funzionante
5. File upload UI (documenti, foto cantiere)

### P1 — Importante (1 settimana dopo il P0)

1. User management (invita utenti, cambia ruolo)
2. Email transazionali (notifiche su eventi critici)
3. Empty states con CTA (pagine vuote che guidano l'utente)
4. Mobile testing completo

### P2 — Nice to have (2-4 settimane)

1. Chatbot AI per query dati
2. Business Central integration
3. Dark mode
4. Dominio custom
5. Backup automatico Supabase

---

## 3. Principio operativo

**Federico non deve più leggere ogni riga di codice.** Deve:

- Definire il perimetro (questo documento)
- Approvare i PR dopo che CI e `reviewer` agent hanno dato OK
- Intervenire personalmente solo su: schema Supabase, auth/RLS, file upload (GDPR), configurazione email transazionale, dipendenze nuove

Tutto il resto è delegato agli agenti.

---

## 4. Infrastruttura di controllo (prerequisito — Settimana 1, giorni 1-2)

Prima di attivare gli agenti, servono i gate automatici. Senza questi, gli agenti sono pericolosi anche se bravi.

### 4.1 CI/CD su GitHub Actions

Creare `.github/workflows/ci.yml` con questi step obbligatori su ogni PR:

- `npm ci` (install deterministico)
- `npm run lint` (ESLint)
- `npm run typecheck` (TypeScript)
- `npm test` (Vitest / Jest, tutti i 22 test esistenti devono passare)
- `npm run build` (build Vite/Next deve completare)
- `npm audit --audit-level=high` (fail se vulnerabilità high o critical)

Se uno qualsiasi di questi step fallisce, il PR non può essere mergeato.

**Status: DONE** — `.github/workflows/ci.yml` già esiste e gira su push/PR a main.

### 4.2 Branch protection su `main`

Su GitHub → Settings → Branches → Add rule per `main`:

- Require pull request before merging
- Require status checks to pass before merging (tutti quelli sopra)
- Require conversation resolution before merging
- Do not allow bypassing the above settings (vale anche per admin)

Nessun push diretto su `main`, mai. Né umano né agente.

**Status: TODO** — va configurato manualmente su GitHub.

### 4.3 Sblocco deploy Vercel

Il deploy Vercel è bloccato da un loop di installazione GitHub app legato a un account legacy 2022. Due strade:

- **(Preferita)** Rimuovere completamente l'installazione vecchia dell'app Vercel da GitHub → Settings → Applications → Configure Vercel → Uninstall, poi reinstallare pulita dal dashboard Vercel sul repo corrente.
- **(Alternativa)** Creare nuovo progetto Vercel via CLI: `npx vercel link` dal repo, senza passare dalla GitHub app.

Target: deploy automatico a ogni merge su `main`, preview deploy a ogni PR.

### 4.4 Struttura branch

- `main` — produzione, protetto
- `feat/*` — nuove funzionalità
- `fix/*` — bug fix
- `polish/*` — UX/UI fixes
- `chore/*` — configurazione, CI, dipendenze
- `docs/*` — documentazione

Ogni branch → PR → CI verde → review → merge squash.

---

## 5. Team di agenti — configurazione Claude Code

Creare la cartella `.claude/agents/` nel repo e definire cinque sub-agent, ognuno con ruolo, permessi sui tool, e branch su cui può lavorare.

### 5.1 `feature-builder`

**Ruolo:** implementa feature P0/P1 end-to-end (schema Supabase, hook, API, componente React, test).
**Branch:** `feat/*`
**Tool permessi:** read file, write file, run bash (test, lint, typecheck), git commit, git push
**Tool vietati:** git push su `main`, modifiche a `.github/workflows/*`, modifiche a file in `/auth` e `/rls` senza flag esplicito
**Convenzione:** ogni feature deve includere almeno un test per il caso positivo e uno per il caso di errore.

### 5.2 `bug-fixer`

**Ruolo:** riceve issue o bug report, riproduce il problema con un test che fallisce, implementa il fix, fa passare il test.
**Branch:** `fix/*`
**Tool permessi:** identici a `feature-builder`
**Regola:** mai fix senza test di regressione. Se non riesci a scrivere un test che riproduce il bug, fermati e chiedi a Federico.

### 5.3 `ux-polisher`

**Ruolo:** gira le pagine, identifica inconsistenze visive, empty state mancanti, loading spinner assenti, messaggi di errore generici, bottoni disallineati, responsive rotti. Produce issue o PR piccoli e focalizzati.
**Branch:** `polish/*`
**Tool permessi:** read file, write file (solo file `.tsx`, `.css`, `.module.css`), run bash (test, lint), git commit, git push
**Tool vietati:** modifiche a logica di business, a schema Supabase, a file `/api` o `/server`.

### 5.4 `reviewer`

**Ruolo:** legge i PR aperti dagli altri agenti e produce un commento strutturato.
**Branch:** nessuno (non committa)
**Tool permessi:** read file, git diff, commento su PR via `gh pr comment`
**Output richiesto per ogni PR:**

```
STATUS: [APPROVE | REQUEST_CHANGES | NEEDS_HUMAN_REVIEW]
SUMMARY: una frase su cosa fa il PR
CHECKS:
- Test presenti e passano: [sì/no]
- Nessuna modifica a auth/RLS/schema: [sì/no + dettaglio]
- Nessun nuovo pacchetto npm: [sì/no + lista se presenti]
- Nessun console.log o debugger lasciato: [sì/no]
- UX coerente con resto piattaforma: [sì/no + note]
FLAGS: lista cose che richiedono attenzione umana, se ce ne sono
```

**Regola:** se il PR tocca `/auth`, `/rls`, schema Supabase, file upload, email config, o aggiunge dipendenze nuove → STATUS sempre `NEEDS_HUMAN_REVIEW`.

### 5.5 `doc-writer`

**Ruolo:** mantiene aggiornati README, `AGENTS.md`, e produce guide utente per i 4 ruoli (originator, finance, architecture, admin).
**Branch:** `docs/*`
**Tool permessi:** read file, write file (solo `.md`), git commit, git push
**Tool vietati:** modifiche a codice sorgente.

---

## 6. AGENTS.md — il briefing permanente del repo

Creare `AGENTS.md` alla root del repo con questi contenuti (Claude Code lo legge automaticamente a ogni sessione):

- Descrizione del prodotto e dei 4 ruoli utente
- Stack tecnico (React, Supabase, Vercel, test framework)
- Convenzioni di codice (naming, struttura cartelle, stile componenti)
- Cosa NON toccare mai senza approvazione umana esplicita: `/auth`, `/rls`, schema Supabase in `/migrations`, `/api/upload`, configurazione email, `.github/workflows/*`
- Convenzioni di commit (conventional commits: `feat:`, `fix:`, `polish:`, `chore:`, `docs:`)
- Come scrivere test (framework, pattern, dove mettere i file)
- Lista dei 5 sub-agent con ruolo di ciascuno
- Link a questo piano (`plan.md`)

---

## 7. Piano di esecuzione — 2 settimane

### Settimana 1

**Giorno 1-2 — Federico, lavoro manuale**

- Setup CI/CD GitHub Actions
- Branch protection su `main`
- Sblocco Vercel
- Creazione `AGENTS.md` e `.claude/agents/*.md`
- Commit iniziale con tutta l'infrastruttura

**Giorno 3 — Primo test del sistema**

- Task al `feature-builder`: **P0 punto 1 — Edit/Delete su deal e borrower**
  - È il più semplice, hooks già pronti, serve solo UI
  - Deve aprire PR su `feat/deal-borrower-crud`
- `reviewer` legge il PR e produce commento
- Federico verifica: test passano? reviewer ha approvato? UI funziona? → merge

Se questo flusso funziona, il sistema è pronto. Se no, si debugga qui prima di andare avanti.

**Giorno 4-7 — Produzione P0, parte 1**

Attivare lavoro in parallelo con git worktrees:

- Worktree 1 — `feature-builder` su **P0 punto 2** (cambio stage deal)
- Worktree 2 — `feature-builder` su **P0 punto 3** (sub-dati Supabase — questo è grande, va spezzato in ~7 PR: DD items, approvals, IC votes, term sheets, waivers, construction, lifecycle)
- Worktree 3 — `ux-polisher` gira tutte le 19 pagine e apre issue o PR piccoli

Federico review 2-3 PR al giorno, ~15 min a PR.

### Settimana 2

**Giorno 8-10 — Produzione P0, parte 2**

- Worktree 1 — `feature-builder` su **P0 punto 4** (searchbar)
- Worktree 2 — **P0 punto 5 (file upload)** — qui Federico lavora insieme al `feature-builder`: l'agente scrive la UI e la validazione base, Federico verifica personalmente MIME types, size limits, virus scan (se necessario), storage Supabase buckets, RLS policies sui file. Questo pezzo non si delega in autonomia.
- Worktree 3 — `ux-polisher` continua
- Worktree 4 — `doc-writer` produce prima bozza guida utente per i 4 ruoli

**Giorno 11-12 — QA e stabilizzazione**

- Federico + 1 persona (Javier?) testano end-to-end ogni ruolo
- `bug-fixer` chiude i bug emersi dal test
- Mobile testing (P1 punto 9) anticipato qui perché aiuta la QA

**Giorno 13-14 — Release e chiusura P0**

- Tag `v1.0.0-p0-complete`
- Deploy produzione Vercel
- Comunicazione a Clikalia / Castlelake che la piattaforma è pronta per uso interno

Alla fine delle 2 settimane: P0 chiuso, piattaforma usabile davvero, sistema di agenti rodato e pronto per attaccare P1.

---

## 8. Cosa Federico guarda personalmente, sempre

Questa è la lista non negoziabile delle cose che richiedono occhio umano, indipendentemente da cosa dice l'agente `reviewer`:

1. Schema Supabase e migrations
2. Policy RLS (Row Level Security)
3. Codice in `/auth` (login, logout, session, JWT)
4. File upload (validazione, storage, accessi)
5. Configurazione email transazionale (SPF/DKIM/DMARC, provider)
6. Qualsiasi nuova dipendenza npm
7. Modifiche a `.github/workflows/*`
8. Qualsiasi PR marcato `NEEDS_HUMAN_REVIEW` dal `reviewer`

Tutto il resto → delega.

---

## 9. Metriche di successo a fine settimana 2

- [ ] P0 punti 1-5 tutti chiusi e in produzione
- [ ] CI/CD con zero bypass nel periodo
- [ ] Federico ha speso meno di 1 ora/giorno in code review
- [ ] Almeno una persona oltre Federico ha usato la piattaforma end-to-end per un ruolo
- [ ] Zero incident di sicurezza su auth, RLS, file upload
- [ ] Guida utente v1 pubblicata per tutti e 4 i ruoli

---

## 10. Primo task da passare a Claude Code

Dopo aver committato questo documento, CI/CD, `AGENTS.md` e `.claude/agents/*.md`, il primissimo prompt da dare a Claude Code è:

> Leggi `AGENTS.md` e `plan.md`. Poi, usando il sub-agent `feature-builder`, implementa **P0 punto 1 — Edit/Delete su deal e borrower**. Gli hooks Supabase esistono già; manca la UI. Apri PR su `feat/deal-borrower-crud` con test inclusi. Quando il PR è aperto, attiva il sub-agent `reviewer` per leggerlo e produrre il commento strutturato.

Da qui in avanti, Federico diventa il reviewer e gli agenti fanno il lavoro.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client (demo/live switch) |
| `src/contexts/AuthContext.tsx` | Auth state, login, signup, roles |
| `src/hooks/useDeals.tsx` | Deals context (demo/live) |
| `src/hooks/useSupabaseQuery.ts` | 36 React Query hooks for Supabase |
| `src/types/database.ts` | TypeScript types for all DB tables |
| `src/components/auth/ProtectedRoute.tsx` | Route-level auth guard |
| `src/components/layout/AppLayout.tsx` | Platform sidebar + header |
| `src/components/layout/InvestorLayout.tsx` | Investor portal layout |
| `supabase/migrations/` | 5 DB migrations (schema, seed, auth, audit, admin) |
| `vite.config.ts` | Build config + env var bridging |
| `.github/workflows/ci.yml` | CI pipeline |
| `vercel.json` | Security headers + SPA rewrite |
