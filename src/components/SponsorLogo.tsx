import Image from 'next/image'

const LOGO_SIZE = 136

type SponsorLogoProps = {
  name: string
  imageUrl: string
  externalUrl?: string | null
}

export function SponsorLogo({ name, imageUrl, externalUrl }: SponsorLogoProps) {
  const logo = (
    <Image
      src={imageUrl}
      alt={name}
      width={LOGO_SIZE}
      height={LOGO_SIZE}
      sizes={`${LOGO_SIZE}px`}
      className="object-contain"
    />
  )

  if (externalUrl) {
    return (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
        {logo}
      </a>
    )
  }

  return logo
}
