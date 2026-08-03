import { Skeleton } from '@/components/ui/skeleton'

export default function PrintLoading() {
  return (
    <div>
      {/* Section header */}
      <div className="section-header">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Form skeleton — matches PrintForm layout */}
      <div className="max-w-md space-y-5">
        {/* Spool select */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Print number */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Total layers */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Filament required */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        {/* Submit button */}
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  )
}
