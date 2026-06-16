/**
 * Blog Publish Watchdog
 *
 * Fires repeatedly through every publish day (Tue/Fri) to recover from
 * GitHub Actions cron skips. The primary publish cron in
 * blog-publish.yml runs at 09:17 UTC — but GHA scheduled crons can
 * silently skip (acknowledged in the workflow file's own comments).
 * This watchdog provides 7 additional chances per publish day, all
 * idempotent.
 *
 * Each run:
 *   1. Looks for any content/blog/*.mdx with status: "scheduled".
 *      If none → nothing to publish, exit clean.
 *   2. Checks if blog-publish.yml has already run successfully today.
 *      If yes → publish already happened, exit clean.
 *   3. Checks if a blog-publish run is currently in_progress / queued.
 *      If yes → another publish is running, exit clean.
 *   4. Otherwise → triggers blog-publish.yml via gh workflow_dispatch.
 *   5. If it's past 20:00 UTC AND a scheduled post still exists with
 *      no successful publish today → emails a failure alert (the
 *      "apocalypse day" path, in case every cron fire was skipped).
 *
 * Usage:
 *   node scripts/watchdog-blog-publish.mjs
 *
 * Requires:
 *   - gh CLI (preinstalled on GHA runners)
 *   - GH_TOKEN / GITHUB_TOKEN in env (for gh CLI auth)
 *   - RESEND_API_KEY in env (for the failure alert email)
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')

const ALERT_EMAIL = 'klinchapp.info@gmail.com'
const PUBLISH_WORKFLOW = 'blog-publish.yml'
const APOCALYPSE_HOUR_UTC = 20  // After 20:00 UTC, send failure alert if still unpublished

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

function findScheduledPosts() {
  if (!fs.existsSync(BLOG_DIR)) return []
  const out = []
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith('.mdx')) continue
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!fmMatch) continue
    const statusMatch = fmMatch[1].match(/^status:\s*"?(\w+)"?/m)
    if (statusMatch && statusMatch[1] === 'scheduled') {
      const titleMatch = fmMatch[1].match(/^title:\s*"([^"]+)"/m)
      out.push({ file, title: titleMatch ? titleMatch[1] : file })
    }
  }
  return out
}

function isToday(isoTimestamp) {
  const d = new Date(isoTimestamp)
  const now = new Date()
  return d.getUTCFullYear() === now.getUTCFullYear() &&
         d.getUTCMonth() === now.getUTCMonth() &&
         d.getUTCDate() === now.getUTCDate()
}

function gh(args) {
  try {
    return execSync(`gh ${args}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (err) {
    log(`gh CLI error on "${args}": ${err.message}`)
    return null
  }
}

function publishedToday() {
  const json = gh(`run list --workflow=${PUBLISH_WORKFLOW} --status success --limit 5 --json createdAt`)
  if (!json) return false
  try {
    const runs = JSON.parse(json)
    return runs.some(r => isToday(r.createdAt))
  } catch {
    return false
  }
}

function publishInFlight() {
  const inProg = gh(`run list --workflow=${PUBLISH_WORKFLOW} --status in_progress --limit 1 --json databaseId`)
  const queued = gh(`run list --workflow=${PUBLISH_WORKFLOW} --status queued --limit 1 --json databaseId`)
  try {
    if (inProg && JSON.parse(inProg).length > 0) return true
    if (queued && JSON.parse(queued).length > 0) return true
  } catch {}
  return false
}

function triggerPublish() {
  const result = gh(`workflow run ${PUBLISH_WORKFLOW}`)
  return result !== null
}

async function sendAlertEmail(scheduledPosts) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    log('No RESEND_API_KEY — skipping alert email')
    return
  }

  const titles = scheduledPosts.map(p => `<li><strong>${p.title}</strong> (<code>${p.file}</code>)</li>`).join('')
  const html = `
    <div style="font-family: sans-serif; max-width: 560px;">
      <h2 style="color: #b91c1c; margin-bottom: 4px;">Blog publish watchdog alert</h2>
      <p style="color: #444;">Today is a scheduled publish day. After ${APOCALYPSE_HOUR_UTC}:00 UTC, the following post(s) are still sitting in <code>scheduled</code> status and no successful blog-publish run has fired today:</p>
      <ul style="color: #333; line-height: 1.8;">${titles}</ul>
      <p style="color: #444;">Every scheduled cron and every watchdog retry today appears to have been skipped by GitHub Actions. Manual recovery:</p>
      <pre style="background: #f4f4f4; padding: 12px; border-radius: 6px; font-size: 13px;">gh workflow run blog-publish.yml</pre>
      <p style="color: #999; font-size: 13px;">— Blog Publish Watchdog (scripts/watchdog-blog-publish.mjs)</p>
    </div>
  `

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: [ALERT_EMAIL],
      subject: '⚠️  Blog publish watchdog: scheduled post not published today',
      html,
    })
    log(`Alert email sent to ${ALERT_EMAIL}`)
  } catch (err) {
    log(`Alert email failed: ${err.message}`)
  }
}

async function main() {
  log('═══ Blog Publish Watchdog ═══')
  const now = new Date()
  const utcHour = now.getUTCHours()
  log(`Current UTC: ${now.toISOString()} (hour=${utcHour})`)

  const scheduled = findScheduledPosts()
  if (scheduled.length === 0) {
    log('✓ No posts in scheduled status — nothing to do.')
    return
  }
  log(`Found ${scheduled.length} scheduled post(s): ${scheduled.map(p => p.file).join(', ')}`)

  if (publishedToday()) {
    log('✓ blog-publish has already run successfully today — nothing to do.')
    // Note: a scheduled post existing AFTER a successful publish today is unusual
    // (the previous run should have flipped it). Could be a brand-new prepare
    // committed right after publish, or a multi-post backlog. Either way the
    // next scheduled publish day will pick it up; watchdog doesn't need to act.
    return
  }

  if (publishInFlight()) {
    log('✓ blog-publish is currently in_progress or queued — letting it complete.')
    return
  }

  log(`No publish today and a scheduled post exists. Triggering blog-publish.yml...`)
  const triggered = triggerPublish()
  if (triggered) {
    log('✓ Triggered blog-publish.yml successfully.')
  } else {
    log('✗ Failed to trigger blog-publish.yml.')
  }

  // Apocalypse path: past the deadline AND still no publish.
  // Send a failure alert email so the user knows manual action is needed.
  if (utcHour >= APOCALYPSE_HOUR_UTC) {
    log(`Past ${APOCALYPSE_HOUR_UTC}:00 UTC and still no successful publish today. Sending alert email.`)
    await sendAlertEmail(scheduled)
  }
}

main().catch(err => {
  console.error('Watchdog crashed:', err)
  process.exit(1)
})
