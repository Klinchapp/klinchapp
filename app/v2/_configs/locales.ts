// Trimmed to ['en'] only on cutover (2026-05-03). The other 5 locales served fallback
// English content which Google would have flagged as duplicate / thin content.
// Re-add other locales when real translated content exists.
export const LOCALES = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' as const },
] as const

export type Locale = typeof LOCALES[number]['code']
export type Direction = 'ltr' | 'rtl'

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_CODES = LOCALES.map((l) => l.code) as readonly Locale[]

export function isLocale(value: string): value is Locale {
  return (LOCALE_CODES as readonly string[]).includes(value)
}

export function getDirection(locale: Locale): Direction {
  return LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr'
}

export function getLocaleNative(locale: Locale): string {
  return LOCALES.find((l) => l.code === locale)?.native ?? locale
}
