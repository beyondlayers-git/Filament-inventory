'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertSettings } from '@/actions/settings'

interface SettingsFormProps {
  initialThreshold: number
}

export function SettingsForm({ initialThreshold }: SettingsFormProps) {
  const [threshold, setThreshold] = useState(String(initialThreshold))
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    const num = parseFloat(threshold)
    if (isNaN(num) || num < 0) {
      toast.error('Enter a valid threshold (0 or more grams)')
      return
    }
    setLoading(true)
    try {
      await upsertSettings(num)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-5 border border-border rounded-lg">
        <div>
          <h2 className="text-sm font-medium text-foreground">Low stock threshold</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Spools with less than this amount of filament remaining will be flagged
            as low stock in the inventory view.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="low-stock-threshold" className="text-xs text-muted-foreground">
              Threshold (grams)
            </Label>
            <Input
              id="low-stock-threshold"
              type="number"
              step="1"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button
            id="save-settings-btn"
            onClick={handleSave}
            disabled={loading}
            size="sm"
          >
            {loading && <Loader2 size={13} className="mr-1.5 animate-spin" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
