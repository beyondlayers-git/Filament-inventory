import type { Metadata } from 'next'
import { getRecentPrints } from '@/actions/failed-prints'
import { FailedPrintForm } from '@/components/failed-print/failed-print-form'

export const metadata: Metadata = {
  title: 'Failed print',
  description: 'Recover leftover filament from a failed print',
}

export default async function FailedPrintPage() {
  const prints = await getRecentPrints()

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Failed print</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Recover leftover filament from a print that didn&apos;t complete
          </p>
        </div>
      </div>
      <div className="max-w-md">
        <FailedPrintForm prints={prints} />
      </div>
    </div>
  )
}
