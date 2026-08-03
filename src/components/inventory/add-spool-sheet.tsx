'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Image from 'next/image'
import { Plus, Package, Loader2, Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createSpool } from '@/actions/spools'
import type { FilamentProfile } from '@/types/database'

const schema = z.object({
  profile_id: z.string().uuid('Select a filament profile'),
  filament_number: z.string().min(1, 'Filament number is required'),
  total_weight: z.coerce.number().positive('Weight must be positive'),
  cost: z.coerce.number().min(0, 'Cost cannot be negative'),
  purchase_date: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddSpoolSheetProps {
  profiles: FilamentProfile[]
}

export function AddSpoolSheet({ profiles }: AddSpoolSheetProps) {
  const [open, setOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<FilamentProfile | null>(null)
  const [profileSearch, setProfileSearch] = useState('')
  const [showProfileList, setShowProfileList] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      profile_id: '',
      filament_number: '',
      total_weight: 1000,
      cost: 0,
      purchase_date: '',
    },
  })

  function selectProfile(profile: FilamentProfile) {
    setSelectedProfile(profile)
    form.setValue('profile_id', profile.id)
    form.setValue('total_weight', profile.default_weight)
    form.setValue('cost', profile.default_cost)
    setShowProfileList(false)
    setProfileSearch('')
  }

  const filteredProfiles = profiles.filter((p) => {
    const q = profileSearch.toLowerCase()
    return (
      p.brand.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      p.material_type.toLowerCase().includes(q)
    )
  })

  async function onSubmit(values: FormValues) {
    try {
      await createSpool({
        profile_id: values.profile_id,
        filament_number: values.filament_number,
        total_weight: values.total_weight,
        cost: values.cost,
        purchase_date: values.purchase_date || null,
      })
      toast.success(`Spool ${values.filament_number} added to inventory`)
      form.reset()
      setSelectedProfile(null)
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add spool')
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button id="add-spool-btn" size="sm">
          <Plus size={14} className="mr-1.5" />
          Add spool
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add spool to inventory</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="profile_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filament profile</FormLabel>
                  <div className="relative">
                    <button
                      id="profile-selector-btn"
                      type="button"
                      onClick={() => setShowProfileList((v) => !v)}
                      className="w-full flex items-center gap-3 px-3 py-2 border border-input rounded-md text-sm bg-background hover:bg-muted transition-colors text-left"
                    >
                      {selectedProfile ? (
                        <>
                          <div className="w-7 h-7 rounded border border-border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                            {selectedProfile.image_url ? (
                              <Image
                                src={selectedProfile.image_url}
                                alt=""
                                width={28}
                                height={28}
                                sizes="28px"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Package size={12} className="text-muted-foreground" />
                            )}
                          </div>
                          <span className="flex-1 text-foreground">
                            {selectedProfile.brand} — {selectedProfile.material_type}{' '}
                            {selectedProfile.color}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground flex-1">
                          Select a profile…
                        </span>
                      )}
                      <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
                    </button>

                    {showProfileList && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-sm">
                        <div className="p-1.5 border-b border-border">
                          <Input
                            placeholder="Search profiles…"
                            value={profileSearch}
                            onChange={(e) => setProfileSearch(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {filteredProfiles.length === 0 ? (
                            <p className="p-3 text-sm text-muted-foreground text-center">
                              No profiles found
                            </p>
                          ) : (
                            filteredProfiles.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => selectProfile(p)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                              >
                                <div className="w-7 h-7 rounded border border-border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                                  {p.image_url ? (
                                    <Image
                                      src={p.image_url}
                                      alt=""
                                      width={28}
                                      height={28}
                                      sizes="28px"
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <Package size={12} className="text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {p.brand}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {p.material_type} · {p.color}
                                  </p>
                                </div>
                                {selectedProfile?.id === p.id && (
                                  <Check size={13} className="text-primary shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filament_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filament number</FormLabel>
                  <FormControl>
                    <Input
                      id="spool-filament-number"
                      placeholder="e.g. FL-001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial weight (g)</FormLabel>
                    <FormControl>
                      <Input
                        id="spool-total-weight"
                        type="number"
                        step="1"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input
                        id="spool-cost"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase date (optional)</FormLabel>
                  <FormControl>
                    <Input id="spool-purchase-date" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              id="add-spool-submit"
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Add to inventory
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
