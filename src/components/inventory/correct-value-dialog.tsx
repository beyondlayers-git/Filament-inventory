'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSpoolAvailableWeight } from '@/actions/spools'

interface CorrectValueDialogProps {
  spoolId: string
  filamentNumber: string
  currentWeight: number
  trigger: React.ReactNode
}

export function CorrectValueDialog({
  spoolId,
  filamentNumber,
  currentWeight,
  trigger,
}: CorrectValueDialogProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(String(currentWeight))
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) {
      toast.error('Enter a valid weight (0 or more)')
      return
    }
    setLoading(true)
    try {
      await updateSpoolAvailableWeight(spoolId, num)
      toast.success(`Weight updated to ${num} g`)
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Correct available weight</AlertDialogTitle>
          <AlertDialogDescription>
            Manually set the remaining weight for spool{' '}
            <strong>{filamentNumber}</strong>. This overrides any calculated
            value.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label htmlFor="correct-weight-input" className="text-sm font-medium">
            Available weight (g)
          </Label>
          <Input
            id="correct-weight-input"
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1.5"
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            id={`confirm-correct-weight-${spoolId}`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 size={13} className="mr-1.5 animate-spin" />}
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
