export const DONATE_BUTTON_TEXT = 'Donate to Truckee Pride!'

/**
 * Canonical container widths used across layouts and pages.
 * All values include horizontal padding and vertical spacing.
 */
export const LayoutWidth = {
  /** Full-bleed content: hero images, banners */
  banner: 'max-w-3xl mx-auto',
  /** Admin dashboards and data-dense tables */
  admin: 'max-w-6xl mx-auto px-2 sm:px-0 py-8',
  /** Homepage, events list, content with sidebars */
  wide: 'max-w-2xl mx-auto px-2 sm:px-0',
  /** Prose articles, static pages */
  prose: 'max-w-prose mx-auto sm:px-0',
} as const

export type LayoutWidth = keyof typeof LayoutWidth

/** HTML elements the markdown editor can produce — used to restrict rendering. */
export const MARKDOWN_ALLOWED_ELEMENTS = [
  'p',
  'strong',
  'em',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'br',
] as const
