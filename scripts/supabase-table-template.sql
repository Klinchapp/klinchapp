-- ─────────────────────────────────────────────────────────────────────────────
-- Klinchapp — Supabase table creation template
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Use this template every time you create a new table in the `public` schema.
-- Without the GRANT statements below, the Data API (supabase-js, REST /rest/v1/,
-- GraphQL /graphql/v1/) will not be able to access the table — you'll get a
-- 42501 error from PostgREST.
--
-- Supabase policy rollout context:
--   - 2026-05-30: Default for NEW Supabase projects (we're not affected; we're
--     an existing project).
--   - 2026-10-30: Enforced on all existing projects too. From this date, any
--     NEW table created in our Supabase project without explicit GRANTs will
--     not be accessible via the Data API.
--   - Existing tables created before this rollout keep their current grants —
--     no migration needed for what's already live.
--
-- How to use this template:
--   1. Copy this whole block into the Supabase SQL editor.
--   2. Replace `your_table` with the real table name (all occurrences).
--   3. Replace the placeholder columns with your real schema.
--   4. Adjust the RLS policies to match your access rules (the four policies
--      below are the standard "user owns their own rows" pattern — change if
--      different).
--   5. Run.
--
-- After running, sanity-check via the verification query in
-- `scripts/SUPABASE_NEW_TABLE_GUIDE.md`.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the table
create table public.your_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  -- your columns here
  created_at timestamptz not null default now()
);

-- 2. Grant Data API access per role
--    (anon = unauthenticated public; authenticated = signed-in user;
--     service_role = backend / server-side admin)
grant select
  on public.your_table
  to anon;

grant select, insert, update, delete
  on public.your_table
  to authenticated;

grant select, insert, update, delete
  on public.your_table
  to service_role;

-- 3. Enable Row Level Security
alter table public.your_table
  enable row level security;

-- 4. Add policies (adjust the rules to match the table's access pattern)
create policy "users can read their own rows"
  on public.your_table
  for select to authenticated
  using (auth.uid() = user_id);

create policy "users can insert their own rows"
  on public.your_table
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users can update their own rows"
  on public.your_table
  for update to authenticated
  using (auth.uid() = user_id);

create policy "users can delete their own rows"
  on public.your_table
  for delete to authenticated
  using (auth.uid() = user_id);
