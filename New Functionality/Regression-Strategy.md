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

### Phase 1.5 — Rendered-HTML gate (homepage)

**Status:** LIVE 2026-05-15 (PR #28)
**Trigger to start:** Was triggered retroactively by the Phase 2 cutover incident — see Incidents & Lessons below.

**Scope:** structural assertions against the *rendered HTML* of the homepage, on every successful Vercel deployment plus a daily prod canary.

**Implementation:**
- `scripts/check-homepage.mjs` — fetches a URL, parses the HTML, runs 13 assertions
- `.github/workflows/homepage-check.yml` — three triggers:
  - `deployment_status` (state=success, environment=Production) — runs on every prod deploy
  - `schedule` — daily at 04:00 UTC against `https://www.klinchapp.com`
  - `workflow_dispatch` — ad-hoc against any URL (preview or prod)
- Preview deployments are skipped by default because Vercel SSO-gates them. Optional re-enable: add `VERCEL_AUTOMATION_BYPASS_SECRET` to repo secrets (token minted in Vercel → Settings → Deployment Protection → Protection Bypass for Automation) and flip the workflow filter to also fire on `Preview` environment.

**The 13 assertions** (all must pass for the workflow to be green):

| # | Check | Catches |
|---|---|---|
| 1 | HTTP 200 | Routing/build failure |
| 2 | `<img src="/logo.jpg">` present | Logo replaced or removed (Phase 2 cutover failure mode) |
| 3 | Brand name "Klinchapp" in HTML | Header swapped to a placeholder |
| 4 | Footer copyright line `© 20YY Klinchapp` present | Footer swapped or removed |
| 5 | `<link rel="canonical">` points at `https://www.klinchapp.com` | Wrong host shipped to prod |
| 6 | `<meta name="robots">` is NOT `noindex` | Staging → prod leak |
| 7 | No staging banner text (`V2 MOCKUP`, `V3.*Staging`, `noindex,nofollow`) | Staging artifact shipped |
| 8 | At least one `<script type="application/ld+json">` block | Schema removed entirely |
| 9 | All JSON-LD blocks parse as valid JSON | Malformed schema (e.g., trailing comma) |
| 10 | JSON-LD contains an Organization entity | Org schema removed |
| 11 | JSON-LD contains a WebSite entity | WebSite schema removed |
| 12 | Organization `logo` references `/logo.jpg` | Logo URL drift |
| 13 | Organization `url` is `https://www.klinchapp.com` | Schema points at wrong host |

**Catches:** the specific failure modes from the 2026-05-15 cutover (see Incidents). Cheap to run (~10 seconds per check) and free.

**What it deliberately does NOT catch** (and is the reason Phase 2 exists):
- Visual regressions (cropped images, broken layouts, colors wrong)
- Interactive flows (clicking anchors actually scrolls to the right section; the menu opens; the form submits)
- Anchor-target alignment (an anchor in the header without a matching `id` in the body — would pass HTML checks but break UX)
- Mobile-specific regressions (everything currently runs against the desktop HTML)

**Cost:** $0, ~10 seconds per run, zero per-PR friction.

**Manual invocation:**
```
gh workflow run homepage-check.yml -f url=<any-url>
```

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

## Incidents & Lessons

Append entries chronologically. Each entry captures: date, severity, what happened, root cause, fix, and lesson — so future maintainers can avoid repeating the failure mode.

### 2026-04-27 — Self-triggering workflow loop (P1)

**What happened:** Within minutes of the regression infrastructure going live, `regression-on-main` produced ~37 commits over 30 minutes recursing on itself. Each run pushed a regression report to `main`, which re-fired the workflow, which wrote another report, ad infinitum. ~37 wasted Vercel deploys followed before the loop was caught.

**Root cause:** `regression-on-main.yml` was configured with:
```yaml
on:
  push:
    branches: [main]
```
…and the workflow's "Commit report" step also pushed to `main`. Nothing filtered the workflow's own commits out of its own trigger, so it recursed.

**Detection:** Manual. Observed by noticing the Vercel dashboard fill with deploys. The system was silent until that.

**Fix (commit `b81c121`):** Added `paths-ignore` to the push trigger:
```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - 'regression-reports/**'
```
Workflow no longer fires when a commit modifies only `regression-reports/`.

**Defense in depth (commit on cleanup branch):** Added `vercel.json` `ignoreCommand` so Vercel also skips deploys for regression-only commits, in case the workflow trigger ever misfires.

**Lesson — for any future workflow that commits to its own trigger branch:** filter the workflow's own writes out of its triggers. Pattern: `paths-ignore: ['<folder-the-workflow-writes-to>/**']`. Also helpful: a `concurrency` group prevents *parallel* loops; `paths-ignore` prevents *sequential* loops. Use both.

**What worked well:** The audit trail itself caught this fast — once `git log` was checked, the recursion was immediately visible. The reporting/audit-trail design (every run leaves a Markdown trace) is part of *why* the loop was diagnosable at all. Without it, this might have run silently for hours.

### 2026-05-15 — Phase 2 cutover shipped three regressions undetected (P1)

**What happened:** PR #25 replaced the live homepage with the v3 design. Three problems hit production before being caught — each by a different mechanism, none by automated tests:

1. **Brand logo disappeared.** The v3 staging file used a hand-coded purple "K" letter tile as a placeholder header. When `home-client.tsx` was rebuilt from v3, the placeholder header was kept and the real logo `<img src="/logo.jpg">` was never wired back in. User noticed visually after merge.
2. **Five in-page nav anchors disappeared.** Hotfix PR #26 (which restored the logo) swapped the v3 bespoke header for `SiteHeader` — but `SiteHeader`'s `marketing` variant only renders Blog / Login / Get Started Free. The five section anchors (How it works / Who it's for / Voices / Platforms / FAQ) silently disappeared. User noticed when testing nav.
3. **Duplicate SoftwareApplication schema.** The follow-up JSON-LD enrichment (PR #29) added a SoftwareApplication block to `app/layout.tsx`'s sitewide schema, not realising `app/home-client.tsx` already emitted a richer one. Both fired on the homepage. Caught locally during dev-server check before going to prod.

**Root cause:** every automated check was green throughout.
- Type-check (`tsc --noEmit`): passed — placeholder JSX is structurally valid.
- Build (`next build`): passed — no compile errors.
- Existing regression reports (Phase 1): passed — nothing checks what the rendered HTML actually contains.
- Vercel preview link was visible on the PR, but no human nor any automated step opened it.

In short: the gate was "did the build succeed" and not "did the page render the things we expect to see." A green CI told the maintainer the change was safe to merge. Visual / content sanity was left implicit.

**Fix:** Phase 1.5 (above) — a rendered-HTML check that fetches the homepage and runs 13 structural assertions covering all three failure modes:
- Logo missing → check #2 (`<img src="/logo.jpg">` present)
- Anchors missing → not directly covered yet; planned follow-up to add "homepage contains expected anchor hrefs" assertion
- Duplicate / missing schema → checks #8–13

The check runs on every prod deploy via `deployment_status`, plus a daily canary, plus on-demand via `workflow_dispatch`. PRs #28 (the gate) and #29 (the schema fix) and #30 (the layout/anchor fix) shipped in sequence the same session.

**Defense in depth:** ad-hoc preview validation is now possible without merging — `gh workflow run homepage-check.yml -f url=<preview-url>` runs all 13 checks against any URL. Combined with `VERCEL_AUTOMATION_BYPASS_SECRET` (now configured), preview deployments can be validated before merge.

**Lessons:**

- **CI signals "build succeeded," not "page works."** Anything more depends on the project adding it explicitly. Without rendered-HTML / browser-level checks, every cutover that changes shared layout will carry this risk again.
- **Visual placeholders in staging are dangerous if not labelled as such.** The v3 "K" tile read as design intent to a reviewer who hadn't built v3. A `TODO: placeholder` comment or a render-time warning would have helped.
- **Shared components win over inline duplication, but their variants must be the unit of test coverage.** `SiteHeader`'s `marketing` variant was inherited as "the safe default" during the hotfix — but it had never been compared to the v3 nav requirements. New variants (here: `marketing-home`) need to be reasoned about as separate UX surfaces.
- **One PR fixes one problem.** PR #26 (logo restore) introduced the anchor regression. If the test plan on PR #26 had included "verify all v3 nav items still present," the cascade would have stopped there.
- **Honest debriefs are cheap.** The user explicitly asked "how did we make such a blunder, what did all the regression testing do?" — answering that question concretely (rather than defensively) is what produced Phase 1.5. The retro is the lesson; the doc entry is the durable form.

**What's still parked:**
- Mobile nav menu for the marketing-home variant — anchors are `hidden md:flex`, invisible below 768px. Saved as deferred work in memory. Will revisit when mobile traffic share or user feedback justifies the build cost (see `project_homepage_marketing_home_tbd.md`).
- Visual regression / screenshot diff — would catch a class of issues these structural checks don't (image cropping, layout breakage, color drift). Still in the deferred list at the bottom of this doc; remains there until project scale justifies the setup cost.

---

## Maintenance

This document is reviewed and updated:

- **Each time a phase moves from Planned → Live** (update the status badge)
- **After every P0 or P1 incident** — add an entry to the **Incidents & Lessons** section above
- **Quarterly** at minimum — confirm thresholds and triggers still match project state
