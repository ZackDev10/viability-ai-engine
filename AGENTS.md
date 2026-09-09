# AGENTS.md — Entrepreneur SaaS

## Project Overview

Monorepo for a startup validation platform. Users submit a startup idea, a Python engine scores its viability via SSE-streamed analysis, results persist to Supabase, and a BMC dashboard shows live financials/burn rate.

## Directory Structure

```
/apps/web/            — Next.js 14 App Router (TypeScript, Tailwind, Framer Motion)
  app/
    page.tsx          — Public marketing landing page (Hero + Tools grid)
    layout.tsx        — Root layout, global metadata
    globals.css       — Tailwind directives only
    validate/
      page.tsx        — Auth-protected AI validation tool (moved from /)
    components/
      ValidationForm.tsx  — Idea submission form + SSE streaming + Supabase persist
      BmcDashboard.tsx    — Real-time financials dashboard (cost inputs → burn rate)
      RiskMatrix.tsx      — AI risk analysis with rule-based severity + LLM advice
      MarketDashboard.tsx  — Premium market analysis: SWOT grid, BarChart, ScatterChart
      Navigation.tsx      — Conditional nav: public CTA on landing, app links when authed
  lib/
    supabase.ts       — Supabase client, null if env vars missing
  package.json        — next dev / next build / next start / next lint
/services/viability-engine/
  main.py             — FastAPI app, /validate SSE + /analyze-risk with Gemini/OpenAI
/supabase/migrations/
  00_initial_schema.sql  — 10 tables, triggers, generated columns
  01_rls_policies.sql    — Row-level security on all tables
```

## Essential Commands

```bash
# Web (from apps/web/)
npm run dev     # next dev — local dev server (default http://localhost:3000)
npm run build   # next build — production build
npm run start   # next start — production server
npm run lint    # next lint — ESLint via Next.js

# Viability Engine (from services/viability-engine/)
# No requirements.txt or venv set up yet — run manually:
pip install fastapi uvicorn pydantic google-generativeai
uvicorn main:app --reload  (default http://localhost:8000)
# Requires GEMINI_API_KEY env var for AI-powered market analysis
```

## Architecture & Control Flow

1. **User submits** industry / target audience / core offering in `ValidationForm`
2. **Frontend POSTs** to `http://localhost:8000/validate` (FastAPI)
3. **FastAPI streams** SSE — 8 pipeline steps (progress events) → final result with `viability_score` (60-99) + 3 `market_insights`
4. **Frontend reads SSE** via `ReadableStream.getReader()`, parses `data:` lines
5. **On result**, attempts to persist to Supabase: creates a `profile` (or reuses existing) → creates a `startup_idea` → stores the score/insights in `description` (JSON stringified)
6. **After persist**, shows `<BmcDashboard>` which loads/saves `financials` rows by `startup_idea_id`
7. **BmcDashboard** also renders `<RiskMatrix>` (rule-based + LLM risk advice) and `<MarketDashboard>` (SWOT grid, TAM BarChart, Competitor ScatterChart)
8. **MarketDashboard** fetches `/analyze-risk` which uses Gemini AI (or fallback synthetic data) to return structured `market_analysis` with swot, market_growth, competitors, and strategy
9. **RiskMatrix** fetches the same endpoint for the `advice`/`severity`/`strategic_advice` fields

## Key Conventions & Patterns

### Code Style
- All interactive components are `"use client"` (Next.js App Router)
- `@/` path alias maps to `apps/web/` root (e.g., `@/lib/supabase`)
- TypeScript strict mode enabled
- Dark theme: `bg-[#0a0e1a]` base, cyan-400 accent, `#0f1424` card backgrounds
- Framer Motion used for all page/component transitions (`AnimatePresence`, `motion.div`)
- Tailwind `animate-border-pulse` custom animation on form card during loading

### Database
- All tables use `uuid` PKs with `uuid_generate_v4()`
- `updated_at` auto-updated via `set_updated_at()` trigger on 6 core tables
- Generated columns: `financials.gross_profit`, `financials.net_income`, `risk_tasks.risk_score` (likelihood * impact)
- RLS on every table — ownership chains through `profiles.auth_user_id` → `startup_ideas.profile_id` → child tables
- No application-level auth checks; all auth is database-level RLS

### Supabase Client
- Client is `null` if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set
- All Supabase calls gated with `if (!supabase) return;` — safe to run without env vars
- On first use, creates a "Demo Founder" profile if none exists

### Persistence Pattern
- `ValidationForm` persists inline inside the SSE reader loop after receiving the result
- `BmcDashboard` auto-saves `financials` on every input change via `useCallback` + `useEffect` (no debounce)
- `savedFinancialId` tracks insert vs update for the upsert pattern

## Testing

No test files or test framework found in the codebase. `next lint` is the only quality check available.

## Gotchas & Non-Obvious

- **Landing page** (`/`) is a server component (no `"use client"`) — lightweight Hero section with floating glass dashboard preview + 3-card Tools grid. Public landing navbar shows Log In and Start for Free buttons linking to `/login`.
- **`/validate`** is the auth-protected route housing ValidationForm — redirects to `/login` if unauthenticated.
- **Navigation.tsx** conditionally renders: public landing nav on `/`, app nav (Command Center, New Idea → `/validate`, Analytics) when authed, or nothing on `/login`.
- **CORS is wide open** (`allow_origins=["*"]`) in the FastAPI engine — only safe for local dev.
- **The viability engine uses `random` for all scoring** — scores and insights are non-deterministic stubs.
- **Financials auto-save on every keystroke** (no debounce) — could produce rapid-fire DB writes.
- **`description` field on `startup_ideas`** stores JSON.stringify'd object with score/insights, not user-facing text.
- **No `.env.example`** — `.env.local` exists but is not tracked. New devs need to know to set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.
- **No requirements.txt or pyproject.toml** for the Python service — dependencies (fastapi, uvicorn, pydantic, google-generativeai) must be installed manually.
- **Gemini AI** used for `/analyze-risk` structured JSON (`swot`, `market_growth`, `competitors`, `strategy`). Falls back to synthetic data if `GEMINI_API_KEY` not set.
- **recharts** and **lucide-react** installed in `apps/web` for MarketDashboard charts and icons.
- **MarketDashboard** uses glassmorphism (`backdrop-blur-md`, `bg-[#0f1424]/80`) with neon borders and pulsing loading skeleton.
- **Analytics page** (`/analytics`) fetches all `startup_ideas` + `financials` via Supabase, computes `totalIdeasValidated`, `avgScore`, `avgBurn`, and renders 3-column KPI grid + Validation History table (Date, Industry, Core Offering, Viability Score, Burn Rate) with row stagger animation and hover effects.
