/**
 * Detect FAQ and HowTo blocks in a markdown blog post body so we can emit
 * matching JSON-LD schema. These structures are produced by Kira when she
 * writes in a format that requires them (see scripts/blog-format-definitions.mjs).
 *
 * Detection is intentionally conservative — if the structure isn't clearly
 * present, return null and we just emit the Article schema as before.
 */

/** Strip basic markdown formatting so answer text reads cleanly as plain text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1') // italic
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → just the text
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
}

export interface FAQEntry {
  question: string
  answer: string
}

/**
 * Detect a FAQ block: 3+ consecutive H3 headings that end with "?",
 * each followed by answer text. Returns null if no qualifying block.
 *
 * Only the most prominent contiguous run of FAQ entries is returned —
 * we don't mix entries from different sections of the post.
 */
export function detectFAQ(content: string): FAQEntry[] | null {
  const lines = content.split('\n')
  const runs: FAQEntry[][] = []
  let currentRun: FAQEntry[] = []
  let currentQ: string | null = null
  let currentAnswerLines: string[] = []

  const closeCurrent = () => {
    if (currentQ && currentAnswerLines.length > 0) {
      const answer = stripMarkdown(currentAnswerLines.join(' '))
      if (answer.length > 10) {
        currentRun.push({ question: stripMarkdown(currentQ), answer })
      }
    }
    currentQ = null
    currentAnswerLines = []
  }

  const closeRun = () => {
    closeCurrent()
    if (currentRun.length >= 3) runs.push(currentRun)
    currentRun = []
  }

  for (const line of lines) {
    const h3Q = line.match(/^###\s+(.+\?)\s*$/)
    if (h3Q) {
      closeCurrent()
      currentQ = h3Q[1]
      continue
    }
    // Any non-H3-question heading ends the current run
    if (/^#{1,3}\s+/.test(line)) {
      closeRun()
      continue
    }
    if (currentQ) {
      const trimmed = line.trim()
      if (trimmed) currentAnswerLines.push(trimmed)
    }
  }
  closeRun()

  if (runs.length === 0) return null
  // Return the longest run
  return runs.sort((a, b) => b.length - a.length)[0]
}

export interface HowToStep {
  name: string
  text: string
}

/**
 * Detect a HowTo step list: 5+ numbered items in a single list, ideally
 * within or after a section heading that mentions "how to" or "step".
 * Returns null if no qualifying block.
 *
 * Each step: the bolded leading phrase becomes the step name; the rest is
 * the step text.
 */
export function detectHowTo(content: string): { name: string; steps: HowToStep[] } | null {
  const lines = content.split('\n')

  // Find candidate sections — H2 headings that mention "how to" or "step"
  let bestSectionHeading: string | null = null
  let bestSteps: HowToStep[] = []
  let currentSectionHeading: string | null = null
  let currentNumberedItems: string[] = []

  const flushList = () => {
    if (currentNumberedItems.length >= 5) {
      const steps: HowToStep[] = currentNumberedItems.map((raw) => {
        // Match leading bold "**Name.**" or "**Name**:" patterns
        const boldMatch = raw.match(/^\*\*([^*]+?)[\.\:\—]?\*\*\s*[\.\:\—]?\s*(.*)$/)
        if (boldMatch) {
          return {
            name: stripMarkdown(boldMatch[1].trim()),
            text: stripMarkdown(boldMatch[2].trim() || boldMatch[1].trim()),
          }
        }
        // Fall back: use first sentence as name
        const text = stripMarkdown(raw)
        const firstSentence = text.split(/[\.\!]/)[0]?.trim()
        return {
          name: firstSentence && firstSentence.length < 80 ? firstSentence : `Step`,
          text,
        }
      })
      // Prefer lists inside how-to sections
      const isPreferred =
        currentSectionHeading &&
        /how\s+to|step/i.test(currentSectionHeading)
      if (
        steps.length > bestSteps.length ||
        (isPreferred && steps.length >= bestSteps.length)
      ) {
        bestSteps = steps
        bestSectionHeading = currentSectionHeading
      }
    }
    currentNumberedItems = []
  }

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2) {
      flushList()
      currentSectionHeading = h2[1].trim()
      continue
    }
    const numbered = line.match(/^\d+\.\s+(.+)$/)
    if (numbered) {
      currentNumberedItems.push(numbered[1])
      continue
    }
    // Continuation of a list item (indented) — append to the last
    const continuation = line.match(/^\s{3,}(.+)$/)
    if (continuation && currentNumberedItems.length > 0) {
      currentNumberedItems[currentNumberedItems.length - 1] += ' ' + continuation[1]
      continue
    }
    // Blank line within a list is fine
    if (line.trim() === '' && currentNumberedItems.length > 0) continue
    // Any other content ends the list
    if (line.trim() !== '') {
      flushList()
    }
  }
  flushList()

  if (bestSteps.length < 5) return null
  return {
    name: bestSectionHeading || 'Steps',
    steps: bestSteps,
  }
}
