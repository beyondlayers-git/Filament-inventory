'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({
  href = '/home',
  label = 'Home',
  className = '',
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1 px-2 -ml-2 mb-1.5 rounded-md hover:bg-accent/60 w-fit ${className}`}
      aria-label={`Back to ${label}`}
    >
      <ChevronLeft size={14} strokeWidth={2} />
      <span>Back to {label}</span>
    </Link>
  )
}
