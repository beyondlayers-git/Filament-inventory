import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/nav/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-56 min-h-screen flex flex-col w-full min-w-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  )
}

