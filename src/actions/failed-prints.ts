'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRecentPrints() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('prints')
    .select(
      '*, spool:filament_spools(filament_number, available_weight, profile:filament_profiles(brand, material_type, color)), failed_print:failed_prints(id, layers_printed, consumed_grams, leftover_grams)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

export async function submitFailedPrint(
  printId: string,
  layersPrinted: number
): Promise<{ consumedGrams: number; leftoverGrams: number }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: print, error: printErr } = await supabase
    .from('prints')
    .select('*, spool:filament_spools(id, available_weight)')
    .eq('id', printId)
    .eq('user_id', user.id)
    .single()

  if (printErr || !print) throw new Error('Print not found')

  const consumed =
    print.filament_required * (layersPrinted / print.total_layers)
  const leftover = print.filament_required - consumed

  const spool = print.spool as any
  let currentSpoolWeight: number = spool?.available_weight ?? 0

  const { data: existingFp } = await supabase
    .from('failed_prints')
    .select('leftover_grams')
    .eq('print_id', printId)
    .maybeSingle()

  if (existingFp) {
    currentSpoolWeight = currentSpoolWeight - existingFp.leftover_grams
  }

  const newSpoolWeight = currentSpoolWeight + leftover

  if (spool?.id) {
    const { error: spoolErr } = await supabase
      .from('filament_spools')
      .update({ available_weight: newSpoolWeight })
      .eq('id', spool.id)
      .eq('user_id', user.id)

    if (spoolErr) throw new Error(spoolErr.message)
  }

  const { error: fpErr } = await supabase.from('failed_prints').upsert(
    {
      print_id: printId,
      layers_printed: layersPrinted,
      consumed_grams: consumed,
      leftover_grams: leftover,
    },
    { onConflict: 'print_id' }
  )

  if (fpErr) throw new Error(fpErr.message)

  const { error: statusErr } = await supabase
    .from('prints')
    .update({ status: 'failed' })
    .eq('id', printId)
    .eq('user_id', user.id)

  if (statusErr) throw new Error(statusErr.message)

  revalidatePath('/failed-print')
  revalidatePath('/inventory')
  revalidatePath('/history')

  return {
    consumedGrams: Math.round(consumed * 100) / 100,
    leftoverGrams: Math.round(leftover * 100) / 100,
  }
}
