import { Skeleton } from '@/components/ui/skeleton'

export default function InventoryLoading() {
  return (
    <div>
      {/* Section header skeleton */}
      <div className="section-header">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Color badge strip */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-8 w-52 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="data-table-container mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {/* matches: thumbnail | filament no. | profile | purchased | available | total | cost/g | actions */}
              {[10, 120, 140, 110, 90, 70, 70, 80].map((w, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className={`h-3 rounded`} style={{ width: w }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, row) => (
              <tr key={row} className="border-b border-border/50 last:border-0">
                {/* Thumbnail */}
                <td className="px-4 py-3">
                  <Skeleton className="w-8 h-8 rounded" />
                </td>
                {/* Filament no. */}
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                {/* Profile */}
                <td className="px-4 py-3 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </td>
                {/* Purchased */}
                <td className="px-4 py-3">
                  <Skeleton className="h-3.5 w-24" />
                </td>
                {/* Available */}
                <td className="px-4 py-3">
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-1 w-16 rounded-full" />
                  </div>
                </td>
                {/* Total */}
                <td className="px-4 py-3">
                  <Skeleton className="h-3.5 w-12 ml-auto" />
                </td>
                {/* Cost/g */}
                <td className="px-4 py-3">
                  <Skeleton className="h-3.5 w-16 ml-auto" />
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="h-7 w-14 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
