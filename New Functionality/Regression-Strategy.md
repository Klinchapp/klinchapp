# Klinchapp Regression Strategy

**Status:** Drafted 2026-04-27
**Related:** `Blog-Project_Status.md` (the autonomous blog engine this strategy protects)

---

## Philosophy

Klinchapp is a fully autonomous system. The blog pipeline researches, writes, fact-checks, scores, publishes, and notifies — without human intervention. Subscribers will depend on this working continuously. The blog pipeline itself has 8 quality gates and 4-provider failover. The application code that serves the site has, today, **none of that protection**.

This document defines how we close that gap, in proportion to risk and project stage.

**The principle**: a fully automated content system deserves a fully automated quality system. Every regression run produces a committed report, the same way every blog post produces a `_pipeline-log.json` entry. Audit trails are not optional for autonomous systems.

---

## Risk Model

### What can break

| Component | Failure mode | Detection today | Subscriber impact |
|---|---|---|---|
| Application build | Compile/type error | Vercel build fails (auto-blocks deploy) | None — Vercel keeps last good deploy |
| Application runtime | White screen, hydration error, broken interactivity | Manual user report | Direct |
| Auth flow (Google OAuth, magic link) | Users can't log in | Manual user report | Direct |
| Blog rendering | MDX render error, missing post | Manual visual check | Direct |
| Subscribe API | New subscribers silently dropped | None | Direct, recoverable |
| Unsubscribe API | Legal exposure (GDPR Art. 17, CAN-SPAM) | None | Direct, **legal risk** |
| Email delivery (Resend) | Subscribers don't receive posts | Pipeline-side errors only; delivery failures invisible | Direct |
| Blog pipeline | Posts don't generate or publish | Existing pipeline failure email | None to users (24h buffer absorbs delays) |
| Sitemap / canonical / robots | SEO ranking degradation | Search Console (delayed days/weeks) | Indirect |
| Middleware | Routing or OAuth callback breaks | Manual testing | Direct |

### Severity classes

| Level | Definition | Response time |
|---|---|---|
| **P0** | Site-down. Home, blog, or auth flow returns 5xx or doesn't render. | Rollback immediately, fix afterward |
| **P1** | Subscriber path broken. Subscribe/unsubscribe APIs failing or email delivery degraded. | 4 hours |
| **P2** | Degraded experience. Visual regression, broken non-critical link, slow page. | 24 hours |
| **P3** | SEO/hygiene. Missing meta, sitemap drift, canonical issues. | 1 week |

---

## Phased Implementation Plan

The phases below match project stage. Each phase unlocks the next. Don't over-build for current scale; don't under-build for the next milestone.

### Phase 1 — Pre-merge build & type check

**Status:** Planned (next commit)
**Trigger to start:** Now

**Scope:** every PR to main runs `npm run build` and `tsc --noEmit` before merge is permitted.

**Implementation:**
- `.github/workflows/ci.yml` — triggers on `pull_request`
- Steps: checkout, setup-node@v4, `npm ci`, `npm run build`, `npx tsc --noEmit`
- GitHub branch protection rule on `main`: require this check before merge

**Catches:** TypeScript errors, broken imports, syntax errors, missing dependencies, accidental dependency removal. Roughly 80% of "I broke prod" incidents.

**Cost:** $0 (GitHub Actions free tier covers this), ~3–5 minutes per PR.

### Phase 2 — Critical-path smoke tests

**Status:** Planned
**Trigger to start:** Before any paid traffic acquisition OR before the audio/video pilot launches (whichever comes first).

**Scope:** Playwright suite running against the Vercel preview deployment URL on every PR. Covers the user paths that actually matter.

**Implementation:**
- `.github/workflows/smoke-tests.yml` — triggers on `deployment_status` (Vercel preview ready)
- Test cases:
  1. `/` loads — "Get Started" button visible, no console errors
  2. `/login` loads — magic link form renders, Google button visible
  3. `/blog` loads — at least one post in the list
  4. `/blog/[real-slug]` — MDX renders, share buttons present, related posts shown
  5. POST `/api/blog/subscribe` with valid email → 200
  6. POST `/api/blog/subscribe` with malformed email → 400
  7. POST `/api/blog/unsubscribe` with valid token → 200
  8. `/blog/rss.xml` → 200, valid XML, contains at least one `<item>`
  9. `/sitemap.xml` → 200, contains `https://www.klinchapp.com`

**Catches:** runtime issues that pass build (hydration mismatches, broken API contracts, regressed data fetching, broken UI under real browser conditions).

**Cost:** ~$0 infra, ~3–4 hours initial setup, ~5 min per PR.

### Phase 3 — Post-deploy synthetic monitoring

**Status:** Planned
**Trigger to start:** Before publishing the subscribe form to a wider audience.

**Scope:** continuous external health monitoring of production URLs.

**Implementation:**
- UptimeRobot, BetterStack, or Vercel's built-in monitoring
- Endpoints, every 5–15 min:
  - `/` (HEAD)
  - `/blog`
  - `/blog/<a-real-slug>`
  - `/api/blog/subscribe` (HEAD or OPTIONS)
- Email alert on failure → klinchapp.info@gmail.com (matches existing pipeline alert pattern)

**Catches:** outages, DNS issues, Vercel-side failures, expired credentials, third-party service breakage (Supabase, Resend, Anthropic).

**Cost:** Free tier viable; paid tiers ~$0–10/mo.

### Phase 4 — Subscriber-path canary

**Status:** Planned
**Trigger to start:** After the first 10 real subscribers exist.

**Scope:** daily end-to-end test of the legally-required subscribe → welcome email → unsubscribe flow.

**Implementation:**
- `.github/workflows/subscriber-canary.yml` — schedule: daily at 03:00 UTC (offset from blog publish times)
- Steps:
  1. POST `/api/blog/subscribe` with dedicated test address (e.g., `regression-canary@klinchapp.com` via Mailosaur or dedicated inbox)
  2. Wait 60s
  3. Verify welcome email arrived (Resend webhook log or Mailosaur API)
  4. Extract unsubscribe token from email body
  5. POST `/api/blog/unsubscribe` with token
  6. Confirm removal from `blog_subscribers` Supabase table
  7. Write report; email alert on any failure

**Catches:** silent failures in the most critical and legally-mandated path. Resend deliverability degradation. Supabase RLS regressions. Email template issues.

**Cost:** ~$0 (Mailosaur free tier sufficient at daily cadence), ~2 hours to build.

### Phase 5 — Branch protection & PR review

**Status:** Planned
**Trigger to start:** When more than one person commits to the repo.

**Scope:** enforce that no code reaches `main` without passing CI and at least one human review.

**Implementation:**
- GitHub branch protection rule on `main`:
  - Require pull request before merging
  - Require at least 1 approval
  - Require Phase 1 + Phase 2 status checks
  - Dismiss stale approvals on new commits
  - Block direct push to `main` (including for admins)

**Catches:** human error, accidental main pushes, merge of untested code.

**Cost:** $0.

---

## Reporting & Audit Trail

**Principle:** every regression run produces a Markdown report committed to the repo. This creates an immutable audit trail and makes patterns visible (flaky tests, recurring failures, deployment instability over time).

### Where reports live

```
regression-reports/
├── INDEX.md                                    (auto-updated, reverse-chronological)
├── 2026-04-27T14-23-00Z_abc1234.md             (one per run)
├── 2026-04-27T03-00-00Z_abc1234.md
└── 2026-04-26T19-11-00Z_def5678.md
```

Naming convention: `<ISO-timestamp-Z-with-dashes>_<short-sha>.md`

### When reports are written

| Trigger | What runs | Report committed? |
|---|---|---|
| PR opened/updated | Phases 1 & 2 (when live) | No — status only on PR |
| Push to `main` (post-merge) | Phases 1 & 2 against production | **Yes** |
| Daily 03:00 UTC schedule | Phases 3 & 4 (when live) | **Yes** |
| Manual `workflow_dispatch` | Selected phases | **Yes** |

PR-level runs don't commit (would create churn and merge conflicts). Only `main`-targeted and scheduled runs produce permanent reports.

### Report content

Each Markdown report contains:

```markdown
# Regression Report — 2026-04-27 14:23 UTC

**Trigger**: post-merge
**Commit**: abc1234 — "fix: SEO canonical for /  and /login"
**Branch**: main
**Duration**: 2m 14s
**Status**: PASS
**GitHub Actions run**: https://github.com/Klinchapp/klinchapp/actions/runs/...

## Phase 1: Build & Type Check
- [x] npm run build — 47s
- [x] tsc --noEmit — 8s

## Phase 2: Smoke Tests
- [x] / loads (1.2s)
- [x] /login loads (0.9s)
- [x] /blog loads (1.4s)
- [x] /blog/ai-content-quality-over-quantity renders (1.8s)
- [x] POST /api/blog/subscribe (200) — 340ms
- [x] POST /api/blog/subscribe (400 invalid email) — 120ms
- [x] POST /api/blog/unsubscribe (200) — 410ms
- [x] /blog/rss.xml valid XML — 80ms
- [x] /sitemap.xml contains canonical host — 60ms

## Phase 3: Synthetic Monitoring (24h window)
- [x] / — 100% uptime, p95 1.1s
- [x] /blog — 100% uptime, p95 1.4s
- [x] /api/blog/subscribe — 100% uptime, p95 380ms
- Slowest endpoint: /blog/ai-content-quality-over-quantity (p95 1.9s)

## Phase 4: Subscriber Canary
- [x] Subscribe → 200, subscriber ID returned
- [x] Welcome email received in 8s
- [x] Unsubscribe → 200, removed from blog_subscribers

## Failures
None.

## Action Required
None.
```

### Index file

`regression-reports/INDEX.md` is auto-updated on every report commit:

```markdown
# Regression Reports

Auto-generated. Most recent first.

| Date (UTC) | Trigger | Commit | Status | Duration | Report |
|---|---|---|---|---|---|
| 2026-04-27 14:23 | post-merge | `abc1234` | PASS | 2m 14s | [view](2026-04-27T14-23-00Z_abc1234.md) |
| 2026-04-27 03:00 | scheduled | `abc1234` | PASS | 1m 47s | [view](2026-04-27T03-00-00Z_abc1234.md) |
| 2026-04-26 19:11 | post-merge | `def5678` | FAIL | 2m 33s | [view](2026-04-26T19-11-00Z_def5678.md) |

## Failure summary (last 30 days)
- 2026-04-26 19:11 — Phase 2 smoke test "POST /api/blog/subscribe" returned 500. Cause: missing SUPABASE_SERVICE_ROLE_KEY in preview env. Fixed in def5679.
```

### Commit author convention

Reports are committed as:

```
Author name:  Klinchapp CI
Author email: klinchapp.info@gmail.com
Commit msg:   ci: regression report <sha>
```

The email is the existing operational address (already used for pipeline notifications). It is intentionally **not linked to any GitHub account** — the PAT_TOKEN handles write access; the author email is metadata only. Keeping it unlinked means CI commits appear unattributed (no profile picture) in GitHub's UI, which is exactly the visual signal we want — "a bot did this, not a human" — without polluting personal contribution graphs.

Distinct from `Kira (Blog Pipeline) <kira@klinchapp.com>` (blog content commits) and from human commits.

### Workflow detail (Phase 1 + commit pattern)

```yaml
# .github/workflows/regression-on-main.yml
name: Regression (post-merge)
on:
  push:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: '0 3 * * *'  # 03:00 UTC daily

jobs:
  regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { token: ${{ secrets.PAT_TOKEN }} }
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci

      - name: Phase 1 — Build
        id: build
        run: npm run build

      - name: Phase 1 — Type check
        id: tsc
        run: npx tsc --noEmit

      # Phase 2/3/4 steps added as phases come online

      - name: Write regression report
        if: always()
        run: node scripts/write-regression-report.mjs
        env:
          BUILD_STATUS: ${{ steps.build.outcome }}
          TSC_STATUS: ${{ steps.tsc.outcome }}
          # ...

      - name: Commit report
        if: always()
        run: |
          git config user.name "Klinchapp CI"
          git config user.email "klinchapp.info@gmail.com"
          git add regression-reports/
          git diff --cached --quiet || git commit -m "ci: regression report ${{ github.sha }}"
          git push
```

The `PAT_TOKEN` is the same fine-grained token already used by the blog pipeline (per `Blog-Project_Status.md`).

---

## Operational Procedures

### When CI fails on a PR

1. Read the failure in the PR check
2. Fix on the same branch — do **not** bypass branch protection (`--no-verify`, admin-merge)
3. CI re-runs automatically on push
4. If the fix is a flake (rare), re-run via the GitHub Actions UI; do not merge a known-failing build

### When post-merge regression fails

1. Email alert fires to klinchapp.info@gmail.com (P0 or P1 only)
2. **Roll back immediately** via Vercel dashboard → Deployments → previous PASS deploy → Promote to Production
3. File issue with the regression report URL
4. Fix on a branch, PR, ensure CI passes, merge
5. Verify the next post-merge regression goes green

### When the canary fails (Phase 4)

P1 incident — subscriber path is broken. Within 4 hours:
1. Read canary report (latest in `regression-reports/`)
2. Reproduce manually (curl the API, check Supabase, check Resend dashboard)
3. Fix and deploy
4. Manually trigger canary via `workflow_dispatch` to confirm green

### Manual regression run

Anyone with repo access can trigger:

```
GitHub → Actions → Regression (post-merge) → Run workflow → main
```

Useful before risky deploys, after env var changes, or for ad-hoc validation. Produces a report just like a scheduled run.

---

## Rollback Strategy

Vercel makes rollback fast — use it.

1. **Vercel dashboard** → klinchapp project → **Deployments**
2. Find the most recent deployment with a green ✓ AND a passing regression report
3. **"..." menu** → **Promote to Production**
4. Verify with `curl -sI https://www.klinchapp.com/ | grep HTTP` and a browser check
5. File issue, fix forward in a branch

**Rollback first, fix second.** A rollback is reversible in 60 seconds; a broken production is not.

Reserve `git revert` for cases where the bad code must never reach production again (e.g., it leaked a secret). Otherwise the Vercel rollback path is enough.

---

## Out of scope (deferred)

| Item | Why deferred |
|---|---|
| Visual regression (Percy, Chromatic) | Overkill until there's a designed component library |
| Load testing (k6) | Overkill until traffic justifies it |
| Penetration testing | Schedule before commercial launch / paid plans |
| Automated accessibility (axe-core in CI) | Recommended; not blocking until WCAG is contractual |
| Multi-region deployment testing | Single Vercel region adequate for current scale |
| Database migration testing | Schema is stable; revisit when `blog_subscribers` schema changes |

---

## Maintenance

This document is reviewed and updated:

- **Each time a phase moves from Planned → Live** (update the status badge)
- **After every P0 or P1 incident** — add the lesson to the relevant section
- **Quarterly** at minimum — confirm thresholds and triggers still match project state
