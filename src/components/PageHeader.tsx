type Props = {
  /**
   * The main title of the page.
   */
  title: string
  /**
   * A subtitle to display below the title, usually a description or explanation of the page.
   */
  subtitle?: string
  /**
   * A emoji to display above the title.
   */
  emoji?: string
  /**
   * A component to display on the right side of the title.
   */
  accessory?: React.ReactNode
}

const titleRowStyles = 'flex flex-wrap gap-1 items-center justify-between'

export function PageHeader({ title, subtitle, emoji, accessory }: Props) {
  return (
    <header>
      {emoji && <div className="text-5xl leading-none mb-2">{emoji}</div>}
      <div className={titleRowStyles}>
        <h1 className="mt-0 mb-0">{title}</h1>
        {accessory && <div className="mt-2">{accessory}</div>}
      </div>
      {subtitle && <p className="text-muted mt-1 mb-0">{subtitle}</p>}
    </header>
  )
}
