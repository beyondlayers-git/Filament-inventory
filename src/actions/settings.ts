'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserSettings } from '@/types/database'

export async function getSettings(): Promise<UserSettings> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return data ?? { user_id: user.id, low_stock_threshold_grams: 100 }
}

export async function upsertSettings(low_stock_threshold_grams: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('settings')
    .upsert({ user_id: user.id, low_stock_threshold_grams })

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
  revalidatePath('/settings')
}
