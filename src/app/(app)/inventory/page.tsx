import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/actions/settings'
import { AddSpoolSheet } from '@/components/inventory/add-spool-sheet'
import { CorrectValueDialog } from '@/components/inventory/correct-value-dialog'
import { DeleteSpoolDialog } from '@/components/inventory/delete-spool-dialog'
import { InventoryFilters } from '@/components/inventory/inventory-filters'
import { Package, AlertTriangle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage your filament spool inventory',
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; material?: string; sort?: string }>
}) {
  const { q, material, sort } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: spools }, { data: profiles }, settings] = await Promise.all([
    supabase
      .from('filament_spools')
      .select('*, profile:filament_profiles(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('filament_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('brand'),
    getSettings(),
  ])

  let filtered = spools ?? []

  if (q) {
    const ql = q.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.filament_number.toLowerCase().includes(ql) ||
        (s.profile as any)?.brand?.toLowerCase().includes(ql) ||
        (s.profile as any)?.color?.toLowerCase().includes(ql) ||
        (s.profile as any)?.material_type?.toLowerCase().includes(ql)
    )
  }
  if (material) {
    filtered = filtered.filter(
      (s) => (s.profile as any)?.material_type === material
    )
  }
  if (sort === 'weight-asc') {
    filtered = [...filtered].sort((a, b) => a.available_weight - b.available_weight)
  } else if (sort === 'weight-desc') {
    filtered = [...filtered].sort((a, b) => b.available_weight - a.available_weight)
  } else if (sort === 'date-asc') {
    filtered = [...filtered].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  const colorCounts: Record<string, number> = {}
  for (const s of spools ?? []) {
    const color = (s.profile as any)?.color ?? 'Unknown'
    colorCounts[color] = (colorCounts[color] ?? 0) + 1
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {spools?.length ?? 0} spool{(spools?.length ?? 0) !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" aria-label="Settings">
            <Link href="/settings">
              <Settings size={15} strokeWidth={1.75} />
            </Link>
          </Button>
          <AddSpoolSheet profiles={profiles ?? []} />
        </div>
      </div>

      {Object.keys(colorCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(colorCounts).map(([color, count]) => (
            <span
              key={color}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
            >
              <span>{color}</span>
              <span className="font-semibold text-foreground">{count}</span>
            </span>
          ))}
        </div>
      )}

      <Suspense fallback={<div className="h-8" />}>
        <InventoryFilters />
      </Suspense>

      {filtered.length > 0 ? (
        <div className="data-table-container mt-4">
          <table>
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-10" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Filament no.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Profile
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Purchased
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Available
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Cost/g
                </th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((spool) => {
                const profile = spool.profile as any
                const isLowStock =
                  spool.available_weight <= settings.low_stock_threshold_grams
                const pct = Math.min(
                  100,
                  Math.round((spool.available_weight / spool.total_weight) * 100)
                )

                return (
                  <tr key={spool.id}>
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                        {profile?.image_url ? (
                          <Image
                            src={profile.image_url}
                            alt=""
                            width={32}
                            height={32}
                            sizes="32px"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package size={13} className="text-muted-foreground" strokeWidth={1.75} />
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {spool.filament_number}
                        </span>
                        {isLowStock && (
                          <span
                            className="badge-low-stock inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                            title={`Below ${settings.low_stock_threshold_grams}g threshold`}
                          >
                            <AlertTriangle size={10} />
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{profile?.brand}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.material_type} · {profile?.color}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {spool.purchase_date
                        ? new Date(spool.purchase_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <p
                        className={`text-sm font-medium tabular-nums ${
                          isLowStock ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {Number(spool.available_weight).toFixed(1)} g
                      </p>
                      <div className="flex justify-end mt-1">
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLowStock ? 'bg-primary' : 'bg-foreground/20'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-right text-muted-foreground tabular-nums">
                      {Number(spool.total_weight).toFixed(0)} g
                    </td>

                    <td className="px-4 py-3 text-sm text-right text-muted-foreground tabular-nums">
                      ₹{Number(spool.cost_per_gram).toFixed(3)}/g
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <CorrectValueDialog
                          spoolId={spool.id}
                          filamentNumber={spool.filament_number}
                          currentWeight={spool.available_weight}
                          trigger={
                            <Button
                              id={`correct-value-${spool.id}`}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-foreground px-2"
                            >
                              Correct
                            </Button>
                          }
                        />
                        <DeleteSpoolDialog
                          spoolId={spool.id}
                          filamentNumber={spool.filament_number}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state border border-dashed border-border rounded-lg mt-4">
          <Package size={32} className="text-muted-foreground mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground mb-1">
            {q || material ? 'No spools match your filters' : 'No spools in inventory'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {q || material
              ? 'Try adjusting your search or filters'
              : 'Add your first spool to start tracking'}
          </p>
          {!q && !material && <AddSpoolSheet profiles={profiles ?? []} />}
        </div>
      )}
    </div>
  )
}
