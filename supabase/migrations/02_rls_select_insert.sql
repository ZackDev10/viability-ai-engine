-- Re-enable RLS + SELECT/INSERT policies for the auth-owned tables.
-- Run these in the Supabase SQL editor or via migration.

-- 1. PROFILES
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = auth_user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = auth_user_id);

-- 2. STARTUP IDEAS (ownership chained through profiles.auth_user_id)
alter table public.startup_ideas enable row level security;

drop policy if exists "Users can read own startup ideas" on public.startup_ideas;
create policy "Users can read own startup ideas"
  on public.startup_ideas for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = startup_ideas.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own startup ideas" on public.startup_ideas;
create policy "Users can insert own startup ideas"
  on public.startup_ideas for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = startup_ideas.profile_id
        and profiles.auth_user_id = auth.uid()
    )
  );

-- 3. FINANCIALS (ownership chained through startup_ideas -> profiles.auth_user_id)
alter table public.financials enable row level security;

drop policy if exists "Users can read own financials" on public.financials;
create policy "Users can read own financials"
  on public.financials for select
  using (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = financials.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own financials" on public.financials;
create policy "Users can insert own financials"
  on public.financials for insert
  with check (
    exists (
      select 1 from public.startup_ideas
      join public.profiles on profiles.id = startup_ideas.profile_id
      where startup_ideas.id = financials.startup_idea_id
        and profiles.auth_user_id = auth.uid()
    )
  );
