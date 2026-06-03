# Supabase Migrations Log

Running log of schema / RLS / grant changes made to the live Klinchapp Supabase project. We don't use a formal migration tool — changes are applied via the Supabase SQL editor — so this file is the only durable record. Append to the top (newest first) when you make a change.

For new-table setup, see `scripts/SUPABASE_NEW_TABLE_GUIDE.md`.

---

## 2026-06-03 — Dashboard bug-fix session

Triggered by a schema-drift audit after the dashboard counter was found resetting to 60 after every navigation. Root cause: `posts.language` and `usage_logs.language` columns were referenced by the insert but didn't exist in the DB → silent failures (PGRST204), API returned success anyway, posts never persisted.

### posts

- **Added `language` column.** Code was inserting `language: language || 'english'` since the multi-language feature went in; column was never added.
  ```sql
  alter table public.posts
    add column if not exists language text not null default 'english';
  ```

- **Recreated `posts_mood_check`.** Old constraint allowed `professional, casual, enthusiastic, humorous, inspirational` only. UI added `luxe, witty, founder, bold` at some point, making any post in those moods fail.
  ```sql
  alter table public.posts drop constraint if exists posts_mood_check;
  alter table public.posts add constraint posts_mood_check
    check (mood in (
      'professional', 'casual', 'enthusiastic', 'humorous', 'inspirational',
      'luxe', 'witty', 'founder', 'bold'
    ));
  ```

### usage_logs

- **Added `language` column.** Same drift as `posts.language` — every `generate` log entry was silently failing since the multi-language feature shipped.
  ```sql
  alter table public.usage_logs
    add column if not exists language text not null default 'english';
  ```

### blog_subscribers

- **Tightened RLS.** Old policy was `cmd: ALL, roles: public, qual: true, with_check: true` — anyone with the anon key (public, shipped in the browser bundle) could list every subscriber email, deactivate anyone, or delete the table. Replaced with INSERT-only for anon/authenticated. `service_role` bypasses RLS by default, so server-side endpoints using the service role still have full access.
  ```sql
  drop policy if exists "Service role can manage subscribers" on public.blog_subscribers;
  create policy "Anyone can subscribe"
    on public.blog_subscribers
    for insert to anon, authenticated
    with check (true);
  ```

  Paired code change: `app/api/blog/subscribe/route.ts` and `app/api/blog/unsubscribe/route.ts` switched from cookie-bound anon client to `createServiceClient()` (new helper in `lib/supabase-server.ts`). They need SELECT/UPDATE on `blog_subscribers` which anon can no longer do.

  Required env var: `SUPABASE_SERVICE_ROLE_KEY` must be set in Vercel for Production + Preview. Confirmed present 2026-06-03.

### Findings noted but not yet acted on

- `profiles.posts_this_month` — dead column. Quota is derived from the `posts` table count since the 2026-05-15 fix; this column is no longer maintained. Safe to drop when convenient; leaving for now as it's not causing problems.
- `posts` has several future-feature columns the code doesn't write to: `image_url`, `image_analysis`, `posted_at`, `posted_to_account_id`, `platform_post_id`, `error_message`, `scheduled_for`. Scaffolding for scheduled-posting / multi-account work. Not bugs.
- `blog_subscribers` grants — anon/authenticated/service_role all have full grants (`DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE`). RLS is the actual gate now, but grants are wider than needed. Could be tightened to `INSERT` only for anon as a belt-and-braces hardening pass; not blocking.
