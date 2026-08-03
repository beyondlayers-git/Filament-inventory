import { Skeleton } from '@/components/ui/skeleton'

export default function HistoryLoading() {
  return (
    <div>
      {/* Section header */}
      <div className="section-header">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-1 mb-4 p-1 bg-muted rounded-md w-fit">
        <Skeleton className="h-7 w-36 rounded" />
        <Skeleton className="h-7 w-28 rounded" />
      </div>

      {/* Table skeleton — print no. | spool | profile | filament used | layers | date */}
      <div className="data-table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[90, 80, 140, 110, 80, 130].map((w, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-3 rounded" style={{ width: w }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, row) => (
              <tr key={row} className="border-b border-border/50 last:border-0">
                {/* Print no. */}
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-14" />
                </td>
                {/* Spool */}
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                {/* Profile */}
                <td className="px-4 py-3 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </td>
                {/* Filament used */}
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-14 ml-auto" />
                </td>
                {/* Layers */}
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-10 ml-auto" />
                </td>
                {/* Date */}
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-28 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
