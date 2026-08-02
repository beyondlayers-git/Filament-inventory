'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarLinkProps {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
}

export function SidebarLink({ href, children, icon }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
      )}
    >
      <span className="shrink-0 w-4 h-4">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}
