'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton({ onNavigate }: { onNavigate?: () => void }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    onNavigate?.()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      id="sign-out-btn"
      onClick={handleSignOut}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors min-h-[44px] touch-manipulation"
    >
      <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
      <span>Sign out</span>
    </button>
  )
}

export function HeaderSignOutButton({ onNavigate }: { onNavigate?: () => void }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    onNavigate?.()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      id="mobile-header-sign-out-btn"
      onClick={handleSignOut}
      aria-label="Sign out"
      title="Sign out"
      className="flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors shrink-0 touch-manipulation"
    >
      <LogOut size={18} strokeWidth={1.75} />
    </button>
  )
}
