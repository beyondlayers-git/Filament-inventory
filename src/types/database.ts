export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU'
export type PrintStatus = 'success' | 'failed'

export interface FilamentProfile {
  id: string
  user_id: string
  brand: string
  material_type: MaterialType
  color: string
  default_weight: number
  default_cost: number
  image_url: string | null
  created_at: string
}

export interface FilamentSpool {
  id: string
  user_id: string
  profile_id: string
  filament_number: string
  total_weight: number
  available_weight: number
  cost: number
  cost_per_gram: number
  purchase_date: string | null
  created_at: string
  updated_at: string
  profile?: FilamentProfile
}

export interface Print {
  id: string
  user_id: string
  print_number: string
  spool_id: string | null
  filament_required: number
  total_layers: number
  status: PrintStatus
  created_at: string
  spool?: FilamentSpool & { profile?: FilamentProfile }
}

export interface FailedPrint {
  id: string
  print_id: string
  layers_printed: number
  consumed_grams: number
  leftover_grams: number
  created_at: string
  updated_at: string
  print?: Print
}

export interface UserSettings {
  user_id: string
  low_stock_threshold_grams: number
}
