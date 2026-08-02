import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getNextPrintNumber } from '@/actions/prints'
import { PrintForm } from '@/components/print/print-form'

export const metadata: Metadata = {
  title: 'Print',
  description: 'Log a new print job',
}

export default async function PrintPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: rawSpools }, nextPrintNumber] = await Promise.all([
    supabase
      .from('filament_spools')
      .select('id, filament_number, available_weight, cost_per_gram, profile:filament_profiles(brand, material_type, color)')
      .eq('user_id', user!.id)
      .order('filament_number'),
    getNextPrintNumber(),
  ])

  const spools = (rawSpools ?? []).map((s: any) => ({
    ...s,
    profile: Array.isArray(s.profile) ? s.profile[0] ?? null : s.profile,
  }))

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Log a print</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record a new print job and deduct filament from a spool
          </p>
        </div>
      </div>
      <div className="max-w-md">
        <PrintForm spools={spools ?? []} nextPrintNumber={nextPrintNumber} />
      </div>
    </div>
  )
}
