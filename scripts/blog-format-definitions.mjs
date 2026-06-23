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
 *   titleShape      — how titles for this format should be phrased (for AI-citation queries)
 *
 * Adding or modifying a format here is the editorial governance lever:
 * Kira chooses freely from the formats listed, but the format she chose
 * carries the structural contract defined below.
 */

export const BLOG_FORMATS = {
  'deep-analysis': {
    description:
      'In-depth analytical piece. Explore the topic with research, data, multiple perspectives, and nuanced conclusions. Structure with clear sections building a logical argument.',
    maxWords: 800,
    lengthWords: '800 MAXIMUM (hard ceiling, not a target)',
    sgeOpening:
      'First paragraph: state the conclusion of your analysis in 1-2 sentences declaratively. Then build the narrative around it.',
    structuralBlock:
      'Optional FAQ block — include 3-5 Q&A pairs (each ### question ending with "?") covering common sub-questions if they fit naturally. Each answer 40-80 words — complete, self-contained, citable. Skip if forced.',
    titleShape:
      'Thesis-framed — declarative title stating your conclusion or central argument (e.g. "AI content scales — quality doesn\'t"). Avoid question-framed titles for analysis pieces; the title should signal the take, not ask one.',
  },
  'opinion': {
    description:
      'Opinionated piece where you (Kira) take a clear stance and argue it. Be bold, back your position with evidence, and acknowledge counterarguments. Let your personality show.',
    maxWords: 800,
    lengthWords: '800 MAXIMUM (hard ceiling, not a target)',
    sgeOpening:
      'Declare your stance in sentence one, definitively. Build the case after.',
    structuralBlock:
      'NONE — opinion pieces argue a stance; structured Q&A would weaken the voice. Skip both FAQ and HowTo blocks.',
    titleShape:
      'Stance-framed — declarative, opinionated, contrarian where honest (e.g. "Why most AI marketing advice is wrong"). Don\'t hedge in the title; don\'t pose as a question. The reader should know your position before they click.',
  },
  'how-to-guide': {
    description:
      'Step-by-step practical guide. Focus on actionable instructions the reader can follow immediately.',
    maxWords: 600,
    lengthWords: '600 MAXIMUM (hard ceiling, not a target)',
    sgeOpening:
      'Open with: "Here is how to [accomplish the task] in [N] steps:" — no narrative warm-up before the steps.',
    structuralBlock:
      'REQUIRED HowTo block — a numbered list of 5-8 clearly-actioned steps. Each step starts with a bold action verb (e.g. "**Open** ..." / "**Configure** ..."). This is the core deliverable; it must be present.',
    titleShape:
      'Question-framed where natural — "How do I X?" / "How to X in N steps" / "What is the best way to Y?". Conversational, the way someone would type the query into ChatGPT or Google.',
  },
  'tool-review': {
    description:
      'Practical review/comparison piece. Evaluate specific tools or platforms with pros, cons, pricing, and real use cases. Be fair and specific — name names.',
    maxWords: 600,
    lengthWords: '600 MAXIMUM (hard ceiling, not a target)',
    sgeOpening:
      "Open with a single direct-answer paragraph naming which tool wins for which use case. Do NOT label this paragraph 'TL;DR' or use any meta-label as a section heading — write a real conversational H2 (e.g. 'Which AI resume builder should you actually use?') and put the direct-answer paragraph under it.",
    structuralBlock:
      'REQUIRED FAQ block (3-5 Q&A pairs near the end, each ### question ending with "?") AND a TL;DR comparison table near the top. The FAQ should cover: "Which tool is best for X?", "Does Y support Z?", "What is the free tier?", and similar. Each answer 40-80 words — complete, self-contained, citable.',
    titleShape:
      'Comparison- or recommendation-framed — "What is the best AI X for Y?" / "X vs Y: which wins for Z?" / "The best AI X tools for Y in 2026". Real users phrase tool questions as comparisons or best-of queries; the title should match.',
  },
  'research-breakdown': {
    description:
      'Summarise and contextualise research findings or industry data. Make academic or complex findings accessible. Explain why the data matters and what readers should do about it.',
    maxWords: 600,
    lengthWords: '600 MAXIMUM (hard ceiling, not a target)',
    sgeOpening:
      'Lead with the key finding as a citable factual statement in the first sentence, then explain the context.',
    structuralBlock:
      'REQUIRED FAQ block — 3-5 Q&A pairs (each ### question ending with "?") addressing common reader questions about the research findings. Each answer 40-80 words — complete, self-contained, citable.',
    titleShape:
      'Findings-framed — lead with the headline data point ("67% of marketers do X — and what it means") OR question-framed if the research clearly answers a specific user question ("What percentage of X actually Y?"). Either shape is good; pick the one that better signals the citable fact.',
  },
  'roundup': {
    description:
      'Curated summary of recent developments. Cover 5-7 key items with brief analysis of each. Focus on what matters and why. Include links to original sources.',
    maxWords: 600,
    lengthWords: '600 MAXIMUM (hard ceiling, not a target)',
    sgeOpening:
      'Open with a 1-paragraph framing of why these developments matter together — not as separate news items.',
    structuralBlock:
      'Optional FAQ block — include if there are clear reader questions about the developments covered; skip if the roundup itself answers them. Each answer 40-80 words — complete, self-contained, citable.',
    titleShape:
      'List-framed and time-anchored — "5 AI X developments to watch in Q3 2026" / "What\'s changing in AI Y this quarter". The number and the time anchor are what makes a roundup citable.',
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
  Structural block: ${def.structuralBlock}
  Title shape: ${def.titleShape}`
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

LENGTH: ${def.lengthWords} words. This is a HARD CEILING, not a target. Going over is a failure. If you find yourself approaching the ceiling with sections left to write, CUT WHOLE SECTIONS — do not just tighten prose. Count your words.

Opening (this matters for AI Overviews / SGE extraction): ${def.sgeOpening}

Structural block requirement: ${def.structuralBlock}`
}

/**
 * The numeric hard ceiling for this format. Used by the pipeline's userPrompt
 * to inject the exact number as a requirement (e.g. "MAXIMUM 600 WORDS").
 * Falls back to deep-analysis's 800 if format is unknown.
 */
export function getMaxWords(format) {
  return (BLOG_FORMATS[format] || BLOG_FORMATS['deep-analysis']).maxWords
}
