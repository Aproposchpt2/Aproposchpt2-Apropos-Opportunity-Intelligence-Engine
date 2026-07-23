# APROPOS Command Center — Production Readiness Report

**Implementation branch:** `agent/command-center-build`  
**Application entry point:** `/index.html`  
**Status:** Implementation complete; production deployment and live acceptance pending.

## Delivered

- Root operational Command Center dashboard
- BEGIN DAILY OPERATIONS primary command
- Resume, governed stop, refresh, and executive-brief controls
- Live agent, pipeline, health, history, and failure displays
- Seven `public.command_*` operational tables with Row Level Security
- Server-controlled write access and authenticated operator read access
- Sequential five-agent orchestration
- Daily idempotency and duplicate-run prevention
- Recoverable retry policy with three attempts
- Failure evidence and safe-resume state
- Daily Executive Intelligence Brief persistence
- Netlify deployment configuration and security headers
- Automated Node architecture/security tests and GitHub Actions workflow

## Required Production Activation

1. Apply `supabase/migrations/20260723230000_command_center.sql` to the approved Supabase project.
2. Deploy all functions under `supabase/functions/` with JWT verification enabled.
3. Set the browser-safe Supabase publishable/anon key through `window.AP_COMMAND_CONFIG.anonKey` during deployment. Never place a service-role credential in browser assets.
4. Register approved publisher connector mappings before production acquisition execution.
5. Connect the repository to the approved Netlify site and deploy the repository root.
6. Execute controlled acceptance runs proving sequential progression, retry, interruption/resume, brief generation, live dashboard refresh, and retained evidence.

## Governance Boundary

The agent endpoints are production control-plane adapters. They intentionally do not fabricate publisher connectors, procurement totals, matching evidence, or delivery records. Approved connector and pipeline integrations must be registered explicitly and must preserve source provenance.

## Completion Standard

Do not mark production acceptance complete until the deployed root URL loads `index.html`, the database migration and functions are live, and every acceptance requirement has been demonstrated with stored operational evidence.
