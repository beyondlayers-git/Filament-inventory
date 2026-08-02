'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createClient } from '@/lib/supabase/client'
import { createFilamentProfile, updateFilamentProfile } from '@/actions/filaments'
import type { FilamentProfile, MaterialType } from '@/types/database'

const MATERIAL_TYPES: MaterialType[] = ['PLA', 'PETG', 'ABS', 'TPU']

const schema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  material_type: z.enum(['PLA', 'PETG', 'ABS', 'TPU']),
  color: z.string().min(1, 'Color is required'),
  default_weight: z.coerce.number().positive('Weight must be positive'),
  default_cost: z.coerce.number().min(0, 'Cost cannot be negative'),
})

type FormValues = z.infer<typeof schema>

interface FilamentFormProps {
  profile?: FilamentProfile
  onSuccess: () => void
}

export function FilamentForm({ profile, onSuccess }: FilamentFormProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    profile?.image_url ?? null
  )
  const [uploading, setUploading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: profile?.brand ?? '',
      material_type: profile?.material_type ?? 'PLA',
      color: profile?.color ?? '',
      default_weight: profile?.default_weight ?? 1000,
      default_cost: profile?.default_cost ?? 0,
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadImage(userId: string): Promise<string | null> {
    if (!imageFile) return imagePreview // keep existing or null
    const ext = imageFile.name.split('.').pop()
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('filament-images')
      .upload(path, imageFile, { upsert: true })
    if (error) throw new Error(`Image upload failed: ${error.message}`)
    const { data } = supabase.storage
      .from('filament-images')
      .getPublicUrl(path)
    return data.publicUrl
  }

  async function onSubmit(values: FormValues) {
    setUploading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const image_url = await uploadImage(user.id)

      if (profile) {
        await updateFilamentProfile(profile.id, { ...values, image_url })
        toast.success('Profile updated')
      } else {
        await createFilamentProfile({ ...values, image_url })
        toast.success('Profile created')
      }
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Image upload */}
        <div className="space-y-2">
          <Label>Image (optional)</Label>
          {imagePreview ? (
            <div className="relative inline-flex">
              <div className="w-20 h-20 rounded-md border border-border overflow-hidden bg-muted">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  unoptimized={imagePreview.startsWith('blob:')}
                />
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-muted-foreground transition-colors"
                aria-label="Remove image"
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="filament-image-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-md text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              <Upload size={14} />
              Upload image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Filament image"
          />
        </div>

        {/* Brand */}
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input id="filament-brand" placeholder="e.g. Bambu Lab" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Material type */}
        <FormField
          control={form.control}
          name="material_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="filament-material">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MATERIAL_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input id="filament-color" placeholder="e.g. Bambu Green" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weight + Cost row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="default_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default weight (g)</FormLabel>
                <FormControl>
                  <Input
                    id="filament-weight"
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
            name="default_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default cost</FormLabel>
                <FormControl>
                  <Input
                    id="filament-cost"
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

        <Button
          id="filament-form-submit"
          type="submit"
          disabled={uploading}
          className="w-full"
        >
          {uploading && <Loader2 size={14} className="mr-2 animate-spin" />}
          {profile ? 'Save changes' : 'Create profile'}
        </Button>
      </form>
    </Form>
  )
}
