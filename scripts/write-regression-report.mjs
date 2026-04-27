import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

const REPORTS_DIR = 'regression-reports'
const INDEX_FILE = path.join(REPORTS_DIR, 'INDEX.md')

const env = process.env

const trigger = env.TRIGGER || 'unknown'
const fullSha = env.COMMIT_SHA || ''
const sha = fullSha ? fullSha.slice(0, 7) : 'unknown'
const githubRunUrl = env.GITHUB_RUN_URL || ''

let commitMessage = '(unknown)'
try {
  if (fullSha) {
    commitMessage = execSync(`git log -1 --format=%s ${fullSha}`, { encoding: 'utf8' }).trim()
  }
} catch {
  // leave default
}

const buildStatus = env.BUILD_STATUS || 'skipped'
const buildDurationSec = parseInt(env.BUILD_DURATION || '0', 10)
const buildDurationStr = buildDurationSec ? `${buildDurationSec}s` : 'n/a'

const tscStatus = env.TSC_STATUS || 'skipped'
const tscDurationSec = parseInt(env.TSC_DURATION || '0', 10)
const tscDurationStr = tscDurationSec ? `${tscDurationSec}s` : 'n/a'

const allChecks = [buildStatus, tscStatus]
const anyFailed = allChecks.includes('failure')
const overallStatus = anyFailed ? 'FAIL' : 'PASS'

const totalSec = buildDurationSec + tscDurationSec
const totalDurationStr = totalSec >= 60
  ? `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`
  : `${totalSec}s`

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const fileTimestamp = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}T${pad(now.getUTCHours())}-${pad(now.getUTCMinutes())}-${pad(now.getUTCSeconds())}Z`
const displayDate = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`

const checkmark = (status) => {
  if (status === 'success') return '[x]'
  if (status === 'failure') return '[FAIL]'
  return '[—]'
}

const failureLines = []
if (buildStatus === 'failure') failureLines.push('- `npm run build` failed. Check the GitHub Actions run for full output.')
if (tscStatus === 'failure') failureLines.push('- `tsc --noEmit` failed. Check the GitHub Actions run for full output.')
const failuresSection = failureLines.length ? failureLines.join('\n') : 'None.'

const actionRequired = anyFailed
  ? '**Investigate failures above and roll back via Vercel if production is affected.** See `New Functionality/Regression-Strategy.md` → Operational Procedures.'
  : 'None.'

const reportContent = `# Regression Report — ${displayDate} UTC

**Trigger**: ${trigger}
**Commit**: \`${sha}\` — ${commitMessage}
**Branch**: main
**Duration**: ${totalDurationStr}
**Status**: ${overallStatus}
**GitHub Actions run**: ${githubRunUrl}

## Phase 1: Build & Type Check
- ${checkmark(buildStatus)} npm run build — ${buildDurationStr}
- ${checkmark(tscStatus)} tsc --noEmit — ${tscDurationStr}

## Phase 2: Smoke Tests
_Not yet implemented (planned)_

## Phase 3: Synthetic Monitoring
_Not yet implemented (planned)_

## Phase 4: Subscriber Canary
_Not yet implemented (planned)_

## Failures
${failuresSection}

## Action Required
${actionRequired}
`

if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true })
}

const reportFilename = `${fileTimestamp}_${sha}.md`
const reportPath = path.join(REPORTS_DIR, reportFilename)
writeFileSync(reportPath, reportContent, 'utf8')
console.log(`Wrote ${reportPath}`)

const indexHeader = `# Regression Reports

Auto-generated. Most recent first. New reports prepend.

| Date (UTC) | Trigger | Commit | Status | Duration | Report |
|---|---|---|---|---|---|
`

let existingRows = ''
if (existsSync(INDEX_FILE)) {
  try {
    const existing = readFileSync(INDEX_FILE, 'utf8')
    const lines = existing.split('\n')
    const sepIdx = lines.findIndex((l) => /^\|---/.test(l))
    if (sepIdx >= 0) {
      existingRows = lines
        .slice(sepIdx + 1)
        .filter((l) => l.startsWith('|') && !/^\|---/.test(l))
        .join('\n')
      if (existingRows) existingRows += '\n'
    }
  } catch {
    // fall back: regenerate index from this run only
  }
}

const newRow = `| ${displayDate} | ${trigger} | \`${sha}\` | ${overallStatus} | ${totalDurationStr} | [view](${reportFilename}) |\n`
writeFileSync(INDEX_FILE, indexHeader + newRow + existingRows, 'utf8')
console.log(`Updated ${INDEX_FILE}`)
