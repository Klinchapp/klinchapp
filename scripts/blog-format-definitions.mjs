/**
 * Canonical definitions of Kira's blog post format types.
 *
 * Single source of truth shared between:
 *   - blog-planner.mjs (assigns a format when generating new series blueprints)
 *   - blog-pipeline.mjs (writes posts using the assigned format's instructions)
 *
 * Each format declares:
 *   description     — what kind of post this format produces
 *   lengthWords     — target word count
 *   sgeOpening      — required opening structure (for AI Overviews / SGE citation)
 *   structuralBlock — whether the post must include a FAQ or HowTo block (for FAQPage / HowTo schema)
 *
 * Adding or modifying a format here is the editorial governance lever:
 * Kira chooses freely from the formats listed, but the format she chose
 * carries the structural contract defined below.
 */

export const BLOG_FORMATS = {
  'deep-analysis': {
    description:
      'In-depth analytical piece. Explore the topic with research, data, multiple perspectives, and nuanced conclusions. Structure with clear sections building a logical argument.',
    lengthWords: '800-1000',
    sgeOpening:
      'First paragraph: state the conclusion of your analysis in 1-2 sentences declaratively. Then build the narrative around it.',
    structuralBlock:
      'Optional FAQ block — include 3-5 Q&A pairs (each ### question ending with "?") covering common sub-questions if they fit naturally. Skip if forced.',
  },
  'opinion': {
    description:
      'Opinionated piece where you (Kira) take a clear stance and argue it. Be bold, back your position with evidence, and acknowledge counterarguments. Let your personality show.',
    lengthWords: '800-1000',
    sgeOpening:
      'Declare your stance in sentence one, definitively. Build the case after.',
    structuralBlock:
      'NONE — opinion pieces argue a stance; structured Q&A would weaken the voice. Skip both FAQ and HowTo blocks.',
  },
  'how-to-guide': {
    description:
      'Step-by-step practical guide. Focus on actionable instructions the reader can follow immediately.',
    lengthWords: '600-800',
    sgeOpening:
      'Open with: "Here is how to [accomplish the task] in [N] steps:" — no narrative warm-up before the steps.',
    structuralBlock:
      'REQUIRED HowTo block — a numbered list of 5-8 clearly-actioned steps. Each step starts with a bold action verb (e.g. "**Open** ..." / "**Configure** ..."). This is the core deliverable; it must be present.',
  },
  'tool-review': {
    description:
      'Practical review/comparison piece. Evaluate specific tools or platforms with pros, cons, pricing, and real use cases. Be fair and specific — name names.',
    lengthWords: '600-800',
    sgeOpening:
      'Open with a 1-paragraph TL;DR recommendation: which tool wins for which use case, named explicitly.',
    structuralBlock:
      'REQUIRED FAQ block (3-5 Q&A pairs near the end, each ### question ending with "?") AND a TL;DR comparison table near the top. The FAQ should cover: "Which tool is best for X?", "Does Y support Z?", "What is the free tier?", and similar.',
  },
  'research-breakdown': {
    description:
      'Summarise and contextualise research findings or industry data. Make academic or complex findings accessible. Explain why the data matters and what readers should do about it.',
    lengthWords: '600-800',
    sgeOpening:
      'Lead with the key finding as a citable factual statement in the first sentence, then explain the context.',
    structuralBlock:
      'REQUIRED FAQ block — 3-5 Q&A pairs (each ### question ending with "?") addressing common reader questions about the research findings.',
  },
  'roundup': {
    description:
      'Curated summary of recent developments. Cover 5-7 key items with brief analysis of each. Focus on what matters and why. Include links to original sources.',
    lengthWords: '600-800',
    sgeOpening:
      'Open with a 1-paragraph framing of why these developments matter together — not as separate news items.',
    structuralBlock:
      'Optional FAQ block — include if there are clear reader questions about the developments covered; skip if the roundup itself answers them.',
  },
}

/**
 * Full format definitions formatted for inclusion in a system or user prompt.
 * Used by blog-planner.mjs so Kira knows what each format requires when she
 * assigns one to a new topic.
 */
export function formatDefinitionsForPrompt() {
  return Object.entries(BLOG_FORMATS)
    .map(([key, def]) => {
      return `- "${key}":
  ${def.description}
  Length: ${def.lengthWords} words.
  Opening (SGE): ${def.sgeOpening}
  Structural block: ${def.structuralBlock}`
    })
    .join('\n\n')
}

/**
 * The single-format instruction string used by blog-pipeline.mjs in the
 * generateContent userPrompt. Falls back to deep-analysis if format is unknown.
 */
export function getFormatInstruction(format) {
  const def = BLOG_FORMATS[format] || BLOG_FORMATS['deep-analysis']
  return `${def.description}

Length target: ${def.lengthWords} words. Tight beats long; cut every sentence that doesn't earn its place.

Opening (this matters for AI Overviews / SGE extraction): ${def.sgeOpening}

Structural block requirement: ${def.structuralBlock}`
}
