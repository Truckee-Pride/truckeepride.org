type Props = {
  title: string
  subtitle?: string
  emoji?: string
}

export function PageHeader({ title, subtitle, emoji }: Props) {
  return (
    <div>
      {emoji && <div className="text-5xl leading-none mb-2">{emoji}</div>}
      <h1 className="mt-0 mb-0">{title}</h1>
      {subtitle && <p className="text-muted mt-1 mb-0">{subtitle}</p>}
    </div>
  )
}
