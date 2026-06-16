# Blog Publish Watchdog — Operational Guide

A self-healing layer over `blog-publish.yml` that recovers when GitHub
Actions silently skips the scheduled publish cron. Built 2026-06-16 after
a real incident where the Tuesday publish cron didn't fire and the post
sat unpublished for 4+ hours until manually triggered.

This document is for **you, six months from now, when something has gone
wrong on a Friday evening and you need to figure out what to do.** Read
it like ops runbook, not like architecture prose.

## What problem this solves

GitHub Actions scheduled crons are not reliable. A cron set to fire at
09:17 UTC may fire on time, may fire hours late, or may silently skip
entirely. There is no built-in alert, no retry, no failover. This is
acknowledged behaviour from GitHub, not a bug — it's the cost of running
on shared runners with cron-as-a-best-effort.

For the Klinchapp blog, "publish didn't fire today" is operationally
real:

- A post has been generated and is sitting in `status: "scheduled"` on
  main, ready to be flipped to `published`.
- Subscribers expect new posts on a cadence (Tue/Fri).
- Syndication to Blogger and WordPress is wired into the publish step;
  if publish doesn't run, neither does syndication.
- Nobody is watching the blog actively. A skipped publish is invisible
  until the user happens to notice.

The watchdog exists to make missed publishes statistically near-impossible
**and** noisy when they do happen.

## How it works — one paragraph

A separate GitHub Actions workflow (`blog-publish-watchdog.yml`) fires
every 2 hours throughout each publish day (Tue/Fri) on top of the
original 09:17 publish cron. Each fire runs a Node.js script
(`watchdog-blog-publish.mjs`) that looks at the state of the blog and
decides whether to trigger `blog-publish.yml` via `gh workflow run`. The
script is fully idempotent — if publish has already succeeded today, or
is currently running, the watchdog exits without action. If by 20:00 UTC
a scheduled post is still sitting unpublished, the script sends an alert
email so the user knows manual intervention is required.

## Schedule — full timeline of a publish day

```
Tuesday or Friday in UTC:

  09:17  ┃ blog-publish.yml      (primary publish cron)
  11:23  ┃ blog-publish-watchdog (retry #1)
  13:23  ┃ blog-publish-watchdog (retry #2)
  15:23  ┃ blog-publish-watchdog (retry #3)
  17:23  ┃ blog-publish-watchdog (retry #4)
  19:23  ┃ blog-publish-watchdog (retry #5)
  21:23  ┃ blog-publish-watchdog (retry #6 + alert email if still unpublished, since 21:23 ≥ 20:00 UTC)
```

That's **7 independent chances** per publish day. The off-the-hour
minute (`:23` for the watchdog, `:17` for publish) deliberately avoids
the top-of-hour GHA cron contention that has historically caused skipped
runs (see comment in `blog-publish.yml:6`).

The watchdog does NOT run on non-publish days (Mon/Wed/Thu/Sat/Sun). On
those days, nothing should be publishing.

## Decision logic — what each watchdog fire actually does

Each fire is a separate `node scripts/watchdog-blog-publish.mjs` run.
The script has 5 mutually-exclusive exit branches:

| # | Branch | Condition | Action |
|---|---|---|---|
| 1 | **Nothing to do** | No file in `content/blog/*.mdx` has `status: "scheduled"` | Exit clean, log "no scheduled posts" |
| 2 | **Already done** | `gh run list --workflow=blog-publish.yml --status success` shows a run created today | Exit clean, log "publish already ran today" |
| 3 | **In flight** | A publish run is currently `in_progress` or `queued` | Exit clean, log "letting it complete" |
| 4 | **Trigger** | Scheduled post exists, no publish today, no publish in flight | Call `gh workflow run blog-publish.yml`. Log result. Continue to (5). |
| 5 | **Alert** | After (4), if UTC hour ≥ 20 AND we just triggered (meaning every prior cron skipped) | Send Resend email to `klinchapp.info@gmail.com` |

Branch (5) deliberately fires AFTER branch (4). The reasoning: even on
the apocalypse path (every prior cron skipped), we still attempt
recovery on the current fire — the alert is the backstop, not the
primary action.

## Idempotency guarantees

- **Branch (1) and (2)** are no-ops by definition.
- **Branch (3)** prevents two publish runs from racing.
- **Branch (4)** triggers `blog-publish.yml`, which has its own
  "no changes to commit" guard (`blog-publish.yml:46-47`). If the
  scheduled post has already been flipped to published between detection
  and trigger, the triggered publish run will see no diff and exit
  without committing.
- **Branch (5)** can fire multiple times in the apocalypse case (once per
  late-day watchdog after 20:00 UTC). This is intentional — multiple
  alerts on a truly broken day are better than missing the only one.

There is no shared state file. Each watchdog fire makes its decision
independently from the same observable inputs (MDX files on main, GHA
run history).

## Success indicators — how to confirm it's working

**On a normal publish day** (publish cron fires successfully at 09:17):

- `gh run list --workflow=blog-publish.yml --limit 2` shows today's
  successful run.
- `gh run list --workflow=blog-publish-watchdog.yml --limit 6` shows
  multiple successful watchdog runs, each with stdout like:
  ```
  ✓ blog-publish has already run successfully today — nothing to do.
  ```
- No email arrives.
- The post is live at its `klinchapp.com/blog/[slug]` URL.

**On a recovery day** (publish cron skipped, watchdog caught it):

- `gh run list --workflow=blog-publish.yml --limit 2` shows one run
  triggered today by `workflow_dispatch` (not `schedule`).
- The watchdog run that did the trigger has stdout:
  ```
  Found 1 scheduled post(s): foo.mdx
  No publish today and a scheduled post exists. Triggering blog-publish.yml...
  ✓ Triggered blog-publish.yml successfully.
  ```
- Subsequent watchdog runs that day land in branch (2) ("already done").

**On the apocalypse day** (every cron skipped, alert sent):

- An email lands at `klinchapp.info@gmail.com` with subject:
  `⚠️  Blog publish watchdog: scheduled post not published today`.
- The email lists the specific MDX file(s) sitting unpublished.
- The email includes the exact manual-recovery command.

## Failure paths and what they look like

| Symptom | What probably happened | What to do |
|---|---|---|
| Email alert arrived from the watchdog | Every cron fire was skipped by GHA. Very rare. | Run `gh workflow run blog-publish.yml` manually. Investigate GHA status page. |
| Watchdog fires, triggers publish, but publish itself fails | Provider chain exhausted, or git push failed, or syndication step crashed | Inspect the failed publish run logs. The script and watchdog are doing their job; the failure is downstream. |
| Watchdog fires but doesn't trigger publish, post still scheduled | Likely branch (3) ("publish in flight") got stuck. Check `gh run list --workflow=blog-publish.yml --status in_progress` | If a publish run is genuinely stuck, cancel it (`gh run cancel <id>`) and rerun the watchdog manually. |
| Multiple alert emails on one day | Apocalypse path — every fire including the 21:23 fire couldn't trigger publish | Read the alert email. Likely auth/permissions issue with PAT_TOKEN or RESEND_API_KEY. |
| No watchdog runs at all on a publish day | The watchdog cron itself was skipped (meta-skip) OR the workflow is disabled OR PAT_TOKEN was rotated and watchdog can't trigger anything | Manually trigger watchdog: `gh workflow run blog-publish-watchdog.yml`. Check GHA Actions tab for the workflow's enabled status. |

## Manual operations

**Force a publish right now (any time, not just publish days):**

```bash
gh workflow run blog-publish.yml
```

This triggers `blog-publish.yml` via `workflow_dispatch`. It will pick
up any post in `scheduled` status and publish it. Safe to run any time —
if there's nothing to publish, the workflow exits cleanly with
"No changes to commit".

**Force the watchdog to run right now (useful for diagnosis):**

```bash
gh workflow run blog-publish-watchdog.yml
```

You'll see the decision branches in the run logs without anything
actually getting triggered (unless there's a scheduled post sitting
unpublished, in which case it will trigger publish as designed).

**Look at the most recent watchdog runs:**

```bash
gh run list --workflow=blog-publish-watchdog.yml --limit 10
gh run view <run-id> --log    # full stdout
```

**Look at watchdog decisions over the last week:**

```bash
gh run list --workflow=blog-publish-watchdog.yml --limit 40 \
  --json createdAt,conclusion,event
```

## Configuration reference

| Setting | Where | Current value |
|---|---|---|
| Schedule (cron) | `.github/workflows/blog-publish-watchdog.yml:24` | `'23 11-21/2 * * 2,5'` (every 2h, 11:23–21:23 UTC, Tue+Fri) |
| Alert deadline | `scripts/watchdog-blog-publish.mjs` `APOCALYPSE_HOUR_UTC` | `20` (alert fires on watchdog runs that happen at hour ≥ 20 UTC) |
| Alert recipient | `scripts/watchdog-blog-publish.mjs` `ALERT_EMAIL` | `klinchapp.info@gmail.com` |
| Auth token | Workflow env `GH_TOKEN` | `secrets.PAT_TOKEN` (existing project secret) |
| Email API key | Workflow env `RESEND_API_KEY` | `secrets.RESEND_API_KEY` (existing project secret) |
| Concurrency group | `.github/workflows/blog-publish-watchdog.yml:30` | `blog-publish-watchdog` (single global, cancels nothing) |
| Job timeout | `.github/workflows/blog-publish-watchdog.yml:35` | 5 minutes (watchdog never legitimately needs more) |

## Maintenance — what to change when X changes

**If you move publish to different days** (e.g. Wed/Sat instead of Tue/Fri):

- Update `blog-publish.yml` cron expression.
- Update `blog-publish-watchdog.yml` cron expression (currently `* * 2,5`).
- Update the "Schedule" section of this doc.

**If you move publish to a different hour:**

- Update `blog-publish.yml` cron expression.
- Update `blog-publish-watchdog.yml` cron to span the new hours.
- Update `APOCALYPSE_HOUR_UTC` in the watchdog script (should remain
  ~2 hours before the last retry fire).

**If you change the alert email address:**

- Update `ALERT_EMAIL` in `scripts/watchdog-blog-publish.mjs`.

**If you change the post status names** (`scheduled`, `published`):

- Update the regex in `findScheduledPosts()` in
  `scripts/watchdog-blog-publish.mjs`.
- This regex is shared with `findScheduledPost()` in
  `scripts/blog-pipeline.mjs:259`; keep them in sync.

**If GHA cron starts dropping watchdog runs too:**

- Tighten the watchdog schedule (e.g. every 1 hour instead of every 2).
- Or migrate the watchdog (not the whole publish) to Vercel Cron or an
  external scheduler. See the "Why not other shapes" notes in the
  watchdog PR description (2026-06-16) for the trade-offs of each option.

## Related files

- `.github/workflows/blog-publish-watchdog.yml` — the workflow itself
- `scripts/watchdog-blog-publish.mjs` — the decision script
- `.github/workflows/blog-publish.yml` — the actual publish workflow this watchdog protects
- `.github/workflows/blog-prepare.yml` — the workflow that creates the scheduled posts the watchdog later publishes (Mon/Thu 09:13 UTC)
- `scripts/blog-pipeline.mjs` — `stagePublish()` / `publishFile()` are the publish logic the watchdog triggers
- `MEMORY.md` → `project_seo_parked_work.md` — operational history including the 2026-06-16 incident that prompted this watchdog
