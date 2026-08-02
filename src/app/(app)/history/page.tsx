import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Printer, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Print history',
  description: 'View all successful and failed print records',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch only the latest 100 prints (older records are auto-deleted on insert)
  const { data: prints } = await supabase
    .from('prints')
    .select(
      '*, spool:filament_spools(filament_number, profile:filament_profiles(brand, material_type, color)), failed_print:failed_prints(*)'
    )
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const successful = (prints ?? []).filter((p) => p.status === 'success')
  const failed = (prints ?? []).filter((p) => p.status === 'failed')

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Print history</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {prints?.length ?? 0} total print{(prints?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Tabs defaultValue="successful">
        <TabsList className="mb-4">
          <TabsTrigger value="successful" id="tab-successful">
            <Printer size={13} className="mr-1.5" strokeWidth={1.75} />
            Successful ({successful.length})
          </TabsTrigger>
          <TabsTrigger value="failed" id="tab-failed">
            <AlertTriangle size={13} className="mr-1.5" strokeWidth={1.75} />
            Failed ({failed.length})
          </TabsTrigger>
        </TabsList>

        {/* Successful prints tab */}
        <TabsContent value="successful">
          {successful.length > 0 ? (
            <div className="data-table-container">
              <table>
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Print no.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Spool
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Profile
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Filament used
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Layers
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {successful.map((print) => {
                    const spool = print.spool as any
                    const profile = spool?.profile
                    return (
                      <tr key={print.id}>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          #{print.print_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {spool?.filament_number ?? (
                            <span className="text-muted-foreground italic">
                              deleted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {profile ? (
                            <div>
                              <p className="text-sm text-foreground">
                                {profile.brand}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {profile.material_type} · {profile.color}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-foreground">
                          {Number(print.filament_required).toFixed(2)} g
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-muted-foreground">
                          {print.total_layers}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-muted-foreground whitespace-nowrap">
                          {format(new Date(print.created_at), 'dd MMM yyyy, HH:mm')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state border border-dashed border-border rounded-lg">
              <Printer size={28} className="text-muted-foreground mb-2" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">No successful prints yet</p>
            </div>
          )}
        </TabsContent>

        {/* Failed prints tab */}
        <TabsContent value="failed">
          {failed.length > 0 ? (
            <div className="data-table-container">
              <table>
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Print no.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Spool
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Required
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Consumed
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Recovered
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Layers (of total)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {failed.map((print) => {
                    const spool = print.spool as any
                    const fp = Array.isArray(print.failed_print)
                      ? print.failed_print[0]
                      : print.failed_print

                    return (
                      <tr key={print.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground">
                              #{print.print_number}
                            </span>
                            <span className="badge-failed inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs">
                              <AlertTriangle size={9} />
                              Failed
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {spool?.filament_number ?? (
                            <span className="text-muted-foreground italic">
                              deleted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-muted-foreground">
                          {Number(print.filament_required).toFixed(2)} g
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-foreground">
                          {fp ? `${Number(fp.consumed_grams).toFixed(2)} g` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-primary font-medium">
                          {fp ? `+${Number(fp.leftover_grams).toFixed(2)} g` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-muted-foreground">
                          {fp
                            ? `${fp.layers_printed} / ${print.total_layers}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-muted-foreground whitespace-nowrap">
                          {format(new Date(print.created_at), 'dd MMM yyyy, HH:mm')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state border border-dashed border-border rounded-lg">
              <AlertTriangle
                size={28}
                className="text-muted-foreground mb-2"
                strokeWidth={1.5}
              />
              <p className="text-sm text-muted-foreground">No failed prints recorded</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
