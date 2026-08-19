import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center p-8 border border-border rounded-xl bg-card shadow-xs">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={24} strokeWidth={2} />
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Access Restricted
        </h1>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Sign-ups are currently disabled for new users. If you believe you should have access, please contact the application administrator to invite your account.
        </p>

        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
