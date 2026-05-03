import type { Metadata } from 'next'
import './v2.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { default: 'Klinchapp V2 (Staging)', template: '%s | Klinchapp V2 Staging' },
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="v2-mockup-banner">
        KLINCHAPP V2 — staging path. noindex,nofollow. Not for production until signed off.
      </div>
      <div className="v2-banner-spacer" aria-hidden="true" />
      {children}
    </>
  )
}
