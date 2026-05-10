# Phase 2 — Live homepage cutover

**Status:** Pending. Gated on Phase 1 health signals.
**Estimated effort:** 60–90 min focused work in one session.
**Earliest:** ~1 week after Phase 1 merge (2026-05-03), so ~2026-05-10.
**Latest:** ~2 weeks after Phase 1 merge (~2026-05-17). Beyond this, holding back v2 homepage costs ranking momentum without buying meaningful additional safety.

---

## What Phase 2 actually does

Replaces the live homepage at `/` (currently `app/home-client.tsx`) with the v2 homepage layout (currently at `app/v2/[locale]/page.tsx` and reachable at `/v2/en`).

The v2 homepage has:

- **New hero** — small "AI Social Media Post Generator." line + big "5 Platforms. 9 Voices. 6 Languages." matrix
- **4-step capability tour** — Upload → Platform → Tone → Language, then a "Hit generate. Done." reveal showing 5 platform mockups side-by-side
- **Audience cards** (3) — E-commerce sellers / Solo creators / Global marketers
- **Comparison table** — Klinchapp vs text-only AI tools (input, languages, voices, platforms)
- **9-voice gallery** — same product, 9 voices written for IG
- **6-language section** — same product, 6 languages incl. RTL Arabic
- **"Built for every platform"** — link strip to the 5 platform pages
- **FAQ** — 8 items
- **Final CTA** — "Ready to Transform Your Social Media?"

vs. the current live homepage:

- Generic 3-section hero/features/CTA with feature checkmarks
- A 3-step "How to create AI social media posts" explainer
- Platform grid (already updated to v2 hover treatment in Phase 1)
- CTA (already updated to drop "Join thousands" claim in Phase 1)

The v2 version is significantly stronger SEO-wise (keyword-led H1, SoftwareApplication schema, no fabricated claims, longer-form content). It's also a noticeably different brand vibe — worth a slow read before committing.

---

## Trigger conditions to fire Phase 2

These are signals **you** monitor and decide on. There is no automation.

### 1. Phase 1 indexing in Google Search Console
- All 5 platform pages submitted via sitemap
- GSC shows "Indexed" status (or "Discovered" trending toward indexed)
- No "Crawled — currently not indexed" stuck pages
- No canonical conflicts flagged

### 2. No traffic / error regression
- Vercel deployment logs clean — no 500s on platform pages
- GA4 (or whatever analytics is wired) shows reasonable bounce rate on `/ai-*-post-generator` URLs
- No bug reports from real users

### 3. You've reviewed the v2 homepage end-to-end
- Click through `/v2/en` on production (currently noindex'd staging)
- Read every section, every H2
- Test on mobile + desktop
- Verify the matrix hero reads right, the 4-step tour flows, the comparison table is honest

When all three are green → trigger Phase 2.

---

## Execution plan (when triggered)

### Pre-work (5 min)
- Branch off main: `git checkout -b feat-v2-homepage-cutover`
- Confirm Phase 1 is still healthy (one quick GSC check)

### File-by-file (45–60 min)

#### 1. Replace `app/home-client.tsx` content with v2 homepage layout

The v2 homepage currently lives at `app/v2/[locale]/page.tsx` (~745 lines). Copy its structure into `app/home-client.tsx`:

**Keep from existing `home-client.tsx`:**
- The auth-redirect-to-dashboard `useEffect` at the top (currently lines ~25–29) — this is the SSR-safe loader that the SEO Action Plan called out as critical
- The 5 platform icon component definitions (Instagram, LinkedIn, X, Facebook, TikTok) — already updated in Phase 1 with no hardcoded color
- `'use client'` directive at top — preserved
- `SiteHeader` and `SiteFooter` imports

**Replace with v2 content:**
- Hero (matrix layout: small top H1 line + big bottom matrix line)
- 4-step capability tour (Upload, Platform, Tone, Language) + step 5 reveal
- Audience cards (3)
- Comparison table
- 9-voice gallery (cherry-pick the 9 voice samples from `app/v2/[locale]/page.tsx`)
- 6-language section
- "Built for every platform" link strip → links to the 5 Phase 1 routes
- FAQ
- Final CTA

**Adopt site chrome:**
- Use `<SiteHeader variant="marketing" />` instead of v2's inline header
- Use `<SiteFooter />` instead of v2's inline footer
- Drop the `dir={dir}` and locale logic (English only, like Phase 1)

#### 2. Add SoftwareApplication schema to homepage `app/page.tsx`

Currently the homepage relies on the sitewide `Organization` + `WebSite` schema in `app/layout.tsx`. The v2 homepage already has its own `SoftwareApplication` schema block in `app/v2/[locale]/page.tsx`. Lift that into `app/page.tsx` (or as a JSON-LD `<script>` injected via `home-client.tsx`).

#### 3. Update `app/page.tsx` metadata
Currently uses sitewide metadata template. Add page-specific:
- `title`: "AI Social Media Post Generator | Captions for 5 Platforms — Klinchapp"
- `description`: tightened to ≤160 chars, leading with primary keyword
- `alternates.canonical`: `https://www.klinchapp.com/`
- `openGraph` + `twitter` per-page (currently inheriting sitewide)

#### 4. Move v2 mockup assets

The v2 homepage uses `/v2-mockup/shoe.png` (the line-art slip-on). Phase 1 platform pages use `/v2-mockup/{cafe,linen-dress,vitamin-c-serum}.png`. The path name "v2-mockup" looks staging-y on production.

**Recommend:** rename `public/v2-mockup/` → `public/sample-posts/` (or `public/mockups/`). Update all references in:
- `lib/platforms/{instagram,linkedin,twitter,facebook,tiktok}.ts` (3 image paths each = 15 references)
- `app/home-client.tsx` (1 reference: shoe.png in ProductCard)

This is a find-replace — low risk. Could also defer to a separate cleanup PR if time-constrained.

#### 5. Delete `/v2/` directory

```
rm -rf app/v2/
```

Removes:
- `app/v2/[locale]/page.tsx` (the v2 homepage — content already moved into `app/home-client.tsx`)
- `app/v2/_configs/locales.ts` (only used by v2 homepage)
- `app/v2/layout.tsx` (the noindex banner — no longer needed)
- `app/v2/v2.css` (CSS used only by v2 staging)

The CSS classes `v2-mockup-banner`, `v2-banner-spacer`, `v2-coming-soon`, `v2-ai-sample-badge`, `v2-rtl-flip` are referenced from the v2 homepage. The `v2-ai-sample-badge` is also used by the production platform pages (`app/components/platform-page.tsx`). **Either rename the class or move the CSS rule into a non-v2 location** before deleting `app/v2/v2.css`.

Recommend: move `v2-ai-sample-badge` rule to `app/globals.css` and rename to `ai-sample-badge`. Update references in `app/components/platform-page.tsx` (5 occurrences inside the card variants).

### Post-work (15 min)

- Local dev verify (`npm run dev`):
  - `/` renders the new v2 homepage layout
  - `/v2/en` returns 404 (deleted)
  - All 5 platform pages still render (chrome unchanged)
- Lighthouse / PageSpeed check on `/` — confirm SSR hasn't regressed
- Commit, push, open PR
- Vercel preview smoke test:
  - Schema validates in Rich Results Test
  - Mobile + desktop layouts read correctly
  - Internal links work
  - Sample images load
- Merge → Vercel auto-promotes

### Sitemap

`app/sitemap.ts` already has the homepage entry. No sitemap change needed for Phase 2.

### Memory cleanup after Phase 2 ships

- Update `~/.claude/projects/.../memory/project_v2_cutover_phase1.md` → "Phase 1 + 2 both shipped"
- Update `~/.claude/projects/.../memory/project_v2_cutover_notes.md` → mark hover treatment item as completed (already migrated)
- Update `Klinchapp V2/decisions-log.md` → append D16 (Phase 2 executed)

---

## What's NOT in Phase 2

- Translated content for non-EN locales — defer to Phase 3 (real translations)
- Use Cases / `/for-X` audience pages — deferred per `New Functionality/SEO/SEO-Action-Plan.md`
- Comparison pages (`/vs/X`) — deferred
- Free tools — deferred
- `aggregateRating` schema — deferred until real reviews exist

These are tracked in `New Functionality/SEO/SEO-Action-Plan.md` as part of the long-term backlog.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Live homepage layout regression on a device class we didn't test | Vercel preview is the smoke test. Hit it on phone + tablet + desktop before merging. |
| SSR auth-redirect breaks (the `useEffect` from current `home-client.tsx`) | Keep that `useEffect` intact when porting the v2 layout. Don't remove it. |
| `v2-ai-sample-badge` CSS class deletion breaks platform pages | Rename + move BEFORE deleting `app/v2/v2.css`. Verify platform pages render with the badge after the rename. |
| Image path rename breaks Phase 1 platform pages | Rename + update all references in same commit. Local dev verify all 5 pages render before pushing. |
| GSC re-indexing takes time on the new homepage | Accept it. URL Inspection in GSC + sitemap submission usually triggers within days. |

---

## When NOT to fire Phase 2

- Phase 1 hasn't been live for at least 5 days
- Search Console shows manual action warnings or canonical issues
- Real users have reported bugs on Phase 1 pages
- You haven't personally clicked through `/v2/en` end-to-end
- It's late Friday and there's nobody around to monitor the deploy

If any of these → wait.

---

## Quick sign-off checklist (paste into the PR description)

- [ ] Phase 1 has been live for ≥5 days
- [ ] GSC shows Phase 1 platform pages indexed (or trending toward indexed)
- [ ] No regression in `/ai-*-post-generator` traffic
- [ ] V2 homepage at `/v2/en` reviewed end-to-end on mobile + desktop
- [ ] CSS class `v2-ai-sample-badge` renamed and moved out of `v2.css`
- [ ] Image paths renamed from `/v2-mockup/` (or deferred to follow-up)
- [ ] `useEffect` auth redirect preserved in `home-client.tsx`
- [ ] Schema validates in Rich Results Test on Vercel preview
- [ ] Mobile layout verified
- [ ] `/v2/en` returns 404 after deletion
- [ ] All 5 platform pages still render correctly
