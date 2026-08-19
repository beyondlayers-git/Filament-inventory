'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MaterialType } from '@/types/database'

interface ProfileData {
  brand: string
  material_type: MaterialType
  color: string
  default_weight: number
  default_cost: number
  image_url?: string | null
}

export async function createFilamentProfile(data: ProfileData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('filament_profiles').insert({
    user_id: user.id,
    brand: data.brand,
    material_type: data.material_type,
    color: data.color,
    default_weight: data.default_weight,
    default_cost: data.default_cost,
    image_url: data.image_url ?? null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/filaments')
  revalidatePath('/inventory')
}

export async function updateFilamentProfile(id: string, data: ProfileData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('filament_profiles')
    .update({
      brand: data.brand,
      material_type: data.material_type,
      color: data.color,
      default_weight: data.default_weight,
      default_cost: data.default_cost,
      image_url: data.image_url ?? null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/filaments')
  revalidatePath('/inventory')
}

export async function deleteFilamentProfile(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('filament_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'This profile is in use by one or more spools. Remove those spools first.'
      )
    }
    throw new Error(error.message)
  }
  revalidatePath('/filaments')
  revalidatePath('/inventory')
}
