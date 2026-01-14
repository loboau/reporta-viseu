'use client'

import Image from 'next/image'

interface CategoryIconV2Props {
  iconPath: string
  alt: string
  size?: number
  className?: string
}

export function CategoryIconV2({
  iconPath,
  alt,
  size = 32,
  className = ''
}: CategoryIconV2Props) {
  return (
    <Image
      src={iconPath}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
