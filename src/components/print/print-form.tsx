'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Package, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { checkPrintNumberAvailable, createPrint } from '@/actions/prints'

interface Spool {
  id: string
  filament_number: string
  available_weight: number
  cost_per_gram: number
  profile: { brand: string; material_type: string; color: string } | null
}

interface PrintFormProps {
  spools: Spool[]
  nextPrintNumber: string
}

const schema = z.object({
  print_number: z.string().min(1, 'Print number is required'),
  spool_id: z.string().uuid('Select a spool'),
  filament_required: z.coerce
    .number()
    .positive('Must be greater than 0')
    .max(10000, 'Value seems too high'),
  total_layers: z.coerce.number().int().positive('Must be a positive integer'),
})

type FormValues = z.infer<typeof schema>

export function PrintForm({ spools, nextPrintNumber }: PrintFormProps) {
  const router = useRouter()
  const [printNumTaken, setPrintNumTaken] = useState(false)
  const [checkingNum, setCheckingNum] = useState(false)
  const [costPreview, setCostPreview] = useState<number | null>(null)
  const [selectedSpool, setSelectedSpool] = useState<Spool | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      print_number: nextPrintNumber,
      spool_id: '',
      filament_required: '' as any,
      total_layers: '' as any,
    },
  })

  const printNumber = form.watch('print_number')
  const spoolId = form.watch('spool_id')
  const filamentRequired = form.watch('filament_required')

  // Inline print number collision check
  useEffect(() => {
    if (!printNumber) return
    const timer = setTimeout(async () => {
      setCheckingNum(true)
      const available = await checkPrintNumberAvailable(printNumber)
      setPrintNumTaken(!available)
      setCheckingNum(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [printNumber])

  // Update selected spool
  useEffect(() => {
    const spool = spools.find((s) => s.id === spoolId) ?? null
    setSelectedSpool(spool)
  }, [spoolId, spools])

  // Live cost preview
  useEffect(() => {
    if (selectedSpool && filamentRequired > 0) {
      setCostPreview(
        Math.round(selectedSpool.cost_per_gram * filamentRequired * 100) / 100
      )
    } else {
      setCostPreview(null)
    }
  }, [selectedSpool, filamentRequired])

  async function onSubmit(values: FormValues) {
    if (printNumTaken) {
      form.setError('print_number', {
        message: `Print number "${values.print_number}" is already in use`,
      })
      return
    }
    if (selectedSpool) {
      const availWeight = Number(selectedSpool.available_weight)
      if (availWeight <= 0) {
        form.setError('spool_id', {
          message: 'Selected spool has no remaining filament available',
        })
        return
      }
      if (values.filament_required > availWeight) {
        form.setError('filament_required', {
          message: `Cannot exceed available filament (${Math.max(0, availWeight).toFixed(1)} g available on this spool)`,
        })
        return
      }
    }
    try {
      await createPrint({
        print_number: values.print_number,
        spool_id: values.spool_id,
        filament_required: values.filament_required,
        total_layers: values.total_layers,
      })
      toast.success(`Print #${values.print_number} logged successfully`)
      router.refresh()
      form.reset({ print_number: String(parseInt(values.print_number) + 1) })
      setSelectedSpool(null)
      setCostPreview(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log print')
    }
  }

  const isExceedingFilament =
    selectedSpool !== null &&
    filamentRequired > 0 &&
    filamentRequired > Number(selectedSpool.available_weight)

  const isDepletedSpool =
    selectedSpool !== null && Number(selectedSpool.available_weight) <= 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Print number */}
        <FormField
          control={form.control}
          name="print_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Print number</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    id="print-number"
                    placeholder="e.g. 42"
                    {...field}
                    className={printNumTaken ? 'border-destructive pr-8' : 'pr-8'}
                  />
                </FormControl>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {checkingNum && (
                    <Loader2 size={13} className="animate-spin text-muted-foreground" />
                  )}
                  {!checkingNum && printNumTaken && (
                    <AlertCircle size={13} className="text-destructive" />
                  )}
                </div>
              </div>
              {printNumTaken && !checkingNum && (
                <p className="text-xs text-destructive mt-1">
                  This print number is already in use
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Spool selector */}
        <FormField
          control={form.control}
          name="spool_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spool</FormLabel>
              <FormControl>
                <select
                  id="spool-selector"
                  {...field}
                  className="w-full h-9 px-3 border border-input rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a spool…</option>
                  {spools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.filament_number} — {(s.profile as any)?.brand}{' '}
                      {(s.profile as any)?.material_type}{' '}
                      {(s.profile as any)?.color} ({Math.max(0, Number(s.available_weight)).toFixed(1)}g available)
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Spool info strip */}
        {selectedSpool && (
          <div
            className={`flex items-center gap-2.5 p-3 rounded-md border ${
              Number(selectedSpool.available_weight) <= 0
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            {Number(selectedSpool.available_weight) <= 0 ? (
              <AlertCircle size={14} className="text-destructive shrink-0" />
            ) : (
              <Package size={14} className="text-muted-foreground shrink-0" strokeWidth={1.75} />
            )}
            <div className="text-xs">
              <span className="font-medium text-foreground">
                {Math.max(0, Number(selectedSpool.available_weight)).toFixed(1)} g
              </span>{' '}
              available · ₹{Number(selectedSpool.cost_per_gram).toFixed(4)}/g
              {Number(selectedSpool.available_weight) <= 0 && (
                <p className="text-xs font-semibold text-destructive mt-0.5">
                  This spool has no remaining filament. Please select another spool or adjust its weight in Inventory.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Filament required */}
        <FormField
          control={form.control}
          name="filament_required"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filament required (g)</FormLabel>
              <FormControl>
                <Input
                  id="filament-required"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 42.5"
                  {...field}
                  className={isExceedingFilament ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
              </FormControl>
              {isExceedingFilament && (
                <p className="text-xs text-destructive mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  Exceeds available spool weight (max{' '}
                  {Math.max(0, Number(selectedSpool.available_weight)).toFixed(1)} g)
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total layers */}
        <FormField
          control={form.control}
          name="total_layers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total layers</FormLabel>
              <FormControl>
                <Input
                  id="total-layers"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 250"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Live cost preview */}
        {costPreview !== null && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-md border border-border">
            <span className="text-xs text-muted-foreground">Estimated cost</span>
            <span className="text-sm font-medium text-foreground tabular-nums">
              ₹{costPreview.toFixed(2)}
            </span>
          </div>
        )}

        <Button
          id="submit-print-btn"
          type="submit"
          disabled={form.formState.isSubmitting || printNumTaken || Boolean(isExceedingFilament) || Boolean(isDepletedSpool)}
          className="w-full"
        >
          {form.formState.isSubmitting && (
            <Loader2 size={14} className="mr-2 animate-spin" />
          )}
          Log print
        </Button>
      </form>
    </Form>
  )
}
