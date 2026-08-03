import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div>
      {/* Section header */}
      <div className="section-header">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>

      {/* Form skeleton — matches SettingsForm layout */}
      <div className="max-w-sm space-y-5">
        {/* Low stock threshold field */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-3 w-56" />
        </div>
        {/* Save button */}
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  )
}
