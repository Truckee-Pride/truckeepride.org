import Link from 'next/link'

type ButtonProps = {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function Button({
  href,
  onClick,
  children,
  className = '',
}: ButtonProps) {
  const baseStyles =
    'inline-block px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ease-out cursor-pointer'
  const colorStyles =
    'bg-[#e400ec] text-white no-underline hover:bg-[#ff33ff] hover:text-white hover:shadow-xl hover:-translate-y-1'
  const textStyles = 'uppercase'
  const classes = `${baseStyles} ${colorStyles} ${textStyles} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
