'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNextPrintNumber(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return '1'

  const { data } = await supabase
    .from('prints')
    .select('print_number')
    .eq('user_id', user.id)

  if (!data || data.length === 0) return '1'

  const maxNum = data.reduce((max, row) => {
    const n = parseInt(row.print_number, 10)
    return isNaN(n) ? max : Math.max(max, n)
  }, 0)

  return String(maxNum + 1)
}

export async function checkPrintNumberAvailable(
  printNumber: string
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('prints')
    .select('id')
    .eq('user_id', user.id)
    .eq('print_number', printNumber)
    .maybeSingle()

  return data === null
}

export async function createPrint(data: {
  print_number: string
  spool_id: string
  filament_required: number
  total_layers: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('prints')
    .select('id')
    .eq('user_id', user.id)
    .eq('print_number', data.print_number)
    .maybeSingle()

  if (existing) {
    throw new Error(
      `Print number "${data.print_number}" is already in use. Choose a different number.`
    )
  }

  const { data: spool, error: spoolErr } = await supabase
    .from('filament_spools')
    .select('available_weight, cost_per_gram, filament_number')
    .eq('id', data.spool_id)
    .eq('user_id', user.id)
    .single()

  if (spoolErr || !spool) throw new Error('Spool not found')

  if (data.filament_required > spool.available_weight) {
    const avail = Math.max(0, spool.available_weight).toFixed(1)
    throw new Error(
      `Insufficient filament on spool ${spool.filament_number}. Available: ${avail}g, requested: ${data.filament_required}g.`
    )
  }

  const newAvailableWeight = spool.available_weight - data.filament_required

  const { error: printErr } = await supabase.from('prints').insert({
    user_id: user.id,
    print_number: data.print_number,
    spool_id: data.spool_id,
    filament_required: data.filament_required,
    total_layers: data.total_layers,
    status: 'success',
  })

  if (printErr) throw new Error(printErr.message)

  const { error: updateErr } = await supabase
    .from('filament_spools')
    .update({ available_weight: newAvailableWeight })
    .eq('id', data.spool_id)
    .eq('user_id', user.id)

  if (updateErr) throw new Error(updateErr.message)

  const { data: cutoff } = await supabase
    .from('prints')
    .select('created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(100, 100)

  if (cutoff && cutoff.length > 0) {
    await supabase
      .from('prints')
      .delete()
      .eq('user_id', user.id)
      .lte('created_at', cutoff[0].created_at)
  }

  revalidatePath('/print')
  revalidatePath('/inventory')
  revalidatePath('/history')
  revalidatePath('/failed-print')
}
