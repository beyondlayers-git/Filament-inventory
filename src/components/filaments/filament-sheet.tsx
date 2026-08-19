'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FilamentForm } from './filament-form'
import type { FilamentProfile } from '@/types/database'

interface AddFilamentSheetProps {
  trigger?: React.ReactNode
}

export function AddFilamentSheet({ trigger }: AddFilamentSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button id="add-filament-btn" size="sm">
            Add profile
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>New filament profile</SheetTitle>
        </SheetHeader>
        <FilamentForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

interface EditFilamentSheetProps {
  profile: FilamentProfile
}

export function EditFilamentSheet({ profile }: EditFilamentSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          id={`edit-profile-${profile.id}`}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          aria-label={`Edit ${profile.brand}`}
        >
          <Pencil size={14} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit filament profile</SheetTitle>
        </SheetHeader>
        <FilamentForm profile={profile} onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
