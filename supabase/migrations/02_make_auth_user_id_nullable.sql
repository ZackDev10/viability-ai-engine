-- 1. Turn off the RLS Bouncer completely for these tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_ideas DISABLE ROW LEVEL SECURITY;

-- 2. Explicitly grant the 'anon' web role permission to write data
GRANT INSERT, SELECT, UPDATE ON public.profiles TO anon;
GRANT INSERT, SELECT, UPDATE ON public.startup_ideas TO anon;

-- Unlock the financials table for MVP testing
ALTER TABLE public.financials DISABLE ROW LEVEL SECURITY;
GRANT INSERT, SELECT, UPDATE ON public.financials TO anon;
