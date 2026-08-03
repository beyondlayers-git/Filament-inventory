'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  History,
  Plus,
  Printer,
  AlertTriangle,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { SidebarLink } from './sidebar-link'
import { SignOutButton, HeaderSignOutButton } from './sign-out-button'

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/home' || pathname === '/'

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }

    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-56 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Filament Inventory Logo"
              width={24}
              height={24}
              priority
              className="w-6 h-6 rounded shrink-0 object-contain"
            />
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Filament Inv.
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <SidebarLink key={item.href} href={item.href} icon={item.icon}>
              {item.label}
            </SidebarLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border shrink-0">
          <SignOutButton />
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-sidebar border-b border-sidebar-border shadow-2xs">
        <div className="flex items-center gap-1">
          {!isHome && (
            <Link
              href="/home"
              aria-label="Back to home"
              title="Back to home"
              className="flex items-center justify-center w-9 h-9 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors shrink-0 touch-manipulation"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </Link>
          )}
          <Link href="/home" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Filament Inventory Logo"
              width={24}
              height={24}
              priority
              className="w-6 h-6 rounded shrink-0 object-contain"
            />
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Filament Inv.
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <HeaderSignOutButton />
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            className="flex items-center justify-center w-11 h-11 rounded-md text-foreground hover:bg-accent/60 transition-colors shrink-0 touch-manipulation"
          >
            {mobileOpen ? (
              <X size={20} strokeWidth={2} className="transition-transform duration-200" />
            ) : (
              <Menu size={20} strokeWidth={2} className="transition-transform duration-200" />
            )}
          </button>
        </div>
      </header>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-2xs transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="mobile-navigation-drawer"
        aria-label="Mobile main navigation"
        aria-hidden={!mobileOpen}
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border shrink-0">
          <Link
            href="/home"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            <Image
              src="/logo.png"
              alt="Filament Inventory Logo"
              width={24}
              height={24}
              priority
              className="w-6 h-6 rounded shrink-0 object-contain"
            />
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Filament Inv.
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              onNavigate={() => setMobileOpen(false)}
            >
              {item.label}
            </SidebarLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border shrink-0">
          <SignOutButton onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>
    </>
  )
}
