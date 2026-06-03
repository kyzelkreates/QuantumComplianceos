# Quantum Compliance OS™

**Defensive Quantum-Readiness & Security Implementation Assessment Platform**

---

## Current Build: v8.5.0 · Run 8.5 — Global Demo Mode / Product Mode Toggle

**Architecture:** Local-first PWA · React + Vite · No backend · No Supabase · No external APIs

---

## Completed Runs

| Run | Name | Status |
|-----|------|--------|
| 1 | Core Foundation + Storage SSOT + Dashboard + PWA Shell | ✅ Complete |
| 2 | Security Assessment Engine (47 questions, 12 domains) | ✅ Complete |
| 3 | Quantum Readiness Engine (HNDL, NIST FIPS 203/204/205) | ✅ Complete |
| 4 | Reports, Evidence Pack, JSON/CSV Export, Recommendations | ✅ Complete |
| 5 | Consultant Dashboard, Multi-Client, Onboarding, Landing Page | ✅ Complete |
| 5.5 | Validation, Hardening, SSOT Enforcement, Mobile Fixes | ✅ Complete |
| 6 | Demo Portfolio (5 SME clients), Consultant Metrics, Sales Polish | ✅ Complete |
| 7 | Deployment Packaging, PWA Hardening, SW Update Notifications | ✅ Complete |
| 8 | Consultant Copilot (8 section generators, local-template, no AI API) | ✅ Complete |
| **8.5** | **Global Demo Mode / Product Mode Toggle** | ✅ **Complete** |

---

## Run 8.5 — What Was Built

Run 8.5 adds a global workspace mode switch between **Demo Mode** and **Product Mode**.

### Demo Mode
- Shows fictional demo clients (5 SME examples)
- Sample scores, sample reports, sample evidence pack
- Sales walkthrough and consultant demo metrics
- All demo content clearly labelled as fictional

### Product Mode
- Hides demo clients from all active product views
- Real user-entered clients and assessments only
- Clean product workspace — no demo contamination
- Empty states prompt real client/data creation
- Demo data preserved in storage (not deleted) until explicitly cleared

### Settings → Workspace Mode
- Mode badge (Demo Mode / Product Mode) in TopBar and Settings
- Switch to Demo Mode / Switch to Product Mode (with confirmation)
- Load Demo Portfolio, Reset Demo Portfolio
- Clear Demo Data Permanently (requires confirmation)
- Create Clean Product Workspace
- Export Workspace Backup

### Architecture Changes (Run 8.5)
- `workspaceMode.js` — SSOT mode module (clientIsDemo, filterClientsByMode, MODE_META, etc.)
- `storage.js` — setWorkspaceMode, enableDemoMode, enableProductMode, getVisibleClients, clearDemoPortfolio, createCleanProductWorkspace, exportWorkspaceBackup
- `consultantStorage.js` — clientMeta stamping on all new clients + migrateClientMeta on load
- `Settings.jsx` — full Workspace Mode section with toggle, explanation cards, action buttons, confirmation modals
- `TopBar.jsx` — live mode badge
- `AppShell.jsx` — workspaceMode derived from storage.subscribe and threaded to all pages
- `Dashboard.jsx` — WorkspaceModeBanner
- `ConsultantDashboard.jsx` — filterClientsByMode, ClientsEmptyState, ConsultantModeBanner, demo badge on client rows, Demo Controls tab
- `Reports.jsx`, `EvidencePack.jsx`, `Recommendations.jsx`, `ConsultantCopilot.jsx` — mode banners and filtering
- `Onboarding.jsx` — demo launcher card on final step
- `LandingPage.jsx` — Load Demo Portfolio CTA wired to enableDemoMode

---

## Demo Portfolio (5 Fictional SME Clients)

| Client | Sector | Risk | Sec | Quantum | Overall |
|--------|--------|------|-----|---------|---------|
| Meridian Legal Partners LLP | Legal | HIGH | 28 | 15 | 22 |
| Vantage SaaS Technologies Ltd | Technology | MEDIUM | 62 | 48 | 57 |
| Apex Managed Services Ltd | Technology | LOW | 88 | 74 | 83 |
| Helix Health Analytics CIC | Healthcare | HIGH | 52 | 18 | 38 |
| Clearline Business Services Ltd | Professional Services | MEDIUM | 67 | 42 | 58 |

All demo clients are fictional. All scores are illustrative only.

---

## Safety Declarations

- **RLS: NOT enabled** — no Supabase, no backend
- **Backend: NOT included**
- **Supabase: NOT included**
- **Real Payments: NOT included**
- **External AI APIs: NOT included**
- **Offensive Scanning: NOT included**
- **Defensive use only** — compliance preparation, post-quantum migration planning, security readiness

This platform does not guarantee compliance, quantum-proof protection, certified security, breach prevention, or legally binding audit results.

---

## Future Runs (Not Yet Built)

- **Run 9** — Final Sales Pack + Launch QA
- Future optional: AI API connector (opt-in)
- Future optional: Supabase migration (opt-in)
- Future optional: Authorised TLS/certificate checker
- Future optional: Team accounts
- Future optional: Real payments

---

## Tech Stack

- React 18 + Vite
- Local-first (localStorage via storage.js SSOT)
- PWA (service worker, manifest)
- No backend, no database, no server
- Deployable to Vercel/Netlify/GitHub Pages

---

*Quantum Compliance OS™ — Defensive Quantum-Readiness & Security Implementation Assessment Platform*
*Run 8.5 Complete. Ready for Run 9.*
