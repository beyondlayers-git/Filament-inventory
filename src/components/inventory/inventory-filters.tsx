'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function InventoryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') || ''
  const material = searchParams.get('material') || ''
  const sort = searchParams.get('sort') || ''

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters = q || material || sort

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
      <div className="relative flex-1 w-full sm:w-auto min-w-0 sm:min-w-48 sm:max-w-72">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          id="inventory-search"
          placeholder="Search brand, color, material…"
          value={q}
          onChange={(e) => update('q', e.target.value)}
          className="pl-9 h-9 text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={material || 'all'}
          onValueChange={(v) => update('material', (v as string) === 'all' ? '' : (v as string))}
        >
          <SelectTrigger id="material-filter" className="h-9 flex-1 sm:w-32 text-sm">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All materials</SelectItem>
            <SelectItem value="PLA">PLA</SelectItem>
            <SelectItem value="PETG">PETG</SelectItem>
            <SelectItem value="ABS">ABS</SelectItem>
            <SelectItem value="TPU">TPU</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort || 'default'}
          onValueChange={(v) => update('sort', (v as string) === 'default' ? '' : (v as string))}
        >
          <SelectTrigger id="sort-select" className="h-9 flex-1 sm:w-44 text-sm">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Date added (newest)</SelectItem>
            <SelectItem value="date-asc">Date added (oldest)</SelectItem>
            <SelectItem value="weight-desc">Weight (most first)</SelectItem>
            <SelectItem value="weight-asc">Weight (least first)</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            id="clear-filters-btn"
            variant="ghost"
            size="sm"
            onClick={() => router.replace(pathname)}
            className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0 px-2.5"
          >
            <X size={13} className="mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
