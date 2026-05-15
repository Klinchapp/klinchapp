import type { Metadata } from 'next'
import '../v2/v2.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { default: 'Klinchapp V3 (Staging)', template: '%s | Klinchapp V3 Staging' },
}

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="v2-mockup-banner">
        KLINCHAPP V3 — Option 2 tightening (single-line H2s, single-paragraph subtitles). noindex,nofollow.
      </div>
      <div className="v2-banner-spacer" aria-hidden="true" />
      {children}
    </>
  )
}
