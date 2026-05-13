# Supabase Table Setup Guide

Why this guide exists, in one sentence: starting **2026-10-30**, any new table we create in our Supabase `public` schema without explicit `GRANT` statements will not be accessible via the Data API (supabase-js, REST, GraphQL). This guide ensures we don't trip on that.

## Background

In May 2026 Supabase notified us that default access for new tables in the Data API is changing. The relevant dates:

| Date | What changes |
|---|---|
| 2026-05-30 | Default for **new** Supabase projects: tables in `public` are NOT exposed to the Data API by default; explicit `GRANT` required |
| 2026-10-30 | Same default **enforced on existing projects too** — including Klinchapp's |

**Existing tables created before the rollout keep their grants.** No migration needed for what's already live. The risk is forgetting to add grants when creating new tables.

## Tables currently in use (as of 2026-05-13)

The app uses the Data API to query these `public` tables:

- `profiles` — user data (plan, posts_this_month, posts_limit)
- `posts` — generated content
- `usage_logs` — usage tracking
- `blog_subscribers` — Kira blog subscribers

These were created via the Supabase dashboard before the policy change and keep their existing grants.

## When you add a new table

1. Open `scripts/supabase-table-template.sql`.
2. Copy the whole block into the Supabase SQL editor.
3. Replace `your_table` with the real table name (all occurrences).
4. Replace placeholder columns with your real schema.
5. Adjust the four RLS policies to match the table's access pattern (the defaults assume "user owns their own rows").
6. Run.

The template includes the GRANT statements for `anon`, `authenticated`, and `service_role` — covering all the typical access scenarios.

## Verify current state of existing tables (one-off sanity check)

Run this in the Supabase SQL editor to confirm our 4 existing tables have the grants we expect:

```sql
select
  table_name,
  grantee,
  string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles', 'posts', 'usage_logs', 'blog_subscribers')
  and grantee in ('anon', 'authenticated', 'service_role')
group by table_name, grantee
order by table_name, grantee;
```

Expected output: each table should show grants for `anon`, `authenticated`, and `service_role`. Specific privileges (SELECT, INSERT, UPDATE, DELETE) vary by access pattern but at minimum `SELECT` should be present for the roles your app uses.

If a row is missing for a table+role combination your app needs, that's where to add grants.

## When something breaks

If you see this error from a Supabase query:

```
PostgrestException: permission denied for table X (42501)
```

It means the role making the request doesn't have the right grant. The error message will include the exact `GRANT` statement to fix it. Paste it into the Supabase SQL editor and run.

## Related references

- Email from Supabase received 2026-05-13 (subject re: Data API schema access changes)
- Project docs that mention Supabase tables: `New Functionality/Blog-Project_Status.md` (lists `blog_subscribers`)
