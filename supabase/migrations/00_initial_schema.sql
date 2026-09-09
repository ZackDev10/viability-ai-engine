-- Entrepreneur SaaS — Initial Schema
-- Supabase PostgreSQL migration

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  auth_user_id  uuid not null unique references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  company_name  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_profiles_auth_user on public.profiles(auth_user_id);

-- 2. Startup Ideas
create table if not exists public.startup_ideas (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  tagline       text,
  description   text,
  industry      text,
  stage         text not null default 'idea' check (stage in ('idea','validation','mvp','growth')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_startup_ideas_profile on public.startup_ideas(profile_id);

-- 3. Market Metrics
create table if not exists public.market_metrics (
  id               uuid primary key default uuid_generate_v4(),
  startup_idea_id  uuid not null references public.startup_ideas(id) on delete cascade,
  tam              numeric(18,2),       -- total addressable market ($)
  sam              numeric(18,2),       -- serviceable available market ($)
  som              numeric(18,2),       -- serviceable obtainable market ($)
  market_growth_rate numeric(5,2),      -- CAGR %
  competitor_count   integer,
  market_sentiment   numeric(3,2),      -- 0.00 – 1.00
  data_source        text,
  analyzed_at        timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index idx_market_metrics_idea on public.market_metrics(startup_idea_id);

-- 4. Financials
create table if not exists public.financials (
  id               uuid primary key default uuid_generate_v4(),
  startup_idea_id  uuid not null references public.startup_ideas(id) on delete cascade,
  projection_year  integer not null,
  revenue          numeric(18,2) default 0,
  cost_of_goods    numeric(18,2) default 0,
  operating_expenses numeric(18,2) default 0,
  gross_profit      numeric(18,2) generated always as (revenue - cost_of_goods) stored,
  net_income        numeric(18,2) generated always as (revenue - cost_of_goods - operating_expenses) stored,
  burn_rate         numeric(18,2),
  runway_months     integer,
  created_at        timestamptz not null default now(),
  unique(startup_idea_id, projection_year)
);

create index idx_financials_idea on public.financials(startup_idea_id);

-- 5. BMC Canvases
create table if not exists public.bmc_canvases (
  id               uuid primary key default uuid_generate_v4(),
  startup_idea_id  uuid not null references public.startup_ideas(id) on delete cascade,
  version          integer not null default 1,
  is_active        boolean not null default true,
  summary_score    numeric(3,2),        -- 0.00 – 1.00 overall coherence score
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_bmc_idea on public.bmc_canvases(startup_idea_id);

-- 6. BMC Segments (the 9 building blocks)
create table if not exists public.bmc_segments (
  id               uuid primary key default uuid_generate_v4(),
  bmc_id           uuid not null references public.bmc_canvases(id) on delete cascade,
  segment          text not null check (segment in (
    'value_proposition','customer_segments','channels',
    'customer_relationships','revenue_streams','key_resources',
    'key_activities','key_partnerships','cost_structure'
  )),
  content          jsonb not null default '{}'::jsonb,
  evidence         text,
  confidence_score numeric(3,2),        -- 0.00 – 1.00
  updated_at       timestamptz not null default now(),
  unique(bmc_id, segment)
);

create index idx_bmc_segments_bmc on public.bmc_segments(bmc_id);

-- 7. Competitors
create table if not exists public.competitors (
  id               uuid primary key default uuid_generate_v4(),
  startup_idea_id  uuid not null references public.startup_ideas(id) on delete cascade,
  name             text not null,
  website          text,
  description      text,
  market_share     numeric(5,2),
  strengths        text[],
  weaknesses       text[],
  threat_level     text not null default 'medium' check (threat_level in ('low','medium','high')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_competitors_idea on public.competitors(startup_idea_id);

-- 8. Risk Tasks
create table if not exists public.risk_tasks (
  id               uuid primary key default uuid_generate_v4(),
  startup_idea_id  uuid not null references public.startup_ideas(id) on delete cascade,
  category         text not null check (category in ('market','technical','team','regulatory','financial')),
  title            text not null,
  description      text,
  likelihood       integer not null default 3 check (likelihood between 1 and 5),
  impact           integer not null default 3 check (impact between 1 and 5),
  risk_score       integer generated always as (likelihood * impact) stored,
  mitigation       text,
  due_date         date,
  status           text not null default 'open' check (status in ('open','in_progress','mitigated','accepted')),
  assigned_to      uuid references public.profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_risk_tasks_idea on public.risk_tasks(startup_idea_id);
create index idx_risk_tasks_status on public.risk_tasks(status);

-- 9. Validation Results
create table if not exists public.validation_results (
  id               uuid primary key default uuid_generate_v4(),
  startup_idea_id  uuid not null references public.startup_ideas(id) on delete cascade,
  hypothesis       text not null,
  test_method      text not null check (test_method in ('interview','survey','landing_page','prototype','smoke_test','data_analysis')),
  result_summary   text,
  validated        boolean,
  confidence_after numeric(3,2),        -- 0.00 – 1.00
  conducted_at     date,
  created_at       timestamptz not null default now()
);

create index idx_validation_idea on public.validation_results(startup_idea_id);

-- 10. Pivot Recommendations
create table if not exists public.pivot_recommendations (
  id               uuid primary key default uuid_generate_v4(),
  startup_idea_id  uuid not null references public.startup_ideas(id) on delete cascade,
  trigger          text not null,       -- what data triggered this recommendation
  suggested_direction text not null,
  rationale        text,
  evidence_links   text[],
  status           text not null default 'pending' check (status in ('pending','reviewed','accepted','rejected')),
  created_at       timestamptz not null default now(),
  reviewed_at      timestamptz
);

create index idx_pivot_idea on public.pivot_recommendations(startup_idea_id);

-- Auto-update updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','startup_ideas','bmc_canvases','bmc_segments',
    'competitors','risk_tasks'
  ]
  loop
    execute format(
      'create trigger trg_%s_updated_at before update on public.%s
       for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end;
$$;
