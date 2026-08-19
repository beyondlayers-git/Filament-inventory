'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { cn } from '@/lib/utils'

interface SidebarLinkProps {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
  onNavigate?: () => void
}

export function SidebarLink({ href, children, icon, onNavigate }: SidebarLinkProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null)

  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
  const showActive = isActive || (isPending && optimisticHref === href)

  return (
    <Link
      href={href}
      onClick={(e) => {
        onNavigate?.()
        if (pathname === href) return
        e.preventDefault()
        setOptimisticHref(href)
        startTransition(() => {
          router.push(href)
          setOptimisticHref(null)
        })
      }}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px] touch-manipulation',
        showActive
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
      )}
    >
      <span className="shrink-0 w-4 h-4">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}
