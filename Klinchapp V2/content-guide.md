# Content Guide

Reference for writing teaser pairs, gallery captions, anatomy annotations, and FAQs that don't sound like AI wrote them.

---

## The 9 tones

### Mandatory (also surfaced in the dashboard mood selector at `app/dashboard/page.tsx:416`)

#### 1. Professional
On-brand, formal, polished. The voice you'd expect from a brand's official channel.

> **IG:** "Introducing the Saffron & Cedar candle. Hand-poured in Brooklyn, single-batch, 60 hours of clean burn."
> **LI:** "After eighteen months of iteration, we're proud to launch our first scent: Saffron & Cedar."

#### 2. Casual
Relaxed, informal, conversational. Reads like a text from a friend who happens to run a candle company.

> **IG:** "ok so we made a candle. it smells like a fancy spa. just saying."
> **LI:** "Quick story. Spent two years thinking about candles. Made one. Here it is."

#### 3. Enthusiastic
High-energy, excited, exclamation-friendly without being shouty.

> **IG:** "It's HERE!! 🕯️ Our Saffron & Cedar candle just dropped and we're so excited we can hardly stand it."
> **LI:** "Today's the day! After eighteen months, our first scent is live. Saffron & Cedar — go light one."

#### 4. Humorous
Funny, light, self-aware. Pokes fun at the genre.

> **IG:** "Made a candle. Burned eight prototypes (literally). Here's the one that didn't smell like a campfire."
> **LI:** "Things I've done in the last eighteen months: burned through $40k of wax. Made a candle. Still married."

#### 5. Inspirational
Motivational, aspirational. The "you can do this" voice.

> **IG:** "Two years ago this was a hobby in a kitchen. Today it's our first product. Make the thing."
> **LI:** "Eighteen months. One scent. Hundreds of failures. The lesson: the candle isn't the product. The discipline is."

### Additions (Klinchapp v2 brings the gallery to 9)

#### 6. Luxe
Premium, restrained, magazine-cover voice. Short sentences. Sensory language. No exclamation marks.

> **IG:** "Cedar. Saffron. Slow burn. Hand-poured in single batch."
> **LI:** "On craft, restraint, and the discipline of a single scent."

#### 7. Witty
Dry, clever, observational. The voice of a smart friend at a dinner party.

> **IG:** "It's a candle. It smells expensive. We're not here to oversell it. (We are absolutely here to oversell it.)"
> **LI:** "Eighteen months ago I was 'going to make a candle.' Now I am 'a person who has made a candle.' This is growth."

#### 8. Founder
Story-driven, vulnerable, behind-the-scenes. First-person, narrative arc.

> **IG:** "I almost gave up in month nine. The wax cracked. Eighty units, gone. This candle is the one that didn't crack."
> **LI:** "We just shipped our first scent. Here's what eighteen months of trying to make a candle taught me about everything else."

#### 9. Bold
Declarative, contrarian. Take a position. Risk being wrong.

> **IG:** "Most candles are perfume in a jar. This one isn't."
> **LI:** "Stop calling things 'craft.' Either you spent eighteen months on it or you didn't. We did."

### How to keep tones distinct

If you can swap the captions between two tones and not notice the difference, one of them is wrong. Test:
- Casual ↔ Witty: Casual is *relaxed*; Witty is *clever*. Casual reads like texting. Witty reads like one-liner.
- Humorous ↔ Witty: Humorous is *funny* (you laugh). Witty is *clever* (you smirk and nod).
- Professional ↔ Luxe: Professional sounds like a brand. Luxe sounds like a magazine.
- Enthusiastic ↔ Inspirational: Enthusiastic is about the *moment* ("this just dropped!"). Inspirational is about the *idea* ("make the thing").

---

## The 5 platforms

| Platform | Char limit | Hashtags | Structure | Source of truth |
|----------|-----------|----------|-----------|-----------------|
| Instagram | 2200 | 5–10 at end | Hook, body, CTA. Emoji-friendly. Line breaks. | `app/api/generate/route.ts:70` |
| LinkedIn | 3000 | 2–3 | Strong hook (first 1–2 lines), short paragraphs, line-broken bullets, closing CTA. No emoji stacks. | `route.ts:72` |
| X (Twitter) | 280 | 1–2 (sparingly) | Hook is the whole post. Sometimes a kicker. Avoid hashtag stacks — looks spammy. | `route.ts:69` |
| Facebook | 63206 | 0–2 | Conversational, ends with question or invitation. 100–250 words sweet spot. | `route.ts:73` |
| TikTok | 2200 | 3–5 trending + 1–2 niche | Caption supports the video. Teaser line + hashtag stack. Sound credit if relevant. | `route.ts:71` |

### Platform mockup chrome

The `<PlatformMockup>` component renders the caption inside the platform's native UI. Each variant lives in `app/v2/_components/platform-mockup.tsx`.

| Platform | Mockup elements |
|----------|-----------------|
| Instagram | Avatar, handle, square image area with brand glow, action row (♡ 💬 ↗ ⋯), caption with hashtag stack in brand color |
| LinkedIn | Avatar, name, title line, "2d · 🌐", multi-paragraph body, engagement count row, action row (👍 Like, 💬 Comment, 🔄 Repost, 📤 Send) |
| X | Compact card, avatar, name + handle, single-block body, action row (💬 ♻ ❤ 📊 🔖) |
| Facebook | Avatar, name, time, body, like/comment/share row, blue link CTA |
| TikTok | Vertical card, video thumbnail placeholder, username, caption, hashtag stack, side engagement column (♡ 💬 ↗ ⋯) |

---

## The 6 languages

| Code | Language | Direction | Notes |
|------|----------|-----------|-------|
| `en` | English | LTR | Default |
| `es` | Spanish (Español) | LTR | |
| `pt` | Portuguese (Português) | LTR | Brazilian default |
| `fr` | French (Français) | LTR | |
| `ar` | Arabic (العربية) | **RTL** | Layout flips. Use logical Tailwind classes (`ms-*`, `me-*`). |
| `hi` | Hindi (हिन्दी) | LTR | Hinglish acceptable per generator API |

### Translation guidance

Hashtags follow the post's language: `#Mode` (FR), `#موضة` (AR), `#फैशन` (HI). Don't keep English hashtags in non-English posts — looks unnatural.

Per the generator API instructions (`route.ts:78-89`):
- "Write the ENTIRE post in [language]. Use [language] hashtags. Make it sound natural to native speakers. Do NOT mix English and [language]."
- For Hindi specifically: Hinglish style is acceptable when appropriate for the platform.

### RTL: what flips, what doesn't

| Flips in RTL | Stays the same |
|--------------|----------------|
| Page direction (`dir="rtl"`) | Logos, brand marks |
| Margins, padding (use `ms-*`, `me-*`) | Numbers (Western Arabic numerals: 60, 280, 2200) |
| Arrow direction (→ becomes ←) | Hashtags (typed RTL automatically) |
| Locale switcher position | Brand color tokens |

---

## The canonical gallery product

**Same product across all 5 platforms × 6 locales × 9 tones.**

### Brief

| Field | Value |
|-------|-------|
| Product | Saffron & Cedar candle |
| Brand | Maison Brûlée |
| Origin | Hand-poured in Brooklyn, NYC |
| Specs | 8oz, single-batch, 60-hour burn |
| Story | First scent after 18 months of development |
| Price point | Premium ($42) |

### Why this product

Plausible content for every platform without requiring domain knowledge from the reader:
- **Instagram** — visual, photogenic
- **LinkedIn** — founder story, "I built this in 18 months" hook
- **X** — witty (one-liners about candles write themselves)
- **Facebook** — community ("which scent should we make next?")
- **TikTok** — unboxing, behind-the-scenes pour

If a future content rewrite picks a different product, it must pass the same 5-platform plausibility test.

### Localized brand

The brand stays "Maison Brûlée" across all locales (it's the brand name, like "Apple" stays "Apple"). Product description and captions translate.

---

## Writing rules (apply to all content)

1. **Sound human.** Read it aloud. If it sounds like AI, it is. Cut "synergy." Cut "leverage." Cut "in today's world." Cut "elevate your brand." Cut "unleash your potential."
2. **One observation per sentence.** Long sentences are LinkedIn's enemy.
3. **Specific > generic.** "Eighteen months and 80 burned prototypes" > "After a lot of work."
4. **Avoid the word "amazing."** Show what it is. Let the reader decide if it's amazing.
5. **No marketing-speak transitions.** "But here's the thing." "What if I told you." Cut them.
6. **Hashtags should be niche-specific.** `#candle` is useless. `#sustainablecandles` is better. `#smallbatchcandles` is best.
7. **Numbers > adjectives.** "60-hour burn" beats "long-lasting." "$40k of wax" beats "lots of investment."
8. **Don't open with "In a world where..."** Don't ever.

---

## Anatomy annotation rules

When picking the caption to dissect:
1. The caption must be doing real structural work — i.e., not a one-liner.
2. Annotations must point to **substrings**, not vague regions.
3. Each annotation has a label (1–3 words) and a "why" (one sentence explaining why this works *on this platform*).

Bad annotation: `{ label: 'Hook', why: 'It hooks the reader.' }`
Good annotation: `{ label: 'Hook', why: 'First 7 words. LinkedIn collapses the rest behind "see more" — these have to earn the click.' }`

---

## Localization quality bar

For non-English content:
- Native-speaker review before sign-off (we'll use translators for the cycle after layout approval)
- Hashtags in target language
- No English idioms left untranslated ("at the end of the day," "the elephant in the room")
- Currency, date format, units adjusted (`$42` becomes `42€` in some locales — check brand guidance)
- Arabic captions tested in `dir="rtl"` rendering — no broken punctuation, no orphaned numbers
