import { Skeleton } from '@/components/ui/skeleton'

export default function FilamentsLoading() {
  return (
    <div>
      <div className="section-header">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      <div className="data-table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[48, 120, 100, 100, 110, 100, 80].map((w, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-3 rounded" style={{ width: w }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, row) => (
              <tr key={row} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <Skeleton className="w-9 h-9 rounded" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-12 rounded" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-14 ml-auto" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-14 ml-auto" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="h-7 w-7 rounded-md" />
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
