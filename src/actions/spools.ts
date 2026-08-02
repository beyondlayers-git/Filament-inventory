'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSpool(data: {
  profile_id: string
  filament_number: string
  total_weight: number
  cost: number
  purchase_date?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('filament_spools').insert({
    user_id: user.id,
    profile_id: data.profile_id,
    filament_number: data.filament_number,
    total_weight: data.total_weight,
    available_weight: data.total_weight, // spool starts full
    cost: data.cost,
    purchase_date: data.purchase_date ?? null,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error(
        `Filament number "${data.filament_number}" is already in use. Choose a unique identifier.`
      )
    }
    throw new Error(error.message)
  }
  revalidatePath('/inventory')
}

export async function updateSpoolAvailableWeight(
  spoolId: string,
  newWeight: number
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('filament_spools')
    .update({ available_weight: newWeight })
    .eq('id', spoolId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}

export async function deleteSpool(spoolId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('filament_spools')
    .delete()
    .eq('id', spoolId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  revalidatePath('/print')
  revalidatePath('/failed-print')
}
