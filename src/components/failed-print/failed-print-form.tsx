'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, isAfter, subHours } from 'date-fns'
import { Loader2, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { submitFailedPrint } from '@/actions/failed-prints'

interface Print {
  id: string
  print_number: string
  filament_required: number
  total_layers: number
  status: string
  created_at: string
  spool?: {
    filament_number: string
    profile?: { brand: string; material_type: string; color: string } | null
  } | null
  failed_print?: Array<{
    id: string
    layers_printed: number
    consumed_grams: number
    leftover_grams: number
  }> | null
}

interface FailedPrintFormProps {
  prints: Print[]
}

export function FailedPrintForm({ prints }: FailedPrintFormProps) {
  const router = useRouter()
  const [selectedPrint, setSelectedPrint] = useState<Print | null>(null)
  const [layersPrinted, setLayersPrinted] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  const now = new Date()
  const threshold48h = subHours(now, 48)

  const layers = parseInt(layersPrinted, 10)
  const isValidLayers =
    selectedPrint &&
    !isNaN(layers) &&
    layers >= 0 &&
    layers <= selectedPrint.total_layers

  const consumedPreview =
    isValidLayers && selectedPrint
      ? (selectedPrint.filament_required * layers) / selectedPrint.total_layers
      : null
  const leftoverPreview =
    consumedPreview !== null && selectedPrint
      ? selectedPrint.filament_required - consumedPreview
      : null

  const isAlreadyFailed =
    selectedPrint?.status === 'failed' ||
    (selectedPrint?.failed_print && (selectedPrint.failed_print as any[]).length > 0)

  function handleSelectPrint(print: Print) {
    setSelectedPrint(print)
    setLayersPrinted('')
  }

  async function doSubmit() {
    if (!selectedPrint || !isValidLayers) return
    setLoading(true)
    try {
      const result = await submitFailedPrint(selectedPrint.id, layers)
      toast.success(
        `You consumed ${result.consumedGrams.toFixed(2)} g of filament. ${result.leftoverGrams.toFixed(2)} g restored to spool.`
      )
      setSelectedPrint(null)
      setLayersPrinted('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit() {
    if (isAlreadyFailed) {
      setShowEditConfirm(true)
    } else {
      doSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {/* Print selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Select print</Label>
        {prints.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No prints found. Log a print first.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-border rounded-md divide-y divide-border">
            {prints.map((print) => {
              const isRecent = isAfter(new Date(print.created_at), threshold48h)
              const isFailed = print.status === 'failed'
              const isSelected = selectedPrint?.id === print.id

              return (
                <button
                  key={print.id}
                  id={`select-print-${print.id}`}
                  type="button"
                  onClick={() => handleSelectPrint(print)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-medium ${
                          isRecent ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        #{print.print_number}
                      </span>
                      {isRecent && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary">
                          <Clock size={10} />
                          Recent
                        </span>
                      )}
                      {isFailed && (
                        <span className="badge-failed inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs">
                          <AlertTriangle size={9} />
                          Failed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {(print.spool as any)?.filament_number} ·{' '}
                      {print.filament_required} g · {print.total_layers} layers ·{' '}
                      {formatDistanceToNow(new Date(print.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Layers input */}
      {selectedPrint && (
        <div className="space-y-4 p-4 border border-border rounded-md bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Selected print</p>
            <p className="text-sm font-medium">
              #{selectedPrint.print_number} — {selectedPrint.filament_required} g /{' '}
              {selectedPrint.total_layers} layers
            </p>
          </div>

          <div>
            <Label htmlFor="layers-printed" className="text-sm font-medium">
              Layers printed before failure
            </Label>
            <Input
              id="layers-printed"
              type="number"
              step="1"
              min="0"
              max={selectedPrint.total_layers}
              value={layersPrinted}
              onChange={(e) => setLayersPrinted(e.target.value)}
              placeholder={`0 – ${selectedPrint.total_layers}`}
              className="mt-1.5"
            />
            {layers < 0 && (
              <p className="text-xs text-destructive mt-1">
                Layers printed cannot be negative
              </p>
            )}
            {layers > selectedPrint.total_layers && (
              <p className="text-xs text-destructive mt-1">
                Cannot exceed total layers ({selectedPrint.total_layers})
              </p>
            )}
          </div>

          {/* Preview */}
          {consumedPreview !== null && leftoverPreview !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-border rounded-md bg-card">
                <p className="text-xs text-muted-foreground">Consumed</p>
                <p className="text-sm font-medium text-foreground tabular-nums mt-0.5">
                  {consumedPreview.toFixed(2)} g
                </p>
              </div>
              <div className="p-3 border border-primary/20 rounded-md bg-primary/5">
                <p className="text-xs text-muted-foreground">Recovered</p>
                <p className="text-sm font-medium text-primary tabular-nums mt-0.5">
                  +{leftoverPreview.toFixed(2)} g
                </p>
              </div>
            </div>
          )}

          <Button
            id="submit-failed-print-btn"
            onClick={handleSubmit}
            disabled={!isValidLayers || loading}
            className="w-full"
          >
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            {isAlreadyFailed ? 'Update failed print' : 'Mark as failed'}
          </Button>
        </div>
      )}

      {/* Edit confirmation dialog */}
      <AlertDialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit failed print?</AlertDialogTitle>
            <AlertDialogDescription>
              Print #{selectedPrint?.print_number} was already marked as failed.
              Editing will reverse the previous filament restoration and apply
              the new calculation. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-edit-failed-print"
              onClick={() => {
                setShowEditConfirm(false)
                doSubmit()
              }}
            >
              Yes, update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
