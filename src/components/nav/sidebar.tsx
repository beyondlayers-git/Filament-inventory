'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  History,
  Plus,
  Printer,
  AlertTriangle,
  Settings,
} from 'lucide-react'
import { SidebarLink } from './sidebar-link'
import { SignOutButton } from './sign-out-button'

const navItems = [
  { href: '/home', label: 'Home', icon: <LayoutDashboard size={16} strokeWidth={1.75} /> },
  { href: '/inventory', label: 'Inventory', icon: <Package size={16} strokeWidth={1.75} /> },
  { href: '/history', label: 'Print history', icon: <History size={16} strokeWidth={1.75} /> },
  { href: '/filaments', label: 'Add new filament', icon: <Plus size={16} strokeWidth={1.75} /> },
  { href: '/print', label: 'Print', icon: <Printer size={16} strokeWidth={1.75} /> },
  { href: '/failed-print', label: 'Failed print', icon: <AlertTriangle size={16} strokeWidth={1.75} /> },
  { href: '/settings', label: 'Settings', icon: <Settings size={16} strokeWidth={1.75} /> },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-56 flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Filament Inventory Logo"
            width={24}
            height={24}
            className="w-6 h-6 rounded shrink-0 object-contain"
          />
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Filament Inv.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map((item) => (
          <SidebarLink key={item.href} href={item.href} icon={item.icon}>
            {item.label}
          </SidebarLink>
        ))}
      </nav>

      {/* Footer: sign out */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <SignOutButton />
      </div>
    </aside>
  )
}
