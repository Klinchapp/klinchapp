# Decisions Log

Append-only record of design decisions. The point: future sessions don't relitigate.

Format: each entry has **Context** (why we needed to decide), **Decision** (what we picked), **Why** (the reasoning), and where useful **Migration debt** (what this leaves to clean up later).

---

## 2026-05-02 — Session 1

### D1. Layout: kill the 3-step explainer

**Context.** The current `/ai-instagram-post-generator` and `/ai-linkedin-post-generator` pages follow a generic SaaS template (hero → 3-step → 4 features → FAQ → CTA). This pattern mirrors `socialpost.ai/free-post-generator` structurally — same beats, same "Pick Platform & Tone" middle step. User flagged this as "shambolic."

**Decision.** Replace the template with: output-first hero teaser, 9-tone gallery (one product, all tones), annotated caption anatomy, small FAQ, quiet CTA. No 3-step explainer, no feature checkmark grid, no testimonials.

**Why.** The 3-step explainer is a description of the tool. The new layout is a *demonstration* of the tool. Demonstration is harder to copy and harder to confuse with competitors.

---

### D2. Architecture: one template + N configs

**Context.** Previous IG and LinkedIn pages were near-clones, hand-edited. Causes drift, layout-platform coupling, untested cross-platform assumptions. User pushed back hard on shipping IG-first ("can't be selective with A, do it properly and then hit the wall with C").

**Decision.** Single `<PlatformGeneratorPage config={...} />` template. Per-platform `PlatformConfig` objects. Route files are 4-line passthroughs.

**Why.** Forces every layout decision to work for every platform. If a section fails on X (280 chars) or TikTok (caption-as-thumbnail), the contract fails at compile time and we see it before shipping. The previous approach would have shipped IG, looked smart, and broken at TikTok.

---

### D3. Tone set: keep mandatory 5, add 4

**Context.** The dashboard mood selector at `app/dashboard/page.tsx:416` exposes 5 tones: Professional, Casual, Enthusiastic, Humorous, Inspirational. User confirmed these are mandatory ("they are mandatory. Then you can add yours").

**Decision.** 9 total tones. Mandatory 5 plus Luxe, Witty, Founder, Bold.

**Why.** Mandatory 5 must match what the dashboard offers — otherwise the marketing pages over-promise voices the product doesn't ship. The 4 additions cover voice gaps: premium (Luxe), dry/clever (Witty distinct from Humorous), narrative (Founder), declarative/contrarian (Bold). 9 fits a clean 3×3 grid on desktop.

**Migration debt.** When a tone is added/removed in the dashboard, this list must be updated to match. The `Tone` union in `_configs/tones.ts` should be the single source of truth and the dashboard should consume from there in a future session.

---

### D4. Locale routing: locale segment INSIDE /v2/

**Context.** I initially proposed `/es/v2/ai-instagram-post-generator` (locale-first, mirroring the eventual production target).

**Decision.** Use `/v2/[locale]/ai-instagram-post-generator` instead — locale segment INSIDE the v2 namespace.

**Why.** Locale-first requires moving every existing route under `app/[locale]/...`, which is a full-site i18n migration. That's a separate, larger task. Containing locale within `/v2/` lets us experiment without disturbing the live site.

**Migration debt.** When v2 is promoted to canonical, full-site i18n migration must follow. Live routes (`/blog`, `/contact`, `/dashboard`, `/ai-instagram-post-generator`) all move under `app/[locale]/`. Middleware redirect from `/foo` → `/en/foo` for default English. Tracked here so it doesn't get forgotten.

---

### D5. Multilingual content phasing

**Context.** Klinchapp supports 6 languages (`en`, `es`, `pt`, `fr`, `ar`, `hi`) at the generator API level (`app/api/generate/route.ts:7`). Marketing pages are currently English-only. User: "we are multi-lingual."

**Decision.** Build the i18n structure (PlatformConfig fields are `Record<Locale, ...>`, locale switcher in header, RTL handling for Arabic, hreflang tags) NOW. Write English content for IG and LinkedIn this session. Non-English locales render English fallback with a "Coming soon" badge until samples are generated.

**Why.** Hand-writing 750+ captions across 6 languages before the layout is approved is wasted work. Once layout is signed off, generate non-English samples — likely using Klinchapp's own API. Perfect dogfooding for marketing pages selling AI captions.

**Migration debt.** Non-English content must be written in a follow-up session. Tracked as a separate task per (platform, locale) cell — 5 platforms × 5 non-English locales = 25 cells once all platforms are live.

---

### D6. Platform scope this session

**Context.** Klinchapp targets 5 platforms (IG, LinkedIn, X, Facebook, TikTok). Only IG and LinkedIn have live pages. User: "all social media platforms will have their own pages — at present there are pages for LI and IG. Others will follow in a few sessions."

**Decision.** Build IG and LinkedIn configs in full this session. FB, TikTok, X get stub configs (`ready: false`) that satisfy the type system. Their route files render a "Coming soon" placeholder.

**Why.** User explicitly scoped this session. Template still designed against all 5 — the constraint that makes the design work is "every platform fits the same template." Stubs ensure that constraint is held even when content isn't there yet.

---

### D7. Approval workflow

**Context.** User: "Scope is to design a fully functional site and test it locally (local host). No shipping till signed-off."

**Decision.** Build on `/v2/`. Pages have `noindex, nofollow`. User reviews on localhost via `npm run dev`. On approval: copy `/v2/[locale]/<page>/page.tsx` content into the canonical route, delete `/v2/`. No staging deploys, no canonical changes, no shipping until explicit sign-off.

**Why.** Direct user requirement.

---

### D8. Documentation: top-level "Klinchapp V2" folder

**Context.** User: "Important - document everything. Happy to have a new folder if required. Klinchapp V2 or whatever you feel like."

**Decision.** Create `Klinchapp V2/` at repo root with 5 docs: README, architecture, config-schema, content-guide, decisions-log. Code in `app/v2/` references back to this folder; documentation does not live in code comments.

**Why.** Decisions are append-only and stable; code is volatile. Mixing them causes either stale doc-comments or undocumented decisions. Top-level folder mirrors existing `New Functionality/` capitalisation convention. Folder name proposed by user.

---

### D10. No fabricated social proof. Anywhere. Ever.

**Context.** The current homepage CTA at `app/home-client.tsx:138` says "Join thousands of creators and businesses using Klinchapp." This is a false claim — AI-generated boilerplate that survived to production. User flagged it.

**Decision.** Ban all fabricated metrics, customer counts, testimonials, awards, press mentions, or scale claims across the v2 site. CTA copy uses verifiable, factual statements only ("Free plan", "60 posts/month", "No credit card"). The candle brand "Maison Brûlée" is clearly framed as a *sample* (it's the gallery product, never claimed as a real customer).

**Extension (also covered):** ban unverifiable quality claims ("native," "best-in-class," "industry-leading," "fluent," "expert"). Same root cause — claims a visitor can't verify and that the product can't guarantee. The honest framing is **"AI-generated"** + factual qualifier (e.g., "AI-generated, in 6 languages" — not "Native, not translated"). Lean into "AI-generated" as the positioning rather than dressing it up; the entire pitch is AI generation, hiding the label is incoherent. All caption demonstrations carry an "AI sample output" badge so visitors don't read them as real customer posts.

**Why.** False claims about customers/scale erode trust the moment they're noticed, and they're easy to notice. Klinchapp's actual differentiation (multi-platform, multi-tonal, multi-lingual) is strong on its own merits — no need to oversell.

**Migration debt.** The live homepage at `app/home-client.tsx:138` still has the false claim. Separate from v2 work: should be fixed in production immediately, not waiting for v2 promotion. Tracked here.

---

### D12. Lead with image-upload USP, not text-prompt

**Context.** First mockup hero showed a *text* prompt as the input ("Saffron & cedar candle. Hand-poured in Brooklyn..."). User flagged this as a structural miss: Klinchapp's actual differentiator vs every other AI text generator is **image upload + AI vision** (`app/api/generate/route.ts:31-39` uses Claude vision on the uploaded image). Text-only is the *fallback* in the API, not the lead.

**Decision.** Hero pitch: "Upload your product. Klinchapp writes the posts." Image upload + a "What Klinchapp sees" panel showing extracted attributes (Category, Vessel, Cues, Mood) is shown as Step 1 in the how-it-works tour. Text-only flow is acknowledged as a fallback ("No image yet? Type a description instead — Klinchapp handles both flows") — never as the primary positioning.

**Why.** A SaaS landing page lives or dies on its first sentence. "Generate AI posts" describes every text generator. "Upload your product, AI sees what you sell, posts written for every platform" describes only Klinchapp. Lead with what's unique.

---

### D13. Capability-tied 4-step tour (not generic explainer)

**Context.** I had previously argued against "How it works" 3-step explainers because socialpost.ai's "Describe Your Post / Pick Platform & Tone / Copy & Publish" is empty abstraction. User then proposed a 4-step walkthrough (Upload / Platform / Tone / Language) and asked if I saw the direction.

**Decision.** Build the 4-step section, with each step *tied to a specific Klinchapp capability* — not abstracted ("Upload" = AI vision, "Platform" = 5 platforms with char limits, "Tone" = 9 voices, "Language" = 6 incl. RTL). Step 5 is the reveal: "270 unique posts from a single upload" + the cross-platform matrix as the payoff.

**Why.** Generic 3-step is bad because it says nothing. **Capability-tied 4-step is good because every step IS a differentiator made visible**. By the time the visitor finishes step 4, they've seen every reason Klinchapp beats a text-only generator. The downstream sections (voice gallery, multilingual proof, platform deep-dives) become evidence/expansions of steps 3, 4, and 2 respectively — making the page architecturally cohesive.

**The principle going forward:** Reject generic explainers. Accept walkthroughs where every step demonstrates a specific capability that competitors lack.

---

### D11. Homepage redesign first, platform pages second

**Context.** I had scoped v2 work as platform pages only (IG, LinkedIn). User correctly pushed back: the redesign should anchor on the homepage. The homepage at `app/home-client.tsx` has the same SaaS template echo (hero → feature grid → "How to create AI social media posts in 3 steps" → platform grid → CTA) — same problem, more visible.

**Decision.** Redesign the homepage *first* as a static HTML mockup (`Klinchapp V2/mockups/homepage-en.html`). Platform pages come after the homepage layout is signed off. Platform-page docs (architecture, config-schema, content-guide) remain accurate but cover only deep-dive pages.

**Why.** Front door before sub-pages. The homepage is higher traffic and sets visual identity for the rest of the site. Platform pages should feel like deep-dives *of* the homepage's thesis, not standalone sites.

**Architecture relationship:** Homepage = the thesis (5 platforms × 9 voices × 6 languages, demonstrated). Platform pages = deep dives per platform.

---

### D15. Phase 1 cutover EXECUTED (2026-05-03)

**Context.** The v2 platform-page work (D1–D14) was reviewed and approved on 2026-05-02. SEO scan against the three audit reports (Wren / Claude / Gemini) confirmed pages met every load-bearing recommendation: keyword-led H1s, FAQPage + BreadcrumbList + SoftwareApplication schema, descriptive alt text, canonical URLs, OpenGraph + Twitter Card per route, `<main>` semantic wrapper, meta descriptions ≤160 chars. User approved cutover with English-only scope.

**Decision.** Single bundled PR ([#15](https://github.com/Klinchapp/klinchapp/pull/15), commit `e049a25`). Five platform pages migrated to canonical URLs:

- `/ai-instagram-post-generator` (replaces existing live page — drops fabricated brands like Rosewood Café, Lumière, Maison Linen)
- `/ai-linkedin-post-generator` (replaces existing live page — drops fabricated identities like Sarah Chen / Northbeam Analytics, Marcus Reid / Halcyon Labs)
- `/ai-twitter-post-generator` (new — slug uses "twitter" per existing convention even though brand is "X"; users still search "twitter post generator")
- `/ai-facebook-post-generator` (new)
- `/ai-tiktok-caption-generator` (new — "caption-generator" matches existing convention since TikTok captions accompany videos)

**File migrations:**

| Was (in v2 staging) | Is now (in production) |
|---|---|
| `app/v2/_components/platform-page.tsx` | `app/components/platform-page.tsx` |
| `app/v2/_configs/platform-types.ts` | `lib/platforms/types.ts` |
| `app/v2/_configs/platforms/instagram.ts` | `lib/platforms/instagram.ts` |
| `app/v2/_configs/platforms/linkedin.ts` | `lib/platforms/linkedin.ts` |
| `app/v2/_configs/platforms/x.ts` | `lib/platforms/twitter.ts` (slug `'x'` → `'twitter'`, routePath unchanged-ish) |
| `app/v2/_configs/platforms/facebook.ts` | `lib/platforms/facebook.ts` |
| `app/v2/_configs/platforms/tiktok.ts` | `lib/platforms/tiktok.ts` (routePath `'ai-tiktok-post-generator'` → `'ai-tiktok-caption-generator'`) |
| `app/v2/[locale]/ai-{platform}-post-generator/page.tsx` | `app/ai-{platform}-{post|caption}-generator/page.tsx` |

**Side changes that rode along:**

- `app/home-client.tsx`: platform grid 5 cards now all link to live URLs (Coming Soon pills gone for X/FB/TT). V2 hover treatment applied (icon background flips light → dark purple, glyph flips purple → white on hover). Fabricated "Join thousands of creators and businesses using Klinchapp" CTA microcopy replaced with honest "Free plan · 60 posts/month · No credit card required."
- `app/sitemap.ts`: 3 new platform routes added.
- `app/dashboard/page.tsx`: 4 new tones (Luxe, Witty, Founder, Bold) added to the mood selector. The generate API at `app/api/generate/route.ts:31-39` takes `mood` as a free string, so no backend change needed. The marketing claim of "9 voices" now matches what the dashboard actually offers — closes the D10 honesty gap on tone count.
- V2 staging cleanup: 5 v2 platform routes deleted (replaced by canonical URLs); shared template + configs moved out of `/v2/` to production locations; locale codes in `app/v2/_configs/locales.ts` trimmed from 6 to `['en']` only — non-EN routes had served fallback English with a coming-soon banner and would have been flagged as duplicate / thin content if exposed.

**What's deliberately NOT in this cutover:**

- V2 homepage (`/v2/en`) — Phase 2, separate decision (see `Phase2-Plan.md`).
- Translated content for non-EN locales — locale codes trimmed in v2 until real translations exist.
- Migration of `public/v2-mockup/` image paths to a non-staging-named location — minor cleanup, deferred.

**Why bundled PR instead of one-per-platform.** The work is interrelated (template + 5 configs + sitemap + homepage grid + dashboard), and earlier user feedback validated single bundled PRs for cohesive features ("the single bundled PR was the right call here, splitting this one would've just been churn"). Splitting into 5 platform PRs would have forced re-importing the template per PR and was not the right shape for this work.

**Migration debt resolved by this entry.** D7's "approval workflow" (build on /v2/, copy to canonical, delete /v2/) is partially executed — platform pages followed it; homepage Phase 2 is the remaining bit. D10's homepage fabrication ("Join thousands of creators") is now fixed in production, closing the D10 migration debt note. D5's English-only-first phasing executed as planned.

---

### D14. Demo product: line-art shoe + "Your Brand" placeholder, not a fictional brand identity

**Context.** The original gallery product was a fictional candle brand "Maison Brûlée" (Saffron & Cedar). User flagged this is itself a form of fabrication — we never asked permission, the name might collide with a real brand, and "Sarah Chen, Founder of Maison Brûlée" reads exactly like a fake testimonial even though we'd labeled it sample. The user offered a real shoe brand "OUTGEAR" with permission, then proposed an even cleaner alternative: line-art illustration + generic placeholder branding.

**Decision.** The canonical demo product is now: **a monoline SVG line-illustration of a slip-on knit sneaker** (matches the existing site's icon language at `app/home-client.tsx:15-19`, `stroke-width="2"`/2.5, `text-[#6B2C6B]`). Brand chrome across all platform mockups uses **placeholder identity**: "Your Brand" / `@yourbrand` / brand-as-poster on LinkedIn (no fabricated person). All hashtag stacks drop brand-specific tags (`#MaisonBrulee`, `#OUTGEAR`) — only generic tags remain (`#NewDrop`, `#SlipOnSneakers`, `#FirstDrop`).

**Why.** Solves four problems at once:
1. No real brand to license or ask permission of.
2. No fictional identity that could collide with a real existing business.
3. Visually consistent with the site's existing monoline icon language (Klinchapp uses inline SVGs throughout, not photography).
4. The "Your Brand" framing reads as "this is what *your* posts will look like" — which is the actual demo intent. A specific brand name (real or fictional) creates ambiguity about whether it's a customer or a sample.

**Trade-off.** Line art is less photorealistic than a real product photo. The "AI vision sees what you sell" demo is slightly less visceral. We accept this — the page is illustrative, not literal, and the visitor knows the actual app accepts photos. The "What Klinchapp sees" panel showing extracted attributes (Category, Style, Color, Mood) carries the AI-vision idea regardless of input fidelity.

**Migration debt — supersedes D9.** The candle/Maison Brûlée brief in `content-guide.md` is replaced by the slip-on sneaker brief. All ~20 captions in the v2 homepage rewritten for sneaker context. When (if) we use real customer brands later — for case studies on a separate page, with explicit permission — that's a different design pattern, not the homepage demo.

**Extension to D10.** Fabricated brand identities (fictional brands inventing customers) are now explicitly banned alongside fabricated metrics, customer counts, testimonials, awards, and unverifiable quality claims. Same root cause — claims a visitor can't verify and that the product can't substantiate.

---

### D9. Canonical gallery product: Saffron & Cedar candle (Maison Brûlée) [SUPERSEDED by D14]

**Context.** The 9-tone gallery requires holding the product constant so voice is the only variable. Same product needed across 5 platforms.

**Decision.** Saffron & Cedar candle, fictional brand "Maison Brûlée," hand-poured in Brooklyn. See `content-guide.md` for full brief.

**Why.** Plausible content for every platform: visual on IG, founder story on LinkedIn, witty on X, community on Facebook, unboxing on TikTok. Premium positioning makes the Luxe tone shine without being out of reach for Casual. Doesn't require domain expertise from the reader.

**Migration debt.** If we change the gallery product later, all 270 captions (5 platforms × 9 tones × 6 locales) need rewriting. Pick once, pick well.
