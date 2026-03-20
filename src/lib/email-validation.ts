import disposableDomains from 'disposable-email-domains'

/** Free/cheap TLDs overwhelmingly used for spam and throwaway domains */
const BLOCKED_TLDS = new Set([
  // Freenom free TLDs
  '.tk',
  '.ml',
  '.ga',
  '.cf',
  '.gq',
  // Country codes with high spam volume
  '.ru',
  '.cn',
  // Cheap TLDs popular with spammers
  '.xyz',
  '.icu',
  '.top',
  '.pw',
  '.click',
  '.bid',
  '.stream',
  '.party',
  '.racing',
  '.cricket',
  '.science',
  '.faith',
  '.trade',
  '.webcam',
  '.win',
  '.loan',
  '.buzz',
  '.live',
])

/** Pre-built Set for O(1) lookup against ~3000 known disposable domains */
const disposableSet = new Set(disposableDomains)

const BLOCKED_MESSAGE =
  'Please use a permanent email address — temporary or disposable emails are not allowed.'

/**
 * Check whether an email domain is allowed for registration.
 * Returns an error message string if blocked, or null if OK.
 */
export function checkEmailDomain(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return 'Enter a valid email address'

  const tld = domain.slice(domain.lastIndexOf('.'))
  if (BLOCKED_TLDS.has(tld)) {
    return BLOCKED_MESSAGE
  }

  if (disposableSet.has(domain)) {
    return BLOCKED_MESSAGE
  }

  return null
}
