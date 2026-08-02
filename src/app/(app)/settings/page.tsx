import type { Metadata } from 'next'
import { getSettings } from '@/actions/settings'
import { SettingsForm } from '@/components/settings/settings-form'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure your filament inventory preferences',
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inventory preferences
          </p>
        </div>
      </div>

      <div className="max-w-sm">
        <SettingsForm initialThreshold={settings.low_stock_threshold_grams} />
      </div>
    </div>
  )
}
