'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      id="sign-out-btn"
      onClick={handleSignOut}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
    >
      <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
      <span>Sign out</span>
    </button>
  )
}
