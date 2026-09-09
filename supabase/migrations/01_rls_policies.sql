-- RLS Policies — Entrepreneur SaaS
-- Enables Row-Level Security on all tables and grants row-level access
-- by auth user id (profiles.auth_user_id).

-- 1. Profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = auth_user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = auth_user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = auth_user_id);

-- 2. Startup Ideas
alter table public.startup_ideas enable row level security;

create policy "Users own their startup ideas"
  on public.startup_ideas for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = startup_ideas.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );

-- 3. Market Metrics
alter table public.market_metrics enable row level security;

create policy "Users own their market metrics"
  on public.market_metrics for all
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = market_metrics.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );

-- 4. Financials
alter table public.financials enable row level security;

create policy "Users own their financials"
  on public.financials for all
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = financials.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );
-- A founder's P&L, burn rate, and unit economics are only visible to
-- their own auth account. No other user — and no anonymous request —
-- can read or write another founder's financial row. This is enforced
-- at the database level, not in application code.

-- 5. BMC Canvases
alter table public.bmc_canvases enable row level security;
alter table public.bmc_segments enable row level security;

create policy "Users own their BMC canvases"
  on public.bmc_canvases for all
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = bmc_canvases.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );

create policy "Users own their BMC segments"
  on public.bmc_segments for all
  using (
    exists (
      select 1 from public.bmc_canvases
      join public.startup_ideas on startup_ideas.id = bmc_canvases.startup_idea_id
      join public.profiles on profiles.id = startup_ideas.profile_id
      where bmc_canvases.id = bmc_segments.bmc_id
        and profiles.auth_user_id = auth.uid()
    )
  );

-- 6. Competitors
alter table public.competitors enable row level security;

create policy "Users own their competitors"
  on public.competitors for all
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = competitors.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );

-- 7. Risk Tasks
alter table public.risk_tasks enable row level security;

create policy "Users own their risk tasks"
  on public.risk_tasks for all
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = risk_tasks.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );

-- 8. Validation Results
alter table public.validation_results enable row level security;

create policy "Users own their validation results"
  on public.validation_results for all
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = validation_results.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );

-- 9. Pivot Recommendations
alter table public.pivot_recommendations enable row level security;

create policy "Users own their pivot recommendations"
  on public.pivot_recommendations for all
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = pivot_recommendations.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );
