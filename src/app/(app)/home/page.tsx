import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Package, Printer, AlertTriangle, Plus, History } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Filament inventory dashboard — quick access to all features',
}

const quickLinks = [
  {
    href: '/inventory',
    label: 'Inventory',
    description: 'View and manage your filament spools',
    icon: <Package size={20} strokeWidth={1.75} />,
  },
  {
    href: '/print',
    label: 'Log a print',
    description: 'Record a new print job and deduct filament',
    icon: <Printer size={20} strokeWidth={1.75} />,
  },
  {
    href: '/failed-print',
    label: 'Failed print',
    description: 'Recover leftover filament from a failed print',
    icon: <AlertTriangle size={20} strokeWidth={1.75} />,
  },
  {
    href: '/filaments',
    label: 'Add filament profile',
    description: 'Create a new filament type template',
    icon: <Plus size={20} strokeWidth={1.75} />,
  },
  {
    href: '/history',
    label: 'Print history',
    description: 'View successful and failed print records',
    icon: <History size={20} strokeWidth={1.75} />,
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name =
    user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="text-foreground">Hello, {name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            What would you like to do today?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-start gap-4 p-5 border border-border rounded-lg bg-card hover:bg-accent/40 transition-colors group"
          >
            <div className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0">
              {link.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{link.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
