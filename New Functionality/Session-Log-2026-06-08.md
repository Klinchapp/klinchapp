# Session Log — 2026-06-08

## Shipped

| PR | Subject | Status |
|---|---|---|
| #54 | Fix Phase 1.5 homepage-check workflow — Vercel Deployment Protection bypass cookie jar + URL whitespace trim | Merged |

## The substantive find today

Phase 1.5 had been silently false-failing on every production deploy for **23 days** (since 2026-05-16). The daily cron's green signal masked the failures, and the May 16 memory captured the symptom but proposed the wrong fix.

### Actual root cause (different from May 16 hypothesis)

`scripts/check-homepage.mjs` used Node's built-in `fetch` with `redirect: 'follow'`. Vercel's Deployment Protection bypass works via a Set-Cookie flow:

1. Script sends `x-vercel-protection-bypass: <token>` request header
2. Vercel validates the token, responds with **HTTP 307 + `Set-Cookie: _vercel_jwt=...`**
3. Subsequent requests need to send that cookie back to prove bypass

Node's built-in `fetch` **has no cookie jar.** `redirect: 'follow'` followed the 307, didn't capture the Set-Cookie, hit the same protected URL, got another 307 with another Set-Cookie, dropped that too, and looped until undici's internal max-redirect count (around 20) gave up with `redirect count exceeded`.

The May 16 memory hypothesized the bug was a header-name mismatch (`VERCEL_PROTECTION_BYPASS` vs `VERCEL_AUTOMATION_BYPASS_SECRET`) or the cookie value (`true` vs `samesitenone`). Neither was the actual cause. Both diagnoses chased what the Vercel docs said, not what the protocol actually requires for server-side Node fetch.

### The fix (PR #54)

Replaced `fetch(url, { redirect: 'follow' })` with a manual hop-by-hop loop that:
- Sets `redirect: 'manual'`
- Captures `Set-Cookie` headers on each response (handles both `getSetCookie()` for undici 18+ and the raw header fallback)
- Resends captured cookies as `Cookie` header on the next request
- Breaks early on same-URL-no-new-cookies (avoids the previous infinite-redirect failure mode)
- Logs hop-by-hop diagnostics for future debugging

Also added defensively:
- `url.trim()` before parsing (the failed run today was caused by a trailing space in the input URL — `new URL` accepted it leniently but the server-side encoding triggered the redirect loop)
- Bare-hostname normalization (auto-prepend `https://` if missing)
- Upfront URL validity check with clean error message

### Three iterations, full circle

The fix took three commits — worth recording because it documents the diagnostic process for the next time something like this happens:

| Commit | Hypothesis | Outcome |
|---|---|---|
| `1b1ba01` | Cookie value `true` → `samesitenone`; add diagnostic logging | Not the fix alone, but the diagnostic was load-bearing for finding the actual cause |
| `76cc393` | Add URL whitespace trim + bare-hostname normalization | Needed because the trial input had a trailing space, but didn't address the deeper redirect-loop |
| `011b815` | **Add cookie jar** — capture Set-Cookie, resend as Cookie on next hop | The actual fix. Manual verification: 13/13 checks pass against a real Vercel preview alias |

## Trigger chain — how the failure surfaced today

The user's instinct ("this looks like a cron") was right in spirit but the actual chain was longer:

```
Mon 09:13 UTC: blog-prepare schedule cron supposed to fire
              ↓ (GHA queue drift ~4 hours)
Mon 13:15 UTC: Blog Pipeline - Prepare actually runs, generates Kira's
              next scheduled post
              ↓
Mon 13:17 UTC: Pipeline commits "blog: prepare scheduled post" to main
              ↓
Mon 13:18 UTC: Vercel auto-deploys the new commit to production
              ↓
Mon 13:18 UTC: Vercel sends deployment_status webhook to GitHub
              ↓
Mon 13:18 UTC: Homepage Check workflow auto-fires against the deployment
              alias URL
              ↓ (cookie jar bug)
Mon 13:18 UTC: redirect count exceeded → workflow fails
              ↓
              User notices, investigates, today's session begins
```

The chain has been firing **every Tuesday and Friday** (the blog-publish cadence) plus every other production deploy for 23 days — same failure mode, just buried in CI noise.

## Why we didn't catch this for 23 days

- **The daily cron's green signal masked the silent failures.** Anyone glancing at the workflow's history saw a row of green from the schedule trigger and assumed the gate was working.
- **The deployment_status failures showed up but were lumped in with other CI noise.** Without a notification rule that surfaced just-deployed-but-checked failures, they blended in.
- **The May 16 memory captured the symptom but proposed the wrong fix.** Even if someone had revisited it, they'd have churned on the header-name hypothesis and not found the cookie issue.
- **No one had specific cause to manually run it against a preview URL until today.** Until you ran `workflow_dispatch` with a preview, the only path that ever exercised the bypass was the deployment_status auto-trigger — which was failing silently.

## Tuesday's e2e test (the real verification)

Tuesday 2026-06-09 ~09:17 UTC the publish cron fires:
- Pipeline flips `status: "scheduled"` → `"published"` on `content/blog/employer-brand-linkedin-posts-ai.mdx`
- Commits + pushes to main
- Vercel deploys
- Vercel sends deployment_status webhook
- **Homepage Check fires with PR #54's cookie-jar fix on main — first publish-time deployment_status check that should actually run all 13 assertions in 23 days**

The post itself (next session order 5) was audited this session against PR #53's editorial-integrity rules: clean. Body content is editorial, no Klinchapp mention in body, no fabricated specifics, no competitor recommendations, no vertical-specialization claims. The Facebook social snippet retains the standard `"Read the full guide on the Klinchapp blog"` footer (hardcoded in the social-snippet prompt, attribution-style not promotion); the platform-link automation from PR #52 added `[LinkedIn](/ai-linkedin-post-generator)` on the first occurrence of "LinkedIn" in the body. Both are intentional system behaviour, not LLM violations, and were left in.

## Lessons recorded for future sessions

1. **Don't trust a single-trigger green signal to mean the gate works.** If a CI gate has multiple trigger types (cron + deployment + manual), the silent failure mode is "one trigger works, others false-fail invisibly." The cron-green hid the deploy-red.
2. **Diagnose at the protocol layer, not just the doc layer.** The May 16 memory chased what Vercel's docs said about header names. The actual fix required understanding the cookie flow underneath. When a doc-prescribed fix doesn't work, the answer is usually a layer deeper.
3. **Node's `fetch` has no cookie jar.** Anyone hitting a Set-Cookie-dependent server-side flow needs to implement one. Worth a note in any future server-side HTTP scripting.
4. **Localhost-first rule scales to CI.** Verified the fix on `workflow_dispatch` before merging — first run failed, surfaced the URL-trim issue, fixed without polluting main. Same discipline that's been useful for app code worked for CI scripts.

## Documents updated this session

| Document | Purpose |
|---|---|
| `scripts/check-homepage.mjs` | The actual fix — cookie jar + URL normalization + diagnostic logging |
| `New Functionality/Session-Log-2026-06-08.md` | This file — the trigger chain, root cause, 23-day silence explanation, Tuesday-publish status |
| `memory/project_homepage_check_workflow_bug.md` | Updated from "open as of 2026-05-16" → "resolved 2026-06-08 PR #54, root cause was cookie jar absence (different from original hypothesis)" |
