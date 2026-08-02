import { Sidebar } from '@/components/nav/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  )
}
